const state = {
  action: '',
  args: {},
  output: 'No output available.\nExecute an action to view its output.',
  curlArgs: {},
  sendRaw: false
}

const getters = {
  getAction: state => state.action,
  getActionArgs: state => state.args,
  getActionOutput: state => state.output,
  getActionCurlArgs: state => state.curlArgs,
  getActionSendRaw: state => state.sendRaw
}

const mutations = {
  setAction: (state, action) => (state.action = action),
  addActionArg: (state, arg) => (state.args[arg.key] = arg.value),
  addActionCurlArgs: (state, arg) => (state.curlArgs[arg.key] = arg.value),
  deleteActionArg: (state, key) => {
    delete state.args[key]
  },
  setActionOutput: (state, output) => (state.output = output),
  toggleActionSendRaw: state => (state.sendRaw = !state.sendRaw)
}

const actions = {}

export default {
  state,
  getters,
  mutations,
  actions
}
