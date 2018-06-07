const fs = require('fs');
const path = require('path');
const $ = require('shelljs');
const Microservice = require('../src/Microservice');

function exec(command, args) {

  // check if we are in a microservice cwd

  if ((!fs.existsSync(path.join(process.cwd(), 'microservice.yml'))) || !fs.existsSync(path.join(process.cwd(), 'Dockerfile'))) {
    // TODO message
    process.exit(1)
  }

  const uuid = build();

  const argsObj = parseArgs(args);
  // const microservice = new Microservice('/Users/tomped/Desktop/test.yml');
  const microservice = new Microservice(path.join(process.cwd(), 'microservice.yml'));


  runCommand(uuid, command, argsObj, microservice.getCommand(command));

  return '';
}


// TODO what if the command does http shit
function runCommand(uuid, cmd, args, command) {
  if (command.arguments.length === 0) {
    $.exec(`docker run ${uuid} ${cmd}`);
  } else {
    if (checkRequiredCommands(Object.keys(args), command)) {
      const dockerRunCommand = formatCommand(uuid, cmd, args);
      $.exec(dockerRunCommand);
    } else {
      // TODO error out
      console.log('error');
    }
  }
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
