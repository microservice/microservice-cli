import { ActionPayload } from '~/types'

interface ActionOptions {
  image?: string
  args?: string[]
  envs?: string[]
  raw?: boolean
}

export default async function run({ options }: ActionPayload<ActionOptions>) {
  console.log('Run command')
}
