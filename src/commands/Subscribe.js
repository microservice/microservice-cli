class Subscribe {
  constructor(microservice, _arguments) {
    this._microservice = microservice;
    this._arguments = _arguments;
  }

  async go(event) {
    this._command = this._microservice.getAction(event);
    let spinner = ora.start(`Running command: \`${this._command.name}\``);
    this._setDefaultArguments();
    this._setDefaultEnvironmentVariables();
    if (!this._command.areRequiredArgumentsSupplied(this._arguments)) {
      throw {
        spinner,
        message: `Failed command: \`${command}\`. Need to supply required arguments: \`${this._command.requiredArguments.toString()}\``,
      };
    }
  }
}

module.exports = Subscribe;
