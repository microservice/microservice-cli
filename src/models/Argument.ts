import Item from './Item';
const validateArgument = require('../schema/schema').argument;

/**
 * Describes an argument.
 */
export default class Argument extends Item {
  private readonly _in: string;
  private readonly _enum: string[];
  private readonly _range: any;

  /**
   * Builds an {@link Argument}.
   *
   * @param {String} name The given name
   * @param {String} pathToArgument The path in the `microservice.yml` to this {@link Argument}
   * @param {Object} rawArguments The given raw data
   */
  constructor(name: string, pathToArgument: string, rawArguments: any) {
    const isValid = validateArgument(rawArguments);
    if (!isValid.valid) {
      isValid.text = isValid.text.replace(/data/g, `actions.${pathToArgument}.arguments.${name}`);
      throw isValid;
    }
    super(name, rawArguments);
    this._in = rawArguments.in || null;
    this._enum = rawArguments.enum || null;
    this._range = rawArguments.range || null;
    if ([(this.pattern !== null), (this._enum !== null), (this._range !== null)].filter((b) => b).length > 1) {
      throw {
        context: `Argument with name: \`${name}\``,
        message: 'An Argument can only have a pattern, enum, or range defined',
      };
    }
  }

  /**
   * The location of this {@link Argument}. This is only used for command that interface via Http.
   *
   * @return {String} The location
   */
  public get in(): string {
    return this._in;
  }

  /**
   * Get the enum of this {@link Argument}.
   *
   * @return {Array} The enum
   */
  public get enum(): string[] {
    return this._enum;
  }

  /**
   * The range of this {@link Argument}.
   *
   * @return {*|Object} The range
   */
  public get range(): any {
    return this._range;
  }
}
