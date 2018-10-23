const fs = require('fs');
const path = require('path');
const YAML = require('yamljs');
const homedir = require('os').homedir();
const utils = require('../utils');
const ora = require('../ora');
const Microservice = require('../models/Microservice');
const Build = require('../commands/Build');
const Exec = require('../commands/Exec');
const Subscribe = require('../commands/Subscribe');

/**
 * Formats the output based on the data and options.
 *
 * @param {Object} data The given data of the validation
 * @param {Object} options The given options (json, silent, or text)
 * @return {String} The string to be printed to the console
 */
function processValidateOutput(data, options) {
  if (options.json) {
    return JSON.stringify(data, null, 2);
  } else if (options.silent) {
    return '';
  } else {
    if (!data.text) {
      return `${data.context} has an issue. ${data.message}`;
    } else {
      return data.text;
    }
  }
}

/**
 * Reads the `microservice.yml` and validates it.
 *
 * @param {Object} options The given options (json, silent, or text)
 */
function validate(options) {
  utils.validateMicroserviceDirectory();
  const json = YAML.parse(fs.readFileSync(path.join(process.cwd(), 'microservice.yml')).toString());
  try {
    const m = new Microservice(json);
    utils.log(processValidateOutput(m.rawData, options));
    process.exit(0);
  } catch (e) {
    utils.error(processValidateOutput(e, options));
    process.exit(1);
  }
}

/**
 * Checks if we are in an OMG directory then builds a microservice.
 *
 * @param {Object} options The given name
 */
async function build(options) {
  utils.validateMicroserviceDirectory();
  try {
    await new Build(options.tag || await utils.createImageName()).go();
  } catch (e) {
    utils.error('The tag flag must be provided because no git config is present. Example: `omg build -t omg/my/service`');
    process.exit(1);
  }
}

let microservice = null;
let e = null;
let s = null;

/**
 * Will read the `microservice.yml` and `Dockerfile` and run the given command with the given arguments and environment variables.
 *
 * @param {String} command The command to run
 * @param {Object} options The given object holding the command, arguments, and environment variables
 */
async function exec(command, options) {
  let image = options.image;
  if (!(options.args) || !(options.envs)) {
    process.stdout.write('\n' +
      '  Usage: omg [options] [command]\n' +
      '\n' +
      '  Options:\n' +
      '\n' +
      '    -V, --version             output the version number\n' +
      '    -h, --help                output usage information\n' +
      '\n' +
      '  Commands:\n' +
      '\n' +
      '    validate [options]        Validate the structure of a `microservice.yml` in the current directory\n' +
      '    build [options]           Builds the microservice defined by the `Dockerfile`. Image will be tagged with `omg/$gihub_user/$repo_name`, unless the tag flag is given. If no git config present a tag name must be provided. Must be ran in a directory with a `Dockerfile` and a `microservice.yml`\n' +
      '    exec [options] <command>  Run commands defined in your `microservice.yml`. Must be ran in a directory with a `Dockerfile` and a `microservice.yml`');
    process.exit(1);
  }
  utils.validateMicroserviceDirectory();

  if (options.image) {
    const images = await utils.exec(`docker images -f "reference=${image}"`);
    if (!images.includes(options.image)) {
      process.stderr.write(`Image for microservice is not built. Run \`omg build\` to build the image with name: \`${await utils.createImageName()}\``);
      process.exit(1);
    }
  } else {
    await build({});
    options.image = await utils.createImageName();
  }

  microservice = buildMicroservice();
  try {
    const argsObj = utils.parse(options.args, 'Unable to parse arguments. Must be of form: `-a key="val"`');
    const envObj = utils.parse(options.envs, 'Unable to parse environment variables. Must be of form: `-e key="val"`');
    e = new Exec(`${options.image}`, microservice, argsObj, envObj);
    await e.go(command);
  } catch (error) {
    if (error.spinner) {
      if (error.message.includes('Unable to find image')) {
        error.spinner.fail(`${error.message.split('.')[0]}. Container not built. Run \`omg build \`container_name\`\``);
      } else {
        error.spinner.fail(error.message);
      }
    } else {
      process.stderr.write(error.message);
    }
    process.exit(1);
  }
}

/**
 * Will read the `microservice.yml` and `Dockerfile` and subscribe to the with the given event..
 *
 * @param {String} event The given event
 * @param {Object} options The given object holding the arguments
 */
async function subscribe(event, options) {
  utils.validateMicroserviceDirectory();
  microservice = buildMicroservice();

  try {
    const argsObj = utils.parse(options.args, 'Unable to parse arguments. Must be of form: `-a key="val"`');
    s = new Subscribe(microservice, argsObj);
    await s.go(event);
  } catch (error) {
    if (error.spinner) {
      if (error.message.includes('Unable to find image')) {
        error.spinner.fail(`${error.message.split('.')[0]}. Container not built. Run \`omg build \`container_name\`\``);
      } else {
        error.spinner.fail(error.message);
      }
    } else {
      process.stderr.write(error.message);
    }
    process.exit(1);
  }
}

/**
 * Kills a docker process that is associated with the microservice.
 */
async function shutdown() {
  utils.validateMicroserviceDirectory();
  microservice = buildMicroservice();

  const spinner = ora.start('Shutting down microservice');
  const infoMessage = 'Microservice not shutdown because it was not running';
  if (!fs.existsSync(`${homedir}/.omg.json`)) {
    spinner.info(infoMessage);
  }

  const omgJson = JSON.parse(fs.readFileSync(`${homedir}/.omg.json`, 'utf8'));
  if (omgJson[process.cwd()]) {
    const containerId = omgJson[process.cwd()].container_id;
    await utils.exec(`docker kill ${containerId}`);
    delete omgJson[process.cwd()];
    fs.writeFileSync(`${homedir}/.omg.json`, JSON.stringify(omgJson), 'utf8');
    spinner.succeed(`Microservice with container id: \`${containerId.substring(0, 12)}\` successfully shutdown`);
  } else {
    spinner.info(infoMessage);
  }
}

/**
 * Builds a {@link Microservice} based ton the `microservice.yml` file. If the build throws an error the user
 * will be directed to run `omg validate`.
 *
 * @return {Microservice} The {@link Microservice}
 */
function buildMicroservice() {
  try {
    const json = YAML.parse(fs.readFileSync(path.join(process.cwd(), 'microservice.yml')).toString());
    return new Microservice(json);
  } catch (e) {
    process.stderr.write('Unable to build microservice. Run `omg validate` for more details');
    process.exit(1);
  }
}

/**
 * Catch the `CtrlC` command to stop running containers.
 */
async function controlC() {
  if (e && e.isDockerProcessRunning()) {
    await e.serverKill();
  }
  if (s) {
    await s.unsubscribe();
  }
  process.exit();
}

module.exports = {
  validate,
  build,
  exec,
  subscribe,
  shutdown,
  controlC,
};
