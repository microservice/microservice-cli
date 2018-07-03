const fs = require('fs');
const path = require('path');
const YAML = require('yamljs');
const utils = require('../utils');
const Microservice = require('../models/Microservice');
const Exec = require('../commands/Exec');

/**
 * Reads the `microservice.yml` and validates it.
 */
function validate() {
  if (!fs.existsSync(path.join(process.cwd(), 'microservice.yml'))) {
    process.stdout.write('Must be ran in a directory with a `Dockerfile` and a `microservice.yml`');
    process.exit(1);
  }
  try {
    const json = YAML.parse(fs.readFileSync(path.join(process.cwd(), 'microservice.yml')).toString());
    const m = new Microservice(json);
    process.stdout.write(JSON.stringify(m.rawData, null, 2));
  } catch (e) {
    process.stderr.write(JSON.stringify(e, null, 2));
    process.exit(1);
  }
}

let microservice = null;
let e = null;

/**
 * Will read the `microservice.yml` and `Dockerfile` and run the given command with the given arguments and environment variables.
 *
 * @param {Object} options The given object holding the command, arguments, and environment variables
 */
async function exec(options) {
  if (!(options.args) || !(options.envs)) {
    process.stdout.write('\n' +
      '  Usage: exec\n' +
      '\n' +
      '  Run commands defined in your `microservice.yml`\n' +
      '\n' +
      '  Options:\n' +
      '\n' +
      '    -c --cmd <c>   The command you want to run, if not provided the `entrypoint` command will be ran\n' +
      '    -a --args <a>  Arguments to be passed to the command, must be of the form `key="val"`\n' +
      '    -e --envs <e>  Environment variables to be passed to run environment, must be of the form `key="val"`\n' +
      '    -h, --help     output usage information');
    process.exit(1);
  }
  if ((!fs.existsSync(path.join(process.cwd(), 'microservice.yml'))) || !fs.existsSync(path.join(process.cwd(), 'Dockerfile'))) {
    process.stdout.write('Must be ran in a directory with a `Dockerfile` and a `microservice.yml`');
    process.exit(1);
  }
  if (!options.cmd) {
    options.cmd = 'entrypoint';
  }

  try {
    const json = YAML.parse(fs.readFileSync(path.join(process.cwd(), 'microservice.yml')).toString());
    microservice = new Microservice(json);
  } catch (e) {
    process.stderr.write(JSON.stringify(e, null, 2));
    process.exit(1);
  }
  try {
    const uuid = await utils.build();
    const argsObj = utils.parse(options.args, 'Unable to parse arguments. Must be of form: `-a key="val"`');
    const envObj = utils.parse(options.envs, 'Unable to parse environment variables. Must be of form: `-e key="val"`');
    e = new Exec(uuid, microservice, argsObj, envObj);
    await e.go(options.cmd);
  } catch (error) {
    if (error.spinner) {
      error.spinner.fail(error.message);
    } else {
      process.stderr.write(error.message);
    }
    process.exit(1);
  }
}

/**
 * Catch the `CtrlC` command to stop running containers.
 */
async function controlC() {
  if (e.isDockerProcessRunning()) {
    await e.serverKill();
  }
  process.exit();
}

module.exports = {
  validate,
  exec,
  controlC,
};

