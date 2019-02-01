import * as fs from 'fs';
import * as path from 'path';
import * as YAML from 'yamljs';
import * as utils from '../utils';
import ora from '../ora';
import Microservice from '../models/Microservice';
import Build from '../commands/Build';
import Subscribe from '../commands/Subscribe';
import Run from '../commands/run/Run';
import RunFactory from '../commands/run/RunFactory';
import Action from '../models/Action';
import Argument from '../models/Argument';
const homedir = require('os').homedir();

/**
 * Describes the cli.
 */
export default class Cli {
  private microservice: Microservice = null;
  private _run: Run = null;
  private _subscribe: Subscribe = null;
  private startedID: string;

  /**
   * Build an {@link Cli}.
   */
  constructor() {
    if ((!fs.existsSync(path.join(process.cwd(), 'microservice.yml')) || !fs.existsSync(path.join(process.cwd(), 'Dockerfile')))
    && (!process.argv.includes('--help')) && (process.argv.length > 2)) {
      utils.error('Must be ran in a directory with a `Dockerfile` and a `microservice.yml`');
      process.exit(1);
    }
  }

  /**
   * Checks if Docker is running by running `docker ps`.
   */
  private static async checkDocker() {
    try {
      await utils.docker.ping();
    } catch (e) {
      utils.error('Docker must be running to use the cli');
      process.exit(1);
    }
  }

  /**
   * Builds a {@link Microservice} based ton the `microservice.yml` file. If the build throws an error the user
   * will be directed to run `omg validate`.
   */
  buildMicroservice(): void {
    try {
      const json = YAML.parse(fs.readFileSync(path.join(process.cwd(), 'microservice.yml')).toString());
      this.microservice = new Microservice(json);
    } catch (e) {
      Cli.validate({});
    }
  }

  helpForAction(actionName): void {
    const action: Action = this.microservice.getAction(actionName);
    const stringBuffer = [`  Action \`${action.name}\` details: \n\n    Arguments: (use in the form of \`-a 'foo=bar' -a 'veggie=carrot'\`\n`];
    if (action.help) {
      stringBuffer.push(`\n    Help: ${action.help}\n`);
    }
    for (let argument of action.arguments) {
      stringBuffer.push(`      - ${argument.name}        ${argument.type}${((argument.help) ? `, ${argument.help}` : '')}\n`)
    }

    if (action.output && action.output.type) {
      stringBuffer.push(`    Output:\n      type: ${action.output.type}`)
    }

    utils.log(stringBuffer.join(''))
    process.exit();
  }

  /**
   * Formats the output based on the data and options.
   *
   * @param {Object} data The given data of the validation
   * @param {Object} options The given options (json, silent, or text)
   * @return {String} The string to be printed to the console
   */
  private static processValidateOutput(data: any, options: any): string {
    if (options.json) {
      return JSON.stringify(data, null, 2);
    } else if (options.silent) {
      return '';
    } else {
      let errorString;
      if (!data.text) {
        errorString = `${data.context} has an issue. ${data.message}`;
      } else {
        errorString = data.text;
      }
      if (errorString === 'No errors') {
        return errorString;
      }
      const errors = errorString.split(', ');
      const errorCount = errors.length;
      const formattedError = [`${errorCount} error${((errorCount === 1) ? '' : 's')} found:`];
      for (let i = 0; i < errors.length; i += 1) {
        formattedError.push(`\n  ${i + 1}. ${errors[i]}`);
      }
      return formattedError.join('');
    }
  }

  /**
   * Reads the `microservice.yml` and validates it.
   *
   * @param {Object} options The given options (json, silent, or text)
   */
  static validate(options: any): void {
    const json = Cli.readYAML(path.join(process.cwd(), 'microservice.yml'));
    try {
      utils.checkActionInterface(json);
      const m = new Microservice(json);
      utils.log(Cli.processValidateOutput(m.rawData, options));
      process.exit(0);
    } catch (e) {
      utils.error(Cli.processValidateOutput(e, options));
      process.exit(1);
    }
  }

  /**
   * Builds a microservice based off of the Dockerfile in the current directory.
   *
   * @param {Object} options The given name
   */
  static async build(options: any): Promise<string> {
    await Cli.checkDocker();
    if (!options.raw) {
      ora.start().info('Building Docker image');
    }
    try {
      const name = await new Build(options.tag || await utils.createImageName()).go(!!options.raw);
      if (!options.raw) {
        ora.start().succeed(`Built Docker image with name: ${name}`);
      }
      return name;
    } catch (e) {
      if (options.raw) {
        utils.error(e);
      } else {
        ora.start().fail(`Failed to build: ${e}`);
      }
      process.exit(1);
    }
  }

  /**
   * Will read the `microservice.yml` and `Dockerfile` and run the given command with the given arguments and environment variables.
   *
   * @param {String} action The command to run
   * @param {Object} options The given object holding the command, arguments, and environment variables
   */
  async run(action: string, options: any): Promise<void> {
    await Cli.checkDocker();
    const image = options.image;
    if (!(options.args) || !(options.envs)) {
      utils.error('Failed to parse command, run `omg run --help` for more information.');
      process.exit(1);
      return;
    }

    if (options.image) {
      if (!utils.doesContainerExist(options.image, (await utils.docker.listImages()))) {
        utils.error(`Image for microservice is not built. Run \`omg build\` to build the image.`);
        process.exit(1);
        return;
      }
    } else {
      options.image = await Cli.build({raw: options.raw});
    }

    let _action;
    let argsObj;
    let envObj;
    try {
      _action = this.microservice.getAction(action);
      argsObj = utils.parse(options.args, 'Unable to parse arguments. Must be of form: `-a key="val"`');
      envObj = utils.parse(options.envs, 'Unable to parse environment variables. Must be of form: `-e key="val"`');
    } catch (e) {
      utils.error(e);
      process.exit(1);
    }

    this._run = new RunFactory(options.image, this.microservice, argsObj, envObj).getRun(_action);
    if ((process.argv[2] === 'run') && (this._run.constructor.name === 'EventRun')) {
      utils.error(`Action \`${action}\` is and event. Use \`omg subscribe\``);
      process.exit(1);
    }
    let spinner;
    if (!options.raw) {
      spinner = ora.start(`Starting Docker container`);
    }
    this.startedID = await this._run.startService(); // 1. start service
    if (!options.raw) {
      spinner.succeed(`Started Docker container: ${this.startedID.substring(0, 12)}`);
      spinner = ora.start(`Health check`);
    }
    await new Promise( (res) => setTimeout(res, 1000)); // wait for the container to start
    if (!await this._run.isRunning()) { // 2. health check
      if (options.raw) {
        utils.error('Health check failed');
      } else {
        spinner.fail('Health check failed');
      }
      utils.error(`  Docker logs:\n${await this._run.getStderr()}`);
      process.exit(1);
    }
    if (!options.raw) {
      spinner.succeed(`Health check passed`);
      spinner = ora.start(`Running action: \`${action}\``);
    }
    let output;
    try {
      output = await this._run.exec(action); // 3. run service
      if (!options.raw) {
        spinner.succeed(`Ran action: \`${action}\` with output: ${output}`);
      }
    } catch (e) {
      if (await this._run.isRunning()) {
        await this._run.stopService();
      }
      if (options.raw) {
        utils.error(`Failed action: \`${action}\`: ${e}`);
      } else {
        spinner.fail(`Failed action: \`${action}\`: ${e}`);
      }
      process.exit(1);
    }

    if (this._run.constructor.name !== 'EventRun') {
      if (!options.raw) {
        spinner = ora.start(`Stopping Docker container: ${this.startedID.substring(0, 12)}`);
      }
      const stoppedID = await this._run.stopService();
      if (!options.raw) {
        spinner.succeed(`Stopped Docker container: ${stoppedID.substring(0, 12)}`);
      }
    }

    if (options.raw) {
      utils.log(output);
    }
  }

  /**
   * Will read the `microservice.yml` and `Dockerfile` and subscribe to the with the given event..
   *
   * @param {String} action The given action
   * @param {String} event The given event
   * @param {Object} options The given object holding the arguments
   */
  async subscribe(action: string, event: string, options: any) {
    await Cli.checkDocker();
    await this.run(action, {args: [], envs: options.envs});
    const spinner = ora.start(`Subscribing to event: \`${event}\``);
    let argsObj;
    try {
      argsObj = utils.parse(options.args, 'Unable to parse arguments. Must be of form: `-a key="val"`');
    } catch (e) {
      spinner.fail(`Failed action: \`${action}\`: ${e}`);
      process.exit(1);
    }
    this._subscribe = new Subscribe(this.microservice, argsObj, this._run);
    try {
      await this._subscribe.go(action, event);
      spinner.succeed(`Subscribed to event: \`${event}\` data will be posted to this terminal window when appropriate`);
      const that = this;
      setInterval(async () => {
        if (!await that._run.isRunning()) {
          utils.error(`\n\nContainer unexpectedly stopped\nDocker logs:\n${await that._run.getStderr()}`);
          process.exit(1);
        }
      }, 1500);
    } catch (e) {
      if (await this._run.isRunning()) {
        await this._run.stopService();
      }
      const logs = await this._run.getStderr();
      spinner.fail(`Failed subscribing to event \`${event}\`: ${e}`);
      if (logs) {
        utils.error(`  Docker logs:\n${await this._run.getStderr()}`);
      }
      process.exit(1);
    }
  }

  /**
   * Catch the `CtrlC` command to stop running containers.
   */
  async controlC() {
    const spinner = ora.start(`Stopping Docker container: ${this.startedID.substring(0, 12)}`);
    if (this._subscribe) {
      await this._subscribe.unsubscribe();
    }
    if (this._run && this._run.isDockerProcessRunning()) {
      await this._run.stopService();
    }
    spinner.succeed(`Stopped Docker container: ${this.startedID.substring(0, 12)}`);
    process.exit();
  }

  /**
   * Read's a `microservice.yml` file to a string.
   *
   * @param {String} path The given path
   * @return {String} Returns file in string form
   */
  private static readYAML(path: string): string {
    try {
      return YAML.parse(fs.readFileSync(path).toString());
    } catch (e) {
      utils.error(`Issue with microservice.yml: ${e.message}`);
      process.exit(1);
    }
  }
}
