import { ConfigSchema, InputType } from '~/types'

export interface ConfigState {
  config: ConfigSchema | null
  envValues: Record<string, any>
}

export interface ConfigEnv {
  name: string
  type: InputType
  value: string
  required: boolean
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
      return state.config.actions || {}
    }
    return {}
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
