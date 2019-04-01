import * as utils from '../../utils'
import http from './wrappers/http'
import io from './wrappers/socket-io'
import { app } from 'omg-ui'
import Run from '../run/Run'
import Subscribe from '../Subscribe'
import Microservice from '../../models/Microservice'

interface ISocketNotif {
  notif: any
  status: boolean
  log?: string
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
      // this.initListeners()
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
}
