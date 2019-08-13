import { ActionPayload } from '~/types'

export default async function run({ options }: ActionPayload<any>) {
  console.log('Run command')
}
