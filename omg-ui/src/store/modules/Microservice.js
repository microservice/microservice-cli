const state = {
  microservice: '',
  rawMicroservice: '',
  status: false,
  notif: '',
  owner: ''
}

const getters = {
  getMicroservice: state => state.microservice,
  getMicroserviceRaw: state => state.rawMicroservice,
  getMicroserviceStatus: state => state.status,
  getMicroserviceNotif: state => state.notif,
  getOwner: state => state.owner
}

const mutations = {
  setValidation: (state, data) => {
    if (data.status === false && data.notif === 'ERROR_PARSING') {
      state.notif = 'Error found while parsing microservice.yml'
      state.valid = false
      state.microservice = null
    } else {
      const json = JSON.parse(data.notif)
      state.notif = json.text
      state.status = json.valid
      state.microservice = json.yaml
    }
  },
  setMicroserviceRaw: (state, data) => {
    state.rawMicroservice = data
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
