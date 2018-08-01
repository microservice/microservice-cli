const Arguments = require('./Argument');
const Http = require('./Http');
const validateCommand = require('../../schema/schema').command;

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
    const isValid = validateCommand(rawCommand);
    if (!isValid.valid) {
      isValid.text = isValid.text.replace('data', `commands.${name}`);
      throw isValid;
    }
    this._name = name;
    this._output = rawCommand.output;
    this._help = rawCommand.help || null;
    this._argumentsMap = null;
    if (rawCommand.arguments) {
      this._argumentsMap = {};
      const _arguments = Object.keys(rawCommand.arguments);
      for (let i = 0; i < _arguments.length; i += 1) {
        this._argumentsMap[_arguments[i]] = new Arguments(_arguments[i], rawCommand.arguments[_arguments[i]]);
      }
    }
    this._http = ((rawCommand.http) ? new Http(name, rawCommand.http) : null);
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
    if ((this._http !== null) && (this._runCommand !== null)) {
      throw {
        context: `Command with name: \`${name}\``,
        message: 'A Command can only interface with exec, an http command, or a run command',
      };
    }
    if (this._http !== null) {
      this._checkHttpArguments();
    }
  }

  /**
   * Check validity of an http command.
   *
   * @private
   */
  _checkHttpArguments() {
    let endpoint = this.http.endpoint;
    for (let i = 0; i < this.arguments.length; i += 1) {
      const argument = this.arguments[i];
      if (argument.location === null) {
        throw {
          context: `Argument: \`${argument.name}\` for command: \`${this.name}\``,
          message: 'Commands\' arguments that interface via http must provide a location',
        };
      }
      if (argument.location === 'path') {
        if (!this.http.endpoint.includes(`{{${argument.name}}}`)) {
          throw {
            context: `Argument: \`${argument.name}\` for command: \`${this.name}\``,
            message: 'Path parameters must be defined in the http endpoint, of the form `{{argument}}`',
          };
        } else {
          endpoint = endpoint.replace(`{{${argument.name}}}`, argument.name);
        }
        if (!argument.isRequired() && (argument.default === null)) {
          throw {
            context: `Argument: \`${argument.name}\` for command: \`${this.name}\``,
            message: 'Path parameters must be marked as required or be provided a default variable',
          };
        }
      }
    }
    const extraPathParams = endpoint.match(/({{[a-zA-Z]+}})/g);
    if (extraPathParams !== null) {
      throw {
        context: `Path parameter(s): \`${extraPathParams.toString()}\` for command: \`${this.name}\``,
        message: 'If a url specifies a path parameter i.e. `{{argument}}`, the argument must be defined in the command',
      };
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
   * Checks if the required arguments are supplied.
   *
   * @param {Object} _arguments The given argument mapping
   * @return {Boolean} True if all required arguments are supplied, otherwise false
   */
  areRequiredArgumentsSupplied(_arguments) {
    const requiredArguments = this.requiredArguments;
    for (let i = 0; i < requiredArguments.length; i += 1) {
      if (!Object.keys(_arguments).includes(requiredArguments[i])) {
        return false;
      }
    }
    return true;
  }

  /**
   * Get this {@link Command}'s required {@link Argument}s.
   *
   * @return {Array<String>} The required {@link Argument}'s names
   */
  get requiredArguments() {
    return this.arguments.filter((a) => a.isRequired()).map((a) => a.name);
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
   * @return {Argument} The {@link Argument} with given name
   */
  getArgument(argument) {
    if ((this._argumentsMap === null) || (!this._argumentsMap[argument])) {
      throw `Argument \`${argument}\` does not exist`;
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
