const _ = require('underscore');

/**
 * Describes and environment variable.
 */
class EnvironmentVariable {
  /**
   * Builds an {@link EnvironmentVariable}.
   *
   * @param {String} name The given name
   * @param {Object} rawEnvironment The given raw data
   */
  constructor(name, rawEnvironment) {
    if (_.isUndefined(rawEnvironment.type)) {
      throw {
        context: `Environment variable with name: \`${name}\``,
        message: 'An EnvironmentVariable must be provided a type',
      };
    }
    if (!['int', 'float', 'string', 'uuid', 'list', 'map', 'boolean', 'path'].includes(rawEnvironment.type)) {
      throw {
        context: `Environment variable with name: \`${name}\``,
        message: 'The EnvironmentVariable type must be one of `int,float,string,uuid,list,map,boolean,path`',
      };
    }
    this._name = name;
    this._type = rawEnvironment.type;
    this._pattern = rawEnvironment.pattern || null;
    this._required = rawEnvironment.required || false;
    this._default = rawEnvironment.default || null;
    this._help = rawEnvironment.help || null;
  }

  /**
   * Get's the name of this {@link EnvironmentVariable}.
   *
   * @return {String} The name of this {@link EnvironmentVariable}
   */
  get name() {
    return this._name;
  }

  /**
   * Get's the type of this {@link EnvironmentVariable}.
   *
   * @return {String} The type
   */
  get type() {
    return this._type;
  }

  /**
   * Get's the pattern of this {@link EnvironmentVariable}.
   *
   * @return {String} The pattern
   */
  get pattern() {
    return this._pattern;
  }

  /**
   * Checks if this {@link EnvironmentVariable} is required
   *
   * @return {Boolean} True if required, otherwise false
   */
  isRequired() {
    return this._required;
  }

  /**
   * Get the default value for this {@link EnvironmentVariable}.
   *
   * @return {*|null} The default value
   */
  get default() {
    return this._default;
  }

  /**
   * Get the help string for this {@link EnvironmentVariable}.
   *
   * @return {String|null} The help
   */
  get help() {
    return this._help;
  }
}

module.exports = EnvironmentVariable;
