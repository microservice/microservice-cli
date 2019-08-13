import { ActionPayload } from '~/types'

interface ActionOptions {
  json?: boolean
  silent?: boolean
}

export default async function validate({ options }: ActionPayload<ActionOptions>) {
  console.log('Validate command')
}
