/* eslint-disable import/export */

import fs from 'sb-fs'
import path from 'path'
import * as logger from '~/logger'
import { HELP_OMS_GETTING_STARTED_WEBSITE } from '~/common'

interface ConfigOptions {
  directory?: string
}

export interface ConfigPaths {
  docker: string | null
  microservice: string | null
}

export default async function getConfigPaths(
  options: ConfigOptions,
  microserviceRequired: true,
  dockerRequired: true,
): Promise<{
  docker: string
  microservice: string
}>
export default async function getConfigPaths(
  options: ConfigOptions,
  microserviceRequired: true,
  dockerRequired: boolean,
): Promise<{
  docker: string | null
  microservice: string
}>
export default async function getConfigPaths(
  options: ConfigOptions,
  microserviceRequired: boolean,
  dockerRequired: true,
): Promise<{
  docker: string
  microservice: string | null
}>
export default async function getConfigPaths(
  options: ConfigOptions,
  microserviceRequired: boolean,
  dockerRequired: boolean,
): Promise<{
  docker: string | null
  microservice: string | null
}>
export default async function getConfigPaths(
  options: ConfigOptions,
  microserviceRequired: boolean = true,
  dockerRequired: boolean = true,
): Promise<ConfigPaths> {
  const workingDirectory = options.directory || process.cwd()

  const dockerConfigPath = path.join(workingDirectory, 'Dockerfile')
  const microserviceYml = path.join(workingDirectory, 'microservice.yml')
  const microserviceYaml = path.join(workingDirectory, 'microservice.yaml')

  const [dockerConfigPathExists, microserviceYmlExists, microserviceYamlExists] = await Promise.all([
    fs.exists(dockerConfigPath),
    fs.exists(microserviceYml),
    fs.exists(microserviceYaml),
  ])

  const foundDockerPath = dockerConfigPathExists ? dockerConfigPath : null
  let foundMicroservicePath: string | null = null
  if (microserviceYmlExists && microserviceYml) {
    foundMicroservicePath = microserviceYml
  } else if (microserviceYamlExists) {
    foundMicroservicePath = microserviceYaml
  }

  const chunks: string[] = []
  if (microserviceRequired && !foundMicroservicePath) {
    chunks.push('a `microservice.y[a]ml`')
  }
  if (dockerRequired && !foundDockerPath) {
    chunks.push('a `Dockerfile`')
  }

  if (chunks.length) {
    logger.fatal(
      `Must be ran in a directory with ${chunks.join(
        ' and ',
      )}.\nVisit ${HELP_OMS_GETTING_STARTED_WEBSITE} to get more info on getting started!`,
    )
  }

  return {
    docker: foundDockerPath,
    microservice: foundMicroservicePath,
  }
}
