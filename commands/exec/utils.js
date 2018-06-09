const $ = require('shelljs');
const axios = require('axios');
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
  await exec(`docker build -t ${uuid} .`);
  spinner.succeed(`Build Docker image with name: ${uuid}`);
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
  const spinner = ora(`Running command: ${microservice.getCommand(command).name}`).start();
  if (microservice.getCommand(command).arguments.length === 0) {
    const output = await exec(`docker run ${uuid} ${command}`);
    spinner.succeed(`Ran command: ${microservice.getCommand(command).name} with output: ${output.trim()}`);
    return true;
  }
  if (!areRequiredArgumentsSupplied(microservice.getCommand(command), arguments)) {
    console.error('Need to supply required arguments'); // TODO error
    return false;
  }
  if (!areRequiredEnvironmentVariablesSupplied(microservice.envrionment, environmentVariables)) {
    console.error('Need to supply required environment variables'); // TODO error
    return false;
  }
  if (microservice.getCommand(command).http === null) {
    const output = await runDockerExecCommand(uuid, command, arguments); // TODO env vars here
    spinner.succeed(`Ran command: ${microservice.getCommand(command).name} with output: ${output.trim()}`);
  } else {
    // TODO check that lifecycle if provided too (maybe do this in the validation)
    const server = startServer(microservice.lifecycle, uuid, environmentVariables);
    const output = await httpCommand(server, microservice.getCommand(command), arguments);
    spinner.succeed(`Ran command: ${microservice.getCommand(command).name} with output: ${JSON.stringify(output, null, 2)}`);
    await serverKill(server.dockerServiceId);
  }
  return true;
}

















async function helpPost(url, args) { // TODO better
  try {
    const data = await axios.post(url, args);
    return data.data;
  } catch (e) {
    if (e.code === 'ECONNRESET') {
      return await helpPost(url, args);
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
  let data;
  // const spinner = ora(`Running command: ${command.name}`).start();
  switch (command.http.method) {
    case 'get':
      break;
    case 'post':
      return await helpPost(`http://localhost:${server.port}${command.http.endpoint}`, args);
      break;
    case 'put':
      break;
    case 'delete':
      break;
  }
}

function startServer(lifecycle, dockerImage, envs) {
  const spinner = ora('Starting Docker container').start();
  let openPort;
  const environmentVars = getEnvironmentVars(envs);
  let dockerStart;
  let dockerServiceId;

  do {
    openPort = Math.floor(Math.random() * 15000) + 2000;
    dockerStart = `docker run -d -p ${openPort}:${lifecycle.startupPort} ${environmentVars} --entrypoint ${lifecycle.startupCommand.command} ${dockerImage} ${lifecycle.startupCommand.args}`;
    dockerServiceId = $.exec(dockerStart, { silent: true });
  } while (dockerServiceId.stderr !== '');

  spinner.succeed(`Stared Docker container with id: ${dockerServiceId.substring(0, 12)}`);
  return {
    dockerServiceId: dockerServiceId.stdout.trim(),
    port: openPort,
  }
}

// TODO shutdown command?
async function serverKill(dockerServiceId) {
  dockerServiceId = dockerServiceId.substring(0, 12);
  const spinner = ora(`Stopping Docker container: ${dockerServiceId}`).start();
  const command = `docker stop ${dockerServiceId}`;
  await exec(command);
  spinner.succeed(`Stopped Docker container: ${dockerServiceId}`);
}

function getEnvironmentVars(envs) {
  let result = '';
  const keys = Object.keys(envs);
  for (let i = 0; i < keys.length; i += 1) {
    result += `-e ${keys[i]}="${envs[keys[i]]}" `;
  }
  return result;
}

function areRequiredEnvironmentVariablesSupplied(environment, environmentVariables) {
  // console.log(environment);
  // console.log(environmentVariables);
  return true;
}

/**
 * Determines of the required arguments are supplied.
 *
 * @param command {Command} The given Command object
 * @param arguments {Object} The given key value argument to be check
 * @return {boolean} True if all required arguments are supplied, otherwise false
 */
function areRequiredArgumentsSupplied(command, arguments) {
  const requiredArguments = command.arguments.filter(argument => argument.isRequired()).map(argument => argument.name);
  for (let i = 0; i < requiredArguments.length; i += 1) {
    if (!Object.keys(arguments).includes(requiredArguments[i])) {
      return false;
    }
  }
  return true;
}

// TODO format of the command needs to be worked in here somehow
async function runDockerExecCommand(uuid, cmd, args) {
  let argString = '';
  const argValues = Object.values(args);

  for (let i = 0; i < argValues.length; i += 1) {
    argString += argValues[i] + ' ';
  }

  return await exec(`docker run ${uuid} ${cmd} ${argString}`);
}



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
  runCommand: executeCommand,
  listToObject,
};

