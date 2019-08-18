import { CommandPayload, CommandOptionsDefault } from '~/types'

interface ActionOptions extends CommandOptionsDefault {
  args?: [string, string][]
  envs?: [string, string][]
  raw?: boolean
}

export default async function subscribe({ options }: CommandPayload<ActionOptions>) {
  console.log('Subscribe command')
}
