import Dockerode from 'dockerode'

import * as logger from '~/logger'
import { ConfigSchema } from '~/types'
import { ConfigPaths } from '~/services/config'
import { lifecycleDisposables } from '~/common'
import { getImageName, getContainer } from '~/services/docker'

import buildForDaemon from './buildForDaemon'

interface DaemonOptions {
  configPaths: ConfigPaths
  microserviceConfig: ConfigSchema
}

interface DaemonStartOptions {
  envs: [string, string][]
  image?: string | null
  raw: boolean
}

interface ContainerState {
  container: Dockerode.Container
  portsMap: Map<number, number>
}

export default class Daemon {
  public configPaths: ConfigPaths
  public microserviceConfig: ConfigSchema
  private containerState: ContainerState | null

  public constructor({ configPaths, microserviceConfig }: DaemonOptions) {
    this.configPaths = configPaths
    this.microserviceConfig = microserviceConfig
    this.containerState = null

    lifecycleDisposables.add(this)
  }

  public async start({ image, envs, raw }: DaemonStartOptions): Promise<void> {
    if (this.containerState) {
      throw new Error('Cannot start when already started')
    }

    const imageName = image || (await getImageName({ configPath: this.configPaths.docker })).name
    if (!image) {
      // If an image name is not specified, call build
      await buildForDaemon({
        imageName,
        configPath: this.configPaths.docker,
        raw,
      })
    }
    logger.spinnerStart('Starting Docker container')
    try {
      const { container, portsMap } = await getContainer({
        envs,
        image: imageName,
        config: this.microserviceConfig,
      })
      this.containerState = { container, portsMap }
      await container.start()
      logger.spinnerSucceed('Successfully started Docker container')
    } catch (error) {
      this.containerState = null
      logger.spinnerFail('Starting Docker container failed')
      throw error
    }
  }

  // Stops gracefully (presumably.)
  public stop(): void {
    const { containerState } = this

    if (!containerState) {
      return
    }

    this.containerState = null
    containerState.container.stop()
  }

  public terminate(): void {
    const { containerState } = this

    if (!containerState) {
      return
    }

    this.containerState = null
    containerState.container.kill()
  }

  public dispose(): void {
    lifecycleDisposables.delete(this)
    this.terminate()
  }
}
