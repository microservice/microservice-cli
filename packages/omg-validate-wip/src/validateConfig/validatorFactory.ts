/* eslint no-shadow: ["error", { "allow": ["state"] }] */

import _get from 'lodash/get'
import { State, Validator, ErrorCallback } from './types'

export default function validatorFactory(rootError: ErrorCallback) {
  function validate(
    state: State,
    prop: string,
    required: boolean,
    callback: (params: { state: State; error: ErrorCallback }) => void,
  ) {
    const path = state.path.concat([prop])
    const errorPath = `.${path.join('.')}`
    const value = _get(state.value)
    if (typeof value === 'undefined') {
      if (required) {
        rootError(`${errorPath} is required`)
      }
      return
    }
    callback({
      state: { value, path },
      error(message: string) {
        rootError(`${errorPath} ${message}`)
      },
    })
  }
  function validateObject(
    state: State,
    prop: string,
    required: boolean,
    callback: (params: { state: State; error: ErrorCallback }) => void,
  ) {
    validate(state, prop, required, ({ state, error }) => {
      if (typeof state.value !== 'object' || !state.value) {
        error('must be a valid object')
      } else {
        callback({ state, error })
      }
    })
  }
  // Associative object validation
  function validateAssocObject(
    state: State,
    prop: string,
    required: boolean,
    callback: (params: { state: State; error: ErrorCallback }) => void,
  ) {
    validateObject(state, prop, required, ({ state }) => {
      Object.keys(state.value).forEach(key => {
        validateObject(state, key, true, callback)
      })
    })
  }

  function validateWith(state: State, prop: string, required: boolean, validator: Validator) {
    validate(state, prop, required, ({ state, error }) => {
      if (!validator.validate(state.value)) {
        error(`must be ${validator.message}`)
      }
    })
  }

  return { validate, validateWith, validateObject, validateAssocObject }
}
