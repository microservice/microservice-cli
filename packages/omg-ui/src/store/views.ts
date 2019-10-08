export interface ViewsState {
  appReady: boolean
  showMetrics: boolean
}

const defaultState: ViewsState = {
  appReady: false,
  showMetrics: false,
}

const mutations = {
  toggleMetrics(state: ViewsState) {
    state.showMetrics = !state.showMetrics
  },
  setAppReady(state: ViewsState) {
    state.appReady = true
  },
}

const getters = {
  getShowMetrics(state: ViewsState) {
    return state.showMetrics
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
