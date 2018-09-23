const fs = require('fs');
const http = require('http');
const utils = require('../utils');
const homedir = require('os').homedir();
const rp = require('request-promise');

class Subscribe {
  /**
   *
   * @param {Microservice} microservice
   * @param {Object} _arguments
   */
  constructor(microservice, _arguments) {
    this._microservice = microservice;
    this._arguments = _arguments;
  }

  async go(event) {
    const omgJson = JSON.parse(fs.readFileSync(`${homedir}/.omg.json`, 'utf8'));
    this._action = this._microservice.getAction(omgJson[process.cwd()].events[event].action);

    const server = this._startOMGServer();
    const port = await utils.getOpenPort();
    server.listen(port, '127.0.0.1');

    var options = {
      method: 'POST',
      uri: `http://localhost:${omgJson[process.cwd()].ports[5000]}${this._action.getEvent(event).subscribe.path}`,
      body: {
        "id": "1231241241",
        "direct": "responds",
        "endpoint": `http://host.docker.internal:${port}`,
        "channel": "CAL6YMP9C",
        "pattern": "scoot"
      },
      json: true // Automatically stringifies the body to JSON
    };

    await rp(options)



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
            console.log('asdasd')
            // verify.verifyOutputType(that._command, data + '');
            process.stdout.write(`${data}\n`);
          } catch (e) {
            // await this.serverKill();
            // process.stderr.write(`${logSymbols.error} Failed command \`${this._command.name}\` ${e}`);
            console.error('TOOD BAD')
            process.exit(1);
          }
        });
        res.end('Done');
      }
    });
  }
}

module.exports = Subscribe;
