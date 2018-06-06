class Server {
  constructor(rawServer) {
    this._type = rawServer.type;
    this._port = rawServer.port;
    this._command = rawServer.command;
  }

  getType() {
    return this._type;
  }

  getPort() {
    return this._port
  }

  getCommand() {
    return this._command;
  }
}

module.exports = Server;
