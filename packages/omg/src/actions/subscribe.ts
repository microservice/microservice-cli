import { ActionPayload, ActionOptionsDefault } from '~/types'

interface ActionOptions extends ActionOptionsDefault {
  args?: string[]
  envs?: string[]
  raw?: boolean
}

export default async function subscribe({ options }: ActionPayload<ActionOptions>) {
  console.log('Subscribe command')
}
