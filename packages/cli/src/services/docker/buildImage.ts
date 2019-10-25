import path from 'path'
import readline from 'readline'

import { CLIError } from '~/errors'
import { getCliOptions } from '~/common'
import pingDaemon from './pingDaemon'
import { dockerode } from './common'

interface BuildImageOptions {
  name: string | null
  configPath: string
  onLog(line: string): void
}

export default async function buildImage(options: BuildImageOptions): Promise<void> {
  if (!(await pingDaemon())) {
    throw new CLIError('Docker daemon must be running before build images')
  }

  const stream = await dockerode.buildImage(
    // @ts-ignore: Dockerode has bad typings and requires src
    {
      context: path.dirname(options.configPath),
    },
    { t: options.name },
  )

  const lineInterface = readline.createInterface({
    input: stream,
    terminal: false,
  })

  return new Promise((resolve, reject) => {
    lineInterface.on('line', line => {
      const parsedLine = JSON.parse(line)
      if (parsedLine.stream) {
        // Ignore non-stream status
        const trimmed = parsedLine.stream.trim()
        if (trimmed.length) {
          options.onLog(trimmed)
        }
      } else if (parsedLine.error) {
        const debugMessage = getCliOptions().debug ? '' : ' (run with --debug for build log)'
        reject(new CLIError(`Building Docker image failed${debugMessage}: ${parsedLine.error}`))
      }
    })
    lineInterface.on('close', resolve)
  })
}
