import {setVal} from '../utils';

/**
 * Represents a data for an {@link Argument} or an {@link EnvironmentVariable}.
 */
export default abstract class Item {
  private readonly _name: string;
  private readonly _type: string;
  private readonly _pattern: string;
  private readonly required: boolean;
  private readonly _default: any;
  private readonly _help: string;

  /**
   * Builds a {@link Item}.
   *
   * @param {String} name The given name
   * @param {Object} rawItem The given raw data
   */
  protected constructor(name: string, rawItem: any) {
    this._name = name;
    this._type = rawItem.type;
    this._pattern = rawItem.pattern || null;
    this.required = rawItem.required || false;
    this._default = setVal(rawItem.default, null);
    this._help = rawItem.help || null;
  }

  /**
   * Get's the name of this {@link EnvironmentVariable}.
   *
   * @return {String} The name of this {@link EnvironmentVariable}
   */
  public get name(): string {
    return this._name;
  }

  /**
   * Get's the type of this {@link EnvironmentVariable}.
   *
   * @return {String} The type
   */
  public get type(): string {
    return this._type;
  }

  /**
   * Get's the pattern of this {@link EnvironmentVariable}.
   *
   * @return {String} The pattern
   */
  public get pattern(): string {
    return this._pattern;
  }

  /**
   * Checks if this {@link EnvironmentVariable} is required
   *
   * @return {Boolean} True if required, otherwise false
   */
  public isRequired(): boolean {
    return this.required;
  }

  /**
   * Get the default value for this {@link EnvironmentVariable}.
   *
   * @return {*|null} The default value
   */
  public get default(): any {
    return this._default;
  }

  /**
   * Get the help string for this {@link EnvironmentVariable}.
   *
   * @return {String|null} The help
   */
  public get help(): string {
    return this._help;
  }
}
