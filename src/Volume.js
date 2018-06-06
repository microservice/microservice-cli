class Volume {
  constructor(name, rawVolume) {
    this._name = name;
    this._target = rawVolume.target;
    this._persist = rawVolume.persist || false;
  }

  getTarget() {
    return this._target;
  }

  doesPersist() {
    return this._persist;
  }
}

module.exports = Volume;
