import { getConfigPaths } from '~/services/config'
import { buildImage, getImageName } from '~/services/docker'
import { ActionPayload, ActionOptionsDefault } from '~/types'
import * as logger from '~/logger'

interface ActionOptions extends ActionOptionsDefault {
  tag?: string
  raw?: boolean
}

export default async function build({ options }: ActionPayload<ActionOptions>) {
  const configPaths = await getConfigPaths(options)

  if (!configPaths) {
    logger.fatal('Must be ran in a directory with a `Dockerfile` and a `microservice.y[a]ml`')
  }
  await buildImage({
    raw: !!options.raw,
    configPath: configPaths.docker,
    tagName: options.tag || (await getImageName({ configPath: configPaths.docker })).name,
  })
}
