const Arguments = require('./Arguments');

class Entrypoint {
  constructor(rawEntrypoint) {
    this._argumentsMap = null;
    if (rawEntrypoint.arguments) {
      this._argumentsMap = {};
      const _arguments = Object.keys(rawEntrypoint.arguments);
      for (let i = 0; i < _arguments.length; i += 1) {
        this._argumentsMap[_arguments[i]] = new Arguments(_arguments[i], rawEntrypoint.arguments[_arguments[i]]);
      }
    }
  }

  get arguments() {
    if (this._argumentsMap === null) {
      return [];
    }
    return Object.keys(this._argumentsMap);
  }

  getArgument(argument) {
    if ((this._argumentsMap === null) || (!this._argumentsMap[argument])) {
      throw 'Argument does not exist';
    }
    return this._argumentsMap[argument];
  }
}

module.exports = Entrypoint;
