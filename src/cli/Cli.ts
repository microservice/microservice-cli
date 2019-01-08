import * as fs from 'fs';
import * as path from 'path';
import * as YAML from 'yamljs';
import * as utils from '../utils';
import ora from '../ora';
import Microservice from '../models/Microservice';
import Build from '../commands/Build';
import Subscribe from '../commands/Subscribe';
import Exec from '../commands/exec/Exec';
import ExecFactory from '../commands/exec/ExecFactory';
const homedir = require('os').homedir();

/**
 * Describes the cli.
 */
export default class Cli {
  private microservice: Microservice = null;
  private _exec: Exec = null;
  private _subscribe: Subscribe = null;
  private startedID: string;

  /**
   * Build an {@link Cli}.
   */
  constructor() {
    if (!fs.existsSync(path.join(process.cwd(), 'microservice.yml')) || !fs.existsSync(path.join(process.cwd(), 'Dockerfile'))) {
      utils.error('Must be ran in a directory with a `Dockerfile` and a `microservice.yml`');
      process.exit(1);
    }
  }

  /**
   * Checks if Docker is running by running `docker ps`.
   */
  private static async checkDocker() {
    try {
      await utils.exec('docker ps');
    } catch (e) {
      utils.error('Docker must be running to us the cli');
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
  static validate(options: any): void {
    const json = Cli.readYAML(path.join(process.cwd(), 'microservice.yml'));
    try {
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
    try {
      return await new Build(options.tag || await utils.createImageName()).go();
    } catch (e) {
      e.spinner.fail(`Failed to build: ${e.message}`);
      process.exit(1);
    }
  }

  /**
   * Will read the `microservice.yml` and `Dockerfile` and run the given command with the given arguments and environment variables.
   *
   * @param {String} action The command to run
   * @param {Object} options The given object holding the command, arguments, and environment variables
   */
  async exec(action: string, options: any): Promise<void> {
    await Cli.checkDocker();
    const image = options.image;
    if (!(options.args) || !(options.envs)) {
      utils.error('Failed to parse command, run `omg exec --help` for more information.');
      process.exit(1);
      return;
    }

    if (options.image) {
      const images = await utils.exec(`docker images -f "reference=${image}"`);
      if (!images.includes(options.image)) {
        utils.error(`Image for microservice is not built. Run \`omg build\` to build the image.`);
        process.exit(1);
        return;
      }
    } else {
      options.image = await Cli.build({});
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

    this._exec = new ExecFactory(options.image, this.microservice, argsObj, envObj).getExec(_action);
    if ((process.argv[2] === 'exec') && (this._exec.constructor.name === 'EventExec')) {
      utils.error(`Action \`${action}\` is and event. Use \`omg subscribe\``);
      process.exit(1);
    }
    let spinner = ora.start(`Starting Docker container`);
    this.startedID = await this._exec.startService(); // 1. start service
    spinner.succeed(`Started Docker container: ${this.startedID.substring(0, 12)}`);
    spinner = ora.start(`Health check`);
    await timer(1000);
    if (!await this._exec.isRunning()) { // 2. health check
      spinner.fail('Health check failed');
      utils.error(`  Docker logs:\n${await this._exec.getLogs()}`);
      process.exit(1);
    }
    spinner.succeed(`Health check passed`);
    spinner = ora.start(`Running action: \`${action}\``);
    try {
      const output = await this._exec.exec(action); // 3. run service
      spinner.succeed(`Ran action: \`${action}\` with output: ${output}`);
    } catch (e) {
      if (await this._exec.isRunning()) {
        await this._exec.stopService();
      }
      spinner.fail(`Failed action: \`${action}\``);
      utils.error(`  ${e}`);
      process.exit(1);
    }

    if (this._exec.constructor.name !== 'EventExec') {
      spinner = ora.start(`Stopping Docker container: ${this.startedID.substring(0, 12)}`);
      const stoppedID = await this._exec.stopService();
      spinner.succeed(`Stopped Docker container: ${stoppedID.substring(0, 12)}`);
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
    await this.exec(action, {args: [], envs: options.envs});
    const spinner = ora.start(`Subscribing to event: \`${event}\``);
    let argsObj;
    try {
      argsObj = utils.parse(options.args, 'Unable to parse arguments. Must be of form: `-a key="val"`');
    } catch (e) {
      spinner.fail(`Failed action: \`${action}\`: ${e}`);
      process.exit(1);
    }
    this._subscribe = new Subscribe(this.microservice, argsObj, this._exec);
    try {
      await this._subscribe.go(action, event);
      spinner.succeed(`Subscribed to event: \`${event}\` data will be posted to this terminal window when appropriate`);
    } catch (e) {
      spinner.fail(`Failed subscribing to event \`${event}\`: ${e}`);
      utils.error(`  Docker logs:\n${await this._exec.getLogs()}`);
      process.exit(1);
    }
  }

  /**
   * Kills a docker process that is associated with the microservice.
   */
  static async shutdown(): Promise<void> {
    await Cli.checkDocker();
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
   * Catch the `CtrlC` command to stop running containers.
   */
  async controlC() {
    const spinner = ora.start(`Stopping Docker container: ${this.startedID.substring(0, 12)}`);
    if (this._subscribe) {
      await this._subscribe.unsubscribe();
    }
    if (this._exec && this._exec.isDockerProcessRunning()) {
      await this._exec.stopService();
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

const timer = (ms) => new Promise( (res) => setTimeout(res, ms));
