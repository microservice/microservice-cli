class Lifecycle {
  constructor(rawLifeCycle) {
    this._startupCommand = null;
    this._startupTimout = null;
    this._startupPort = null;
    this._shutdownCommand = null;
    this._shutdownTimout = null;
    this._shutdownPort = null;
    if (rawLifeCycle.startup) {
      this._startupCommand = rawLifeCycle.startup.command;
      this._startupTimout = rawLifeCycle.startup.timeout;
      this._startupPort = rawLifeCycle.startup.port || null;
    }
    if (rawLifeCycle.shutdown) {
      this._shutdownCommand = rawLifeCycle.shutdown.command;
      this._shutdownTimout = rawLifeCycle.shutdown.timeout;
      this._shutdownPort = rawLifeCycle.shutdown.port || null;
    }
  }

  get startupCommand() {
    return this._startupCommand;
  }

  get startupTimout() {
    return this._startupTimout;
  }

  get startupPort() {
    return this._startupPort;
  }

  get shutdownCommand() {
    return this._shutdownCommand;
  }

  get shutdownTimout() {
    return this._shutdownTimout;
  }

  get shutdownPort() {
    return this._shutdownPort;
  }
}

module.exports = Lifecycle;
