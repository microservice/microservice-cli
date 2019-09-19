import { ConfigSchema, InputType } from '~/types'

export interface ConfigState {
  config: ConfigSchema | null
  validationErrors: string[]
  envValues: Record<string, any>
}

export interface ConfigEnv {
  name: string
  type: InputType | InputType[]
  required: boolean
}
export interface ConfigAction {
  name: string
}
export interface ConfigValidation {
  schema: boolean
  info: boolean
  actions: boolean
  startup: boolean
  health: boolean
}

const defaultState: ConfigState = {
  config: null,
  validationErrors: [],
  envValues: {},
}

const mutations = {
  setConfig(state: ConfigState, payload: { config: ConfigSchema; validationErrors: string[] }) {
    state.config = payload.config
    state.validationErrors = payload.validationErrors
  },
  setConfigEnv(state: ConfigState, { key, value }: { key: string; value: string }) {
    state.envValues[key] = value
  },
  resetConfigEnv(state: ConfigState) {
    state.envValues = {}
  },
}

const getters = {
  getConfig(state: ConfigState) {
    return state.config
  },
  getConfigActions(state: ConfigState) {
    if (state.config) {
      const { actions } = state.config
      if (actions) {
        const configActions: ConfigAction[] = []
        Object.keys(actions).forEach(name => {
          const value = actions[name]
          if (value.http) {
            // Only allow http actions in UI for now
            configActions.push({
              name,
            })
          }
        })

        return configActions
      }
    }
    return []
  },
  getConfigEnvValues(state: ConfigState): Record<string, string> {
    return state.envValues
  },
  getConfigEnvs(state: ConfigState): ConfigEnv[] {
    if (state.config) {
      const { environment } = state.config
      if (environment) {
        const envs: ConfigEnv[] = []
        Object.keys(environment).forEach(name => {
          const value = environment[name]

          envs.push({
            name,
            type: value.type,
            required: !!value.required,
          })
        })

        return envs
      }
    }
    return []
  },
  getConfigValidation(state: ConfigState): ConfigValidation {
    const validationSchema = state.validationErrors.length === 0
    const validationInfo = !!(state.config && state.config.info && state.config.info.title && state.config.info.version)
    const validationActions = Object.keys((state.config && state.config.actions) || {}).length > 0
    const validationStartup = !!(state.config && state.config.lifecycle && state.config.lifecycle.startup)
    const validationHealth = !!(state.config && state.config.health)

    return {
      schema: validationSchema,
      info: validationInfo,
      actions: validationActions,
      startup: validationStartup,
      health: validationHealth,
    }
  },
}

export default {
  state: defaultState,
  mutations,
  getters,
}
