const _ = require('underscore');
const $ = require('shelljs');
const net = require('http');
const ora = require('./ora');

/**
 * Used to set values in the constructors of the microservice classes.
 *
 * @param {*} val The value to set
 * @param {*} _else The value to set if val if not defined
 * @return {*} The value
 */
function setVal(val, _else) {
  if (_.isUndefined(val)) {
    return _else;
  }
  return val;
}

/**
 * Builds the microservice described in the Dockerfile of the current working directory.
 *
 * @return {String} The name of the Docker image (uuid)
 */
async function build() {
  const spinner = ora.start('Building Docker image');
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
 * @param {String} errorMessage The given message to used when unable to parse
 * @return {Object} Key value of the list
 */
function parse(list, errorMessage) {
  const dictionary = {};
  for (let i = 0; i < list.length; i += 1) {
    const split = list[i].split(/=(.+)/);
    if (split.length !== 3) {
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

const typeCast = {
  int: (int) => parseInt(int),
  float: (float) => parseFloat(float),
  string: (string) => string,
  uuid: (uuid) => uuid,
  list: (list) => JSON.parse(list),
  map: (map) => JSON.parse(map),
  boolean: (boolean) => boolean === 'true',
  path: (path) => path,
  any: (any) => any,
};

const dataTypes = {
  int: (int) => {
    return int.match(/^[-+]?\d+$/) !== null;
  },
  float: (float) => {
    return !isNaN(parseFloat(float)) && parseFloat(float).toString().indexOf('.') !== -1;
  },
  string: (string) => {
    return true;
  },
  uuid: (uuid) => {
    return uuid.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/) !== null;
  },
  list: (list) => {
    try {
      return JSON.parse(list).toString() !== '[object Object]';
    } catch (e) {
      return false;
    }
  },
  map: (map) => {
    try {
      return JSON.parse(map).toString() === '[object Object]';
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
      const lastChar = path.substr(path.length - 1);
      if (lastChar === '/') {
        return false;
      }
      return typeof path === 'string';
    }
  },
  any: (any) => {
    return true;
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
  setVal,
  build,
  parse,
  exec,
  dataTypes,
  getOpenPort,
  typeCast,
};
