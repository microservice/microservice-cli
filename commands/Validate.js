const {dataTypes} = require('./utils');

/**
 * Used for validating a `microservice.yml`.
 */
class Validate {
  /**
   * Builds a {@link Validate}
   */
  constructor() {}

  /**
   * Verifies the types of given arguments based off of the given {@link Command}.
   *
   * @param {Command} command The given {@link Command}
   * @param {Object} args The given argument mapping
   */
  static verifyArgumentTypes(command, args) {
    command.arguments.forEach((a) => {
      if (Object.keys(args).includes(a.name)) {
        if (!dataTypes[a.type](args[a.name])) {
          throw 'TODO';
        }
      }
    });
  }

  /**
   * Verifies the output type.
   *
   * @param {Command} command The given {@link Command}
   * @param {String} output The given output
   */
  static verifyOutputType(command, output) {
    if (!dataTypes[command.output.type](output)) {
      throw 'Not correct output type'; // TODO message
    }
  }
}

module.exports = Validate;
