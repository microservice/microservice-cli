import { Validator } from './types'

export const string: Validator = {
  message: 'a valid string',
  validate: item => !!(typeof item === 'string' && item),
}

export const pathname: Validator = {
  message: 'a valid pathname',
  validate: item => !!(typeof item === 'string' && item.startsWith('/')),
}

export const number: Validator = {
  message: 'a valid number',
  validate: item => !!(typeof item === 'number' && item),
}

export const boolean: Validator = {
  message: 'a valid boolean',
  validate: item => !!(typeof item === 'boolean' && item),
}

export function notDefined(message: string): Validator {
  return {
    message: `not defined ${message}`,
    validate: () => false,
  }
}

export const any: Validator = {
  message: 'defined',
  validate: () => true,
}
