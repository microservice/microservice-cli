/* eslint no-shadow: ["error", { "allow": ["state"] }] */
/* eslint-disable @typescript-eslint/no-use-before-define */

import _get from 'lodash/get'
import arrayToSentence from 'array-to-sentence'
import { object as validatorObject } from './validatorsArgout'
import { State, Validator, ErrorCallback } from './types'

// Invokes validator and returns error message or null if validation was a success
function invokeValidator(value: any, validator: Validator): string | null {
  if (validator.validate) {
    if (!validator.validate(value)) {
      return validator.message
    }
    return null
  }
  return validator.validateForMessage(value)
}

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
    const rootError = invokeValidator(state.value, validatorObject)
    if (rootError) {
      error(rootError)
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
    const errorMessage = invokeValidator(state.value, validator)
    if (errorMessage) {
      error(`must be ${errorMessage}`)
    }
  })
}

function array(validator: Validator): Validator {
  return {
    validateForMessage(value) {
      if (!Array.isArray(value)) {
        return `an array`
      }
      let errorMessage: string | null = null
      value.forEach(item => {
        errorMessage = errorMessage || invokeValidator(item, validator)
      })
      if (!errorMessage) {
        return null
      }
      return `an array of ${errorMessage || 'valid items'}`
    },
  }
}

function oneOf(...validators: Validator[]): Validator {
  return {
    validateForMessage(value) {
      const errorMessages = validators.map(validator => invokeValidator(value, validator)).filter(Boolean)

      if (errorMessages.length !== validators.length) {
        // Value passed one or more validators
        return null
      }

      const messagesCombined = arrayToSentence(errorMessages, {
        lastSeparator: ' or ',
      })

      return `one of ${messagesCombined}`
    },
  }
}

function enumValues(values: string[]): Validator {
  const callback = (value: any): boolean => values.includes(value)
  const message = `one of ${values.join(', ')}`

  return { message, validate: callback }
}

export { validate, validateWith, validateObject, validateAssocObject, array, enumValues, oneOf }
