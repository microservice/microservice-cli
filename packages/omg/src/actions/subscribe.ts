import { ActionPayload } from '~/types'

export default async function subscribe({ options }: ActionPayload<any>) {
  console.log('Subscribe command')
}
