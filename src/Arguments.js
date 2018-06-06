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

  getType() {
    return this._type;
  }

  getHelp() {
    return this._help;
  }

  getPattern() {
    return this._pattern;
  }


  getEnum() {
    return this._enum;
  }

  getRange() {
    return this._range;
  }

  isRequired() {
    return this._required
  }

  getDefault() {
    return this._default;
  }
}

module.exports = Arguments;
