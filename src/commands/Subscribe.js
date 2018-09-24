const fs = require('fs');
const http = require('http');
const utils = require('../utils');
const homedir = require('os').homedir();
const rp = require('request-promise');

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
    const omgJson = JSON.parse(fs.readFileSync(`${homedir}/.omg.json`, 'utf8'));
    this._action = this._microservice.getAction(omgJson[process.cwd()].events[event].action);
    this._eventName = event;

    const server = this._startOMGServer();
    const port = await utils.getOpenPort();
    server.listen(port, '127.0.0.1');

    let options = {
      method: 'POST',
      uri: `http://localhost:${omgJson[process.cwd()].ports[5000]}${this._action.getEvent(event).subscribe.path}`,
      body: {
        id: '1231241241',
        direct: 'responds',
        endpoint: `http://host.docker.internal:${port}`,
        channel: 'CAL6YMP9C',
        pattern: 'scoot',
      },
      json: true, // Automatically stringifies the body to JSON
    };

    await rp(options);


    //   this._command = this._microservice.getAc(event);
    //   let spinner = ora.start(`Running command: \`${this._command.name}\``);
    //   this._setDefaultArguments();
    //   this._setDefaultEnvironmentVariables();
    //   if (!this._command.areRequiredArgumentsSupplied(this._arguments)) {
    //     throw {
    //       spinner,
    //       message: `Failed command: \`${command}\`. Need to supply required arguments: \`${this._command.requiredArguments.toString()}\``,
    //     };
    //   }
    // }
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
          try {
            process.stdout.write(`${data}\n`);
          } catch (e) {
            process.stderr.write(`Failed to subscribe to \`${this._eventName}\` ${e}`);
            process.exit(1);
          }
        });
        res.end('Done');
      }
    });
  }
}

module.exports = Subscribe;
