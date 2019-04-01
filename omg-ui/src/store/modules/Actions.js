const state = {
  action: '',
  args: {}
}

const getters = {
  getAction: state => state.action,
  getArgs: state => state.args
}

const mutations = {
  setAction: (state, action) => {
    state.action = action
  },
  addArg: (state, arg) => {
    state.args[arg.key] = arg.value
  },
  deleteArg: (state, key) => {
    delete state.args[key]
  }
}

const actions = {}

export default {
  state,
  getters,
  mutations,
  actions
}
