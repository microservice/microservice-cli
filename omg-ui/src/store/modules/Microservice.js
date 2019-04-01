const state = {
  microservice: '',
  status: false,
  notif: '',
  owner: ''
}

const getters = {
  getMicroservice: state => state.microservice,
  getMicroserviceStatus: state => state.status,
  getMicroserviceNotif: state => state.notif,
  getOwner: state => state.owner
}

const mutations = {
  setValidation: (state, data) => {
    const json = JSON.parse(data.notif)
    state.notif = json.text
    state.status = json.valid
    state.microservice = json.yaml
  },
  setOwner: (state, owner) => {
    state.owner = owner
  }
}

const actions = {}

export default {
  state,
  getters,
  mutations,
  actions
}
