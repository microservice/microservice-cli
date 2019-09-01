import { Validator } from './types'

export const string: Validator = {
  message: 'a valid string',
  validate: item => !!(typeof item === 'string' && item),
}

export const number: Validator = {
  message: 'a valid number',
  validate: item => !!(typeof item === 'number' && item),
}

export const boolean: Validator = {
  message: 'a valid boolean',
  validate: item => !!(typeof item === 'boolean' && item),
}

export const notDefined: Validator = {
  message: 'not defined',
  validate: () => false,
}

export const any: Validator = {
  message: 'defined',
  validate: () => true,
}
