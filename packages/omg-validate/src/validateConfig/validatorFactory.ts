/* eslint no-shadow: ["error", { "allow": ["state"] }] */

import _get from 'lodash/get'
import { State, Validator, ErrorCallback } from './types'

function validate(
  state: State,
  prop: string,
  required: boolean,
  callback: (params: { state: State; error: ErrorCallback }) => void,
) {
  const newPath = state.path.concat([prop])
  const newValue = _get(state.value, prop)
  const newState: State = { ...state, path: newPath, value: newValue }
  const errorPath = `.${newPath.join('.')}`

  state.visited.push(prop)

  if (typeof newValue === 'undefined') {
    if (required) {
      state.onError(`${errorPath} is required`)
    }
    return
  }
  callback({
    state: newState,
    error(message: string) {
      state.onError(`${errorPath} ${message}`)
    },
  })
}
function validateObject(
  state: State,
  prop: string,
  required: boolean,
  callback: (params: { state: State; error: ErrorCallback }) => void,
) {
  const newState: State = { ...state, visited: [] }
  validate(newState, prop, required, ({ state, error }) => {
    if (typeof state.value !== 'object' || !state.value) {
      error('must be a valid object')
    } else {
      callback({ state, error })
    }
    // console.log(newState.visited)
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

export { validate, validateWith, validateObject, validateAssocObject }
