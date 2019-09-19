import { getRandomString } from '~/common'

interface ActionTab {
  id: string
  title: string
  actionName: string | null
  payload: string | null
}

export interface ActionsState {
  tabs: ActionTab[]
  activeTabId: string | null
}

function getActionTab(): ActionTab {
  return {
    id: getRandomString(),
    title: 'Action',
    actionName: null,
    payload: null,
  }
}
function getActiveTabFromState(state: ActionsState) {
  const { tabs, activeTabId } = state
  const activeTab = tabs.find(item => item.id === activeTabId)
  if (activeTab) {
    return activeTab
  }
  return tabs[0]
}

const defaultState: ActionsState = {
  tabs: [getActionTab()],
  activeTabId: null,
}

const mutations = {
  selectActionsTab(state: ActionsState, tabId: string) {
    state.activeTabId = tabId
  },
  destroyActionsTab(state: ActionsState, tabId: string) {
    if (state.tabs.length > 1) {
      state.tabs = state.tabs.filter(item => item.id !== tabId)
    }
  },
  createActionsTab(state: ActionsState) {
    const newTab = getActionTab()
    state.tabs.push(newTab)
    state.activeTabId = newTab.id
  },
  selectAction(state: ActionsState, name: string) {
    const activeTab = getActiveTabFromState(state)
    activeTab.actionName = name
  },
}

const getters = {
  getAllActionTabs(state: ActionsState): ActionTab[] {
    return state.tabs
  },
  getActiveActionTab: getActiveTabFromState,
}

export default {
  state: defaultState,
  mutations,
  getters,
}
