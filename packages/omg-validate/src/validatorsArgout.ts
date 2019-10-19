import { Validator } from './types'

export const int: Validator = {
  message: 'a valid int',
  validate: item => item.toString().match(/^[-+]?\d+$/) !== null,
}
export const float: Validator = {
  message: 'a valid float',
  validate: item =>
    !Number.isNaN(parseFloat(item)) &&
    parseFloat(item)
      .toString()
      .indexOf('.') !== -1,
}
export const string: Validator = {
  message: 'a valid string',
  validate: item => typeof item === 'string',
}
export const uuid: Validator = {
  message: 'a valid UUID',
  validate: item => item.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/) !== null,
}
export const boolean: Validator = {
  message: 'a valid boolean',
  validate: item => ['true', 'false'].includes(item.toString()),
}
export const any: Validator = {
  message: 'a valid existing item',
  validate: () => true,
}
export const list: Validator = {
  message: 'a valid list',
  validate: item => {
    try {
      return Array.isArray(item) && typeof item === 'object'
    } catch (e) {
      return false
    }
  },
}

export const object: Validator = {
  validateForMessage(item) {
    if (Array.isArray(item)) {
      return 'a valid object (not an Array)'
    }
    if (!item) {
      return 'a valid object (not empty/falsy)'
    }
    if (typeof item !== 'object') {
      return ` valid object (not ${item})`
    }

    return null
  },
}

export const map: Validator = object

export const path: Validator = {
  message: 'a valid path',
  validate: item => {
    try {
      JSON.parse(item)
      return false
    } catch (e) {
      const lastChar = item.substr(item.length - 1)
      if (lastChar === '/') {
        return false
      }
      return typeof item === 'string'
    }
  },
}
