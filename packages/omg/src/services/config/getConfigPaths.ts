import fs from 'sb-fs'
import path from 'path'

interface ConfigOptions {
  directory?: string
}

interface ConfigPaths {
  docker: string
  microservice: string
}

export default async function getConfigPaths(options: ConfigOptions): Promise<ConfigPaths | null> {
  const workingDirectory = options.directory || process.cwd()

  const dockerConfigPath = path.join(workingDirectory, 'Dockerfile')
  const microserviceYml = path.join(workingDirectory, 'microservice.yml')
  const microserviceYaml = path.join(workingDirectory, 'microservice.yaml')

  const [dockerConfigPathExists, microserviceYmlExists, microserviceYamlExists] = await Promise.all([
    fs.exists(dockerConfigPath),
    fs.exists(microserviceYml),
    fs.exists(microserviceYaml),
  ])

  if (!dockerConfigPathExists) {
    return null
  }

  if (microserviceYmlExists) {
    return { docker: dockerConfigPath, microservice: microserviceYml }
  }
  if (microserviceYamlExists) {
    return { docker: dockerConfigPath, microservice: microserviceYaml }
  }

  return null
}
