const fs = require('fs');
const path = require('path');
const $ = require('shelljs');
const axios = require('axios');
const Microservice = require('../src/Microservice');

async function exec(command, args) {

  // check if we are in a microservice cwd

  if ((!fs.existsSync(path.join(process.cwd(), 'microservice.yml'))) || !fs.existsSync(path.join(process.cwd(), 'Dockerfile'))) {
    // TODO message
    process.exit(1)
  }

  const uuid = build();

  const argsObj = parseArgs(args);

  // const microservice = new Microservice('/Users/tomped/Desktop/test.yml');
  const microservice = new Microservice(path.join(process.cwd(), 'microservice.yml'));


  await runCommand(uuid, command, argsObj, microservice.getCommand(command), microservice.lifecyle);

  return '';
}


// TODO what if the command does http shit
async function runCommand(uuid, cmd, args, command, lifecycle, http) {
  if (command.arguments.length === 0) {
    $.exec(`docker run ${uuid} ${cmd}`);
  } else {
    if (checkRequiredCommands(Object.keys(args), command)) {

      if (command.http === null) {
        const dockerRunCommand = formatCommand(uuid, cmd, args);
        $.exec(dockerRunCommand);
      } else {
        // TODO check that lifecycle if provided too (maybe do this in the validation)
        const server = startServer(lifecycle, uuid);
        await httpCommand(server, command, args);
      }
    } else {
      // TODO error out
      console.log('error');
    }
  }
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

function startServer(lifecycle, dockerImage) {
  let openPort = 3000;
  const environmentVars = getEnvironmentVars();
  let dockerStart;
  let dockerServiceId;

  do {
    dockerStart = `docker run -d -p ${openPort}:${lifecycle.startupPort} ${environmentVars} --entrypoint ${lifecycle.startupCommand.command} ${dockerImage} ${lifecycle.startupCommand.args}`;
    dockerServiceId = $.exec(dockerStart, { silent: true });
    openPort += 1;
  } while (dockerServiceId.stderr !== '');



  // return dockerServiceId;
  return {
    dockerServiceId: dockerServiceId.stdout.trim(),
    port: openPort - 1,
    // port: 5000,
  }
}

function getEnvironmentVars() {
  return '-e BOT_TOKEN=\'xoxb-359481089157-367420992610-3RuiJjakC2IfPvkoTzKz84wU\'';
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
function formatCommand(uuid, cmd, args) {
  let argString = '';
  const argValues = Object.values(args);

  for (let i = 0; i < argValues.length; i += 1) {
    argString += argValues[i] + ' ';
  }

  return `docker run ${uuid} ${cmd} ${argString}`;
}

function build() {
  const uuid = $.exec('uuidgen', {silent: true }).stdout.trim().toLowerCase();
  $.exec(`docker build -t ${uuid} .`);
  return uuid;
}

function parseArgs(args) {
  const dictionary = {};
  for (let i = 0; i < args.length; i += 1) {
    const split = args[i].split(':');
    if (split.length !== 2) {
      // TODO message
      process.exit(1)
    }
    dictionary[split[0]] = split[1];
  }
  return dictionary;
}

module.exports = exec;
