import http from 'http'
import stripAnsi from 'strip-ansi'
import bodyParser from 'body-parser'
import express, { Response } from 'express'
import { CompositeDisposable, Emitter, Disposable } from 'event-kit'
import OmgUiPath from 'omg-ui'

import * as logger from '~/logger'
import { ConfigSchema, Args, UIAppStatus } from '~/types'

type TExecuteAction = (payload: { name: string; args: Args }) => Promise<any>
interface DashboardHttpServerOptions {
  port: number
  appStatus: UIAppStatus
  microserviceConfig: ConfigSchema
  executeAction: TExecuteAction
}

export default class DashboardHttpServer {
  private port: number
  private appStatus: string
  private microserviceConfig: ConfigSchema
  private executeAction: TExecuteAction

  private serverRef: http.Server | null
  private emitter: Emitter
  private subscriptions: CompositeDisposable
  private eventListeners: Set<Response>

  public constructor(options: DashboardHttpServerOptions) {
    this.port = options.port
    this.appStatus = options.appStatus
    this.microserviceConfig = options.microserviceConfig
    this.executeAction = options.executeAction
    this.serverRef = null

    this.emitter = new Emitter()
    this.subscriptions = new CompositeDisposable()
    this.eventListeners = new Set()

    this.subscriptions.add(this.emitter)

    // Forward console logs to the UI
    const handleConsoleLogs = ({ severity, contents }: { severity: 'info' | 'warn' | 'error'; contents: string }) => {
      this.publishEvent('console-log', { severity, contents: stripAnsi(contents) })
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
      this.publishEvent('config-updated', this.microserviceConfig, res)
      this.publishEvent('app-status-updated', { status: this.appStatus }, res)

      // GC Handlers:
      res.on('end', () => {
        this.eventListeners.delete(res)
      })
      this.eventListeners.add(res)
    })
    // API RPC endpoints:
    app.post('/api/buildImage', (req, res) => {
      const { envs } = req.body
      const envsArgs: Args = []
      Object.keys(envs).forEach(key => {
        envsArgs.push([key, envs[key]])
      })

      this.emitter.emit('should-build', { envs: envsArgs })
      res.json({ status: 'ok' })
    })
    app.post('/api/executeAction', async (req, res) => {
      try {
        const { name, args } = req.body
        const actionArgs: Args = []
        Object.keys(args).forEach(key => {
          actionArgs.push([key, args[key]])
        })

        const result = await this.executeAction({
          name,
          args: actionArgs,
        })
        res.json({ status: 'ok', result })
      } catch (error) {
        res.json({ status: 'error', error: error && error.message })
      }
    })

    await new Promise(resolve => {
      this.serverRef = app.listen({ port: this.port, hostname: '127.0.0.1' }, resolve)
    })
  }
  public handleConfigUpdated(microserviceConfig: ConfigSchema) {
    this.microserviceConfig = microserviceConfig
    this.publishEvent('config-updated', microserviceConfig)
  }
  public handleAppStatusUpdated(status: UIAppStatus) {
    this.appStatus = status
    this.publishEvent('app-status-updated', { status })
  }
  public handleDockerLog({ stream, contents }: { stream: 'stdout' | 'stderr'; contents: string }) {
    this.publishEvent('docker-log', { stream, contents: stripAnsi(contents) })
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
