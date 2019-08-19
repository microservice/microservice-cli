/* eslint-disable import/export */

import fs from 'sb-fs'
import path from 'path'
import * as logger from '~/logger'

interface ConfigOptions {
  directory?: string
}

export interface ConfigPaths {
  docker: string
  microservice: string
}

export default async function getConfigPaths(options: ConfigOptions, required: true): Promise<ConfigPaths>
export default async function getConfigPaths(options: ConfigOptions, required: false): Promise<ConfigPaths | null>
export default async function getConfigPaths(options: ConfigOptions, required: boolean): Promise<ConfigPaths | null> {
  const workingDirectory = options.directory || process.cwd()

  const dockerConfigPath = path.join(workingDirectory, 'Dockerfile')
  const microserviceYml = path.join(workingDirectory, 'microservice.yml')
  const microserviceYaml = path.join(workingDirectory, 'microservice.yaml')

  const [dockerConfigPathExists, microserviceYmlExists, microserviceYamlExists] = await Promise.all([
    fs.exists(dockerConfigPath),
    fs.exists(microserviceYml),
    fs.exists(microserviceYaml),
  ])

  if (dockerConfigPathExists) {
    if (microserviceYmlExists) {
      return { docker: dockerConfigPath, microservice: microserviceYml }
    }
    if (microserviceYamlExists) {
      return { docker: dockerConfigPath, microservice: microserviceYaml }
    }
  }

  if (required) {
    logger.fatal('Must be ran in a directory with a `Dockerfile` and a `microservice.y[a]ml`')
  }

  return null
}
