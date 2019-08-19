import _get from 'lodash/get'
import getPort from 'get-port'
import Dockerode from 'dockerode'

import { ConfigSchema } from '~/types'
import { getContainerPorts } from '~/services/config'

import { dockerode } from './common'

interface GetContainerOptions {
  config: ConfigSchema
  envs: [string, string][]
  image: string
}

interface GetContainerResult {
  container: Dockerode.Container
  portsMap: Map<number, number>
}

export default async function getContainer({ config, envs, image }: GetContainerOptions): Promise<GetContainerResult> {
  const imageWithTag = image.includes(':') ? image : `${image}:latest`

  const availableImages = await dockerode.listImages()
  if (!availableImages.some(item => item.RepoTags.includes(imageWithTag))) {
    throw new Error(`Docker Image '${image}' not found with latest tag`)
  }

  const envObj = {}

  if (config.environment) {
    Object.entries(config.environment).forEach(([name, env]) => {
      if (env.default) {
        envObj[name] = env.default
      }
    })
  }
  envs.forEach(([name, value]) => {
    envObj[name] = value
  })
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

  const container = await dockerode.createContainer({
    Image: image,
    Cmd: _get(config, 'lifecycle.startup.command', null),
    Env: Object.entries(envObj).map(([k, v]) => `${k}=${v}`),
    ExposedPorts: portsExposed,
    // ^ Exposed ports are container ports
    HostConfig: {
      PortBindings: portBindings,
      // TODO: Make ExtraHosts work on linux
      // Lookup `getHostIp` in old codebase
    },
  })

  return { container, portsMap }
}
