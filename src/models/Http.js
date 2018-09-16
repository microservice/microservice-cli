const validateHttp = require('../../schema/schema').http;

/**
 * Describes an http setup.
 */
class Http {
  /**
   * Builds an {@link Http} setup.
   *
   * @param {String} commandName The name of the command that interfaces via http
   * @param {Object} rawHttp The given raw data
   */
  constructor(commandName, rawHttp) {
    const isValid = validateHttp(rawHttp);
    if (!isValid.valid) {
      isValid.text = isValid.text.replace('data', `commands.${commandName}.http`);
      throw isValid;
    }
    this._method = rawHttp.method;
    this._path = rawHttp.path;
  }

  /**
   * Get's the method of this {@link Http}.
   *
   * @return {String} The method
   */
  get method() {
    return this._method;
  }

  /**
   * Get's the path of this {@link Http}.
   *
   * @return {String} The endpoint
   */
  get path() {
    return this._path;
  }
}

module.exports = Http;
