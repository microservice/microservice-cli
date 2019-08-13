import { ActionPayload } from '~/types'

export default async function list({ options }: ActionPayload<any>) {
  console.log('List command')
}
