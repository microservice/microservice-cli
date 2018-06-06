const Arguments = require('./Arguments');

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
    this._http = rawCommand.http || null; // TODO maybe a class
    this._getServer = rawCommand.server || null; // TODO maybe a class
  }

  getHelp() {
    return this._help;
  }

  getFormat() {
    return this._format;
  }

  getArguments() {

  }

  getRequiredArguments() {

  }

  getHttp() {

  }

  getServer() {

  }
}

module.exports = Command;
