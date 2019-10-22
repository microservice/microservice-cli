import { validateArgout } from '@microservices/validate'
import { ActionHttp } from '@microservices/validate/src/types'
import { CLIError } from '~/errors'

interface ValidateActionOutputOptions {
  action: ActionHttp
  actionName: string
  output: any
}

export default function validateActionOutput({ action, actionName, output }: ValidateActionOutputOptions) {
  const errors = validateArgout(action.output as any, output)
  if (errors.length) {
    throw new CLIError(`Output validation failed for Action#${actionName}\n${errors.map(item => `  - ${item}`)}`)
  }
}
