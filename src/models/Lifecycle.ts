const validateLifecycle = require('../schema/schema').lifecycle;

/**
 * Describes a lifecycle used by a {@link Microservice}.
 */
export default class Lifecycle {
  private readonly _startup: any;
  private readonly _shutdown: object;

  /**
   * Build a {@link Lifecycle}.
   *
   * @param {Object} rawLifecycle The given raw data
   */
  constructor(rawLifecycle: any) {
    const isValid = validateLifecycle(rawLifecycle);
    if (!isValid.valid) {
      isValid.text = isValid.text.replace(/data/g, 'lifecycle');
      throw isValid;
    }
    this._startup = rawLifecycle.startup || null;
    this._shutdown = rawLifecycle.shutdown || null;
  }

  /**
   * Get's the startup process for this {@link Lifecycle}.
   *
   * @return {{command: String, args: String}|null} The startup object
   */
  public get startup(): any {
    if (typeof this._startup.command === 'string') {
      return this._startup.command.split(' ');
    }
    return this._startup.command;
  }

  /**
   * Get's the shutdown process for this {@link Lifecycle}.
   *
   * @return {{command: String, timeout: Number, method: String}|null} The shutdown object
   */
  public get shutdown(): any {
    return this._shutdown;
  }
}
