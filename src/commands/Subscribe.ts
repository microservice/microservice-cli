import * as fs from 'fs';
import * as http from 'http';
import * as utils from '../utils';
import * as rp from 'request-promise';
import ora from '../ora';
import * as verify from '../verify';
import Microservice from '../models/Microservice';
import Action from '../models/Action';
import Event from '../models/Event';
const homedir = require('os').homedir();
const uuidv4 = require('uuid/v4');

/**
 * Describes a way to subscribe to an event.
 */
export default class Subscribe {
  private readonly microservice: Microservice;
  private readonly _arguments: object;
  private action: Action;
  private omgJson: object;
  private event: Event;
  private id: string;

  /**
   *
   * @param {Microservice} microservice The given {@link Microservice}
   * @param {Object} _arguments The given arguments
   */
  constructor(microservice: Microservice, _arguments: any) {
    this.microservice = microservice;
    this._arguments = _arguments;
  }

  /**
   * Subscribes you to the given event.
   *
   * @param {String} action The given action
   * @param {String} event The given event
   */
  async go(action: string, event:string) {
    const spinner = ora.start(`Subscribing to event: \`${event}\``);
    await timer(3000);

    this.omgJson = JSON.parse(fs.readFileSync(`${homedir}/.omg.json`, 'utf8'));
    if (!this.omgJson[process.cwd()]) {
      throw {
        spinner,
        message: `Failed subscribing to event: \`${event}\`. You must run \`omg exec \`action_for_event\`\` before trying to subscribe to an event`,
      };
    }
    this.action = this.microservice.getAction(action);
    this.event = this.action.getEvent(event);
    if (!this.event.areRequiredArgumentsSupplied(this._arguments)) {
      throw {
        spinner,
        message: `Failed subscribing to event: \`${event}\`. Need to supply required arguments: \`${this.event.requiredArguments.toString()}\``,
      };
    }

    try {
      verify.verifyArgumentTypes(this.event, this._arguments);
      this._castTypes();
      const server = this._startOMGServer();
      const port = await utils.getOpenPort();
      server.listen({port, hostname: '127.0.0.1'});

      this.id = uuidv4();
      await rp({
        method: this.event.subscribe.method,
        uri: `http://localhost:${this.omgJson[process.cwd()].ports[this.event.subscribe.port]}${this.event.subscribe.path}`,
        body: {
          id: this.id,
          endpoint: `http://host.docker.internal:${port}`,
          data: this._arguments,
        },
        json: true,
      });
      spinner.succeed(`Subscribed to event: \`${event}\` data will be posted to this terminal window when appropriate`);
    } catch (e) {
      let message = `Failed subscribe to event: \`${event}\`. ${e.toString().trim()}`;
      if (e.error.code === 'ECONNREFUSED') {
        message = `No running process to subscribe to for event: \`${event}\`. Be sure to run the action for the given event (\`omg exec \`action_for_event\`\`)`;
      }
      throw {
        spinner,
        message,
      };
    }
  }

  /**
   * Starts a server for a streaming service to POST back to.
   *
   * @return {Server} The server
   * @private
   */
  _startOMGServer() {
    return http.createServer((req, res) => {
      if (req.method === 'POST') {
        req.on('data', async (data) => {
          process.stdout.write(`${data}\n`);
        });
        res.end('Done');
      }
    });
  }

  /**
   * Cast the types of the arguments. Everything comes in as a string so it's important to convert to given type.
   *
   * @private
   */
  _castTypes() {
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
    await rp({
      method: this.event.unsubscribe.method,
      uri: `http://localhost:${this.omgJson[process.cwd()].ports[this.event.unsubscribe.port]}${this.event.unsubscribe.path}`,
      body: {
        id: this.id,
      },
      json: true,
    });
  }
}

const timer = (ms) => new Promise((res) => setTimeout(res, ms));
