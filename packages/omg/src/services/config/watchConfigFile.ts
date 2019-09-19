import chokidar from 'chokidar'
import { throttle } from 'lodash'
import { Disposable } from 'event-kit'

import * as logger from '~/logger'
import { ConfigSchema } from '~/types'

import parseMicroserviceConfig from './parseMicroserviceConfig'

const DEBOUNCE_MS = 500

export default function watchConfigFile({
  validate,
  configPath,
  onConfigChanged,
}: {
  validate: boolean
  configPath: string
  onConfigChanged: (config: ConfigSchema) => void
}): Disposable {
  const watcher = chokidar.watch([configPath])
  const disposable = new Disposable(() => {
    watcher.close()
  })

  watcher.on(
    'change',
    throttle(() => {
      parseMicroserviceConfig({
        configPath,
        validate,
      })
        .then(configParsed => onConfigChanged(configParsed))
        .catch(logger.error)
    }, DEBOUNCE_MS),
  )

  return disposable
}
