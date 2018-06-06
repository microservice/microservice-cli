const Requirements = require('./Requirements');

class System {
  constructor(rawSystem) {
    this._requests = ((rawSystem.requests) ? new Requirements(rawSystem.requests) : null);
    this._limits = ((rawSystem.limits) ? new Requirements(rawSystem.limits) : null);
  }

  get requested() {
    return this._requests;
  }

  get limits() {
    return this._limits;
  }
}

module.exports = System;
