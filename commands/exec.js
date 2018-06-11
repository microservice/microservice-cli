const fs = require('fs');
const path = require('path');
const Microservice = require('../src/Microservice');
const { build, runCommand, listToObject } = require('./exec/utils');

async function exec(command, args, envs) {
  if ((!fs.existsSync(path.join(process.cwd(), 'microservice.yml'))) || !fs.existsSync(path.join(process.cwd(), 'Dockerfile'))) {
    // TODO message
    process.exit(1)
  }
  try {
    const microservice = new Microservice(path.join(process.cwd(), 'microservice.yml'));
    const uuid = await build();
    const argsObj = listToObject(args, ':', 'Unable to parse args');
    const envObj = listToObject(envs, '=', 'Unable to parse envs');
    await runCommand(uuid, command, microservice, argsObj, envObj);
  } catch (error) {
    if (error.spinner) {
      error.spinner.fail(error.message);
    } else {
      console.error(error.message);
    }
    process.exit(1);
  }
  return 'Success';
}


module.exports = exec;
