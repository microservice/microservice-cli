const {dataTypes} = require('./utils');

/**
 * Used for validating a `microservice.yml`.
 */
class Validate {
  /**
   * Builds a {@link Validate}
   */
  constructor() {}
  //
  static verifyArgumentConstrains(command, args) {
    command.arguments.forEach((a) => {
      if (Object.keys(args).includes(a.name)) {
        const argumentValue = args[a.name];
        if ((a.pattern !== null) && (argumentValue.match(a.pattern) === null)) {
          throw 'PATTERN TODO';
        }
        if ((a.enum !== null) && (!a.enum.includes(argumentValue))) {
          throw 'ENUM TODO';
        }
        if (a.range !== null) {
          if (a.range.min && argumentValue < a.range.min) {
            throw 'LOW RANGE TODO';
          }
          if (a.range.max && argumentValue > a.range.max) {
            throw 'HIGH RANGE TODO';
          }
        }
      }
    });
  }

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
          throw 'TYPE TODO';
        }
      }
    });
  }

  /**
   *
   * @param {Microservice} microservice
   * @param {Object} envs
   */
  static verifyEnvironmentVariableTypes(microservice, envs) {
    microservice.environmentVariables.forEach((e) => {
      if (Object.keys(envs).includes(e.name)) {
        if (!dataTypes[e.type](envs[e.name])) {
          throw 'TYPE TODO';
        }
      }
    })
  }

  /**
   *
   * @param {Microservice} microservice
   * @param {Object} envs
   */
  static verifyEnvironmentVariablePattern(microservice, envs) {
    microservice.environmentVariables.forEach((e) => {
      if (Object.keys(envs).includes(e.name)) {
        if ((e.pattern !== null) && (envs[e.name].match(e.pattern)) === null) {
          throw 'PATTERN TODO';
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
