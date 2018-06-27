#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const program = require('commander');
const validator = require('./schema/schema');
const {build, parse} = require('./commands/utils');
const Microservice = require('./src/Microservice');
const Exec = require('./commands/Exec');

program
  .version('0.0.1');

program
  .command('validate')
  .description('Validate the structure of a `microservice.yml` in the current directory')
  .usage(' ')
  .action(() => {
    if (!fs.existsSync(path.join(process.cwd(), 'microservice.yml'))) {
      process.stdout.write('Must be ran in a directory with a `Dockerfile` and a `microservice.yml`');
      process.exit(1);
    }
    const valid = validator();
    if (valid.valid) {
      try {
        new Microservice(valid.microsericeYaml);
        process.stdout.write(JSON.stringify(valid, null, 2));
      } catch (e) {
        process.stderr.write(e);
        process.exit(1);
      }
    } else {
      process.stdout.write(JSON.stringify(valid, null, 2));
      process.exit(1);
    }
  });

/**
 * Used to append the environment variable options into [args...]
 *
 * @param {Array} xs
 * @return {function(*=): (*|Array)}
 */
function appender(xs) {
  xs = xs || [];
  return function(x) {
    xs.push(x);
    return xs;
  };
}

let exec = null;
program
  .command('exec')
  .usage(' ')
  .option('-c --cmd <c>', 'The command you want to run, if not provided the `entrypoint` command will be ran')
  .option('-a --args <a>', 'Arguments to be passed to the command, must be of the form `key="val"`', appender([]))
  .option('-e --envs <e>', 'Environment variables to be passed to run environment, must be of the form `key="val"`', appender([]))
  .description('Run commands defined in your `microservice.yml`. Must be ran in a directory with a `Dockerfile` and a `microservice.yml`')
  .action(async (options) => {
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
      const valid = validator();
      if (!valid.valid) {
        process.stderr.write(JSON.stringify(valid, null, 2));
        process.exit(1);
      }
      const microservice = new Microservice(valid.microsericeYaml);
      microservice.getCommand(options.cmd);
      const uuid = await build();
      const argsObj = parse(options.args, 'Unable to parse args');
      const envObj = parse(options.envs, 'Unable to parse envs');
      const e = new Exec(uuid, microservice, argsObj, envObj);
      exec = e;
      await e.go(options.cmd);
    } catch (error) {
      if (error.spinner) {
        error.spinner.fail(error.message);
      } else {
        process.stderr.write(error.message);
      }
      process.exit(1);
    }
  });

program.parse(process.argv);

if (process.argv.length === 2) {
  program.help();
}

process.on('SIGINT', async function() {
  if (exec.isDockerProcessRunning()) {
    await exec.serverKill();
  }
  process.exit();
});
