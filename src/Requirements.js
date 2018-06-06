class Requirements {
  constructor(rawRequirements) {
    this._cpu = rawRequirements.cpu || null;
    this._gpu = rawRequirements.gpu || null;
    this._memory = rawRequirements.memory || null;
  }

  get cpu() {
    return this._cpu;
  }

  get gpu() {
    return this._gpu;
  }

  get memory() {
    return this._memory;
  }
}

module.exports = Requirements;
