import { ActionPayload } from '~/types'

interface ActionOptions {
  json?: boolean
  details?: boolean
}

export default async function list({ options }: ActionPayload<ActionOptions>) {
  console.log('List command')
}
