import {setVal} from '../utils';
const validateArgument = require('../schema/schema').argument;

/**
 * Describes an argument.
 */
export default class Argument {
  private readonly _name: string;
  private readonly _type: any;
  private readonly _in: string;
  private readonly _help: string;
  private readonly _pattern: string;
  private readonly _enum: string[];
  private readonly _range: any;
  private readonly required: boolean;
  private readonly _default: any;

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
    this._name = name;
    this._type = rawArguments.type;
    this._in = rawArguments.in || null;
    this._help = rawArguments.help || null;
    this._pattern = rawArguments.pattern || null;
    this._enum = rawArguments.enum || null;
    this._range = rawArguments.range || null;
    this.required = rawArguments.required || false;
    this._default = setVal(rawArguments.default, null);
    if ([(this._pattern !== null), (this._enum !== null), (this._range !== null)].filter((b) => b).length > 1) {
      throw {
        context: `Argument with name: \`${name}\``,
        message: 'An Argument can only have a pattern, enum, or range defined',
      };
    }
  }

  /**
   * Get the name of this {@link Argument}.
   *
   * @return {String} The name
   */
  public get name(): string {
    return this._name;
  }

  /**
   * Get the type of this {@link Argument}.
   *
   * @return {*} The type
   */
  public get type(): string {
    return this._type;
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
   * Get the help of this {@link Argument}.
   *
   * @return {String} The help
   */
  public get help(): string {
    return this._help;
  }

  /**
   * Get the patter of this {@link Argument}.
   *
   * @return {*|null}
   */
  public get pattern(): string {
    return this._pattern;
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

  /**
   * Check to see if this {@link Argument} is required.
   *
   * @return {Boolean} True if required, otherwise false
   */
  public isRequired(): boolean {
    return this.required;
  }

  /**
   * Get the default value of this {@link Argument}.
   *
   * @return {*|null} The default value
   */
  public get default(): any {
    return this._default;
  }
}
