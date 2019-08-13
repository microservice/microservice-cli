import { ActionPayload, ActionOptionsDefault } from '~/types'

interface ActionOptions extends ActionOptionsDefault {
  json?: boolean
  silent?: boolean
}

export default async function validate({ options }: ActionPayload<ActionOptions>) {
  console.log('Validate command')
}
