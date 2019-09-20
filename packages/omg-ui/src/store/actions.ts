import { getRandomString } from '~/common'
import { executeAction } from '~/rpc'

const DEFAULT_PAYLOAD = `{\n\t"parameter": "value"\n}`
const DEFAULT_RESULT = ''

export interface ActionTab {
  id: string
  title: string
  actionName: string | null
  payload: string
  result: string
}

export type ActionTabHistoric = ActionTab & {
  timestamp: number
}

export interface ActionsState {
  tabs: ActionTab[]
  history: ActionTabHistoric[]
  activeTabId: string | null
}

function getActionTab(): ActionTab {
  return {
    id: getRandomString(),
    title: 'Action',
    actionName: null,
    payload: DEFAULT_PAYLOAD,
    result: DEFAULT_RESULT,
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
  history: [],
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
  setActionPayload(state: ActionsState, payload: string) {
    const activeTab = getActiveTabFromState(state)
    activeTab.payload = payload
  },
  setActionResult(state: ActionsState, { tabId, result }) {
    const relevantTab = state.tabs.find(item => item.id === tabId)
    if (relevantTab) {
      relevantTab.result = JSON.stringify(result)
    }
  },
  saveActiveAction(state: ActionsState) {
    const activeTab = getActiveTabFromState(state)
    state.history.push({
      ...activeTab,
      timestamp: Date.now(),
    })
  },
  restoreHistoricTab(state: ActionsState, historicTab: ActionTabHistoric) {
    const newTab = getActionTab()
    newTab.title = historicTab.title
    newTab.actionName = historicTab.actionName
    newTab.payload = historicTab.payload
    newTab.result = historicTab.result

    state.tabs.push(newTab)
    state.activeTabId = newTab.id
  },
}

const actions = {
  executeActiveAction(context) {
    const activeTab = getActiveTabFromState(context.state)
    const { actionName } = activeTab

    let parsed
    try {
      parsed = JSON.parse(activeTab.payload)
    } catch (_) {
      /* No Op */
    }
    if (!parsed || typeof parsed !== 'object' || !actionName) {
      // Don't bother
      return
    }
    executeAction({
      name: actionName,
      args: parsed,
    }).then(response => {
      let result = response
      if (result.status === 'ok') {
        result = result.result
      } else if (result.status === 'error') {
        result = { error: result.error }
      }
      context.commit('setActionResult', {
        tabId: activeTab.id,
        result,
      })
    })
  },
}

const getters = {
  historicTabs(state: ActionsState): ActionTabHistoric[] {
    return state.history.slice()
  },
  getAllActionTabs(state: ActionsState): ActionTab[] {
    return state.tabs
  },
  getActiveActionTab: getActiveTabFromState,
}

export default {
  state: defaultState,
  mutations,
  getters,
  actions,
}
