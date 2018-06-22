#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const program = require('commander');
const Validate = require('./commands/Validate');
const validator = require('./schema/schema');
const {build, parse, checkExecArgs} = require('./commands/utils');
const Microservice = require('./src/Microservice');
const Exec = require('./commands/Exec');

program
  .version('0.0.1');

program
  .command('validate')
  .description('Use to validate a microservice.yml')
  .action(() => {
    if (!fs.existsSync(path.join(process.cwd(), 'microservice.yml'))) {
      // TODO message
      process.exit(1);
    }
    process.stdout.write(new Validate().structure());
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
  .option('-c --cmd <c>')
  .option('-a --args <a>', '', appender(), [])
  .option('-e --envs <e>', '', appender(), [])
  .description('TODO') // TODO
  .action(async (options) => {
    if (!(options.args) || !(options.envs)) {
      // TODO message
      process.exit(1);
    }
    if ((!fs.existsSync(path.join(process.cwd(), 'microservice.yml'))) || !fs.existsSync(path.join(process.cwd(), 'Dockerfile'))) {
      // TODO message
      process.exit(1);
    }
    if (!options.cmd) {
      options.cmd = 'entrypoint';
    }

    try {
      const valid = JSON.parse(validator());
      const microservice = new Microservice(valid.microsericeYaml);
      microservice.getCommand(options.cmd);
      const uuid = await build();
      const argsObj = parse(options.args, '=', 'Unable to parse args');
      const envObj = parse(options.envs, '=', 'Unable to parse envs');
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

