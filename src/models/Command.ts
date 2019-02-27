import Argument from './Argument';
import Http from './Http';

/**
 * Describes a general command. NOTE: this is used as an Abstract Class and should not be instantiated.
 */
export default abstract class Command {
  protected readonly _name: string;
  protected readonly _help: string;
  protected readonly _output: any;
  protected argumentsMap: object;

  /**
   * Builds a {@link Command}.
   *
   * @param {String} name The given name
   * @param {Object} rawCommand The raw data
   * @param {String} argumentPath Name of that parent action, if null, this means that this is a root action
   */
  protected constructor(name: string, rawCommand: any, argumentPath: string) {
    this._name = name;
    this._help = rawCommand.help || null;
    this._output = rawCommand.output;
    this.argumentsMap = null;
    if (rawCommand.arguments) {
      this.argumentsMap = {};
      const _arguments = Object.keys(rawCommand.arguments);
      for (let i = 0; i < _arguments.length; i += 1) {
        this.argumentsMap[_arguments[i]] = new Argument(_arguments[i], argumentPath, rawCommand.arguments[_arguments[i]]);
      }
    }
  }

  /**
   * Check validity of a http interfacing {@link Command}.
   *
   * @param {Http} http The given {@link Http}
   * @param {String} commandType 'event' or 'action'
   * @param {String} commandTypeUpper 'Event' or 'Action'
   */
  protected checkHttpArguments(http: Http, commandType: string, commandTypeUpper: string): void {
    let _path = http.path;

    for (let i = 0; i < this.arguments.length; i += 1) {
      const argument = this.arguments[i];
      if (argument.in === null) {
        throw {
          context: `Argument: \`${argument.name}\` for ${commandType}: \`${this.name}\``,
          message: `${commandTypeUpper}s' arguments that interface via http must provide an in`,
        };
      }
      if (argument.in === 'path') {
        if (!http.path.includes(`{${argument.name}}`)) {
          throw {
            context: `Argument: \`${argument.name}\` for ${commandType}: \`${this.name}\``,
            message: 'Path parameters must be defined in the http path, of the form `{argument}`',
          };
        } else {
          _path = _path.replace(`{${argument.name}}`, argument.name);
        }
        if (!argument.isRequired() && (argument.default === null)) {
          throw {
            context: `Argument: \`${argument.name}\` for ${commandType}: \`${this.name}\``,
            message: 'Path parameters must be marked as required or be provided a default variable',
          };
        }
      }
    }
    const extraPathParams = _path.match(/({[a-zA-Z]+})/g);
    if (extraPathParams !== null) {
      throw {
        context: `Path parameter(s): \`${extraPathParams.toString()}\` for ${commandType}: \`${this.name}\``,
        message: `If a url specifies a path parameter i.e. \`{argument}\`, the argument must be defined in the ${commandType}`,
      };
    }
  }

  /**
   * Get's the name of this {@link Command}.
   *
   * @return {String} The name
   */
  public get name(): string {
    return this._name;
  }

  /**
   * Get's help for this {@link Command}.
   *
   * @return {String} The help
   */
  public get help(): string {
    return this._help;
  }

  /**
   * Get's the output type for this {@link Command}.
   *
   * @return {Object} The output type
   */
  public get output(): any {
    return this._output;
  }

  /**
   * Checks if the required arguments are supplied.
   *
   * @param {Object} _arguments The given argument mapping
   * @return {Boolean} True if all required arguments are supplied, otherwise false
   */
  public areRequiredArgumentsSupplied(_arguments: any): boolean {
    const requiredArguments = this.requiredArguments;
    for (let i = 0; i < requiredArguments.length; i += 1) {
      if (!Object.keys(_arguments).includes(requiredArguments[i])) {
        return false;
      }
    }
    return true;
  }

  /**
   * Get this {@link Command}'s required {@link Argument}s.
   *
   * @return {Array<String>} The required {@link Argument}'s names
   */
  public get requiredArguments(): string[] {
    return this.arguments.filter((a) => a.isRequired()).map((a) => a.name);
  }

  /**
   * Get the {@ink Argument}s for this {@link Command}.
   *
   * @return {Array<Argument>} The {@link Argument}s
   */
  public get arguments(): Argument[] {
    if (this.argumentsMap === null) {
      return [];
    }
    return (<any>Object).values(this.argumentsMap);
  }

  /**
   * Get an {@link Argument} based on given argument for this {@link Command}.
   *
   * @param {String} argument The given argument
   * @throws {String} If the argument does not exists
   * @return {Argument} The {@link Argument} with given name
   */
  public getArgument(argument): Argument {
    if ((this.argumentsMap === null) || (!this.argumentsMap[argument])) {
      throw `Argument \`${argument}\` does not exist`;
    }
    return this.argumentsMap[argument];
  }
}
