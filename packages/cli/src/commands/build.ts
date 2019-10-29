import { getConfigPaths } from '~/services/config'
import { buildImage, getImageName } from '~/services/docker'
import { CommandPayload, CommandOptionsDefault } from '~/types'
import * as logger from '~/logger'

interface ActionOptions extends CommandOptionsDefault {
  tag?: string
  verbose?: boolean
}

export default async function build({ options }: CommandPayload<ActionOptions>) {
  const buildingText = 'Building Docker image'
  const configPaths = await getConfigPaths(options, true, true)
  const tagName = options.tag || (await getImageName({ configPath: configPaths.docker })).name

  const spinner = logger.spinnerStart(buildingText)

  try {
    await buildImage({
      configPath: configPaths.docker,
      name: tagName,
      onLog(line) {
        if (options.verbose) {
          logger.info(line)
        }
        if (spinner) {
          spinner.text = `${buildingText}\n${line}`
        }
      },
    })
    logger.spinnerSucceed(`Built Docker image with name: ${tagName}`)
  } catch (error) {
    process.exitCode = 1

    logger.spinnerFail('Error building Docker image')
    logger.error(error)
  }
}
