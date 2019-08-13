import { ActionPayload, ActionOptionsDefault } from '~/types'

interface ActionOptions extends ActionOptionsDefault {
  tag?: string
}

export default async function build({ options }: ActionPayload<ActionOptions>) {
  console.log('Build command')
}
