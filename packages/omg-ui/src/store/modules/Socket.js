const io = require('socket.io-client')

const state = {
  socket: null
}

const getters = {
  getSocket (state) {
    return state.socket
  }
}

const mutations = {
  initSocket (state) {
    state.socket = io(`http://localhost:${window.location.port}`)
  }
}

const actions = {}

export default {
  state,
  getters,
  mutations,
  actions
}
