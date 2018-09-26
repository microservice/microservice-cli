const fs = require('fs');
const http = require('http');
const uuidv4 = require('uuid/v4');
const utils = require('../utils');
const homedir = require('os').homedir();
const rp = require('request-promise');
const ora = require('../ora');
const verify = require('../verify');

/**
 * Describes a way to subscribe to an event.
 */
class Subscribe {
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
   * @param {String} event The given event
   */
  async go(event) {
    let spinner = ora.start(`Subscribing to event: \`${event}\``);
    if (!fs.existsSync(`${homedir}/.omg.json`)) {
      throw {
        spinner,
        message: `Failed subscribing to event: \`${event}\`. You must run \`omg exec \`action_for_event\`\` before trying to subscribe to an event`,
      };
    }

    this._omgJson = JSON.parse(fs.readFileSync(`${homedir}/.omg.json`, 'utf8'));
    this._action = this._microservice.getAction(this._omgJson[process.cwd()].events[event].action);
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
      server.listen(port, '127.0.0.1');

      this._id = uuidv4();
      await rp({
        method: this._event.subscribe.method,
        uri: `http://localhost:${this._omgJson[process.cwd()].ports[this._event.subscribe.port]}${this._event.subscribe.path}`,
        body: Object.assign(this._arguments, {
          id: this._id,
          direct: 'responds', // what is this?
          endpoint: `http://host.docker.internal:${port}`,
        }),
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

module.exports = Subscribe;
