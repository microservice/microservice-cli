const net = require('http');
const $ = require('shelljs');
const ora = require('ora');

/**
 * Builds the microservice described in the Dockerfile of the current working directory.
 *
 * @return {String} The name of the Docker image (uuid)
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
 * @param {Array<String>} list The given list of strings with delimiter
 * @param {String} delimiter The given delimiter
 * @param {String} errorMessage The given message to used when unable to parse
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
 * Stringifies given data.
 *
 * @param {*} data The given data
 * @return {String} The stringified data
 */
function stringifyContainerOutput(data) {
  try {
    return JSON.stringify(data, null, 2);
  } catch (e) {
    return data.toString.trim();
  }
}

/**
 * Promise wrapper for the `exec`.
 *
 * @param {String} command The command to run
 * @return {Promise<String>} The stdout if resolved, otherwise stderror
 */
function exec(command) {
  return new Promise(function(resolve, reject) {
    $.exec(command, {silent: true}, function(code, stdout, stderr) {
      if (code !== 0) {
        reject(stderr.trim());
      } else {
        resolve(stdout.trim());
      }
    });
  });
}

const dataTypes = {
  int: (int) => {
    return Number.isInteger(parseFloat(int));
  },
  float: (float) => {
    return !isNaN(parseFloat(float)) && parseFloat(float).toString().indexOf('.') !== -1;
  },
  string: (string) => {
    try {
      JSON.parse(string);
      return false;
    } catch (e) {
      return typeof string === 'string';
    }
  },
  uuid: (uuid) => {
    return uuid.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/).length === 1;
  },
  list: (list) => {
    try {
      JSON.parse(list);
      return true;
    } catch (e) {
      return false;
    }
  },
  object: (object) => {
    try {
      JSON.parse(object);
      return true;
    } catch (e) {
      return false;
    }
  },
  boolean: (boolean) => {
    return boolean === 'false' || boolean === 'true';
  },
  path: (path) => {
    try {
      JSON.parse(path);
      return false;
    } catch (e) {
      return typeof path === 'string';
    }
  },
};

/**
 * Get's an open port.
 *
 * @return {Promise<Number>} The open port
 */
function getOpenPort() {
  return new Promise((resolve) => {
    _getPort((data) => {
      resolve(data);
    });
  });

  /**
   * Helper for {@link getOpenPort}. Tries to open a server on a random port, if fail try again, otherwise call
   * the callback with the port.
   *
   * @param {Function} cb The given callback
   * @private
   */
  function _getPort(cb) {
    const server = net.createServer();
    const port = Math.floor(Math.random() * 15000) + 2000; // port range 2000 to 17000
    server.listen(port, () => {
      server.once('close', () => {
        cb(port);
      });
      server.close();
    });
    server.on('error', () => {
      _getPort(cb);
    });
  }
}

module.exports = {
  build,
  parse,
  exec,
  stringifyContainerOutput,
  dataTypes,
  getOpenPort,
};
