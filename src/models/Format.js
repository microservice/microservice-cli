const validateFormat = require('../../schema/schema').format;

/**
 * Describes a format.
 */
class Format {
  /**
   * Builds a {@link Format}.
   *
   * @param {String} commandName The given command name
   * @param {Object} rawFormat The given raw data
   */
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
      this._command = this._command.trim();
    }
  }

  /**
   * Gets the command for this {@link Format}.
   *
   * @return {String} The command for this {@link Format}
   */
  get command() {
    return this._command;
  }
}

module.exports = Format;
