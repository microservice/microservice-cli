import { ActionPayload } from '~/types'

interface ActionOptions {
  port?: string
  open: boolean
  inheritEnv?: boolean
}

export default async function ui({ options }: ActionPayload<ActionOptions>) {
  console.log('UI command')
}
