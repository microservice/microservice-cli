import _validateConfig from './validateConfig'
import { validateArgument as _validateArgument, validateOutput as _validateOutput } from './validateArgout'
import { ConfigSchema, Action, OutputType, ArgOut, Argument } from './types'

export default function validateConfig(config: ConfigSchema): string[] {
  const errors: string[] = []

  try {
    _validateConfig(config, message => errors.push(message))
  } catch (error) {
    errors.push(`Error validating config: ${error.stack}`)
  }

  return errors
}

export function validateArgument(spec: Argument, value: any) {
  const errors: string[] = []

  try {
    _validateArgument(spec, value, message => errors.push(message))
  } catch (error) {
    errors.push(`Error validating config: ${error.stack}`)
  }

  return errors
}

export function validateOutput(spec: ArgOut<OutputType>, value: any) {
  const errors: string[] = []

  try {
    _validateOutput(spec, value, message => errors.push(message))
  } catch (error) {
    errors.push(`Error validating config: ${error.stack}`)
  }

  return errors
}

export { ConfigSchema, Action }
