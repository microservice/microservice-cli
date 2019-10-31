import * as logger from '~/logger'
import { CommandPayload, CommandOptionsDefault } from '~/types'
import { getConfigPaths, parseMicroserviceConfig } from '~/services/config'

interface ActionOptions extends CommandOptionsDefault {
  json?: boolean
  pretty?: boolean
  details?: boolean
}

export default async function list({ options }: CommandPayload<ActionOptions>) {
  const configPaths = await getConfigPaths(options, true, false)
  const microserviceConfig = await parseMicroserviceConfig({
    configPath: configPaths.microservice,
    validate: true,
  })

  if (options.json) {
    logger.info(JSON.stringify(microserviceConfig.actions, null, options.pretty ? 2 : 0))
    return
  }

  const { actions } = microserviceConfig
  if (!actions) {
    return
  }

  if (options.details) {
    Object.entries(actions).forEach(([actionName, action], i, actionEntries) => {
      logger.info(`${actionName}: ${action.help ? action.help.trim() : 'No help provided'}`)
      if (action.http) {
        const args = Object.entries(action.arguments || {})
        let uri = `:${action.http.port}${action.http.path}`
        const query = args
          .filter(([_, arg]) => arg.in === 'query')
          .map(([name]) => `${name}=<arg>`)
          .join('&')
        const body = args.filter(([_, arg]) => arg.in === 'requestBody').map(([name, arg]) => `${name}=${arg.type}`)

        if (query.length) {
          uri = `${uri}?${query}`
        }
        logger.info(`${action.http.method.toUpperCase()} ${uri} ${body.join(' ')}`)
      } else if (action.events) {
        Object.entries(action.events).forEach(([eventName, event]) => {
          logger.info(`  ${eventName}: ${event.help ? event.help.trim() : 'No help provided'}`)
          // TODO: Subscribe/Unsubscribe?
        })
      }

      // Only emit an empty line for non-last items
      if (i < actionEntries.length - 1) {
        console.log('')
      }
    })
    return
  }

  Object.entries(actions).forEach(([key, value], i, arr) => {
    const lastLine = i === arr.length - 1
    logger.info(`${key}: ${value.help ? value.help.trim() : 'No help provided'}${lastLine ? '' : '\n'}`)
  })
  logger.info(`Run again with --details for a more detailed look at your Microservice Config`)
}
