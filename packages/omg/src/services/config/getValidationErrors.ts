import validate from 'omg-validate'

export default function getValidationErrors(config: any): string[] {
  return validate(config)
}
