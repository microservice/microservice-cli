const fs = require('fs');
const path = require('path');
const YAML = require('yamljs');
const utils = require('../utils');
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
  if (!fs.existsSync(path.join(process.cwd(), 'microservice.yml'))) {
    process.stdout.write('Must be ran in a directory with a `Dockerfile` and a `microservice.yml`');
    process.exit(1);
  }

  const json = YAML.parse(fs.readFileSync(path.join(process.cwd(), 'microservice.yml')).toString());
  try {
    const m = new Microservice(json);
    process.stdout.write(processValidateOutput(m.rawData, options));
    process.exit(0);
  } catch (e) {
    process.stderr.write(processValidateOutput(e, options));
    process.exit(1);
  }
}

/**
 * Checks if we are in an OMG directory then builds a microservice.
 *
 * @param {Object} options The given name
 */
async function build(options) {
  if (!fs.existsSync(path.join(process.cwd(), 'microservice.yml'))) {
    process.stdout.write('Must be ran in a directory with a `Dockerfile` and a `microservice.yml`');
    process.exit(1);
  }
  try {
    await new Build(options.tag || await utils.createImageName()).go();
  } catch (e) {
    process.stderr.write('The tag flag must be provided because no git config is present. Example: `omg build -t omg/my/service`');
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
  if ((!fs.existsSync(path.join(process.cwd(), 'microservice.yml'))) || !fs.existsSync(path.join(process.cwd(), 'Dockerfile'))) {
    process.stdout.write('Must be ran in a directory with a `Dockerfile` and a `microservice.yml`');
    process.exit(1);
  }

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

  try {
    const json = YAML.parse(fs.readFileSync(path.join(process.cwd(), 'microservice.yml')).toString());
    microservice = new Microservice(json);
  } catch (e) {
    process.stderr.write(JSON.stringify(e, null, 2));
    process.exit(1);
  }
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

async function subscribe(event, options) {
  if ((!fs.existsSync(path.join(process.cwd(), 'microservice.yml'))) || !fs.existsSync(path.join(process.cwd(), 'Dockerfile'))) {
    process.stdout.write('Must be ran in a directory with a `Dockerfile` and a `microservice.yml`');
    process.exit(1);
  }

  try {
    const json = YAML.parse(fs.readFileSync(path.join(process.cwd(), 'microservice.yml')).toString());
    microservice = new Microservice(json);
  } catch (e) {
    process.stderr.write(JSON.stringify(e, null, 2));
    process.exit(1);
  }

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
  build,
  exec,
  subscribe,
  controlC,
};

