import { CommandPayload, CommandOptionsDefault } from '~/types'

interface ActionOptions extends CommandOptionsDefault {
  port?: string
  open: boolean
  inheritEnv?: boolean
}

export default async function ui({ options }: CommandPayload<ActionOptions>) {
  console.log('UI command')
}
