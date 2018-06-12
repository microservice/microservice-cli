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
      this._startupMethod = rawLifeCycle.startup.method || null;
    }
    if (rawLifeCycle.run) {
      this._runCommand = rawLifeCycle.run.command;
      this._runPort = rawLifeCycle.run.port;
    }
    if (rawLifeCycle.shutdown) {
      this._shutdownCommand = rawLifeCycle.shutdown.command;
      this._shutdownTimout = rawLifeCycle.shutdown.timeout;
      this._shutdownMethod = rawLifeCycle.shutdown.method || null;
    }
  }

  get startupCommand() {
    const result = {
      command: this._startupCommand[0],
      args: '',
    };
    for (let i = 1; i < this._startupCommand.length; i += 1) { // maybe do this is constructor
      result.args += this._startupCommand[i] + ' ';
    }
    return result;
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
