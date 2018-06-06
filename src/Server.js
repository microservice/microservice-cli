class Server {
  constructor(rawServer) {
    this._type = rawServer.type;
    this._port = rawServer.port;
    this._command = rawServer.command;
  }

  get type() {
    return this._type;
  }

  get port() {
    return this._port
  }

  get command() {
    return this._command;
  }
}

module.exports = Server;
