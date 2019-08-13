import { ActionPayload } from '~/types'

export default async function ui({ options }: ActionPayload<any>) {
  console.log('UI command')
}
