const Arguments = require('./Argument');
const Http = require('./Http');

/**
 * Describes a command.
 */
class Command {
  /**
   * Build a {@link Command}.
   *
   * @param {String} name The given name
   * @param {Object} rawCommand The raw data
   */
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

  /**
   * Get's the name of this {@link Command}.
   *
   * @return {String} The name
   */
  get name() {
    return this._name;
  }

  /**
   * The output type of this {@link Command}.
   *
   * @return {Object} The output type
   */
  get output() {
    return this._output;
  }

  /**
   * Get this {@Command}'s help.
   *
   * @return {String|null} The help
   */
  get help() {
    return this._help;
  }

  /**
   * Get the format of this {@link Command}.
   *
   * @return {String|null}
   */
  get format() {
    return this._format;
  }

  /**
   * Checks if the required arguments are supplied.
   *
   * @param {Object} _arguments The given argument mapping
   * @return {Boolean} True if all required arguments are supplied, otherwise false
   */
  areRequiredArgumentsSupplied(_arguments) {
    const requiredArguments = this.arguments.filter((argument) => argument.isRequired()).map((argument) => argument.name);
    for (let i = 0; i < requiredArguments.length; i += 1) {
      if (!Object.keys(_arguments).includes(requiredArguments[i])) {
        return false;
      }
    }
    return true;
  }

  /**
   * Get the {@ink Arguments}s for this {@link Command}.
   *
   * @return {Array<Arguments>} The {@link Arguments}s
   */
  get arguments() {
    if (this._argumentsMap === null) {
      return [];
    }
    return Object.values(this._argumentsMap);
  }

  /**
   * Get an {@link Argument} based on given argument from this {@link Command}.
   *
   * @param {String} argument The given argument
   * @throws {String} If the argument does not exists
   * @return {Command} The command with given name
   */
  getArgument(argument) {
    if ((this._argumentsMap === null) || (!this._argumentsMap[argument])) {
      throw 'Argument does not exist';
    }
    return this._argumentsMap[argument];
  }

  /**
   * The this {@link Command}s {@link Http} service.
   *
   * @return {Http} The {@link Http} service
   */
  get http() {
    return this._http;
  }

  /**
   * The the run object for this {@link Command}
   *
   * @return {null|Object}
   */
  get run() {
    return this._runCommand;
  }
}

module.exports = Command;
