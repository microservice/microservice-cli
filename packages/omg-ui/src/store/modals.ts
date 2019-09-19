export enum Modals {
  ENVIRONMENT = 'ENVIRONMENT',
  COMPLETENESS = 'COMPLETENESS',
}

export const MODAL_NAMES: Modals[] = Object.values(Modals)

export interface ModalState {
  activeModal: null | Modals
}

const defaultState: ModalState = {
  activeModal: null,
}

const mutations = {
  dismissModal(state: ModalState) {
    state.activeModal = null
  },
  openEnvironemntModal(state: ModalState) {
    state.activeModal = Modals.ENVIRONMENT
  },
  openCompletenessModal(state: ModalState) {
    state.activeModal = Modals.COMPLETENESS
  },
  openYamlEditorModal(state: ModalState) {
    state.activeModal = Modals.COMPLETENESS
  },
}

const getters = {
  getActiveModal(state: ModalState) {
    return state.activeModal
  },
}

export default {
  state: defaultState,
  mutations,
  getters,
}
