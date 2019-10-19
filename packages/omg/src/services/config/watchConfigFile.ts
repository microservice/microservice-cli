import chokidar from 'chokidar'
import { throttle } from 'lodash'
import { Disposable } from 'event-kit'

import * as logger from '~/logger'
import { ConfigSchema } from '~/types'

import getValidationErrors from './getValidationErrors'
import parseMicroserviceConfig from './parseMicroserviceConfig'

const DEBOUNCE_MS = 500

export default function watchConfigFile({
  validate,
  configPath,
  onConfigUpdated,
}: {
  validate: boolean
  configPath: string
  onConfigUpdated: (config: ConfigSchema) => void
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
        validate: false,
      })
        .then(configParsed => {
          if (validate) {
            const validationErrors = getValidationErrors(configParsed)
            if (validationErrors.length) {
              // Ignore If we were asked to validate but the newly changed config file
              // is malformed
              return
            }
          }
          onConfigUpdated(configParsed)
        })
        .catch(logger.error)
    }, DEBOUNCE_MS),
  )

  return disposable
}
