import { ConsoleLine, DockerLine } from '~/types'

export interface LogsState {
  logs: (
    | ({
        type: 'console'
      } & ConsoleLine)
    | ({ type: 'docker' } & DockerLine))[]
}

const defaultState: LogsState = {
  logs: [],
}

const MAX_HISTORY_LINES = 500

const mutations = {
  logConsoleLine(state: LogsState, payload: ConsoleLine) {
    state.logs = state.logs.slice(-MAX_HISTORY_LINES).concat([{ type: 'console', ...payload }])
  },
  logDockerLine(state: LogsState, payload: DockerLine) {
    state.logs = state.logs.slice(-MAX_HISTORY_LINES).concat([{ type: 'docker', ...payload }])
  },
}

const getters = {
  logsAll(state: LogsState) {
    return state.logs.map(item => item.contents).join('\n')
  },
  logsConsole(state: LogsState) {
    return state.logs
      .filter(item => item.type === 'console')
      .map(item => item.contents)
      .join('\n')
  },
  logsDocker(state: LogsState) {
    return state.logs
      .filter(item => item.type === 'docker')
      .map(item => item.contents)
      .join('\n')
  },
}

export default {
  state: defaultState,
  mutations,
  getters,
}
