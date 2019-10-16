import { setShowHistory, setShowLogs } from '~/persistence'

export interface ViewsState {
  appReady: boolean
  showHistory: boolean
  showLogs: boolean
}

const defaultState: ViewsState = {
  appReady: false,
  showHistory: false,
  showLogs: false,
}

const mutations = {
  toggleShowHistory(state: ViewsState) {
    state.showHistory = !state.showHistory
    setShowHistory(state.showHistory)
  },
  setShowHistory(state: ViewsState, value: boolean) {
    state.showHistory = !!value
    setShowHistory(state.showHistory)
  },
  toggleShowLogs(state: ViewsState) {
    state.showLogs = !state.showLogs
    setShowLogs(state.showLogs)
  },
  setShowLogs(state: ViewsState, value: boolean) {
    state.showLogs = !!value
    setShowLogs(state.showLogs)
  },
  setAppReady(state: ViewsState) {
    state.appReady = true
  },
}

const getters = {
  getShowHistory(state: ViewsState) {
    return state.showHistory
  },
  getShowLogs(state: ViewsState) {
    return state.showLogs
  },
  getAppReady(state: ViewsState) {
    return state.appReady
  },
}

export default {
  state: defaultState,
  mutations,
  getters,
}
