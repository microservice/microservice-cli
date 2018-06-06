const path = require('path');
const $ = require('shelljs');
const Microservice = require('../src/Microservice');
const { parseArgs } = require('../lib/utils');

function exec(command, args) {
  const argsObj = parseArgs(args);
  // const microservice = new Microservice('/Users/tomped/Desktop/test.yml');
  const microservice = new Microservice(path.join(process.cwd(), 'microservice.yml'));

  console.log(microservice.getCommand(command));

  // TODO build

  runCommand(command, argsObj, microservice.getCommand(command));

  // console.log(microservice.getCommand('sms'));
  // console.log(microservice);
  return '';
}


// TODO format of the command needs to be worked in here somehow
// TODO what if the command does http shit
function runCommand(cmd, args, command) {
  if (command.arguments.length === 0) {
    console.log('run')
    $.exec(`docker run random ${cmd}`); // TODO get name of docker container (probs a uuid)
  } else {
    console.log('check')
  }

}

module.exports = exec;
