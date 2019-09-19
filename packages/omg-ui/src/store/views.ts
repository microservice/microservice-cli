export interface ViewsState {
  showHistory: boolean
  showMetrics: boolean
}

const defaultState: ViewsState = {
  showHistory: true,
  // TODO: ^ Only true for debugging
  showMetrics: false,
}

const mutations = {
  toggleHistory(state: ViewsState) {
    state.showHistory = !state.showHistory
  },
  toggleMetrics(state: ViewsState) {
    state.showMetrics = !state.showMetrics
  },
}

const getters = {
  getShowHistory(state: ViewsState) {
    return state.showHistory
  },
  getShowMetrics(state: ViewsState) {
    return this.showMetrics
  },
}

export default {
  state: defaultState,
  mutations,
  getters,
}
