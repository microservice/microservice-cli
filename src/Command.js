const Arguments = require('./Arguments');
const Http = require('./Http');

class Command {
  constructor(name, rawCommand) {
    this._name = name;
    this._output = rawCommand.output;
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
    this._runCommand = null;
    if (rawCommand.run) {
      this._runCommand = {};
      this._runCommand.command = rawCommand.run.command[0];
      this._runCommand.args = '';
      this._runCommand.port = rawCommand.run.port;
      for (let i = 1; i < rawCommand.run.command.length; i += 1) {
        this._runCommand.args += rawCommand.run.command[i] + ' ';
      }
    }
  }

  get name () {
    return this._name;
  }

  get output() {
    return this._output;
  }

  get help() {
    return this._help;
  }

  get format() {
    return this._format;
  }

  areRequiredArgumentsSupplied(_arguments) {
    const requiredArguments = this.arguments.filter(argument => argument.isRequired()).map(argument => argument.name);
    for (let i = 0; i < requiredArguments.length; i += 1) {
      if (!Object.keys(_arguments).includes(requiredArguments[i])) {
        return false;
      }
    }
    return true;
  }

  /**
   *
   * @return {Array<Arguments>}
   */
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

  /**
   *
   * @return {null|{command: String, args: String, port: Number}}
   */
  get run() {
    return this._runCommand;
  }
}

module.exports = Command;
