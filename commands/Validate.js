const validator = require('../schema/schema');
const Microservice = require('../src/Microservice');
const { dataTypes } = require('./utils');

class Validate {
  constructor() {
    this._valid = JSON.parse(validator());
  }

  structure() {
    if (!this._valid.valid) {
      return JSON.stringify(this._valid, null, 2);
    }
    new Microservice().commands.forEach(c => {
      if (c.http === null) {
        this._validateExecCommandFormat(c);
      } else {
        this._validateHttpCommandFormat(c);
      }
    });
    return JSON.stringify(this._valid, null, 2);
  }

  _validateExecCommandFormat(command) {
    if ((command.format === null) && (command.arguments.length > 0)) {
      if (this._valid.errors === null) {
        this._valid.errors = [];
      }
      this._valid.valid = false;
      this._valid.errors.push({
        message: 'format not provided for command',
        command: command.name,
        missingArguments: [command.arguments.map(a => a.name)],
      });
    } else if ((command.format !== '$args') && (command.format !== '$json')) {
      const missingArguments = [];
      command.arguments.forEach(a => {
        if (!command.format.includes(`{{${a.name}}}`)) {
          missingArguments.push(a.name)
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

  _validateHttpCommandFormat() {

  }

  /**
   *
   * @param command {Command}
   */
  static verifyArgumentTypes(command, args) {
    command.arguments.forEach(a => {
      if (!dataTypes[a.type](args[a.name])) {
        throw 'TODO';
      }
    });
  }

  /**
   *
   * @param command {Command}
   */
  static verifyOutputType(command, output) {
    if (!dataTypes[command.output](output)) {
      throw 'Not correct output type'; // TODO message
    }
  }
}

module.exports = Validate;
