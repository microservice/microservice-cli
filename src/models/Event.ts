import Http from './Http';
import Command from './Command';

/**
 * Describes a event.
 */
export default class Event extends Command {
  /**
   * Build a {@link Event}.
   *
   * @param {String} name The given name
   * @param {String} actionName The name of this {@link Event}'s {@link Action}
   * @param {Object} rawEvent The raw data
   */
  _subscribe: Http;
  _unsubscribe: Http;
  constructor(name, actionName, rawEvent) {
    super(name, rawEvent, actionName);
    this._subscribe = new Http(name, rawEvent.http.subscribe, `actions.${actionName}.events.${name}.http.subscribe`, rawEvent.http.port);
    this._unsubscribe = ((rawEvent.http.unsubscribe) ? new Http(name, rawEvent.http.unsubscribe, `actions.${actionName}.events.${name}.http.unsubscribe`, rawEvent.http.port) : null);
    this._checkHttpArguments(this._subscribe);
    if (this._unsubscribe !== null) {
      this._checkHttpArguments(this._unsubscribe);
    }
  }

  /**
   * The this {@link Event}s subscribe {@link Http} service.
   *
   * @return {Http} The {@link Http} service
   */
  get subscribe() {
    return this._subscribe;
  }

  /**
   * The this {@link Event}s unsubscribe {@link Http} service.
   *
   * @return {Http} The {@link Http} service
   */
  get unsubscribe() {
    return this._unsubscribe;
  }
}
