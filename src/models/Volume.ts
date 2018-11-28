const validateVolume = require('../schema/schema').volume;

/**
 * Describes a volume used by a {@link Microservice}
 */
export default class Volume {
  private readonly _name: string;
  private readonly _target: string;
  private readonly persist: boolean;

  /**
   * Builds a {@link Volume}.
   *
   * @param {String} name The given name
   * @param {Object} rawVolume The given raw data
   */
  constructor(name: string, rawVolume: any) {
    const isValid = validateVolume(rawVolume);
    if (!isValid.valid) {
      isValid.text = isValid.text.replace(/data/g, `volumes.${name}`);
      throw isValid;
    }
    this._name = name;
    this._target = rawVolume.target;
    this.persist = rawVolume.persist || false;
  }

  /**
   * Get the name of the {@link Volume}.
   *
   * @return {String} The name
   */
  public get name(): string {
    return this._name;
  }

  /**
   *  Get the target path of the {@link Volume}.
   *
   * @return {String} The target
   */
  public get target(): string {
    return this._target;
  }

  /**
   * Check if this {@link Volume} persists.
   *
   * @return {Boolean} True if persistent, otherwise false
   */
  public doesPersist(): boolean {
    return this.persist;
  }
}
