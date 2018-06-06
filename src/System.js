const Requirements = require('./Requirements');

class System {
  constructor(rawSystem) {
    this._requests = ((rawSystem.requests) ? new Requirements(rawSystem.requests) : null);
    this._limits = ((rawSystem.limits) ? new Requirements(rawSystem.limits) : null);
  }

  getRequested() {
    return this._requests;
  }

  getLimits() {
    return this._requests;
  }
}

module.exports = System;
