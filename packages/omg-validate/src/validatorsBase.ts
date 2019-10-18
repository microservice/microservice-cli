/* eslint no-shadow: ["error", { "allow": ["state"] }] */

import _get from 'lodash/get'
import arrayToSentence from 'array-to-sentence'
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
  // Since we're overwriting state visited, mark current prop as visited
  state.visited.push(prop)

  const newState: State = { ...state, visited: [] }
  validate(newState, prop, required, ({ state, error }) => {
    if (typeof state.value !== 'object' || !state.value) {
      error('must be a valid object')
      return
    }
    callback({ state, error })
    const currentKeys = Object.keys(state.value)
    const unknownKeys = currentKeys.filter(item => !newState.visited.includes(item))
    if (unknownKeys.length) {
      unknownKeys.forEach(key => {
        state.onError(`.${state.path.concat([key]).join('.')} is unrecognized`)
      })
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

function array(validator: Validator): Validator {
  const callback = (value: any): boolean => {
    if (!Array.isArray(value) || !value.every(validator.validate)) {
      return false
    }
    return true
  }

  let origMessage = validator.message
  if (origMessage.startsWith('a ')) {
    origMessage = origMessage.slice(2)
  }
  const message = `an array of ${origMessage}`

  return { message, validate: callback }
}

function oneOf(...validators: Validator[]): Validator {
  const callback = (value: any): boolean => {
    if (validators.some((validator: Validator) => validator.validate(value))) {
      return true
    }

    return false
  }
  const messagesCombined = arrayToSentence(validators.map(item => item.message), {
    lastSeparator: ' or ',
  })
  const message = `one of ${messagesCombined}`

  return { message, validate: callback }
}

function enumValues(values: string[]): Validator {
  const callback = (value: any): boolean => values.includes(value)
  const message = `one of ${values.join(', ')}`

  return { message, validate: callback }
}

export { validate, validateWith, validateObject, validateAssocObject, array, enumValues, oneOf }
