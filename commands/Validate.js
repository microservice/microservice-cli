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
    this._microservice = new Microservice();
    this.validateCommandFormat();
    return JSON.stringify(this._valid, null, 2);
  }

  validateCommandFormat() {
    this._microservice.commands.forEach(c => {
      if ((c.format === null) && (c.arguments.length > 0)) {
        this._valid.valid = false;
        this._valid.errors = [{
          message: 'format not provided for command',
          command: c.name,
          missingArguments: [c.arguments.map(a => a.name)],
        }];
        return;
      }
      if ((c.format !== '$args') && (c.format !== '$json')) {
        const missingArguments = [];
        c.arguments.forEach(a => {
          if (!c.format.includes(`{{${a.name}}}`)) {
            missingArguments.push(a.name)
          }
        });
        if (missingArguments.length > 0) {
          this._valid.valid = false;
          this._valid.errors = [{
            message: 'format not valid for command',
            command: c.name,
            missingArguments,
          }]
        }
      }
    });
  }

  validateHttpCommand() {

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
