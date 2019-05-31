import * as utils from '../../utils'
import http from './wrappers/http'
import io from './wrappers/socket-io'
import { app } from 'omg-ui'
import Run from '../run/Run'
import Subscribe from '../Subscribe'
import Microservice from '../../models/Microservice'
import Build from '../Build'
import Cli from '../../cli/Cli'
import RunFactory from '../run/RunFactory'
import * as fs from 'fs'
import * as path from 'path'
import open from './wrappers/open'
import Dockerode from './wrappers/dockerode'

interface ISocketNotif {
  notif: any
  status: boolean
  log?: string
}

interface IDataBuild {
  name?: string
}

interface IStartContainer {
  image: string
  envs: any
}

interface IDataAction {
  image: string
  action: string
  args: {}
  envs: {}
  event?: string
}

/**
 * UIServer definition
 */
export default class UIServer {
  private port: number
  private app: any
  private http: any
  private io: any
  private microservice: Microservice
  private microserviceStr: any
  private socket: any
  private dockerContainer: Run
  private containerID: string
  private subscribe: Subscribe
  private rebuildBak: { build: any; start: any }
  private rebuildToggle: boolean
  private isClientConnected: boolean
  private inheritEnv: boolean
  private clogsSince: number

  /**
   * Constructor
   *
   * @param  {any} options
   * @param  {any} microservice
   */
  constructor(options: any, microservice: any) {
    this.port = options.port
    this.app = app()
    this.http = new http.Server(this.app)
    this.io = io.listen(this.http)
    this.socket = null
    this.microserviceStr = microservice
    this.rebuildToggle = true
    this.isClientConnected = false
    this.inheritEnv = options.inheritEnv ? options.inheritEnv : false
  }
  /**
   * Starts the UI server
   * @param {Boolean} [doOpen=false]
   */
  async startUI(doOpen = false) {
    this.io.on('connection', socket => {
      if (!this.isClientConnected) {
        this.isClientConnected = true
        socket.removeAllListeners()
        this.socket = socket
        this.sendFile(path.join(process.cwd(), 'microservice.yml'))
        this.initListeners()
        utils.log('Web client connected to socket.')
      }
      this.socket.on('disconnect', () => {
        this.isClientConnected = false
        utils.log('Web client disconnected from socket.')
      })
    })

    if (!this.port) {
      this.port = await utils.getOpenPort()
    }
    this.http.listen(this.port, async () => {
      utils.log(`OMG UI started on http://localhost:${this.port}`)
      if (doOpen) {
        await open(`http://localhost:${this.port}`)
      }
    })
  }

  /**
   * Inits all socket listeners
   */
  private initListeners() {
    this.socket.on('build', (data: any) => {
      this.buildImage(data)
    })
    this.socket.on('run', (data: any) => {
      this.runAction(data)
    })
    this.socket.on('health-check', () => {
      this.healthCheck()
    })
    this.socket.on('inspect', () => {
      this.dockerInspect()
    })
    this.socket.on('subscribe', (data: any) => {
      this.subscribeEvent(data)
    })
    this.socket.on('dockerLogs', () => {
      this.dockerLogs()
    })
    this.socket.on('start', (data: any) => {
      this.startContainer(data)
    })
    this.socket.on('stop', () => {
      this.stopContainer()
    })
    this.socket.on('container-stats', () => {
      this.dockerStats()
    })
    this.socket.on('rebuild', data => {
      this.rebuild(data)
    })
    this.socket.on('rebuild-toggle', data => {
      this.rebuildToggle = data
    })
    this.socket.on('clear-container-logs', timestamp => {
      this.clogsSince = timestamp
    })
    this.socket.on('microservice.yml', (data: any) => {
      const content = new Uint8Array(Buffer.from(data))
      fs.writeFile(
        path.join(process.cwd(), 'microservice.yml'),
        content,
        err => {
          if (err) throw err
          this.validate()
          utils.log('microservice.yml file has been saved!')
        }
      )
    })
  }

  /**
   * Rebuild image and restarts container
   *
   * @param  {any} data Data used to build image
   * @param  {string} microservice
   * @param  {Boolean} [bak=false]
   * @param  {string} appPath
   */
  async rebuild(
    data?: any,
    microservice?: string,
    bak = false,
    appPath?: string
  ) {
    if (this.rebuildToggle) {
      if (appPath) {
        utils.log(
          `${appPath.substr(appPath.lastIndexOf('/') + 1)} changed. Rebuilding.`
        )
      }
      if (microservice) {
        this.microserviceStr = microservice
      }

      this.sendFile(path.join(process.cwd(), 'microservice.yml'))
      await this.stopContainer()
      if (bak && this.rebuildBak) {
        await this.buildImage(this.rebuildBak.build)
      } else {
        await this.buildImage(data.build)
        this.rebuildBak = { build: data.build, start: data.start }
      }
    }
  }

  /**
   * Sends provided file raw content
   *
   * @param  {string} file
   */
  sendFile(file: string) {
    fs.readFile(file, 'utf8', (err: any, data: any) => {
      if (err) throw err
      this.socket.emit('microservice.yml', data)
      this.validate()
    })
  }

  /**
   * socket.emit serializer
   *
   * @param  {string} room
   * @param  {ISocketNotif} msg
   */
  private emit(room: string, msg: ISocketNotif) {
    this.socket.emit(room, msg)
  }

  /**
   * Removes socket listeners
   *
   * @return {Promise} a promise when listeners have been removed
   */
  removeListeners(): Promise<any> {
    return this.socket.removeAllListeners()
  }

  /**
   * Wraps omg-cli validate command
   */
  private async validate() {
    try {
      if (this.microserviceStr === 'ERROR_PARSING') {
        this.emit('validate', {
          notif: this.microserviceStr,
          status: false
        })
      } else {
        utils.checkActionInterface(this.microserviceStr)
        this.microservice = new Microservice(this.microserviceStr)
        this.emit('validate', {
          notif: JSON.stringify(this.microservice.rawData, null, 2),
          status: true
        })
      }
    } catch (e) {
      this.emit('validate', {
        notif: JSON.stringify(e, null, 2),
        status: false
      })
    }
    this.emit('owner', {
      notif: await utils.createImageName(true),
      status: true
    })
  }
  /**
   * Wraps omg-cli build command
   *
   * @param  {IDataBuild} data image name
   */
  async buildImage(data: IDataBuild) {
    await Cli.checkDocker()

    this.emit('build', { notif: 'Building Docker image', status: true })
    try {
      const stream = await new Build(
        data.name || (await utils.createImageName())
      ).go(false, true)
      const dockerode = new Dockerode()
      const log: any = await new Promise((resolve, reject) => {
        dockerode.modem.followProgress(stream, (err, res) =>
          err ? reject(err) : resolve(res)
        )
      })
      for (const line in log) {
        if (log[line].stream) {
          this.socket.emit('build', {
            status: true,
            notif: log[line].stream.trim(),
            build: true
          })
        }
      }
      this.socket.emit('build', {
        status: true,
        built: true
      })
      return data.name
    } catch (e) {
      this.emit('build', {
        status: false,
        notif: `Failed to build: ${e}`
      })
    }
  }

  /**
   * Inspects docker container then the sends result through socket
   */
  private async dockerInspect() {
    if (this.dockerContainer) {
      const output = await this.dockerContainer.getInspect()
      this.emit('inspect', {
        notif: 'Docker inspected',
        status: true,
        log: output
      })
    } else {
      this.emit('inspect', { status: false, notif: 'Container not running' })
    }
  }

  /**
   * Gets and returns docker container stats
   */
  private async dockerStats() {
    if (this.dockerContainer) {
      const output = await this.dockerContainer.getStats()
      this.emit('container-stats', {
        notif: 'Container stats',
        status: true,
        log: output
      })
    } else {
      this.emit('container-stats', {
        status: false,
        notif: 'Container not running'
      })
    }
  }

  /**
   * Gets docker container logs then sends the result through socket
   */
  private async dockerLogs() {
    if (this.dockerContainer) {
      this.socket.emit(
        'dockerLogs',
        await this.dockerContainer.getLogs(this.clogsSince)
      )
    }
  }

  /**
   * Starts the container with the povided data
   *
   * @param  {IStartContainer} data Image name and envs
   * @return {Promise}
   */
  private async startContainer(data: IStartContainer): Promise<string> {
    await Cli.checkDocker()

    if (data && data.image.length > 0) {
      try {
        !utils.doesContainerExist(data.image, await utils.docker.listImages())
      } catch (e) {
        this.emit('start', {
          notif: `Image for microservice is not built. Run \`omg build\` to build the image.`,
          status: false
        })
        return
      }
    } else {
      await this.buildImage({})
    }

    let envObj: any
    try {
      envObj = data.envs
      envObj = utils.matchEnvironmentCases(
        envObj,
        this.microservice.environmentVariables
      )
    } catch (e) {
      this.emit('start', {
        status: false,
        notif: e
      })
      return
    }

    if (this.rebuildBak === undefined) {
      this.rebuildBak = { start: data, build: {} }
    }
    this.dockerContainer = new RunFactory(
      data.image,
      this.microservice,
      null,
      envObj
    ).getRun(null, true)

    // Start container
    this.socket.emit('start', {
      notif: 'Starting Docker container',
      status: true
    })
    this.containerID = await this.dockerContainer.startService(this.inheritEnv)
    this.socket.emit('start', {
      notif: `Started Docker container: ${this.containerID.substring(0, 12)}`,
      status: true,
      started: true,
      ports: this.dockerContainer.getPortbindings(),
      forwards: this.dockerContainer.forwardPortsBindings
    })
    await new Promise(res => setTimeout(res, 1000))
  }

  /**
   * Stops the currently running container
   *
   * @return {Promise}
   */
  stopContainer(): Promise<any> {
    return new Promise(async (resolve, reject) => {
      let output
      if (this.dockerContainer && (await this.dockerContainer.isRunning())) {
        output = await this.dockerContainer.stopService()
        this.emit('stop', {
          status: true,
          notif: `Stoppped Docker container: ${output}`
        })
      }
      resolve()
    })
  }

  /**
   * Removes the current container
   *
   * @return {Promise}
   */
  removeContainer(): Promise<any> {
    return new Promise(async (resolve, reject) => {
      let output
      if (this.dockerContainer && !(await this.dockerContainer.isRunning())) {
        output = await this.dockerContainer.removeContainer()
        this.emit('stop', {
          status: true,
          notif: `Removed Docker container: ${output}`
        })
      }
      resolve()
    })
  }

  /**
   * Run the asked action with params
   *
   * @param  {any} data actions and its params
   */
  private async runAction(data: any) {
    await this.healthCheck()

    // Run action
    this.socket.emit('run', {
      notif: `Running action: \`${data.action}\``,
      status: true
    })
    let output
    try {
      this.dockerContainer.setArgs(data.args)
      output = await this.dockerContainer.exec(data.action)
      this.socket.emit('run', {
        notif: `Ran action: \`${data.action}\` with output: ${output}`,
        status: true
      })
    } catch (e) {
      this.socket.emit('run', {
        notif: `Failed action: \`${data.action}\`: ${e}`,
        status: false
      })
      return
    }
    this.socket.emit('run', {
      output: output,
      notif: output,
      status: true
    })
  }

  /**
   * Subscribes to the asked event eith provided params
   *
   * @param  {IDataAction} data
   */
  private async subscribeEvent(data: any) {
    await Cli.checkDocker()
    await this.runAction({
      action: data.action,
      args: data.args,
      image: data.image
    })

    this.socket.emit('subscribe', {
      notif: `Subscribing to event: \`${data.event}\``,
      status: true
    })

    this.subscribe = new Subscribe(
      this.microservice,
      data.args,
      this.dockerContainer
    )
    try {
      await this.subscribe.go(data.action, data.event)
      this.socket.emit('subscribe', {
        notif: `Subscribed to event: \`${
          data.event
        }\` data will be posted to this terminal window when appropriate`,
        status: true
      })
      setInterval(async () => {
        if (!(await this.dockerContainer.isRunning())) {
          this.socket.emit('subscribe', {
            notif: 'Container unexpectedly stopped',
            status: false,
            logs: `${await this.dockerContainer.getStderr()}`
          })
          return
        }
      }, 1500)
    } catch (e) {
      this.socket.emit('subscribe', {
        notif: `Failed subscribing to event ${data.event}: ${e}`,
        status: false,
        logs: `${await this.dockerContainer.getStderr()}`
      })
      return
    }
  }

  /**
   * Gets docker container health status then sends the result through socket
   */
  private async healthCheck() {
    this.socket.emit('health-check', {
      notif: 'Health check',
      status: true
    })
    if (!(await this.dockerContainer.isRunning())) {
      this.socket.emit('health-check', {
        notif: 'Health check failed',
        status: false,
        log: `${await this.dockerContainer.getStderr()}`
      })
      return
    }
    this.socket.emit('health-check', {
      notif: 'Health check passed',
      status: true
    })
  }
}
