class EnvironmentVariable {
  constructor(name, rawEnvironment) {
    this._name = name;
    this._type = rawEnvironment.type;
    this._pattern = rawEnvironment.pattern || null;
    this._required = rawEnvironment.required || false;
    this._default = rawEnvironment.default || null;
    this._help = rawEnvironment.help || null;
  }

  get name() {
    return this._name;
  }

  get type() {
    return this._type;
  }

  get pattern() {
    return this._pattern;
  }

  isRequired() {
    return this._required;
  }

  get default() {
    return this._default
  }

  get help() {
    return this._help;
  }
}

module.exports = EnvironmentVariable;
