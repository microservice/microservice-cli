const state = {
  starting: false,
  running: false,
  building: false,
  built: false,
  logs: '',
  runStat: '',
  inspect: ''
}

const getters = {
  getDockerStarting: state => state.starting,
  getDockerBuilding: state => state.building,
  getDockerBuilt: state => state.built,
  getDockerRunning: state => state.running,
  getDockerLogs: state => state.logs,
  getDockerRunStat: state => state.runStat,
  getDockerInspect: state => state.inspect
}

const mutations = {
  setDockerStarting: (state, value) => (state.starting = value),
  setDockerBuilding: (state, value) => (state.building = value),
  setDockerBuilt: (state, value) => (state.built = value),
  setDockerRunning: (state, value) => (state.running = value),
  setDockerLogs: (state, value) => (state.logs = value),
  setDockerRunStat: (state, value) => (state.runStat = value),
  setDockerInspect: (state, value) => (state.inspect = value)
}

const actions = {}

export default {
  state,
  getters,
  mutations,
  actions
}
