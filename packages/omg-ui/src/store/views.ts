export interface ViewsState {
  showMetrics: boolean
}

const defaultState: ViewsState = {
  showMetrics: false,
}

const mutations = {
  toggleMetrics(state: ViewsState) {
    state.showMetrics = !state.showMetrics
  },
}

const getters = {
  getShowMetrics(state: ViewsState) {
    return state.showMetrics
  },
}

export default {
  state: defaultState,
  mutations,
  getters,
}
