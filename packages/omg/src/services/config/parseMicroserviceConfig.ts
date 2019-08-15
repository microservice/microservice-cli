import fs from 'sb-fs'
import jsYaml from 'js-yaml'

interface ParseMicroserviceConfigOptions {
  configPath: string
}

export default async function parseMicroserviceConfig(options: ParseMicroserviceConfigOptions): Promise<any> {
  const parsed = jsYaml.safeLoad(await fs.readFile(options.configPath, 'utf8'))
  if (typeof parsed !== 'object' || !parsed) {
    throw new Error(`Malformed config file found at: ${options.configPath}`)
  }

  return parsed
}
