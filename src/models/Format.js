const validateFormat = require('../../schema/schema').format;

class Format {
  constructor(commandName, rawFormat) {
    const isValid = validateFormat(rawFormat);
    if (!isValid.valid) {
      isValid.text = isValid.text.replace('data', `commands.${commandName}.http`);
      throw isValid;
    }
    if (typeof rawFormat.command === 'string') {
      this._command = rawFormat.command;
    } else {
      this._command = '';
      for (let i = 0; i < rawFormat.command.length; i += 1) {
        this._command += rawFormat.command[i] + ' ';
      }
      this._command = this._command.trim()
    }
  }

  get command() {
    return this._command;
  }
}

module.exports = Format;
