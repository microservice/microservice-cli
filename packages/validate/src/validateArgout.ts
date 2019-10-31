/* eslint no-shadow: ["error", { "allow": ["state"] }] */

import { InputType, OutputType, State, ErrorCallback, Argument, ArgOut } from './types'
import { validateNode, validate as _validate } from './validatorsBase'

import * as v from './validatorsArgout'

interface ValidationState<Type extends ArgOut<InputType | OutputType>> extends State {
  spec: Type
}

function validate<T extends ArgOut<InputType | OutputType>>(
  state: ValidationState<T>,
  prop: string,
  newSpec: T,
  required: boolean,
  callback: (params: { state: ValidationState<T>; error: ErrorCallback }) => void,
) {
  _validate(state, prop, required, ({ state, error }) => {
    const validationState: ValidationState<T> = { ...state, spec: newSpec }

    callback({ state: validationState, error })
  })
}

function validateTArgOut<Type extends ArgOut<InputType | OutputType>>({
  state,
  error,
}: {
  state: ValidationState<Type>
  error: ErrorCallback
}) {
  const { type } = state.spec

  if (v[type]) {
    const passedValidation = validateNode(state, error, v[type])
    if (!passedValidation) {
      return
    }
  }

  if (type === 'none') {
    // Do not validate for "none"
    return
  }

  if (type === 'object') {
    const specProperties = state.spec.properties || {}
    Object.keys(specProperties).forEach(propName => {
      const propSpec = specProperties[propName]
      validate(state, propName, propSpec, !!propSpec.required, validateTArgOut)
    })
  } else if (type === 'map') {
    // TODO: Validate .keys and .values for maps
    // const {map} = state.spec
  } else if (type === 'list') {
    // TODO: Validate .elements for lists
    // const {list} = state.spec
  } else if (type === 'int' || type === 'float') {
    // TODO: Validate range for numbers
    // const {range} = state.spec
  }
}

export function validateArgument(spec: Argument, value: any, onError: ErrorCallback): void {
  const state = {
    path: [],
    value,
    spec,
    visited: [],
    onError,
  }

  validateTArgOut<Argument>({
    state,
    error: onError,
  })
}

export function validateOutput(spec: ArgOut<OutputType>, value: any, onError: ErrorCallback) {
  const state = {
    path: [],
    value,
    spec,
    visited: [],
    onError,
  }

  validateTArgOut({
    state,
    error(message) {
      onError(`Output ${message}`)
    },
  })
}
