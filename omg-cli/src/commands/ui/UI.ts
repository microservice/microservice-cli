import * as utils from '../../utils'
import http from './wrappers/http'
import io from './wrappers/socket-io'
import { app } from 'omg-ui'
import Run from '../run/Run'
import Subscribe from '../Subscribe'
import Microservice from '../../models/Microservice'
import Build from '../Build';
import Cli from '../../cli/Cli';
import RunFactory from '../run/RunFactory';

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

  constructor(port: number, microservice: any) {
    this.port = port
    this.app = app()
    this.http = http.Server(this.app)
    this.io = io.listen(this.http)
    this.microserviceStr = microservice
    this.socket = null
  }

  startUI() {
    this.io.on('connection', socket => {
      socket.removeAllListeners()
      this.socket = socket
      this.validate()
      this.initListeners()
      // setInterval(() => {
      //   this.usage()
      // }, 1000)
      utils.log('Web client connected to socket.')
      this.socket.on('disconnect', () => {
        utils.log('Web client disconnected from socket.')
      })
    })

    this.http.listen(this.port, () => {
      utils.log(`OMG UI started on http://localhost:${this.port}`)
    })
  }

  reloadUI(microservice: any) {
    this.microserviceStr = microservice
    this.socket.emit('browserReload', 'true')
  }

  private emit(room: string, msg: ISocketNotif) {
    this.socket.emit(room, msg)
  }

  private initListeners() {
    this.socket.on('build', (data: any) => {
      this.buildImage(data)
    })
    this.socket.on('run', (data: any) => {
      this.runAction(data)
    })
    this.socket.on('healthCheck', () => {
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
  }

  private async validate() {
    try {
      utils.checkActionInterface(this.microserviceStr)
      this.microservice = new Microservice(this.microserviceStr)
      this.emit('validate', {
        notif: JSON.stringify(this.microservice.rawData, null, 2),
        status: true
      })
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

  private async buildImage(data: IDataBuild) {
    await Cli.checkDocker()

    this.emit('build', { notif: 'Building Docker image', status: true })
    try {
      const res = await new Build(
        data.name || (await utils.createImageName())
      ).go(false, true)
      this.emit('build', {
        status: true,
        notif: `Built Docker image with name: ${res.name}`,
        log: res.log
      })
      return res.name
    } catch (e) {
      this.emit('build', {
        status: false,
        notif: `Failed to build: ${e}`
      })
    }
  }

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

  private async dockerLogs() {
    this.socket.emit('dockerLogs', await this.dockerContainer.getLogs())
  }

  private async startContainer(data: IStartContainer): Promise<string> {
    await Cli.checkDocker()

    if (data && data.image.length > 0) {
      if (
        !utils.doesContainerExist(data.image, await utils.docker.listImages())
      ) {
        this.emit('start', {
          notif: `Image for microservice is not built. Run \`omg build\` to build the image.`,
          status: false
        })
        return
      }
    } else {
      data.image = await this.buildImage({})
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
    this.containerID = await this.dockerContainer.startService()
    this.socket.emit('start', {
      notif: `Started Docker container: ${this.containerID.substring(0, 12)}`,
      status: true
    })
    await new Promise(res => setTimeout(res, 1000))
  }

  private async stopContainer(): Promise<any> {
    const output = await this.dockerContainer.stopService()
    this.emit('stop', {
      status: true,
      notif: `Stoppped Docker container: ${output}`
    })
  }

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
      if (await this.dockerContainer.isRunning()) {
        await this.dockerContainer.stopService()
      }
      this.socket.emit('run', {
        notif: `Failed action: \`${data.action}\`: ${e}`,
        status: false
      })
      return
    }
    this.socket.emit('run', {
      notif: output,
      status: true
    })
  }

  private async subscribeEvent(data: IDataAction) {
    await Cli.checkDocker()
    await this.runAction({
      action: data.action,
      args: [],
      envs: data.envs,
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
      if (await this.dockerContainer.isRunning()) {
        await this.dockerContainer.stopService()
      }
      this.socket.emit('subscribe', {
        notif: `Failed subscribing to event ${data.event}: ${e}`,
        status: false,
        logs: `${await this.dockerContainer.getStderr()}`
      })
      return
    }
  }

  private async healthCheck() {
    this.socket.emit('healthCheck', {
      notif: 'Health check',
      status: true
    })
    if (!(await this.dockerContainer.isRunning())) {
      this.socket.emit('healthCheck', {
        notif: 'Health check failed',
        status: false,
        log: `${await this.dockerContainer.getStderr()}`
      })
      return
    }
    this.socket.emit('healthCheck', {
      notif: 'Health check passed',
      status: true
    })
  }
}
