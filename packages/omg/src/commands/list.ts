import * as logger from '~/logger'
import { getConfigPaths, parseMicroserviceConfig } from '~/services/config'
import { CommandPayload, CommandOptionsDefault } from '~/types'

interface ActionOptions extends CommandOptionsDefault {
  json?: boolean
  details?: boolean
}

export default async function list({ options }: CommandPayload<ActionOptions>) {
  const configPaths = await getConfigPaths(options, true)
  const microserviceConfig = await parseMicroserviceConfig({
    configPath: configPaths.microservice,
    validate: true,
  })

  if (options.json) {
    logger.info(JSON.stringify(microserviceConfig.actions))
    return
  }

  const { actions } = microserviceConfig
  if (!actions) {
    return
  }

  if (options.details) {
    Object.entries(actions).forEach(([actionName, action], i) => {
      logger.info(`${i === 0 ? '' : '\n'}${actionName}: ${action.help ? action.help.trim() : 'No help provided'}`)
      const { events, http } = action
      if (http) {
        const args = Object.entries(action.arguments)
        let uri = `:${http.port}${http.path}`
        const query = args
          .filter(([_, arg]) => arg.in === 'query')
          .map(([name]) => `${name}=<arg>`)
          .join('&')
        const body = args.filter(([_, arg]) => arg.in === 'requestBody').map(([name, arg]) => `${name}=${arg.type}`)

        if (query.length) {
          uri = `${uri}?${query}`
        }
        logger.info(`${http.method.toUpperCase()} ${uri} ${body.join(' ')}`)
      } else if (events) {
        Object.entries(events).forEach(([eventName, event]) => {
          logger.info(`  ${eventName}: ${event.help ? event.help.trim() : 'No help provided'}`)
          // TODO: Subscribe/Unsubscribe?
        })
      }
    })
    return
  }

  Object.entries(actions).forEach(([key, value], i) => {
    logger.info(`${i === 0 ? '' : '\n'}${key}: ${value.help ? value.help.trim() : 'No help provided'}`)
  })
}
