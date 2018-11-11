import {setVal} from '../utils';
const validateArgument = require('../schema/schema').argument;

/**
 * Describes an argument.
 */
export default class Argument {
  /**
   * Builds an {@link Argument}.
   *
   * @param {String} name The given name
   * @param {String} pathToArgument The path in the `microservice.yml` to this {@link Argument}
   * @param {Object} rawArguments The given raw data
   */
  _name: string;
  _type: any;
  _in: string;
  _help: string;
  _pattern: string;
  _enum: string[];
  _range: object;
  _required: boolean;
  _default: any;
  constructor(name, pathToArgument, rawArguments) {
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
    this._required = rawArguments.required || false;
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
  get name() {
    return this._name;
  }

  /**
   * Get the type of this {@link Argument}.
   *
   * @return {*} The type
   */
  get type() {
    return this._type;
  }

  /**
   * The location of this {@link Argument}. This is only used for command that interface via Http.
   *
   * @return {String|null} The location
   */
  get in() {
    return this._in;
  }

  /**
   * Get the help of this {@link Argument}.
   *
   * @return {String|null} The help
   */
  get help() {
    return this._help;
  }

  /**
   * Get the patter of this {@link Argument}.
   *
   * @return {*|null}
   */
  get pattern() {
    return this._pattern;
  }

  /**
   * Get the enum of this {@link Argument}.
   *
   * @return {Array|null} The enum
   */
  get enum() {
    return this._enum;
  }

  /**
   * The range of this {@link Argument}.
   *
   * @return {*|Object} The range
   */
  get range() {
    return this._range;
  }

  /**
   * Check to see if this {@link Argument} is required.
   *
   * @return {Boolean} True if required, otherwise false
   */
  isRequired() {
    return this._required;
  }

  /**
   * Get the default value of this {@link Argument}.
   *
   * @return {*|null} The default value
   */
  get default() {
    return this._default;
  }
}
