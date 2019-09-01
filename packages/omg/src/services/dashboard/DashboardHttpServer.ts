import http from 'http'
import express from 'express'
import { CompositeDisposable, Emitter } from 'event-kit'

import * as logger from '~/logger'

interface DashboardHttpServerOptions {
  port: number
}

export default class DashboardHttpServer {
  private port: number
  private serverRef: http.Server | null
  private emitter: Emitter
  private subscriptions: CompositeDisposable

  public constructor(options: DashboardHttpServerOptions) {
    this.port = options.port
    this.serverRef = null

    this.emitter = new Emitter()
    this.subscriptions = new CompositeDisposable()

    this.subscriptions.add(this.emitter)
  }
  public async start(): Promise<void> {
    const app = express()

    await new Promise(resolve => {
      this.serverRef = app.listen({ port: this.port, hostname: '127.0.0.1' }, resolve)
    })
    logger.info(`Server is running at http://localhost:${this.port}/`)
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
  }
}
