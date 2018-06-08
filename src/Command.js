const Arguments = require('./Arguments');
const Http = require('./Http');

class Command {
  constructor(name, rawCommand) {
    this._help = rawCommand.help || null;
    this._format = rawCommand.format || null;
    this._argumentsMap = null;
    if (rawCommand.arguments) {
      this._argumentsMap = {};
      const _arguments = Object.keys(rawCommand.arguments);
      for (let i = 0; i < _arguments.length; i += 1) {
        this._argumentsMap[_arguments[i]] = new Arguments(_arguments[i], rawCommand.arguments[_arguments[i]]);
      }
    }
    this._http = ((rawCommand.http) ? new Http(rawCommand.http) : null);
    // this._server = ((rawCommand.server) ? new Server(rawCommand.server) : null); // TODO
  }

  get help() {
    return this._help;
  }

  get format() {
    return this._format;
  }

  get arguments() {
    if (this._argumentsMap === null) {
      return [];
    }
    return Object.values(this._argumentsMap);
  }

  getArgument(argument) {
    if ((this._argumentsMap === null) || (!this._argumentsMap[argument])) {
      throw 'Argument does not exist';
    }
    return this._argumentsMap[argument];
  }

  /**
   *
   * @returns {Http}
   */
  get http() {
    return this._http;
  }

  get server() {
    return this._server
  }
}

module.exports = Command;
