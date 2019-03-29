import Http from './Http';
import Command from './Command';
const validateEvent = require('../schema/schema').event;

/**
 * Describes a event.
 */
export default class Event extends Command {
  private readonly _subscribe: Http;
  private readonly _unsubscribe: Http;

  /**
   * Build a {@link Event}.
   *
   * @param {String} name The given name
   * @param {String} actionName The name of this {@link Event}'s {@link Action}
   * @param {Object} rawEvent The raw data
   */
  constructor(name: string, actionName: string, rawEvent: any) {
    super(name, rawEvent, `${actionName}.events.${name}`);
    const isValid = validateEvent(rawEvent);
    if (!isValid.valid) {
      isValid.text = isValid.text.replace('data', `actions.${actionName}.events.${name}`);
      throw isValid;
    }
    this._subscribe = new Http(name, rawEvent.http.subscribe, `actions.${actionName}.events.${name}.http.subscribe`, rawEvent.http.port);
    this._unsubscribe = ((rawEvent.http.unsubscribe) ? new Http(name, rawEvent.http.unsubscribe, `actions.${actionName}.events.${name}.http.unsubscribe`, rawEvent.http.port) : null);
    this.checkHttpArguments(this._subscribe, 'event', 'Event');
    if (this._unsubscribe !== null) {
      this.checkHttpArguments(this._unsubscribe, 'event', 'Event');
    }
  }

  /**
   * The this {@link Event}s subscribe {@link Http} service.
   *
   * @return {Http} The {@link Http} service
   */
  public get subscribe(): Http {
    return this._subscribe;
  }

  /**
   * The this {@link Event}s unsubscribe {@link Http} service.
   *
   * @return {Http} The {@link Http} service
   */
  public get unsubscribe(): Http {
    return this._unsubscribe;
  }
}
