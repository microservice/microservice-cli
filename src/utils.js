const _ = require('underscore');
const $ = require('shelljs');
const net = require('http');

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
 * Get's the ports that need to be open defined by the given {@link Microservice}.
 *
 * @param {Microservice} microservice The given {@link Microservice}
 * @return {Array<Integer>} The ports that need to be opened for the given {@link Microservice}
 */
function getNeededPorts(microservice) {
  const ports = [];
  for (let i = 0; i < microservice.actions.length; i += 1) {
    const action = microservice.actions[i];
    if (action.http !== null) {
      if (!ports.includes(action.http.port)) {
        ports.push(action.http.port);
      }
    }
    if (action.events !== null) {
      for (let j = 0; j < action.events.length; j += 1) {
        if (!ports.includes(action.events[j].subscribe.port)) {
          ports.push(action.events[j].subscribe.port);
        }
        if (action.events[j].unsubscribe && !ports.includes(action.events[j].unsubscribe.port)) {
          ports.push(action.events[j].unsubscribe.port);
        }
      }
    }
  }
  return ports;
}

/**
 * Creates a name for the Docker images based of the git remote -v.
 *
 * @return {Promise<String>} The image name
 */
async function createImageName() {
  const data = await exec('git remote -v');
  return `omg/${data.match(/git@github\.com:(\w+\/[\w|-]+).git/)[1].toLowerCase()}`;
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
      return (
        (Array.isArray(list) && typeof list === 'object')
        || JSON.parse(list).toString() !== '[object Object]'
      );
    } catch (e) {
      return false;
    }
  },
  map: (map) => {
    try {
      return (
        (!Array.isArray(map) && typeof map === 'object')
        || JSON.parse(map).toString() === '[object Object]'
      );
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

/**
 * Used to append the environment variable options into [args...]
 *
 * @param {Array} xs
 * @return {function(*=): (*|Array)}
 */
function appender(xs) {
  xs = xs || [];
  return function(x) {
    xs.push(x);
    return xs;
  };
}

module.exports = {
  setVal,
  getNeededPorts,
  createImageName,
  parse,
  exec,
  dataTypes,
  getOpenPort,
  typeCast,
  appender,
};
