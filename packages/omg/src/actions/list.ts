import { ActionPayload, ActionOptionsDefault } from '~/types'

interface ActionOptions extends ActionOptionsDefault {
  json?: boolean
  details?: boolean
}

export default async function list({ options }: ActionPayload<ActionOptions>) {
  console.log('List command')
}
