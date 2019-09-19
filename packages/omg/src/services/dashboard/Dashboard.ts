import getPort from 'get-port'
import { CompositeDisposable } from 'event-kit'

import { Daemon } from '~/services/daemon'
import { ConfigSchema } from '~/types'
import { ConfigPaths, watchConfigFile } from '~/services/config'
import { lifecycleDisposables } from '~/common'

import DashboardHttpServer from './DashboardHttpServer'

interface DashboardOptions {
  inheritEnv: boolean
  configPaths: ConfigPaths
  microserviceConfig: ConfigSchema
}

interface DashboardStartOptions {
  port: number | null
}

export default class Dashboard {
  public inheritEnv: boolean
  public configPaths: ConfigPaths
  public microserviceConfig: ConfigSchema

  private daemonRef: null | Daemon
  private httpServer: null | DashboardHttpServer
  private subscriptions: null | CompositeDisposable

  public constructor(options: DashboardOptions) {
    this.inheritEnv = options.inheritEnv
    this.configPaths = options.configPaths
    this.microserviceConfig = options.microserviceConfig

    this.daemonRef = null
    this.httpServer = null

    lifecycleDisposables.add(this)
  }

  public async start(options: DashboardStartOptions): Promise<{ port: number }> {
    const httpServer = new DashboardHttpServer({
      port: options.port || (await getPort({ port: 9000 })),
    })
    await httpServer.start()

    const subscriptions = new CompositeDisposable()
    subscriptions.add(httpServer)
    subscriptions.add(
      watchConfigFile({
        validate: true,
        configPath: this.configPaths.microservice,
        onConfigChanged: microserviceConfig => {
          // TODO: didConfigUpdate
          this.microserviceConfig = microserviceConfig
        },
      }),
    )

    httpServer.onDidDestroy(() => {
      subscriptions.delete(httpServer)
    })

    this.httpServer = httpServer
    this.subscriptions = subscriptions

    return { port: httpServer.getPort() }
  }

  public async stop(): Promise<void> {
    const { daemonRef, httpServer } = this
    const promises: Promise<void>[] = []
    if (httpServer) {
      httpServer.dispose()
      this.httpServer = null
    }
    if (daemonRef) {
      promises.push(daemonRef.stop())
      this.daemonRef = null
    }

    await promises
  }

  public dispose() {
    lifecycleDisposables.delete(this)

    const { subscriptions } = this
    if (subscriptions) {
      subscriptions.dispose()
    }
  }
}
