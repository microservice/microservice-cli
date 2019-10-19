import getPort from 'get-port'
import { CompositeDisposable } from 'event-kit'

import * as logger from '~/logger'
import { CLIError } from '~/errors'
import { Daemon } from '~/services/daemon'
import { executeAction } from '~/services/action'
import { ConfigSchema, Args, UIAppStatus } from '~/types'
import { ConfigPaths, watchConfigFile } from '~/services/config'
import { lifecycleDisposables } from '~/common'

import DashboardHttpServer from './DashboardHttpServer'

interface DashboardOptions {
  image: string | null
  inheritEnv: boolean
  configPaths: ConfigPaths
  microserviceConfig: ConfigSchema
}

interface DashboardStartOptions {
  port: number | null
}

export default class Dashboard {
  public envs: Args
  public image: string | null
  public inheritEnv: boolean
  public configPaths: ConfigPaths
  public microserviceConfig: ConfigSchema
  private appStatus: UIAppStatus

  private daemon: null | Daemon
  private httpServer: null | DashboardHttpServer
  private subscriptions: null | CompositeDisposable

  public constructor(options: DashboardOptions) {
    this.envs = []
    this.image = options.image
    this.inheritEnv = options.inheritEnv
    this.configPaths = options.configPaths
    this.microserviceConfig = options.microserviceConfig
    this.appStatus = UIAppStatus.stopped

    this.daemon = null
    this.httpServer = null

    lifecycleDisposables.add(this)
  }

  public async start(options: DashboardStartOptions): Promise<{ port: number }> {
    const httpServer = new DashboardHttpServer({
      port: options.port || (await getPort({ port: 9000 })),
      configPaths: this.configPaths,
      microserviceConfig: this.microserviceConfig,
      appStatus: this.appStatus,
      executeAction: async ({ name, args }) => {
        // Start the daemon if it dieded.
        if (!this.daemon) {
          await this.reload()
        }
        let response = null
        await executeAction({
          daemon: this.daemon!,
          actionName: name,
          args,
          config: this.microserviceConfig,
          callback(_response) {
            response = _response
          },
        })

        return response
      },
    })
    httpServer.onShouldBuild(({ envs }) => {
      this.envs = envs
      this.reload().catch(logger.error)
    })
    await httpServer.start()

    const subscriptions = new CompositeDisposable()
    subscriptions.add(httpServer)
    subscriptions.add(
      watchConfigFile({
        validate: false,
        configPath: this.configPaths.microservice as string,
        onConfigUpdated: microserviceConfig => {
          this.microserviceConfig = microserviceConfig
          httpServer.handleConfigUpdated(microserviceConfig)
          this.reload().catch(logger.error)
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

  public async reload(): Promise<void> {
    const { daemon, httpServer } = this
    if (!httpServer) {
      return
    }

    if (daemon) {
      this.updateAppStatus(UIAppStatus.stopped)
      this.daemon = null
      daemon.stop().catch(logger.error)
    }
    this.updateAppStatus(UIAppStatus.starting)
    const newDaemon = new Daemon({
      configPaths: this.configPaths,
      microserviceConfig: this.microserviceConfig,
    })
    this.daemon = newDaemon
    try {
      await newDaemon.start({
        envs: this.envs,
        verbose: true,
        image: this.image,
        inheritEnv: this.inheritEnv,
      })
    } catch (error) {
      this.updateAppStatus(UIAppStatus.stopped)
      throw error
    }
    this.updateAppStatus(UIAppStatus.started)
    const daemonLogs = await newDaemon.getLogs()
    daemonLogs.onLogLine(line => {
      httpServer.handleDockerLog({ stream: 'stdout', contents: line })
    })
    daemonLogs.onErrorLine(line => {
      httpServer.handleDockerLog({ stream: 'stderr', contents: line })
    })
  }

  private updateAppStatus(appStatus: UIAppStatus) {
    const { httpServer } = this
    this.appStatus = appStatus

    if (httpServer) {
      httpServer.handleAppStatusUpdated(appStatus)
    }
  }

  public dispose() {
    const { subscriptions } = this

    if (subscriptions) {
      subscriptions.dispose()
    }
    lifecycleDisposables.delete(this)
  }
}
