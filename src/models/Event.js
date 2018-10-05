const Http = require('./Http');
const Command = require('./Command');

/**
 * Describes a command.
 */
class Event extends Command {
  /**
   * Build a {@link Event}.
   *
   * @param {String} name The given name
   * @param {Object} rawCommand The raw data
   */
  constructor(name, rawCommand) {
    super(name, rawCommand, false);
    this._subscribe = new Http(name, rawCommand.http.subscribe, rawCommand.http.port);
    this._unsubscribe = new Http(name, rawCommand.http.unsubscribe, rawCommand.http.port);
    this._checkHttpArguments(this._subscribe);
    this._checkHttpArguments(this._unsubscribe);
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

module.exports = Event;
