import * as fs from 'fs';
import * as http from 'http';
import * as utils from '../utils';
import * as verify from '../verify';
import Microservice from '../models/Microservice';
import Action from '../models/Action';
import Event from '../models/Event';
const homedir = require('os').homedir();
const uuidv4 = require('uuid/v4');
import * as rp from '../request';
import Exec from './exec/Exec';

/**
 * Describes a way to subscribe to an event.
 */
export default class Subscribe {
  private readonly microservice: Microservice;
  private readonly _arguments: object;
  private readonly exec: Exec;
  private action: Action;
  private omgJson: object;
  private event: Event;
  private id: string;

  /**
   *
   * @param {Microservice} microservice The given {@link Microservice}
   * @param {Object} _arguments The given arguments
   * @param {Exec} exec The {@link Exec} object that started the event
   */
  constructor(microservice: Microservice, _arguments: any, exec: Exec) {
    this.microservice = microservice;
    this._arguments = _arguments;
    this.exec = exec;
  }

  /**
   * Subscribes you to the given event.
   *
   * @param {String} action The given action
   * @param {String} event The given event
   */
  async go(action: string, event:string) {
    this.omgJson = JSON.parse(fs.readFileSync(`${homedir}/.omg.json`, 'utf8'));
    this.action = this.microservice.getAction(action);
    this.event = this.action.getEvent(event);
    if (!this.event.areRequiredArgumentsSupplied(this._arguments)) {
      throw `Failed subscribing to event: \`${event}\`. Need to supply required arguments: \`${this.event.requiredArguments.toString()}\``;
    }

    verify.verifyArgumentTypes(this.event, this._arguments);
    this.castTypes();
    const server = this.startOMGServer();
    const port = await utils.getOpenPort();
    server.listen({port, hostname: '127.0.0.1'});
    this.id = uuidv4();
    await this.subscribe(port);
  }

  /**
   * Subscribes to an event, the try catch is needed for the slow start of the container. (same issue with http commands)
   *
   * @param {Number} port The given port to request on
   * @return {Promise<void>}
   */
  private async subscribe(port: number): Promise<void> {
    await rp.makeRequest({
      method: this.event.subscribe.method,
      uri: `http://localhost:${this.omgJson[process.cwd()].ports[this.event.subscribe.port]}${this.event.subscribe.path}`,
      body: {
        id: this.id,
        endpoint: `http://host.docker.internal:${port}`,
        data: this._arguments,
      },
      json: true,
    });
  }

  /**
   * Starts a server for a streaming service to POST back to.
   *
   * @return {Server} The server
   */
  private startOMGServer() {
    return http.createServer((req, res) => {
      if (req.method === 'POST') {
        req.on('data', async (data) => {
          try {
            verify.verifyOutputType(this.event, data.toString());
            if ((this.event.output) && (this.event.output.type) && ((this.event.output.type === 'map') || this.event.output.type === 'object')) {
              utils.log(JSON.stringify(JSON.parse(data), null, 2));
            } else {
              utils.log(data);
            }
          } catch (e) {
            utils.error(e);
          }
          res.end('Done');
        });
      }
    });
  }

  /**
   * Cast the types of the arguments. Everything comes in as a string so it's important to convert to given type.
   */
  private castTypes() {
    const argumentList = Object.keys(this._arguments);
    for (let i = 0; i < argumentList.length; i += 1) {
      const argument = this.event.getArgument(argumentList[i]);
      this._arguments[argument.name] = utils.typeCast[argument.type](this._arguments[argument.name]);
    }
  }

  /**
   * Unsubscribe this {@link Subscribe}'s {@link Event}.
   */
  async unsubscribe() {
    if (this.event.unsubscribe === null) {
      return;
    }
    await rp.makeRequest({
      method: this.event.unsubscribe.method,
      uri: `http://localhost:${this.omgJson[process.cwd()].ports[this.event.unsubscribe.port]}${this.event.unsubscribe.path}`,
      body: {
        id: this.id,
      },
      json: true,
    });
  }
}
