import validate from '@microservices/validate'

export default function getValidationErrors(config: any): string[] {
  return validate(config)
}
