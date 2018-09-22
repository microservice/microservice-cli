const Argument = require('./Argument');
const Http = require('./Http');
const validateEvent = require('../../schema/schema').event;

/**
 * Describes a command.
 */
class Event {
  /**
   * Build a {@link Event}.
   *
   * @param {String} name The given name
   * @param {Object} rawCommand The raw data
   */
  constructor(name, rawCommand) {
    const isValid = validateEvent(rawCommand);
    if (!isValid.valid) {
      isValid.text = isValid.text.replace('data', `actions.events.${name}`);
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
        this._argumentsMap[_arguments[i]] = new Argument(_arguments[i], rawCommand.arguments[_arguments[i]]);
      }
    }
    this._subscribe = new Http(name, rawCommand.http.subscribe, rawCommand.http.port);
    this._unsubscribe = new Http(name, rawCommand.http.unsubscribe, rawCommand.http.port);
    this._checkHttpArguments(this._subscribe);
    this._checkHttpArguments(this._unsubscribe);
  }

  /**
   * Check validity of a Event command.
   *
   * @param {Http} http The given http: subscribe or unsubscribe
   * @private
   */
  _checkHttpArguments(http) {
    let _path = http.path;
    for (let i = 0; i < this.arguments.length; i += 1) {
      const argument = this.arguments[i];
      if (argument.in === null) {
        throw {
          context: `Argument: \`${argument.name}\` for command: \`${this.name}\``,
          message: 'Commands\' arguments that interface via http must provide an in',
        };
      }
      if (argument.in === 'path') {
        if (!http.path.includes(`{{${argument.name}}}`)) {
          throw {
            context: `Argument: \`${argument.name}\` for command: \`${this.name}\``,
            message: 'Path parameters must be defined in the http path, of the form `{{argument}}`',
          };
        } else {
          _path = _path.replace(`{{${argument.name}}}`, argument.name);
        }
        if (!argument.isRequired() && (argument.default === null)) {
          throw {
            context: `Argument: \`${argument.name}\` for command: \`${this.name}\``,
            message: 'Path parameters must be marked as required or be provided a default variable',
          };
        }
      }
    }
    const extraPathParams = _path.match(/({{[a-zA-Z]+}})/g);
    if (extraPathParams !== null) {
      throw {
        context: `Path parameter(s): \`${extraPathParams.toString()}\` for command: \`${this.name}\``,
        message: 'If a url specifies a path parameter i.e. `{{argument}}`, the argument must be defined in the command',
      };
    }
  }

  /**
   * Get's the name of this {@link Event}.
   *
   * @return {String} The name
   */
  get name() {
    return this._name;
  }

  /**
   * The output type of this {@link Event}.
   *
   * @return {Object} The output type
   */
  get output() {
    return this._output;
  }

  /**
   * Get this {@Event}'s help.
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
   * Get this {@link Event}'s required {@link Argument}s.
   *
   * @return {Array<String>} The required {@link Argument}'s names
   */
  get requiredArguments() {
    return this.arguments.filter((a) => a.isRequired()).map((a) => a.name);
  }

  /**
   * Get the {@ink Argument}s for this {@link Event}.
   *
   * @return {Array<Argument>} The {@link Argument}s
   */
  get arguments() {
    if (this._argumentsMap === null) {
      return [];
    }
    return Object.values(this._argumentsMap);
  }

  /**
   * Get an {@link Argument} based on given argument from this {@link Event}.
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
   * The this {@link Event}s {@link Http} service.
   *
   * @return {Http} The {@link Http} service
   */
  get http() {
    return this._http;
  }
}

module.exports = Event;
