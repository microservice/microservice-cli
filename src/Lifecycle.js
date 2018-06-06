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

  getStartupCommand() {
    return this._startupCommand;
  }

  getStartupTimout() {
    return this._startupTimout;
  }

  getStartupPort() {
    return this._startupPort;
  }

  getShutdownCommand() {
    return this._shutdownCommand;
  }

  getShutdownTimout() {
    return this._shutdownTimout;
  }

  getShutdownPort() {
    return this._shutdownPort;
  }
}

module.exports = Lifecycle;
