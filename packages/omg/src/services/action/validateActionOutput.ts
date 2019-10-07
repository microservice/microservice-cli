import { validateArgout } from 'omg-validate'
import { CLIError } from '~/errors'
import { ConfigSchemaAction } from '~/types'

interface ValidateActionOutputOptions {
  action: ConfigSchemaAction
  actionName: string
  output: any
}

export default function validateActionOutput({ action, actionName, output }: ValidateActionOutputOptions) {
  const errors = validateArgout(action.output as any, output)
  if (errors.length) {
    throw new CLIError(`Output validation failed for Action#${actionName}\n${errors.map(item => `  - ${item}`)}`)
  }
}
