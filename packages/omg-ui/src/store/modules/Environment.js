const defaultState = {
  envs: {},
}

const getters = {
  getEnvs: state => state.envs,
}

const mutations = {
  addEnv: (state, env) => {
    state.envs[env.key] = env.value
  },
  removeEnv: (state, key) => {
    delete state.envs[key]
  },
}

const actions = {}

export default {
  state: defaultState,
  getters,
  mutations,
  actions,
}
