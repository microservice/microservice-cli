const Http = require('./Http');
const Format = require('./Format');
const Event = require('./Event');
const Command = require('./Command');

/**
 * Describes an action.
 */
class Action extends Command {
  /**
   * Build a {@link Action}.
   *
   * @param {String} name The given name
   * @param {Object} rawAction The raw data
   */
  constructor(name, rawAction) {
    super(name, rawAction, null);
    this._output = rawAction.output;
    this._eventMap = null;
    if (rawAction.events) {
      this._eventMap = {};
      const eventList = Object.keys(rawAction.events);
      for (let i = 0; i < eventList.length; i += 1) {
        this._eventMap[eventList[i]] = new Event(eventList[i], name,rawAction.events[eventList[i]]);
      }
    }
    this._http = ((rawAction.http) ? new Http(name, rawAction.http, null) : null);
    this._format = ((rawAction.format) ? new Format(name, rawAction.format) : null);
    if (this._http !== null) {
      this._checkHttpArguments(this._http);
    }
  }

  /**
   * The output type of this {@link Action}.
   *
   * @return {Object} The output type
   */
  get output() {
    return this._output;
  }

  /**
   * Get the {@link Event}s, or null if there are no events, for this {@link Action}.
   *
   * @return {Array<Event>|null} The {@link Event}s
   */
  get events() {
    if (this._eventMap === null) {
      return null;
    }
    return Object.values(this._eventMap);
  }

  /**
   * Get an {@link Event} based on the given event name for this {@link Action}.
   *
   * @param {String} event The given event
   * @throws {String} If the event does not exist
   * @return {Event}
   */
  getEvent(event) {
    if ((this._eventMap === null) || (!this._eventMap[event])) {
      throw `Event \`${event}\` does not exist`;
    }
    return this._eventMap[event];
  }

  /**
   * The this {@link Action}s {@link Http} service.
   *
   * @return {Http} The {@link Http} service
   */
  get http() {
    return this._http;
  }

  /**
   * Get's this {@link Action}'s format.
   *
   * @return {Format} The {@link Action}'s format
   */
  get format() {
    return this._format;
  }
}

module.exports = Action;
