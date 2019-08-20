import { Args, CommandPayload, CommandOptionsDefault } from '~/types'

interface ActionOptions extends CommandOptionsDefault {
  args?: Args
  envs?: Args
  raw?: boolean
}

export default async function subscribe({ options }: CommandPayload<ActionOptions>) {
  console.log('Subscribe command')
}
