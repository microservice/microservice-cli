import http from 'http'
import bodyParser from 'body-parser'
import express, { Response } from 'express'
import { CompositeDisposable, Emitter, Disposable } from 'event-kit'
import OmgUiPath from 'omg-ui'

import * as logger from '~/logger'
import { ConfigSchema } from '~/types'

interface DashboardHttpServerOptions {
  port: number
  microserviceConfig: ConfigSchema
}

export default class DashboardHttpServer {
  private port: number
  private microserviceConfig: ConfigSchema

  private serverRef: http.Server | null
  private emitter: Emitter
  private subscriptions: CompositeDisposable
  private eventListeners: Set<Response>

  public constructor(options: DashboardHttpServerOptions) {
    this.port = options.port
    this.microserviceConfig = options.microserviceConfig
    this.serverRef = null

    this.emitter = new Emitter()
    this.subscriptions = new CompositeDisposable()
    this.eventListeners = new Set()

    this.subscriptions.add(this.emitter)

    // Forward console logs to the UI
    function handleConsoleLogs({ severity, contents }: { severity: 'info' | 'warn' | 'error'; contents: string }) {
      this.publishEvent('console-log', { severity, contents })
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
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      })
      // Bootstrap events:
      this.publishEvent('config-updated', this.microserviceConfig, res)
      res.on('end', () => {
        this.eventListeners.delete(res)
      })
      this.eventListeners.add(res)
    })
    // API RPC endpoints:
    app.post('/api/buildImage', (req, res) => {
      const { env } = req.body
      this.emitter.emit('should-build', { env })
      res.json({ status: 'ok' })
    })

    await new Promise(resolve => {
      this.serverRef = app.listen({ port: this.port, hostname: '127.0.0.1' }, resolve)
    })
  }
  public handleConfigUpdated(microserviceConfig: ConfigSchema) {
    this.microserviceConfig = microserviceConfig
    this.publishEvent('config-updated', microserviceConfig)
  }
  private publishEvent(type: string, payload: Record<string, any>, connection?: Response) {
    if (connection) {
      connection.write(JSON.stringify({ type, payload }))
    } else {
      this.eventListeners.forEach(resp => {
        resp.write(JSON.stringify({ type, payload }))
      })
    }
  }
  public onShouldBuild(callback: (payload: { env: Record<string, string> }) => void): Disposable {
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
    this.eventListeners.forEach(socket => {
      socket.end()
    })
    this.eventListeners.clear()
  }
}
