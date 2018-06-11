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
  try {
    await exec(`docker build -t ${uuid} .`);
    spinner.succeed(`Build Docker image with name: ${uuid}`);
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
 * Executes a command on a given Microservice.
 *
 * @param uuid {String} The given uuid of the docker images
 * @param command {String} The given command to run
 * @param microservice {Microservice} The given Microservice we are running
 * @param arguments {Object} The key values arguments
 * @param environmentVariables {Object} The key value environment variables
 */
async function executeCommand(uuid, command, microservice, arguments, environmentVariables) {
  const spinner = ora(`Running command: ${microservice.getCommand(command).name}`).start();
  if (!microservice.getCommand(command).areRequiredArguemntsSuplied(arguments)) {
    throw {
      spinner,
      message: `Failed command: ${command}. Need to supply required arguments`, // TODO need to say what args
    }
  }
  if (!microservice.areRequiredEnvironmentVariablesSupplied(environmentVariables)) {
    throw {
      spinner,
      message: `Failed command: ${command}. Need to supply required environment variables`, // TODO need to say what variables
    };
  }
  try {
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
  } catch (e) {
    throw {
      spinner,
      message: `Failed commnad: ${command}. ${e.toString().trim()}`,
    }
  }
}

/**
 * Run the given command that interfaces via HTTP.
 *
 * @param server {Object} The given sever started in Docker
 * @param command {Command} The command to be ran
 * @param arguments {Object} The given arguments
 */
async function httpCommand(server, command, arguments) { // TODO format http request (query params, body, or path params)
  let data;
  const url = `http://localhost:${server.port}${command.http.endpoint}`;
  try {
    switch (command.http.method) {
      case 'get':
        data = await axios.get(url);
        break;
      case 'post':
        data = await axios.post(url, arguments);
        break;
      case 'put':
        data = await axios.put(url, arguments);
        break;
      case 'delete':
        data = await axios.delete(url);
        break;
    }
    return data.data;
  } catch (e) {
    if (e.code === 'ECONNRESET') {
      return await httpCommand(server, command, arguments);
    } else {
      throw e;
    }
  }
}

// TODO timeout time defined in the microservice.yml
/**
 * Starts the server for the HTTP command based of the lifecycle provided in the microservice.yml.
 *
 * @param lifecycle {Lifecycle} The given Lifecycle, describing how to start the service
 * @param dockerImage {String} The given docker image
 * @param environmentVariables {Object} The given environment variables
 * @return {{dockerServiceId: string, port: number}} An object of the Docker service that was started and the port it was started on
 */
function startServer(lifecycle, dockerImage, environmentVariables) {
  const spinner = ora('Starting Docker container').start();
  const environmentVars = formatEnvironmentVariables(environmentVariables);

  let openPort;
  let dockerStart;
  let dockerServiceId;
  do {
    openPort = Math.floor(Math.random() * 15000) + 2000; // port range 2000 to 17000
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
/**
 * Stops a running Docker service
 *
 * @param dockerServiceId {String} The given Docker service id
 */
async function serverKill(dockerServiceId) {
  dockerServiceId = dockerServiceId.substring(0, 12);
  const spinner = ora(`Stopping Docker container: ${dockerServiceId}`).start();
  const command = `docker stop ${dockerServiceId}`;
  await exec(command);
  spinner.succeed(`Stopped Docker container: ${dockerServiceId}`);
}

/**
 * Formats an object of environment variables to a `-e KEY='val'` style.
 *
 * @param environmentVariables {Object} The given environment variables
 * @return {string}
 */
function formatEnvironmentVariables(environmentVariables) {
  let result = '';
  const keys = Object.keys(environmentVariables);
  for (let i = 0; i < keys.length; i += 1) {
    result += `-e ${keys[i]}="${environmentVariables[keys[i]]}" `;
  }
  return result;
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
  listToObject: parse,
};
