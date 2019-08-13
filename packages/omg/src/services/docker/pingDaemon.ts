import { dockerode } from './common'

export default async function pingDcker(): Promise<boolean> {
  try {
    await dockerode.ping()
    return true
  } catch (e) {
    return false
  }
}
