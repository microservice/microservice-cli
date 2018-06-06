class Metrics {
  constructor(rawMetrics) {
    this._ssl = rawMetrics.ssl || false;
    this._port = rawMetrics.port;
    this._uri = rawMetrics.uri;
  }

  isSsl() {
    return this._ssl;
  }

  getPort() {
    return this._port;
  }

  getUri() {
    return this._uri;
  }
}

module.exports = Metrics;
