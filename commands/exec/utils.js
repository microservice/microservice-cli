const $ = require('shelljs');
const axios = require('axios');

/**
 * Builds the microservice described in the Dockerfile of the current working directory.
 *
 * @returns {string} The name of the Docker image (uuid)
 */
function build() {
  console.log('Build started');
  const uuid = $.exec('uuidgen', { silent: true }).stdout.trim().toLowerCase();
  $.exec(`docker build -t ${uuid} .`, { silent: true });
  console.log('Build finished');
  return uuid;
}

/**
 * Turns a list of string with a delimiter to a map.
 *
 * @param list {Array<String>} The given list of strings with delimiter
 * @param delimiter {String} The given delimiter
 * @return {Object} Key value of the list
 */
function listToObject(list, delimiter) {
  const dictionary = {};
  for (let i = 0; i < list.length; i += 1) {
    const split = list[i].split(delimiter);
    if (split.length !== 2) {
      console.error('Unable to parse'); // TODO better message
      process.exit(1)
    }
    dictionary[split[0]] = split[1];
  }
  return dictionary;
}

/**
 * Executes a command on a given Microservice.
 *
 * @param uuid {String} The given uuid of the docker images
 * @param command {String} The given command to run
 * @param microservice {Microservice} The given Microservice we are running
 * @param arguments {Object} The key values arguments
 * @param environmentVariables {Object} The key value environment variables
 * @return {Promise<Boolean>} True if the command was executed successfully, otherwise false
 */
async function executeCommand(uuid, command, microservice, arguments, environmentVariables) {
  if (microservice.getCommand(command).arguments.length === 0) {
    $.exec(`docker run ${uuid} ${command}`);
    return true;
  }
  if (!checkRequiredCommands(Object.keys(arguments), microservice.getCommand(command))) {
    console.error('error'); // TODO error
    return false;
  }
  if (microservice.getCommand(command).http === null) {
    runDockerExecCommand(uuid, command, arguments); // TODO env vars here
  } else {
    // TODO check that lifecycle if provided too (maybe do this in the validation)
    const server = startServer(microservice.lifecycle, uuid, environmentVariables);
    await httpCommand(server, microservice.getCommand(command), arguments);
  }
  return true;
}

















async function helpPost(url, args) { // TODO better
  try {
    await axios.post(url, args);
  } catch (e) {
    if (e.code === 'ECONNRESET') {
      await helpPost(url, args);
    } else {
      // TODO
      console.log(e);
    }
  }
}

/**
 *
 * @param server
 * @param command {Command}
 */
async function httpCommand(server, command, args) {

  switch (command.http.method) {
    case 'get':
      break;
    case 'post':
      await helpPost(`http://localhost:${server.port}${command.http.endpoint}`, args);
      break;
    case 'put':
      break;
    case 'delete':
      break;
  }
}

function startServer(lifecycle, dockerImage, envs) {
  let openPort;
  const environmentVars = getEnvironmentVars(envs);
  let dockerStart;
  let dockerServiceId;

  do {
    openPort = Math.floor(Math.random() * 15000) + 2000;
    dockerStart = `docker run -d -p ${openPort}:${lifecycle.startupPort} ${environmentVars} --entrypoint ${lifecycle.startupCommand.command} ${dockerImage} ${lifecycle.startupCommand.args}`;
    dockerServiceId = $.exec(dockerStart, { silent: true });
  } while (dockerServiceId.stderr !== '');

  return {
    dockerServiceId: dockerServiceId.stdout.trim(),
    port: openPort,
  }
}

function getEnvironmentVars(envs) {
  let result = '';
  const keys = Object.keys(envs);
  for (let i = 0; i < keys.length; i += 1) {
    result += `-e ${keys[i]}="${envs[keys[i]]}" `;
  }
  return result;
}

function checkRequiredEnvironment() {
  return true;
}

function checkRequiredCommands(args, command) { // TODO rename
  const requiredArgumentList = command.arguments.filter(argument => argument.isRequired()).map(argument => argument.name);

  for (let i = 0; i < requiredArgumentList.length; i += 1) {
    if (!args.includes(requiredArgumentList[i])) {
      return false;
    }
  }
  return true;
}

// TODO format of the command needs to be worked in here somehow
function runDockerExecCommand(uuid, cmd, args) {
  let argString = '';
  const argValues = Object.values(args);

  for (let i = 0; i < argValues.length; i += 1) {
    argString += argValues[i] + ' ';
  }

  $.exec(`docker run ${uuid} ${cmd} ${argString}`);
}

module.exports = {
  build,
  runCommand: executeCommand,
  listToObject,
};

