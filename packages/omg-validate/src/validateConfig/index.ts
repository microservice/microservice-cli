/* eslint no-shadow: ["error", { "allow": ["state"] }] */

import * as v from './validators'
import { validate, validateWith, validateObject, validateAssocObject } from './validatorFactory'
import { ConfigSchema, INPUT_TYPES, OUTPUT_TYPES, CONTENT_TYPES, HTTP_METHODS } from '../types'
import { State, ErrorCallback } from './types'

export default function validateConfig(config: ConfigSchema, rootError: ErrorCallback): void {
  if (typeof config !== 'object' || !config) {
    rootError('Config is malformed')
    // Cannot perform any other checks when confirm is malformed
    // Return early.
    return
  }

  const root: State = { path: [], value: config, visited: [], onError: rootError }
  // +Local validator mixins
  function validateTOutput({ state }: { state: State }) {
    validateWith(state, 'type', true, v.enumValues(OUTPUT_TYPES))
    validateWith(state, 'contentType', false, v.enumValues(CONTENT_TYPES))
    validateAssocObject(state, 'properties', false, ({ state }) => {
      validateWith(state, 'type', true, v.enumValues(OUTPUT_TYPES))
      validateWith(state, 'help', false, v.string)
    })
  }
  function validateTArgument({ state }: { state: State }) {
    validateWith(state, 'help', false, v.string)
    validateWith(state, 'type', true, v.oneOf(v.enumValues(INPUT_TYPES), v.array(v.enumValues(INPUT_TYPES))))
    validateWith(state, 'in', false, v.enumValues(['query', 'path', 'requestBody']))
    validateWith(state, 'pattern', false, v.string)
    validateWith(state, 'enum', false, v.array(v.string))
    validateObject(state, 'range', false, ({ state }) => {
      validateWith(state, 'min', false, v.number)
      validateWith(state, 'max', false, v.number)
    })
    validateWith(state, 'required', false, v.boolean)
    validateWith(state, 'default', false, v.any)
  }
  // -Local validator mixins

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
    validateWith(state, 'help', false, v.string)
    validateObject(state, 'format', false, ({ state }) => {
      validateWith(state, 'command', true, v.oneOf(v.string, v.array(v.string)))
    })
    validateAssocObject(state, 'events', false, ({ state }) => {
      validateWith(state, 'help', false, v.string)
      validateObject(state, 'http', true, ({ state }) => {
        validateWith(state, 'port', true, v.number)
        validateWith(state, 'subscribe', true, v.any)
        validateWith(state, 'unsubscribe', false, v.any)
      })
      validateObject(state, 'output', false, ({ state }) => {
        validateWith(state, 'actions', false, v.any)
        validateTOutput({ state })
      })
      validateAssocObject(state, 'arguments', false, validateTArgument)
    })
    // TODO: Type this
    validateWith(state, 'rpc', false, v.any)
    validateObject(state, 'http', false, ({ state }) => {
      validateWith(state, 'path', true, v.string)
      validateWith(state, 'method', true, v.enumValues(HTTP_METHODS))
      validateWith(state, 'port', true, v.number)
      validateWith(state, 'contentType', false, v.enumValues(CONTENT_TYPES))
    })
    validateAssocObject(state, 'arguments', true, validateTArgument)
    validateObject(state, 'output', false, validateTArgument)
  })

  validateAssocObject(root, 'environment', false, ({ state }) => {
    validateWith(state, 'type', true, v.oneOf(v.enumValues(INPUT_TYPES), v.array(v.enumValues(INPUT_TYPES))))
    validateWith(state, 'pattern', false, v.string)
    validateWith(state, 'required', false, v.boolean)
    validateWith(state, 'help', false, v.string)
    validateWith(state, 'help', false, v.any)
  })

  validateAssocObject(root, 'volumes', false, ({ state }) => {
    validateWith(state, 'target', true, v.string)
    validateWith(state, 'persist', false, v.boolean)
  })

  validateObject(root, 'metrics', false, ({ state }) => {
    validateWith(state, 'ssl', false, v.boolean)
    validateWith(state, 'port', true, v.number)
    validateWith(state, 'uri', true, v.string)
  })

  validateObject(root, 'scale', false, ({ state }) => {
    validateWith(state, 'metric_type', false, v.enumValues(['cpu', 'mem']))
    validateWith(state, 'metric_agg', false, v.enumValues(['avg', 'min', 'max', 'mean', 'mode']))
    validateWith(state, 'metric_interval', false, v.number)
    validateWith(state, 'metric_target', false, v.number)
    validateWith(state, 'min', false, v.number)
    validateWith(state, 'max', false, v.number)
    validateWith(state, 'desired', false, v.number)
    validateWith(state, 'cooldown', false, v.number)
  })

  validateAssocObject(root, 'forward', false, ({ state }) => {
    validateObject(state, 'http', true, ({ state }) => {
      validateWith(state, 'path', true, v.string)
      validateWith(state, 'port', true, v.number)
    })
  })

  validateAssocObject(root, 'health', false, ({ state }) => {
    validateObject(state, 'http', true, ({ state }) => {
      validateWith(state, 'path', true, v.string)
      validateWith(state, 'port', true, v.number)
    })
  })
}
