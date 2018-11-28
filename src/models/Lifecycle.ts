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
      return {
        command: this._startup.command,
        args: '',
      };
    }
    const result = {
      command: this._startup.command[0],
      args: '',
    };
    for (let i = 1; i < this._startup.command.length; i += 1) {
      result.args += this._startup.command[i] + ' ';
    }
    result.args = result.args.trim();
    return result;
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
