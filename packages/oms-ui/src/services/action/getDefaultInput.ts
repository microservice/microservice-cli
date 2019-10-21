import store from '~/store'
import { ConfigSchema, Argument } from '~/types'

export default function getDefaultInput(actionName: string | null) {
  if (!actionName) {
    return ''
  }

  let args: Record<string, Argument> | null = null
  const config: ConfigSchema = store.getters.getConfig

  if (config && typeof config === 'object') {
    const { actions } = config
    if (actions && typeof actions === 'object') {
      const actionConfig = actions[actionName]
      if (
        actionConfig &&
        typeof actionConfig === 'object' &&
        actionConfig.arguments &&
        typeof actionConfig.arguments === 'object'
      ) {
        args = actionConfig.arguments
      }
    }
  }

  if (args) {
    const keys = Object.keys(args).map((key, index, arr) => {
      const isLastItem = index === arr.length - 1
      return `  ${JSON.stringify(key)}: ${isLastItem ? '' : ','}`
    })
    return `{\n${keys.join('\n')}\n}`
  }

  return `{\n}`
}
