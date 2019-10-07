import * as logger from '~/logger'

import { buildImage } from '~/services/docker'

export default async function buildForDaemon({
  imageName,
  configPath,
  raw,
}: {
  imageName: string
  configPath: string
  raw: boolean
}): Promise<void> {
  logger.spinnerStart('Building Docker image')

  try {
    await buildImage({
      configPath,
      name: imageName,
      onLog(line) {
        if (raw) {
          logger.info(line)
        }
      },
    })
    logger.spinnerSucceed(`Built Docker image with name: ${imageName}`)
  } catch (error) {
    logger.spinnerFail('Error building Docker image')
    throw error
  }
}
