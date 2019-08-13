import { ActionPayload } from '~/types'

interface ActionOptions {
  tag?: string
}

export default async function build({ options }: ActionPayload<ActionOptions>) {
  console.log('Build command')
}
