export enum Modals {
  ENVIRONMENT = 'ENVIRONMENT',
  COMPLETENESS = 'COMPLETENESS',
}

export const MODAL_NAMES: Modals[] = Object.values(Modals)

export interface ModalState {
  activeModal: null | Modals
}

const defaultState: ModalState = {
  activeModal: Modals.ENVIRONMENT,
}

const mutations = {
  dismissModal(state: ModalState) {
    state.activeModal = null
  },
  openModal(state: ModalState, modalName: Modals) {
    if (!MODAL_NAMES.includes(modalName)) {
      throw new Error(`Invalid modal name to open: ${modalName}`)
    }
    state.activeModal = modalName
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
