const validateEnvironmentVariable = require('../schema/schema').environmentVariable;

/**
 * Describes and environment variable.
 */
export default class EnvironmentVariable {
  private readonly _name: string;
  private readonly _type: any;
  private readonly _pattern: string;
  private readonly _enum: string[];
  private readonly required: boolean;
  private readonly _default: any;
  private readonly _help: string;

  /**
   * Builds an {@link EnvironmentVariable}.
   *
   * @param {String} name The given name
   * @param {Object} rawEnvironment The given raw data
   */
  constructor(name: string, rawEnvironment: any) {
    const isValid = validateEnvironmentVariable(rawEnvironment);
    if (!isValid.valid) {
      isValid.text = isValid.text.replace(/data/g, `environment.${name}`);
      throw isValid;
    }
    this._name = name;
    this._type = rawEnvironment.type;
    this._pattern = rawEnvironment.pattern || null;
    this.required = rawEnvironment.required || false;
    this._default = rawEnvironment.default || null;
    this._help = rawEnvironment.help || null;
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
