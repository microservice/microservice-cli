const _ = require('underscore');

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
    if (_.isUndefined(rawHttp.method)) {
      throw 'An Http must be provided a method';
    }
    if (_.isUndefined(rawHttp.endpoint)) {
      throw 'An Http must be provided an endpoint';
    }
    if (!['get', 'post', 'put', 'delete'].includes(rawHttp.method)) {
      throw 'The Http method must be one of `get,post,put,delete`';
    }
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
