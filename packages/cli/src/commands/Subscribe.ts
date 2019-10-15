import fs from 'fs'
import http from 'http'
import uuidv4 from 'uuid/v4'
import { Action, Event, Microservice } from '@microservices/validate'
import * as utils from '../utils'
import * as verify from '../verify'
import * as rp from '../request'
import Run from './run/Run'

const homedir = require('os').homedir()

/**
 * Describes a way to subscribe to an event.
 */
export default class Subscribe {
  private readonly microservice: Microservice
  private readonly _arguments: object
  private readonly run: Run
  private action: Action
  private omsJson: object
  private event: Event
  private id: string

  /**
   *
   * @param {Microservice} microservice The given {@link Microservice}
   * @param {Object} _arguments The given arguments
   * @param {Run} run The {@link Run} object that started the event
   */
  public constructor(microservice: Microservice, _arguments: any, run: Run) {
    this.microservice = microservice
    this._arguments = _arguments
    this.run = run
  }

  /**
   * Subscribes you to the given event.
   *
   * @param {String} action The given action
   * @param {String} event The given event
   * @param  {string} ip The given IP address
   */
  public async go(action: string, event: string) {
    this.omsJson = JSON.parse(fs.readFileSync(`${homedir}/.oms.json`, 'utf8'))
    this.action = this.microservice.getAction(action)
    this.event = this.action.getEvent(event)
    if (!this.event.areRequiredArgumentsSupplied(this._arguments)) {
      throw `Failed subscribing to event: \`${event}\`. Need to supply required arguments: \`${this.event.requiredArguments.toString()}\``
    }

    verify.verifyArgumentTypes(this.event, this._arguments)
    this.castTypes()
    verify.verifyArgumentConstrains(this.event, this._arguments)
    const server = this.startOMSServer()
    const port = await utils.getOpenPort()
    server.listen({ port, hostname: '127.0.0.1' })
    this.id = uuidv4()
    await this.subscribe(port)
  }

  /**
   * Subscribes to an event, the try catch is needed for the slow start of the container. (same issue with http commands)
   *
   * @param {Number} port The given port to request on
   * @param  {string} ip The given IP address
   * @return {Promise<void>}
   */
  private async subscribe(port: number): Promise<void> {
    await rp.makeRequest({
      method: this.event.subscribe.method,
      uri: `http://localhost:${this.omsJson[process.cwd()].ports[this.event.subscribe.port]}${this.event.subscribe.path}`,
      body: {
        id: this.id,
        endpoint: `http://host.docker.internal:${port}`,
        event: this.event.name,
        data: this._arguments,
      },
      json: true,
    })
  }

  /**
   * Starts a server for a streaming service to POST back to.
   *
   * @return {Server} The server
   */
  private startOMSServer() {
    return http.createServer((req, res) => {
      if (req.method === 'POST') {
        req.on('data', async data => {
          try {
            verify.verifyOutputType(this.event, data.toString())
            if (
              this.event.output &&
              this.event.output.type &&
              (this.event.output.type === 'map' || this.event.output.type === 'object')
            ) {
              utils.log(JSON.stringify(JSON.parse(data), null, 2))
            } else {
              utils.log(data)
            }
          } catch (e) {
            utils.error(e)
          }
          res.end('Done')
        })
      }
    })
  }

  /**
   * Cast the types of the arguments. Everything comes in as a string so it's important to convert to given type.
   */
  private castTypes() {
    const argumentList = Object.keys(this._arguments)
    for (let i = 0; i < argumentList.length; i += 1) {
      const argument = this.event.getArgument(argumentList[i])
      this._arguments[argument.name] = utils.typeCast[argument.type](this._arguments[argument.name])
    }
  }

  /**
   * Unsubscribe this {@link Subscribe}'s {@link Event}.
   */
  public async unsubscribe() {
    if (this.event.unsubscribe === null) {
      return
    }
    await rp.makeRequest({
      method: this.event.unsubscribe.method,
      uri: `http://localhost:${this.omsJson[process.cwd()].ports[this.event.unsubscribe.port]}${
        this.event.unsubscribe.path
      }`,
      body: {
        id: this.id,
      },
      json: true,
    })
  }
}
