// TODO some of these methods may not be used and should be cleaned up

class Arguments {
  constructor(name, rawArguments) {
    this._name = name;
    this._type = rawArguments.type;
    this._help = rawArguments.help || null;
    this._pattern = rawArguments.pattern || null;
    this._enum = rawArguments.enum || null;
    this._range = rawArguments.range || null;
    this._required = rawArguments.required || false;
    this._default = rawArguments.default || null;
  }

  get type() {
    return this._type;
  }

  get help() {
    return this._help;
  }

  get pattern() {
    return this._pattern;
  }

  get enum() {
    return this._enum;
  }

  get range() {
    return this._range;
  }

  get required() {
    return this._required;
  }

  get default() {
    return this._default;
  }
}

module.exports = Arguments;
