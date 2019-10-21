/* eslint no-shadow: ["error", { "allow": ["state"] }] */

import * as v from './validatorsConfig'
import { validate, validateWith, validateObject, validateAssocObject, enumValues, oneOf, array } from './validatorsBase'
import {
  ConfigSchema,
  INPUT_TYPES,
  OUTPUT_TYPES,
  CONTENT_TYPES,
  ENV_TYPES,
  HTTP_METHODS,
  State,
  ErrorCallback,
} from './types'

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
    validateWith(state, 'help', false, v.string)
    validateWith(state, 'type', true, enumValues(OUTPUT_TYPES))
    validateAssocObject(state, 'properties', state.value.type === 'object', ({ state }) => {
      validateTOutput({ state })
    })
  }
  function validateTArgument({ state, validateIn }: { state: State; validateIn: boolean }) {
    validateWith(state, 'help', false, v.string)
    validateWith(state, 'type', true, enumValues(INPUT_TYPES))
    if (validateIn) {
      validateWith(state, 'in', true, enumValues(['query', 'path', 'requestBody', 'header']))
    }

    validateWith(state, 'enum', false, array(v.string))
    validateObject(state, 'range', false, ({ state }) => {
      validateWith(state, 'min', false, v.number)
      validateWith(state, 'max', false, v.number)
    })
    validateWith(state, 'required', false, v.boolean)
    validateWith(state, 'default', false, v.any)

    validateAssocObject(state, 'properties', state.value.type === 'object', ({ state }) => {
      validateTArgument({ state, validateIn: false })
    })
  }
  // -Local validator mixins

  validate(root, root.value.omg ? 'omg' : 'oms', true, ({ state, error }) => {
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
    validate(state, 'startup', false, ({ state }) => {
      validateWith(state, 'command', true, oneOf(v.string, array(v.string)))
    })
    validate(state, 'shutdown', false, ({ state }) => {
      validateWith(state, 'command', true, oneOf(v.string, array(v.string)))
      validateWith(state, 'timeout', false, v.number)
    })
  })

  validateAssocObject(root, 'actions', true, ({ state }) => {
    validateWith(state, 'help', false, v.string)
    validateObject(state, 'format', false, ({ state }) => {
      validateWith(state, 'command', true, oneOf(v.string, array(v.string)))
    })
    validateAssocObject(state, 'events', false, ({ state }) => {
      validateWith(state, 'help', false, v.string)
      validateObject(state, 'http', true, ({ state }) => {
        validateWith(state, 'port', true, v.number)
        validateObject(state, 'subscribe', true, ({ state }) => {
          validateWith(state, 'path', true, v.pathname)
          validateWith(state, 'method', true, enumValues(HTTP_METHODS))
          validateWith(state, 'contentType', false, enumValues(CONTENT_TYPES))
        })
        validateObject(state, 'unsubscribe', false, ({ state }) => {
          validateWith(state, 'path', true, v.pathname)
          validateWith(state, 'method', true, enumValues(HTTP_METHODS))
          validateWith(state, 'contentType', false, enumValues(CONTENT_TYPES))
        })
      })
      validateObject(state, 'output', false, ({ state }) => {
        validateWith(state, 'actions', false, v.any)
        validateWith(state, 'contentType', false, enumValues(CONTENT_TYPES))
        validateTOutput({ state })
      })
      validateAssocObject(state, 'arguments', false, ({ state }) => {
        validateTArgument({ state, validateIn: true })
      })
    })
    validateObject(state, 'rpc', false, ({ state }) => {
      validateWith(state, 'port', true, v.number)
      validateObject(state, 'framework', true, ({ state }) => {
        validateObject(state, 'grpc', true, ({ state }) => {
          validateWith(state, 'version', true, v.number)
          validateObject(state, 'proto', true, ({ state }) => {
            validateWith(state, 'path', true, v.string)
          })
        })
      })
      validateObject(state, 'client', true, ({ state }) => {
        validateWith(state, 'endpoint', true, v.string)
        validateWith(state, 'port', true, v.number)
        validateWith(state, 'tls', true, v.boolean)
      })
    })
    validateObject(state, 'http', false, ({ state }) => {
      validateWith(state, 'method', true, enumValues(HTTP_METHODS))
      validateWith(state, 'contentType', false, enumValues(CONTENT_TYPES))

      if (state.value.port) {
        validateWith(state, 'path', true, v.pathname)
        validateWith(state, 'port', true, v.number)
        validateWith(state, 'url', false, v.notDefined('when port is defined'))
      } else {
        validateWith(state, 'path', false, v.notDefined('when url is defined'))
        validateWith(state, 'port', false, v.notDefined('when url is defined'))
        validateWith(state, 'url', true, v.string)
      }
    })
    validateAssocObject(state, 'arguments', false, ({ state }) => {
      validateTArgument({ state, validateIn: true })
    })
    validateObject(state, 'output', true, ({ state }) => {
      validateWith(state, 'contentType', false, enumValues(CONTENT_TYPES))
      validateTOutput({ state })
    })
  })

  validateWith(root, 'hostedExternally', false, v.boolean)

  validateAssocObject(root, 'environment', false, ({ state }) => {
    validateWith(state, 'type', true, enumValues(ENV_TYPES))
    validateWith(state, 'pattern', false, v.string)
    validateWith(state, 'sensitive', false, v.boolean)
    validateWith(state, 'help', false, v.string)

    if (typeof state.value.required !== 'undefined') {
      validateWith(state, 'default', false, v.notDefined('when port is defined'))
      validateWith(state, 'required', false, v.boolean)
    } else {
      validateWith(state, 'required', false, v.notDefined('when port is defined'))
      validateWith(state, 'default', false, v.string)
    }
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
    validateWith(state, 'metric_type', false, enumValues(['cpu', 'mem']))
    validateWith(state, 'metric_agg', false, enumValues(['avg', 'min', 'max', 'mean', 'mode']))
    validateWith(state, 'metric_interval', false, v.number)
    validateWith(state, 'metric_target', false, v.number)
    validateWith(state, 'min', false, v.number)
    validateWith(state, 'max', false, v.number)
    validateWith(state, 'desired', false, v.number)
    validateWith(state, 'cooldown', false, v.number)
  })

  validateAssocObject(root, 'forwards', false, ({ state }) => {
    validateWith(state, 'help', false, v.string)
    validateObject(state, 'http', true, ({ state }) => {
      validateWith(state, 'path', true, v.pathname)
      validateWith(state, 'port', true, v.number)
    })
  })

  validateObject(root, 'health', false, ({ state }) => {
    validateObject(state, 'http', true, ({ state }) => {
      validateWith(state, 'path', true, v.pathname)
      validateWith(state, 'port', true, v.number)
    })
  })
}
