const state = {
  microservice: '',
  rawMicroservice: '',
  status: false,
  notif: '',
  owner: '',
  ownerGenerated: false
}

const getters = {
  getMicroservice: state => state.microservice,
  getMicroserviceRaw: state => state.rawMicroservice,
  getMicroserviceStatus: state => state.status,
  getMicroserviceNotif: state => state.notif,
  getMicroserviceActionList: state => {
    if (state.microservice) {
      return Object.keys(state.microservice.actions)
    }
    return null
  },
  getOwner: state => state.owner,
  getOwnerGenerated: state => state.ownerGenerated
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
    if (typeof owner === 'object' && owner.generated) {
      state.ownerGenerated = true
      state.owner = owner.owner
    } else {
      state.owner = owner
    }
  }
}

const actions = {}

export default {
  state,
  getters,
  mutations,
  actions
}
