const validateLifecycle = require('../../schema/schema').lifecycle;

/**
 * Describes a lifecycle used by a {@link Microservice}.
 */
class Lifecycle {
  /**
   * Build a {@link Lifecycle}.
   *
   * @param {Object} rawLifecycle The given raw data
   */
  constructor(rawLifecycle) {
    const isValid = validateLifecycle(rawLifecycle);
    if (!isValid.valid) {
      isValid.text = isValid.text.replace('data', 'lifecycle');
      throw isValid;
    }
    this._startup = rawLifecycle.startup || null;
    this._shutdown = rawLifecycle.shutdown || null;
  }

  /**
   * Get's the startup process for this {@link Lifecycle}.
   *
   * @return {String|null} The startup object
   */
  get startup() {
    if (typeof this._startup.command === 'string') {
      return this._startup.command;
    }
    let result = '';
    for (let i = 0; i < this._startup.command.length; i += 1) {
      result += this._startup.command[i] + ' ';
    }
    return result.trim();
  }

  /**
   * Get's the shutdown process for this {@link Lifecycle}.
   *
   * @return {{command: String, timeout: Number, method: String}|null} The shutdown object
   */
  get shutdown() {
    return this._shutdown;
  }
}

module.exports = Lifecycle;
