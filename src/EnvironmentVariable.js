class EnvironmentVariable {
  constructor(name, rawEnvironment) {
    this._name = name;
    this._type = rawEnvironment.type;
    this._pattern = rawEnvironment.pattern || null;
    this._required = rawEnvironment.required || false;
    this._default = rawEnvironment.default || null;
    this._help = rawEnvironment.help || null;
  }

  getType() {
    return this._type;
  }

  getPattern() {
    return this._pattern;
  }

  isRequired() {
    return this._required;
  }

  getDefault() {
    return this._default
  }

  getHelp() {
    return this._help;
  }
}

module.exports = EnvironmentVariable;
