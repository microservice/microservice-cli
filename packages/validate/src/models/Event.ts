import Http from './Http'
import Command from './Command'
import { dataTypes } from '../utils'

const validateEvent = require('../schema/schema').event

/**
 * Describes a event.
 */
export default class Event extends Command {
  private readonly _subscribe: Http
  private readonly _unsubscribe: Http

  /**
   * Build a {@link Event}.
   *
   * @param {String} name The given name
   * @param {String} actionName The name of this {@link Event}'s {@link Action}
   * @param {Object} rawEvent The raw data
   */
  public constructor(name: string, actionName: string, givenEvent: any) {
    let rawEvent = givenEvent

    super(name, rawEvent, `${actionName}.events.${name}`)
    if (!dataTypes.map(rawEvent)) {
      rawEvent = {}
    }
    const isValid = validateEvent(rawEvent)
    if (!isValid.valid) {
      isValid.text = isValid.text.replace('data', `actions.${actionName}.events.${name}`)
      throw isValid
    }
    this._subscribe = new Http(
      name,
      rawEvent.http.subscribe,
      `actions.${actionName}.events.${name}.http.subscribe`,
      rawEvent.http.port,
    )
    if (rawEvent.http.unsubscribe) {
      this._unsubscribe = new Http(
        name,
        rawEvent.http.unsubscribe,
        `actions.${actionName}.events.${name}.http.unsubscribe`,
        rawEvent.http.port,
      )
    } else {
      this._unsubscribe = null
    }
    this.checkHttpArguments(this._subscribe, 'event', 'Event')
    if (this._unsubscribe !== null) {
      this.checkHttpArguments(this._unsubscribe, 'event', 'Event')
    }
  }

  /**
   * The this {@link Event}s subscribe {@link Http} service.
   *
   * @return {Http} The {@link Http} service
   */
  public get subscribe(): Http {
    return this._subscribe
  }

  /**
   * The this {@link Event}s unsubscribe {@link Http} service.
   *
   * @return {Http} The {@link Http} service
   */
  public get unsubscribe(): Http {
    return this._unsubscribe
  }
}
