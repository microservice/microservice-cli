class Requirements {
  constructor(rawRequirements) {
    this._cpu = rawRequirements.cpu || null;
    this._gpu = rawRequirements.gpu || null;
    this._memory = rawRequirements.memory || null;
  }

  getCpu() {
    return this._cpu;
  }

  getGpu() {
    return this._gpu;
  }

  getMemory() {
    return this._memory;
  }
}

module.exports = Requirements;
