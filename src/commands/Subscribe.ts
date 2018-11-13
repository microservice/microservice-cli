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
  _microservice: Microservice;
  _arguments: object;
  _action: Action;
  _omgJson: object;
  _event: Event;
  _id: string;

  /**
   *
   * @param {Microservice} microservice The given {@link Microservice}
   * @param {Object} _arguments The given arguments
   */
  constructor(microservice, _arguments) {
    this._microservice = microservice;
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
    if (!fs.existsSync(`${homedir}/.omg.json`)) {
      throw {
        spinner,
        message: `Failed subscribing to event: \`${event}\`. You must run \`omg exec \`action_for_event\`\` before trying to subscribe to an event`,
      };
    }

    this._omgJson = JSON.parse(fs.readFileSync(`${homedir}/.omg.json`, 'utf8'));
    if (!this._omgJson[process.cwd()]) {
      throw {
        spinner,
        message: `Failed subscribing to event: \`${event}\`. You must run \`omg exec \`action_for_event\`\` before trying to subscribe to an event`,
      };
    }
    this._action = this._microservice.getAction(action);
    this._event = this._action.getEvent(event);
    if (!this._event.areRequiredArgumentsSupplied(this._arguments)) {
      throw {
        spinner,
        message: `Failed subscribing to event: \`${event}\`. Need to supply required arguments: \`${this._event.requiredArguments.toString()}\``,
      };
    }

    try {
      verify.verifyArgumentTypes(this._event, this._arguments);
      this._castTypes();
      const server = this._startOMGServer();
      const port = await utils.getOpenPort();
      server.listen({port, hostname: '127.0.0.1'});

      this._id = uuidv4();
      await rp({
        method: this._event.subscribe.method,
        uri: `http://localhost:${this._omgJson[process.cwd()].ports[this._event.subscribe.port]}${this._event.subscribe.path}`,
        body: {
          id: this._id,
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
      const argument = this._event.getArgument(argumentList[i]);
      this._arguments[argument.name] = utils.typeCast[argument.type](this._arguments[argument.name]);
    }
  }

  /**
   * Unsubscribe this {@link Subscribe}'s {@link Event}.
   */
  async unsubscribe() {
    if (this._event.unsubscribe === null) {
      return;
    }
    await rp({
      method: this._event.unsubscribe.method,
      uri: `http://localhost:${this._omgJson[process.cwd()].ports[this._event.unsubscribe.port]}${this._event.unsubscribe.path}`,
      body: {
        id: this._id,
      },
      json: true,
    });
  }
}

const timer = (ms) => new Promise((res) => setTimeout(res, ms));
