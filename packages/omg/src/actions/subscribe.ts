import { ActionPayload } from '~/types'

interface ActionOptions {
  args?: string[]
  envs?: string[]
  raw?: boolean
}

export default async function subscribe({ options }: ActionPayload<ActionOptions>) {
  console.log('Subscribe command')
}
