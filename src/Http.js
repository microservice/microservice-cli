class Http {
  constructor(rawHttp) {
    this._method = rawHttp.method;
    this._endpoint = rawHttp.endpoint;
  }

  getMethod() {
    return this._method;
  }

  getEndpoint() {
    return this._endpoint;
  }

}

module.exports = Http;
