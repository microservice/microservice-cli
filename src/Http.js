/**
 * Describes an http setup.
 */
class Http {
  /**
   * Builds an {@link Http} setup.
   *
   * @param {Object} rawHttp The given raw data
   */
  constructor(rawHttp) {
    this._method = rawHttp.method;
    this._endpoint = rawHttp.endpoint;
  }

  /**
   * Get's the method of this {@link Http}
   *
   * @return {String} The method
   */
  get method() {
    return this._method;
  }

  /**
   * Get's the endpoint of this {@link Http}
   *
   * @return {String} The endpoint
   */
  get endpoint() {
    return this._endpoint;
  }
}

module.exports = Http;
