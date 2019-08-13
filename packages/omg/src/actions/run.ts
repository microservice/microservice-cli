import { ActionPayload, ActionOptionsDefault } from '~/types'

interface ActionOptions extends ActionOptionsDefault {
  image?: string
  args?: string[]
  envs?: string[]
  raw?: boolean
}

export default async function run({ options }: ActionPayload<ActionOptions>) {
  console.log('Run command')
}
