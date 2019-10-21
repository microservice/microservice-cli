/* eslint no-shadow: ["error", { "allow": ["state"] }] */

import { InputType, OutputType, State, ErrorCallback } from './types'
import { validateWith, validateObject, enumValues } from './validatorsBase'

import * as v from './validatorsArgout'

export interface ValidateArgoutOptions {
  type: InputType | OutputType
  enum?: string[]
  properties?: Record<string, ValidateArgoutOptions>
}

export default function validateArgout(rootOptions: ValidateArgoutOptions, value: any, rootError: ErrorCallback): void {
  function errorCallback(message: string) {
    if (message.startsWith('.root')) {
      rootError(`.${message.slice(5)}`)
    } else {
      rootError(message)
    }
  }

  function validateItem(state: State, prop: string, options: ValidateArgoutOptions) {
    if (options.type === 'object') {
      validateObject(state, prop, true, ({ state }) => {
        const { properties } = options
        if (properties) {
          Object.entries(properties).forEach(([k, propOptions]) => {
            validateItem(state, k, propOptions)
          })
        }
      })
    } else if (options.type === 'enum') {
      validateWith(state, prop, true, enumValues((options.enum as any) || []))
    } else {
      validateWith(state, prop, true, v[options.type])
    }
  }

  validateItem({ path: [], value: { root: value }, visited: [], onError: errorCallback }, 'root', rootOptions)
}
