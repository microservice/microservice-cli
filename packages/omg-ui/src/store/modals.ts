export enum Modals {
  ENVIRONMENT = 'ENVIRONMENT',
  YAML_EDITOR = 'YAML_EDITOR',
}

export const MODAL_NAMES: Modals[] = Object.values(Modals)

export interface ModalsState {
  activeModal: null | Modals
}

const defaultState: ModalsState = {
  activeModal: Modals.YAML_EDITOR,
}

const mutations = {
  dismissModal(state: ModalsState) {
    state.activeModal = null
  },
  openEnvironemntModal(state: ModalsState) {
    state.activeModal = Modals.ENVIRONMENT
  },
  openYamlEditorModal(state: ModalsState) {
    state.activeModal = Modals.YAML_EDITOR
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
