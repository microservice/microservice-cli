import _get from 'lodash/get'
import getPort from 'get-port'
import Dockerode from 'dockerode'

import getHostIp from '~/helpers/getHostIp'
import { CLIError } from '~/errors'
import { Args, ConfigSchema } from '~/types'
import { getContainerPorts } from '~/services/config'

import processContainerEnv from './processContainerEnv'
import { dockerode } from './common'

interface GetContainerOptions {
  config: ConfigSchema
  envs: Args
  image: string
  inheritEnv: boolean
}

interface GetContainerResult {
  container: Dockerode.Container
  portsMap: Map<number, number>
}

const SHOULD_MAP_TO_LOCALHOST = !['darwin', 'win32'].includes(process.platform)
export default async function getContainer({
  config,
  envs,
  image,
  inheritEnv,
}: GetContainerOptions): Promise<GetContainerResult> {
  const imageWithTag = image.includes(':') ? image : `${image}:latest`

  const availableImages = await dockerode.listImages()
  if (!availableImages.some(item => Array.isArray(item.RepoTags) && item.RepoTags.includes(imageWithTag))) {
    throw new CLIError(`Docker Image '${image}' not found on this machine. Maybe try 'docker pull ${image}' first`)
  }

  const { missing: missingEnvs, invalid: invalidEnvs, values: envObj } = processContainerEnv({
    config,
    envs,
    inheritEnv,
  })

  const invalidChunks: string[] = []
  if (missingEnvs.length) {
    invalidChunks.push(`${missingEnvs.join(', ')} ${missingEnvs.length > 1 ? 'are' : 'is'} missing`)
  }
  if (invalidEnvs.length) {
    invalidChunks.push(`${invalidEnvs.join(', ')} ${invalidEnvs.length > 1 ? 'are' : 'is'} invalid`)
  }
  if (invalidChunks.length) {
    const totalCount = missingEnvs.length + invalidEnvs.length
    throw new CLIError(`Environment variable${totalCount > 1 ? 's' : ''} ${invalidChunks.join(' and ')}`)
  }

  const portsMap: Map</* container port */ number, /* host port */ number> = new Map()
  const portsExposed = {}
  const portBindings = {}

  const containerPorts = getContainerPorts(config)
  // TODO: Make a list instead of map, then convert to map
  // Use Promise.all on it to make things faster with lots of ports.
  for (let i = 0, { length } = containerPorts; i < length; i += 1) {
    const containerPort = containerPorts[i]
    // eslint-disable-next-line no-await-in-loop
    const freePort = await getPort()
    portsMap.set(containerPort, freePort)

    portsExposed[`${containerPort}/tcp`] = {}
    portBindings[`${containerPort}/tcp`] = [{ HostPort: freePort.toString() }]
  }

  const hostIp = SHOULD_MAP_TO_LOCALHOST ? await getHostIp() : null
  const container = await dockerode.createContainer({
    Image: image,
    Cmd: _get(config, 'lifecycle.startup.command', null),
    Env: Object.entries(envObj).map(([k, v]) => `${k}=${v}`),
    ExposedPorts: portsExposed,
    HostConfig: {
      PortBindings: portBindings,
      ExtraHosts: SHOULD_MAP_TO_LOCALHOST || !hostIp ? [] : [hostIp],
    },
  })

  return { container, portsMap }
}
