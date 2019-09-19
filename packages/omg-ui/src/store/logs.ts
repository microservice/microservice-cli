import { ConsoleLine, DockerLine } from '~/types'

export interface LogsState {
  console: ConsoleLine[]
  docker: DockerLine[]
}

const defaultState: LogsState = {
  console: [],
  docker: [],
}

const MAX_HISTORY_LINES = 500

const mutations = {
  logConsoleLine(state: LogsState, payload: ConsoleLine) {
    state.console = state.console.slice(-MAX_HISTORY_LINES).concat([payload])
  },
  logDockerLine(state: LogsState, payload: DockerLine) {
    state.docker = state.docker.slice(-MAX_HISTORY_LINES).concat([payload])
  },
}

const getters = {
  logsConsole(state: LogsState) {
    return state.console.map(item => item.contents).join('\n')
  },
  logsConsoleInfo(state: LogsState) {
    return state.console
      .filter(item => item.severity === 'info')
      .map(item => item.contents)
      .join('\n')
  },
  logsConsoleWarn(state: LogsState) {
    return state.console
      .filter(item => item.severity === 'warn')
      .map(item => item.contents)
      .join('\n')
  },
  logsConsoleError(state: LogsState) {
    return state.console
      .filter(item => item.severity === 'error')
      .map(item => item.contents)
      .join('\n')
  },
  logsDocker(state: LogsState) {
    return state.docker.map(item => item.contents).join('\n')
  },
  logsDockerStdout(state: LogsState) {
    return state.docker
      .filter(item => item.stream === 'stdout')
      .map(item => item.contents)
      .join('\n')
  },
  logsDockerSterr(state: LogsState) {
    return state.docker
      .filter(item => item.stream === 'stderr')
      .map(item => item.contents)
      .join('\n')
  },
}

export default {
  state: defaultState,
  mutations,
  getters,
}
