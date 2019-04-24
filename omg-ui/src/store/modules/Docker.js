const state = {
  starting: false,
  running: false,
  building: false,
  built: false,
  logs: '',
  runStat: '',
  inspect: '',

  rebuild: true,
  containerLogs: '',
  dockerLogs: '',
  state: 'stopped',
  stats: []
}

const getters = {
  getDockerStarting: state => state.starting,
  getDockerBuilding: state => state.building,
  getDockerBuilt: state => state.built,
  getDockerRunning: state => state.running,
  // getDockerLogs: state => state.logs,
  getDockerRunStat: state => state.runStat,
  getDockerInspect: state => state.inspect,

  getDockerRebuild: state => state.rebuild,
  getContainerLogs: state => state.containerLogs,
  getDockerLogs: state => state.dockerLogs,
  getDockerState: state => state.state,
  getDockerStats: state => state.stats
}

const mutations = {
  setDockerStarting: (state, value) => (state.starting = value),
  setDockerBuilding: (state, value) => (state.building = value),
  setDockerBuilt: (state, value) => (state.built = value),
  setDockerRunning: (state, value) => (state.running = value),
  setDockerLogs: (state, value) => (state.logs = value),
  setDockerRunStat: (state, value) => (state.runStat = value),
  addLineDockerRunStat: (state, line) => (state.runStat += `\n${line}`),
  setDockerInspect: (state, value) => (state.inspect = value),
  setDockerRebuild: (state, value) => (state.rebuild = value),

  toggleDockerRebuild: state => (state.rebuild = !state.rebuild),
  setContainerLogs: (state, log) => (state.containerLogs = log),
  appendDockerLogs: (state, line) => (state.dockerLogs += `${line}\n`),
  setDockerState: (state, value) => (state.state = value),
  addDockerStatsEntry: (state, entry) => state.stats.push(entry)
}

const actions = {}

export default {
  state,
  getters,
  mutations,
  actions
}
