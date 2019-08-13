import { ActionPayload } from '~/types'

export default async function validate({ options }: ActionPayload<any>) {
  console.log('Validate command')
}
