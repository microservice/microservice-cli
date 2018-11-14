import Item from './Item';
const validateEnvironmentVariable = require('../schema/schema').environmentVariable;

/**
 * Describes and environment variable.
 */
export default class EnvironmentVariable extends Item {
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
    super(name, rawEnvironment);
  }
}
