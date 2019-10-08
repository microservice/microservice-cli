import fs from 'sb-fs'
import http from 'http'
import stripAnsi from 'strip-ansi'
import bodyParser from 'body-parser'
import express, { Response } from 'express'
import { CompositeDisposable, Emitter, Disposable } from 'event-kit'
import OmgUiPath from 'omg-ui'

import * as logger from '~/logger'
import mapToArgs from '~/helpers/mapToArgs'
import { ConfigPaths, getValidationErrors } from '~/services/config'
import { ConfigSchema, Args, UIAppStatus } from '~/types'

// Note: Should always be positive
const MAX_HISTORY_LENGTH = 500

type TExecuteAction = (payload: { name: string; args: Args }) => Promise<any>
type TLogHistory = { type: 'docker-log' | 'console-log'; payload: Record<string, any> }[]

interface DashboardHttpServerOptions {
  port: number
  configPaths: ConfigPaths
  appStatus: UIAppStatus
  microserviceConfig: ConfigSchema
  executeAction: TExecuteAction
}

export default class DashboardHttpServer {
  private port: number
  private configPaths: ConfigPaths
  private appStatus: string
  private microserviceConfig: ConfigSchema
  private executeAction: TExecuteAction

  private serverRef: http.Server | null
  private emitter: Emitter
  private subscriptions: CompositeDisposable
  private eventListeners: Set<Response>
  private logHistory: TLogHistory

  public constructor(options: DashboardHttpServerOptions) {
    this.port = options.port
    this.configPaths = options.configPaths
    this.appStatus = options.appStatus
    this.microserviceConfig = options.microserviceConfig
    this.executeAction = options.executeAction
    this.serverRef = null

    this.emitter = new Emitter()
    this.subscriptions = new CompositeDisposable()
    this.eventListeners = new Set()
    this.logHistory = []

    this.subscriptions.add(this.emitter)

    // Forward console logs to the UI
    const handleConsoleLogs = ({ severity, contents }: { severity: 'info' | 'warn' | 'error'; contents: string }) => {
      this.logToHistory('console-log', { severity, contents: stripAnsi(contents) })
    }

    logger.logConsumers.add(handleConsoleLogs)
    this.subscriptions.add(
      new Disposable(() => {
        logger.logConsumers.delete(handleConsoleLogs)
      }),
    )
  }

  public getPort(): number {
    return this.port
  }

  public async start(): Promise<void> {
    const app = express()
    app.use(bodyParser.json())
    app.use(express.static(OmgUiPath))

    // API Routes
    app.get('/api/config', (req, res) => {
      res.json(this.microserviceConfig)
    })
    app.get('/api/configRaw', (req, res) => {
      res.sendFile(this.configPaths.microservice as string)
    })
    app.get('/api/events', (req, res) => {
      // 24 hours
      req.setTimeout(1000 * 60 * 60 * 24, () => {
        /* No op */
      })

      res.writeHead(200, {
        'Transfer-Encoding': 'chunked',
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      })
      // Bootstrap events:
      this.publishEvent(
        'config-updated',
        {
          config: this.microserviceConfig,
          validationErrors: getValidationErrors(this.microserviceConfig),
        },
        res,
      )
      this.publishEvent('app-status-updated', { status: this.appStatus }, res)
      this.logHistory.forEach(({ type, payload }) => {
        this.publishEvent(type, payload, res)
      })

      // GC Handlers:
      res.on('end', () => {
        this.eventListeners.delete(res)
      })
      this.eventListeners.add(res)
    })
    // API RPC endpoints:
    app.post('/api/buildImage', (req, res) => {
      // Filtering is necessary because UI cannot have empty string
      this.emitter.emit('should-build', { envs: mapToArgs(req.body.envs || {}).filter(item => item[0] && item[1]) })
      res.json({ status: 'ok' })
    })
    app.post('/api/executeAction', async (req, res) => {
      try {
        const result = await this.executeAction({
          name: req.body.name,
          args: mapToArgs(req.body.args || {}),
        })
        res.json({ status: 'ok', result })
      } catch (error) {
        res.json({ status: 'error', error: error && error.message })
      }
    })
    app.post('/api/writeConfig', async (req, res) => {
      const { config } = req.body
      if (config && config.length && typeof config === 'string') {
        fs.writeFile(this.configPaths.microservice, config).catch(logger.error)
      }
      res.json({ status: 'ok' })
    })

    await new Promise(resolve => {
      this.serverRef = app.listen({ port: this.port, hostname: '127.0.0.1' }, resolve)
    })
  }
  public handleConfigUpdated(microserviceConfig: ConfigSchema) {
    this.microserviceConfig = microserviceConfig
    this.publishEvent('config-updated', {
      config: microserviceConfig,
      validationErrors: getValidationErrors(microserviceConfig),
    })
  }
  public handleAppStatusUpdated(status: UIAppStatus) {
    this.appStatus = status
    this.publishEvent('app-status-updated', { status })
  }
  public handleDockerLog({ stream, contents }: { stream: 'stdout' | 'stderr'; contents: string }) {
    this.logToHistory('docker-log', { stream, contents: stripAnsi(contents) })
  }
  private logToHistory(type: 'docker-log' | 'console-log', payload: Record<string, any>) {
    this.publishEvent(type, payload)

    // Keep them both separately so restarting app often
    // doesn't remove Docker logs from the stack
    let countDockerLogs = 0
    let countConsoleLogs = 0

    const logHistory: TLogHistory = []

    // Temporarily store them in present->past order
    const reversedLogHistory = this.logHistory.slice().concat([{ type, payload }])
    reversedLogHistory.reverse()
    reversedLogHistory.forEach(item => {
      if (item.type === 'docker-log' && countDockerLogs < MAX_HISTORY_LENGTH) {
        logHistory.push(item)
        countDockerLogs += 1
      } else if (item.type === 'console-log' && countConsoleLogs < MAX_HISTORY_LENGTH) {
        logHistory.push(item)
        countConsoleLogs += 1
      }
    })

    // Now that we're done filtering, reverse once more to make it all in past->present order
    this.logHistory = logHistory.reverse()
  }
  private publishEvent(type: string, payload: Record<string, any>, connection?: Response) {
    const serialized = `${JSON.stringify({ type, payload })}\n`
    if (connection) {
      connection.write(serialized)
    } else {
      this.eventListeners.forEach(resp => {
        resp.write(serialized)
      })
    }
  }
  public onShouldBuild(callback: (payload: { envs: Args }) => void): Disposable {
    return this.emitter.on('should-build', callback)
  }
  public onDidDestroy(callback: () => void): void {
    this.emitter.on('did-destroy', callback)
  }
  public dispose() {
    const { serverRef } = this
    if (serverRef) {
      serverRef.close()
      this.serverRef = null
    }
    this.emitter.emit('did-destroy')
    this.subscriptions.dispose()
    this.eventListeners.forEach(item => {
      item.destroy()
    })
    this.eventListeners.clear()
  }
}
