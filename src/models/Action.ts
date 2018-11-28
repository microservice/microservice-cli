import Http from './Http';
import Format from './Format';
import Event from './Event';
import Command from './Command';
const validateAction = require('../schema/schema').action;

/**
 * Describes an action.
 */
export default class Action extends Command {
  private readonly eventMap: object;
  private readonly _http: Http;
  private readonly _format: Format;

  /**
   * Build a {@link Action}.
   *
   * @param {String} name The given name
   * @param {Object} rawAction The raw data
   */
  constructor(name: string, rawAction: any) {
    const isValid = validateAction(rawAction);
    if (!isValid.valid) {
      isValid.text = isValid.text.replace(/data/g, `actions.${name}`);
      throw isValid;
    }
    super(name, rawAction, name);
    this.eventMap = null;
    if (rawAction.events) {
      this.eventMap = {};
      const eventList = Object.keys(rawAction.events);
      for (let i = 0; i < eventList.length; i += 1) {
        this.eventMap[eventList[i]] = new Event(eventList[i], name, rawAction.events[eventList[i]]);
      }
    }
    this._http = ((rawAction.http) ? new Http(name, rawAction.http, `actions.${name}.http`, null) : null);
    this._format = ((rawAction.format) ? new Format(name, rawAction.format) : null);
    if (this._http !== null) {
      this.checkHttpArguments(this._http, 'action', 'Action');
    }
  }

  /**
   * Get the {@link Event}s, or null if there are no events, for this {@link Action}.
   *
   * @return {Array<Event>|null} The {@link Event}s
   */
  public get events(): Event[] {
    if (this.eventMap === null) {
      return null;
    }
    return (<any>Object).values(this.eventMap);
  }

  /**
   * Get an {@link Event} based on the given event name for this {@link Action}.
   *
   * @param {String} event The given event
   * @throws {String} If the event does not exist
   * @return {Event}
   */
  public getEvent(event): Event {
    if ((this.eventMap === null) || (!this.eventMap[event])) {
      throw `Event \`${event}\` does not exist`;
    }
    return this.eventMap[event];
  }

  /**
   * The this {@link Action}s {@link Http} service.
   *
   * @return {Http} The {@link Http} service
   */
  public get http(): Http {
    return this._http;
  }

  /**
   * Get's this {@link Action}'s format.
   *
   * @return {Format} The {@link Action}'s format
   */
  public get format(): Format {
    return this._format;
  }
}
