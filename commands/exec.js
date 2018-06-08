const fs = require('fs');
const path = require('path');
const Microservice = require('../src/Microservice');
const { build, runCommand, listToObject } = require('./exec/utils');

async function exec(command, args, envs) {
  if ((!fs.existsSync(path.join(process.cwd(), 'microservice.yml'))) || !fs.existsSync(path.join(process.cwd(), 'Dockerfile'))) {
    // TODO message
    process.exit(1)
  }
  const microservice = new Microservice(path.join(process.cwd(), 'microservice.yml'));
  const uuid = build();
  const argsObj = listToObject(args, ':');
  const envObj = listToObject(envs, '=');
  await runCommand(uuid, command, microservice, argsObj, envObj);
  return 'Success';
}


module.exports = exec;
