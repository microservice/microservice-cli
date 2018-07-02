const validateVolume = require('../../schema/schema').volume;

/**
 * Describes a volume used by a {@link Microservice}
 */
class Volume {
  /**
   * Builds a {@link Volume}.
   *
   * @param {String} name The given name
   * @param {Object} rawVolume The given raw data
   */
  constructor(name, rawVolume) {
    const isValid = validateVolume(rawVolume);
    if (!isValid.valid) {
      throw isValid;
    }
    this._name = name;
    this._target = rawVolume.target;
    this._persist = rawVolume.persist || false;
  }

  /**
   * Get the name of the {@link Volume}.
   *
   * @return {String} The name
   */
  get name() {
    return this._name;
  }

  /**
   *  Get the target path of the {@link Volume}.
   *
   * @return {String} The target
   */
  get target() {
    return this._target;
  }

  /**
   * Check if this {@link Volume} persists.
   *
   * @return {Boolean} True if persistent, otherwise false
   */
  doesPersist() {
    return this._persist;
  }
}

module.exports = Volume;
