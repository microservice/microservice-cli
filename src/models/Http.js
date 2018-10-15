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
   * @param {String} pathToHttp Path in the `microservice.yml` file to this {@link Http}
   * @param {Integer} [port] If no port given on rawHttp, this port will be used
   */
  constructor(commandName, rawHttp, pathToHttp, port) {
    if (!rawHttp.port && port) {
      rawHttp.port = port;
    }
    const isValid = validateHttp(rawHttp);
    if (!isValid.valid) {
      isValid.text = isValid.text.replace(/data/g, pathToHttp);
      throw isValid;
    }
    this._method = rawHttp.method;
    this._port = rawHttp.port;
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
   * Get's the port of this {@link Http}.
   *
   * @return {Integer} The port
   */
  get port() {
    return this._port;
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
