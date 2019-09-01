/* eslint-disable class-methods-use-this */
// TODO: Remove ^ suppression when class is implemented
import { ConfigSchema } from '~/types'
import { ConfigPaths } from '~/services/config'
import { lifecycleDisposables } from '~/common'

interface DashboardOptions {
  configPaths: ConfigPaths
  microserviceConfig: ConfigSchema
}

interface DashboardStartOptions {
  port: number | null
  inheritEnv: boolean
}

export default class Dashboard {
  public configPaths: ConfigPaths
  public microserviceConfig: ConfigSchema

  public constructor(options: DashboardOptions) {
    this.configPaths = options.configPaths
    this.microserviceConfig = options.microserviceConfig

    lifecycleDisposables.add(this)
  }

  public async start(options: DashboardStartOptions): Promise<void> {
    // TODO
    console.log('hello world')
  }

  public async stop(): Promise<void> {
    // TODO
  }

  public terminate(): void {}

  public dispose() {
    lifecycleDisposables.delete(this)
    this.terminate()
  }
}
