const validator = require('../schema/schema');
const Microservice = require('../src/Microservice');
const {dataTypes} = require('./utils');

/**
 * Used for validating a `microservice.yml`.
 */
class Validate {
  /**
   * Builds a {@link Validate}
   */
  constructor() {
    this._valid = JSON.parse(validator());
  }

  /**
   * Validates the structure of the `microservice.yml`. Also checks to make sure specific values ane valid based on the
   * other parts of the `yaml`. For example, if a command interfaces with http, there must be a run command for the http service.
   *
   * @return {String} Stringified results of the validation
   */
  structure() {
    if (!this._valid.valid) {
      return JSON.stringify(this._valid, null, 2);
    }
    new Microservice().commands.forEach((c) => {
      if (c.http === null) {
        this._validateExecCommandFormat(c);
      } else {
        this._validateHttpCommandFormat(c);
      }
    });
    return JSON.stringify(this._valid, null, 2);
  }

  /**
   * Validates the formation of a {@link Command} and its {@link Argument}s.
   *
   * @param {Command} command The given command
   * @private
   */
  _validateExecCommandFormat(command) {
    if ((command.format === null) && (command.arguments.length > 0)) {
      if (this._valid.errors === null) {
        this._valid.errors = [];
      }
      this._valid.valid = false;
      this._valid.errors.push({
        message: 'format not provided for command',
        command: command.name,
        missingArguments: [command.arguments.map((a) => a.name)],
      });
    } else if ((command.format !== '$args') && (command.format !== '$json')) {
      const missingArguments = [];
      command.arguments.forEach((a) => {
        if (!command.format.includes(`{{${a.name}}}`)) {
          missingArguments.push(a.name);
        }
      });
      if (missingArguments.length > 0) {
        if (this._valid.errors === null) {
          this._valid.errors = [];
        }
        this._valid.errors.push({
          message: 'format not valid for command',
          command: command.name,
          missingArguments,
        });
      }
    }
  }

  /**
   * TODO
   * @private
   */
  _validateHttpCommandFormat() {

  }

  /**
   * Verifies the types of given arguments based off of the given {@link Command}.
   *
   * @param {Command} command The given {@link Command}
   * @param {Object} args The given argument mapping
   */
  static verifyArgumentTypes(command, args) {
    command.arguments.forEach((a) => {
      if (!dataTypes[a.type](args[a.name])) {
        throw 'TODO';
      }
    });
  }

  /**
   * Verifies the output type.
   *
   * @param {Command} command The given {@link Command}
   * @param {String} output The given output
   */
  static verifyOutputType(command, output) {
    if (!dataTypes[command.output](output)) {
      throw 'Not correct output type'; // TODO message
    }
  }
}

module.exports = Validate;
