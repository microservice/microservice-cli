import { ActionPayload, ActionOptionsDefault } from '~/types'

interface ActionOptions extends ActionOptionsDefault {
  port?: string
  open: boolean
  inheritEnv?: boolean
}

export default async function ui({ options }: ActionPayload<ActionOptions>) {
  console.log('UI command')
}
