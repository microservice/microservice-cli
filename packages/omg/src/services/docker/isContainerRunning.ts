import { dockerode } from './common'

export default async function isContainerRunning(container: string): Promise<boolean> {
  const [containerInfo] = await dockerode.listContainers({
    filters: { id: [container] },
  })
  if (!containerInfo || containerInfo.State !== 'running') {
    return false
  }
  return true
}
