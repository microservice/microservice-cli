import { ConfigSchema, InputType } from '~/types'

export interface ConfigState {
  config: ConfigSchema | null
  envValues: Record<string, any>
}

export interface ConfigEnv {
  name: string
  type: InputType | InputType[]
  value: string
  required: boolean
}
export interface ConfigAction {
  name: string
}

const defaultState: ConfigState = {
  config: null,
  envValues: {},
}

const mutations = {
  setConfig(state: ConfigState, newConfig: ConfigSchema | null) {
    state.config = newConfig
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
            value: state.envValues[name],
          })
        })

        return envs
      }
    }
    return []
  },
}

export default {
  state: defaultState,
  mutations,
  getters,
}
