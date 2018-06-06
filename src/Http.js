class Http {
  constructor(rawHttp) {
    this._method = rawHttp.method;
    this._endpoint = rawHttp.endpoint;
  }

  get method() {
    return this._method;
  }

  get endpoint() {
    return this._endpoint;
  }

}

module.exports = Http;
