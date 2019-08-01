import _ from 'underscore'

/**
 * Used to set values in the constructors of the microservice classes.
 *
 * @param {*} val The value to set
 * @param {*} _else The value to set if val if not defined
 * @return {*} The value
 */
export default function setVal(val: any, _else: any): any {
  if (_.isUndefined(val)) {
    return _else
  }
  return val
}
