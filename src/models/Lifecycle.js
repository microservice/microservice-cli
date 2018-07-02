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
  constructor(rawLifecycle) { // TODO maybe make these fields class instead of raw objects https://microservice.guide/lifecycle
    const isValid = validateLifecycle(rawLifecycle);
    if (!isValid.valid) {
      throw isValid;
    }
    this._startup = rawLifecycle.startup || null;
    this._run = rawLifecycle.run;
    this._run = {};
    this._run.command = rawLifecycle.run.command[0];
    this._run.args = '';
    this._run.port = rawLifecycle.run.port;
    for (let i = 1; i < rawLifecycle.run.command.length; i += 1) {
      this._run.args += rawLifecycle.run.command[i] + ' ';
    }
    this._shutdown = rawLifecycle.shutdown || null;
  }

  /**
   * Get's the startup process for this {@link Lifecycle}.
   *
   * @return {{command: String, timeout: Number, method: String}|null} The startup object
   */
  get startup() {
    return this._startup;
  }

  /**
   * Get's the run object for this {@link Lifecycle}.
   *
   * @return {{command: String, args: String, port: Number}} The run object
   */
  get run() {
    return this._run;
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
