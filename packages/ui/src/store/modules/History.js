const defaultState = {
  history: [],
}

const getters = {
  getHistory: state => state.history,
}

const mutations = {
  addHistoryEntry: (state, entry) => {
    state.history.unshift(entry)
  },
}

const actions = {}

export default {
  state: defaultState,
  getters,
  mutations,
  actions,
}
