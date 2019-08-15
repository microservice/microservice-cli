/* eslint no-shadow: ["error", { "allow": ["state"] }] */

import * as v from './validators'
import validatorFactory from './validatorFactory'
import { ConfigSchema, INPUT_TYPES } from '../../types'
import { State, ErrorCallback } from './types'

export default function validateConfig(config: ConfigSchema, rootError: ErrorCallback): void {
  const { validate, validateWith, validateObject, validateAssocObject } = validatorFactory(rootError)

  if (typeof config !== 'object' || !config) {
    rootError('Config is malformed')
    // Cannot perform any other checks when confirm is malformed
    // Return early.
    return
  }

  const root: State = { path: [], value: config }

  validate(root, 'omg', true, ({ state, error }) => {
    if (typeof state.value !== 'number') {
      error('must be a valid number')
    } else if (state.value !== 1) {
      error(`version expected to be 1, found: ${state.value}`)
    }
  })

  validateObject(root, 'info', true, ({ state }) => {
    ;['title', 'version', 'description'].forEach(prop => {
      validateWith(state, prop, true, v.string)
    })
    validateObject(state, 'contact', false, ({ state }) => {
      ;['name', 'url', 'email'].forEach(prop => {
        validateWith(state, prop, false, v.string)
      })
    })
    validateObject(state, 'license', false, ({ state }) => {
      ;['name', 'url'].forEach(prop => {
        validateWith(state, prop, false, v.string)
      })
    })
  })

  validate(root, 'lifecycle', false, ({ state }) => {
    ;['startup', 'shutdown'].forEach(lifeCycle => {
      validate(state, lifeCycle, false, ({ state }) => {
        validateWith(state, 'command', true, v.oneOf(v.string, v.array(v.string)))
      })
    })
  })

  validateAssocObject(root, 'actions', true, ({ state }) => {
    // TODO
  })

  validateAssocObject(root, 'environment', false, ({ state }) => {
    validateWith(state, 'type', true, v.oneOf(v.enumValues(INPUT_TYPES), v.array(v.enumValues(INPUT_TYPES))))
    validateWith(state, 'pattern', false, v.string)
  })
}
