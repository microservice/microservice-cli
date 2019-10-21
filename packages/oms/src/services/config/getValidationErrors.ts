import validate from 'oms-validate'

export default function getValidationErrors(config: any): string[] {
  return validate(config)
}
