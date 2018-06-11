const $ = require('shelljs');
const ora = require('ora');

/**
 * Builds the microservice described in the Dockerfile of the current working directory.
 *
 * @returns {string} The name of the Docker image (uuid)
 */
async function build() {
  const spinner = ora('Building Docker image').start();
  let uuid = await exec('uuidgen');
  uuid = uuid.toLowerCase().trim();
  try {
    await exec(`docker build -t ${uuid} .`);
    spinner.succeed(`Built Docker image with name: ${uuid}`);
  } catch (e) {
    throw {
      spinner,
      message: e.toString().trim(),
    };
  }
  return uuid;
}

/**
 * Turns a list of string with a delimiter to a map.
 *
 * @param list {Array<String>} The given list of strings with delimiter
 * @param delimiter {String} The given delimiter
 * @param errorMessage {String} The given message to used when unable to parse
 * @return {Object} Key value of the list
 */
function parse(list, delimiter, errorMessage) {
  const dictionary = {};
  for (let i = 0; i < list.length; i += 1) {
    const split = list[i].split(delimiter);
    if (split.length !== 2) {
      throw {
        message: errorMessage,
      };
    }
    dictionary[split[0]] = split[1];
  }
  return dictionary;
}

/**
 * Promise wrapper for the `exec`.
 *
 * @param command {String} The command to run
 * @return {Promise<String>} The stdout if resolved, otherwise stderror
 */
function exec(command) {
  return new Promise(function(resolve, reject) {
    $.exec(command, { silent: true }, function(code, stdout, stderr) {
      if (code !== 0) {
        reject(stderr)
      } else {
        resolve(stdout);
      }
    });
  });
}

module.exports = {
  build,
  listToObject: parse,
  exec,
};
