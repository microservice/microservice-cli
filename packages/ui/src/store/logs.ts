import { ConsoleLine, DockerLine, AppStatus } from '~/types'

export interface LogsState {
  status: AppStatus
  logs: (({ type: 'console' } & ConsoleLine) | ({ type: 'docker' } & DockerLine))[]
}

const defaultState: LogsState = {
  status: AppStatus.stopped,
  logs: [],
}

const MAX_HISTORY_LINES = 500

const mutations = {
  setAppStatus(state: LogsState, payload: AppStatus) {
    state.status = payload
  },
  logConsoleLine(state: LogsState, payload: ConsoleLine) {
    state.logs = state.logs.slice(-MAX_HISTORY_LINES).concat([
      {
        type: 'console',
        ...payload,
      },
    ])
  },
  logDockerLine(state: LogsState, payload: DockerLine) {
    state.logs = state.logs.slice(-MAX_HISTORY_LINES).concat([
      {
        type: 'docker',
        ...payload,
      },
    ])
  },
}

const getters = {
  appStatus(state: LogsState) {
    return state.status
  },
  logsAllReverse(state: LogsState) {
    const logsReverse = state.logs.slice()
    logsReverse.reverse()
    return logsReverse.map(item => item.contents).join('\n')
  },
}

export default {
  state: defaultState,
  mutations,
  getters,
}
