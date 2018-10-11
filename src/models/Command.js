const Argument = require('./Argument');
const validateAction = require('../../schema/schema').action;
const validateEvent = require('../../schema/schema').event;

/**
 * Describes a general command. NOTE: this is used as an Abstract Class and should not be instantiated.
 */
class Command {
  /**
   * Builds a {@link Command}.
   *
   * @param {String} name The given name
   * @param {Object} rawCommand The raw data
   * @param {boolean} isAction Describes if a command is an {@link Action} or {@link Event} // TODO say what null is
   */
  constructor(name, rawCommand, actionName) {
    this._isAction = actionName === null;
    let argumentPath = name;
    if (this._isAction) {
      const isValid = validateAction(rawCommand);
      if (!isValid.valid) {
        isValid.text = isValid.text.replace('data', `actions.${name}`);
        throw isValid;
      }
    } else {
      argumentPath = `${actionName}.events.${name}`;
      const isValid = validateEvent(rawCommand);
      if (!isValid.valid) {
        isValid.text = isValid.text.replace('data', `actions.events.${name}`);
        throw isValid;
      }
    }
    this._name = name;
    this._help = rawCommand.help || null;
    this._argumentsMap = null;
    if (rawCommand.arguments) {
      this._argumentsMap = {};
      const _arguments = Object.keys(rawCommand.arguments);
      for (let i = 0; i < _arguments.length; i += 1) {
        this._argumentsMap[_arguments[i]] = new Argument(_arguments[i], argumentPath, rawCommand.arguments[_arguments[i]]);
      }
    }
  }

  /**
   * Check validity of an http interfacing {@link Command}.
   *
   * @param {Http} http The given {@link Http}
   * @private
   */
  _checkHttpArguments(http) {
    let _path = http.path;
    let commandType = 'action';
    let commandTypeUpper = 'Action';
    if (!this._isAction) {
      commandType = 'event';
      commandTypeUpper = 'Event';
    }

    for (let i = 0; i < this.arguments.length; i += 1) {
      const argument = this.arguments[i];
      if (argument.in === null) {
        throw {
          context: `Argument: \`${argument.name}\` for ${commandType}: \`${this.name}\``,
          message: `${commandTypeUpper}s' arguments that interface via http must provide an in`,
        };
      }
      if (argument.in === 'path') {
        if (!http.path.includes(`{{${argument.name}}}`)) {
          throw {
            context: `Argument: \`${argument.name}\` for ${commandType}: \`${this.name}\``,
            message: 'Path parameters must be defined in the http path, of the form `{{argument}}`',
          };
        } else {
          _path = _path.replace(`{{${argument.name}}}`, argument.name);
        }
        if (!argument.isRequired() && (argument.default === null)) {
          throw {
            context: `Argument: \`${argument.name}\` for ${commandType}: \`${this.name}\``,
            message: 'Path parameters must be marked as required or be provided a default variable',
          };
        }
      }
    }
    const extraPathParams = _path.match(/({{[a-zA-Z]+}})/g);
    if (extraPathParams !== null) {
      throw {
        context: `Path parameter(s): \`${extraPathParams.toString()}\` for ${commandType}: \`${this.name}\``,
        message: `If a url specifies a path parameter i.e. \`{{argument}}\`, the argument must be defined in the ${commandType}`,
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
   * Get's hel for this {@link Command}.
   *
   * @return {String} The help
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
   * Get the {@ink Argument}s for this {@link Command}.
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
   * Get an {@link Argument} based on given argument for this {@link Command}.
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
}

module.exports = Command;
