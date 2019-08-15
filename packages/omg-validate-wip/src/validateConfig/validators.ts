import arrayToSentence from 'array-to-sentence'
import { Validator } from './types'

export const string: Validator = {
  message: 'a valid string',
  validate: item => !!(typeof item === 'string' && item),
}

export const number: Validator = {
  message: 'a valid number',
  validate: item => !!(typeof item === 'number' && item),
}

export function array(validator: Validator): Validator {
  const validate = (value: any): boolean => {
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

  return { message, validate }
}

export function oneOf(...validators: Validator[]): Validator {
  const validate = (value: any): boolean => {
    if (validators.some(value)) {
      return true
    }

    return false
  }
  const messagesCombined = arrayToSentence(validators.map(item => item.message), {
    lastSeparator: ' or ',
  })
  const message = `one of ${messagesCombined}`

  return { message, validate }
}

export function enumValues(values: string[]): Validator {
  const validate = (value: any): boolean => values.includes(value)
  const message = `one of ${values}`

  return { validate, message }
}
