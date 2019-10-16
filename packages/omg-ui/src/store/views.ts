export interface ViewsState {
  appReady: boolean
  showHistory: boolean
}

const defaultState: ViewsState = {
  appReady: false,
  showHistory: true,
}

const mutations = {
  toggleShowHistory(state: ViewsState) {
    state.showHistory = !state.showHistory
  },
  setAppReady(state: ViewsState) {
    state.appReady = true
  },
}

const getters = {
  getShowHistory(state: ViewsState) {
    return state.showHistory
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
