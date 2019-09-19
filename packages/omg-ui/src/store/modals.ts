export enum Modals {
  ENVIRONMENT = 'ENVIRONMENT',
  COMPLETENESS = 'COMPLETENESS',
}

export const MODAL_NAMES: Modals[] = Object.values(Modals)

export interface ModalsState {
  activeModal: null | Modals
}

const defaultState: ModalsState = {
  activeModal: Modals.ENVIRONMENT,
}

const mutations = {
  dismissModal(state: ModalsState) {
    state.activeModal = null
  },
  openEnvironemntModal(state: ModalsState) {
    state.activeModal = Modals.ENVIRONMENT
  },
  openCompletenessModal(state: ModalsState) {
    state.activeModal = Modals.COMPLETENESS
  },
  openYamlEditorModal(state: ModalsState) {
    state.activeModal = Modals.COMPLETENESS
  },
}

const getters = {
  getActiveModal(state: ModalsState) {
    return state.activeModal
  },
}

export default {
  state: defaultState,
  mutations,
  getters,
}
