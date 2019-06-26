const validateFormat = require('../schema/schema').format;

/**
 * Describes a format.
 */
export default class Format {
  private readonly _command: string[];

  /**
   * Builds a {@link Format}.
   *
   * @param {String} commandName The given command name
   * @param {Object} rawFormat The given raw data
   */
  constructor(commandName: string, rawFormat: any) {
    const isValid = validateFormat(rawFormat);
    if (!isValid.valid) {
      isValid.text = isValid.text.replace(/data/g, `commands.${commandName}.format`);
      throw isValid;
    }
    if (typeof rawFormat.command === 'string') {
      this._command = rawFormat.command.split(' ');
    } else {
      this._command = rawFormat.command;
    }
  }

  /**
   * Gets the command for this {@link Format}.
   *
   * @return {String} The command for this {@link Format}
   */
  public get command(): string[] {
    return this._command;
  }
}
