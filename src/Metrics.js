class Metrics {
  constructor(rawMetrics) {
    this._ssl = rawMetrics.ssl || false;
    this._port = rawMetrics.port;
    this._uri = rawMetrics.uri;
  }

  isSsl() {
    return this._ssl;
  }

  get port() {
    return this._port;
  }

  get uri() {
    return this._uri;
  }
}

module.exports = Metrics;
