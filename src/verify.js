const _ = require('underscore');
const {dataTypes} = require('./utils');

/**
 * Verifies the pattern, enum, and range of the given arguments.
 *
 * @param {Command} command The given {@link Command}
 * @param {Object} args The given argument mapping
 */
function verifyArgumentConstrains(command, args) {
  command.arguments.forEach((a) => {
    if (Object.keys(args).includes(a.name)) {
      const argumentValue = args[a.name];
      if ((a.pattern !== null) && (argumentValue.match(a.pattern) === null)) {
        throw `Argument: \`${a.name}\` must match regex: \`${a.pattern}\``;
      }
      if ((a.enum !== null) && (!a.enum.includes(argumentValue))) {
        throw `Argument: \`${a.name}\` must be one of: \`${a.enum.toString()}\``;
      }
      if (a.range !== null) {
        if (!_.isUndefined(a.range.min) && argumentValue < a.range.min) {
          throw `Argument: \`${a.name}\` must be be no smaller than the value: \`${a.range.min}\``;
        }
        if (!_.isUndefined(a.range.max) && argumentValue > a.range.max) {
          throw `Argument: \`${a.name}\` must be be no larger than the value: \`${a.range.max}\``;
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
function verifyArgumentTypes(command, args) {
  command.arguments.forEach((a) => {
    if (Object.keys(args).includes(a.name)) {
      if (!dataTypes[a.type](args[a.name])) {
        throw `Argument: \`${a.name}\` must be of type: \`${a.type}\``;
      }
    }
  });
}

/**
 * Verifies the types of the environment variables.
 *
 * @param {Microservice} microservice The given {@link Microservice}
 * @param {Object} envs The given environment variable mapping
 */
function verifyEnvironmentVariableTypes(microservice, envs) {
  microservice.environmentVariables.forEach((e) => {
    if (Object.keys(envs).includes(e.name)) {
      if (!dataTypes[e.type](envs[e.name])) {
        throw `Environment variable: \`${e.name}\` must be of type: \`${e.type}\``;
      }
    }
  });
}

/**
 * Verifies the patterns of the environment variables, if a pattern is defined.
 *
 * @param {Microservice} microservice The given {@link Microservice}
 * @param {Object} envs The given environment variable mapping
 */
function verifyEnvironmentVariablePattern(microservice, envs) {
  microservice.environmentVariables.forEach((e) => {
    if (Object.keys(envs).includes(e.name)) {
      if ((e.pattern !== null) && (envs[e.name].match(e.pattern)) === null) {
        throw `Environment variable: \`${e.name}\` must match regex: \`${e.pattern}\``;
      }
    }
  });
}

/**
 * Verifies the output type of a container.
 *
 * @param {Command} command The given {@link Command}
 * @param {String} output The given output
 */
function verifyOutputType(command, output) {
  if (!dataTypes[command.output.type](output)) {
    throw `Command: \`${command.name}\` must have output type: \`${command.output.type}\``;
  }
}

module.exports = {
  verifyArgumentConstrains,
  verifyArgumentTypes,
  verifyEnvironmentVariableTypes,
  verifyEnvironmentVariablePattern,
  verifyOutputType,
};
