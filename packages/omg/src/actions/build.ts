import { ActionPayload } from '~/types'

export default async function build({ options }: ActionPayload<any>) {
  console.log('Build command')
}
