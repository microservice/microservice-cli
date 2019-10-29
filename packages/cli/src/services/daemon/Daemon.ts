import execa from 'execa'
import Dockerode, { ContainerInspectInfo } from 'dockerode'
import { CompositeDisposable } from 'event-kit'

import * as logger from '~/logger'
import { CLIError } from '~/errors'
import { Args, ConfigSchema } from '~/types'
import { ConfigPaths } from '~/services/config'
import { lifecycleDisposables } from '~/common'
import { getImageName, getContainer, pingContainer, isContainerRunning } from '~/services/docker'

import DaemonLogs from './DaemonLogs'
import buildForDaemon from './buildForDaemon'

interface DaemonOptions {
  configPaths: ConfigPaths
  microserviceConfig: ConfigSchema
}

interface DaemonStartOptions {
  envs: Args
  image?: string | null
  verbose: boolean
  inheritEnv: boolean
}

interface ContainerState {
  subscriptions: CompositeDisposable
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

  public async start({ image, envs, verbose, inheritEnv }: DaemonStartOptions): Promise<void> {
    if (this.containerState) {
      throw new CLIError('Cannot start when already started')
    }

    const imageName = image || (await getImageName({ configPath: this.configPaths.docker as string })).name
    if (!image) {
      // If an image name is not specified, call build
      await buildForDaemon({
        imageName,
        configPath: this.configPaths.docker as string,
        verbose,
      })
    }

    logger.spinnerStart('Starting Docker container')

    try {
      const { container, portsMap } = await getContainer({
        envs,
        image: imageName,
        config: this.microserviceConfig,
        inheritEnv,
      })
      this.containerState = { container, portsMap, subscriptions: new CompositeDisposable() }
      lifecycleDisposables.add(this)

      await container.start()
      logger.spinnerSucceed('Successfully started Docker container')
    } catch (error) {
      this.containerState = null
      logger.spinnerFail('Starting Docker container failed')
      throw error
    }
  }

  public async getLogs(): Promise<DaemonLogs> {
    const { containerState } = this

    if (!containerState) {
      throw new CLIError('Failed to get logs on a stopped Daemon')
    }

    const daemonLogger = new DaemonLogs(containerState.container)
    await daemonLogger.start()

    containerState.subscriptions.add(daemonLogger)
    daemonLogger.onDidDestroy(() => {
      containerState.subscriptions.delete(daemonLogger)
    })

    return daemonLogger
  }

  public async inspectContainer(): Promise<ContainerInspectInfo> {
    const { containerState } = this

    if (!containerState) {
      throw new Error(`Cannot inspect a stopped daemon`)
    }

    return containerState.container.inspect()
  }

  public async ping(): Promise<boolean> {
    const { containerState } = this

    if (!containerState) {
      return false
    }

    const status = await pingContainer({
      config: this.microserviceConfig,
      container: containerState.container.id,
      portsMap: containerState.portsMap,
    })

    return status
  }

  public async isRunning(): Promise<boolean> {
    const { containerState } = this

    if (!containerState) {
      return false
    }
    return isContainerRunning(containerState.container.id)
  }

  public getContainerPort(sourcePort: number): number {
    const { containerState } = this

    if (!containerState) {
      throw new CLIError(`Failed to getContainerPort#${sourcePort} while the container is not running`)
    }
    const mappedPort = containerState.portsMap.get(sourcePort)
    if (!mappedPort) {
      throw new CLIError(`Mapped port for port '${sourcePort}' not found`)
    }
    return mappedPort
  }

  // Stops gracefully (presumably.)
  public async stop(): Promise<void> {
    const { containerState } = this

    if (!containerState) {
      return
    }

    this.containerState = null
    containerState.subscriptions.dispose()
    await containerState.container.stop()
    await containerState.container.remove()
    lifecycleDisposables.delete(this)
  }

  // Terminate is synchronous
  public terminate(): void {
    const { containerState } = this

    if (!containerState) {
      return
    }

    this.containerState = null
    try {
      containerState.subscriptions.dispose()
      execa.sync('docker', ['kill', containerState.container.id], {
        stdio: 'ignore',
      })
      execa.sync('docker', ['rm', containerState.container.id], {
        stdio: 'ignore',
      })
    } catch (_) {
      /* Ignore kill errors - If this fails, God save us. */
    }
    lifecycleDisposables.delete(this)
  }

  public dispose(): void {
    this.terminate()
  }
}
