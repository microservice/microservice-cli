import { getRandomString } from '~/common'
import { executeAction } from '~/rpc'
import { setHistoricTabs } from '~/persistence'
import { getDefaultInput } from '~/services/action'

const DEFAULT_PAYLOAD = ''
const DEFAULT_RESULT = ''
const DEFAULT_TITLE = 'New Tab'

export interface ActionTab {
  id: string
  title: string
  actionName: string | null
  payload: string
  result: string
  bookmark: boolean
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
    title: DEFAULT_TITLE,
    actionName: null,
    payload: DEFAULT_PAYLOAD,
    result: DEFAULT_RESULT,
    bookmark: false,
  }
}

function isTabInDefaultState(tab: ActionTab) {
  return (
    tab.title === DEFAULT_TITLE &&
    tab.actionName === null &&
    tab.payload === DEFAULT_PAYLOAD &&
    tab.result === DEFAULT_RESULT
  )
}

function tabsHaveSameAction(tabA: ActionTab, tabB: ActionTab) {
  return tabA.title === tabB.title && tabA.actionName === tabB.actionName
}

function tabsAreSame(tabA: ActionTab, tabB: ActionTab) {
  return tabsHaveSameAction(tabA, tabB) && tabA.payload === tabB.payload && tabA.result === tabB.result
}

// Checks if tab is within last hour
function isTabRecent(tab: ActionTabHistoric) {
  const secondsAgo = (Date.now() - tab.timestamp) / 1000

  return secondsAgo <= 3600
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
    } else {
      state.tabs = [getActionTab()]
    }
  },
  createActionsTab(state: ActionsState) {
    const newTab = getActionTab()
    state.tabs.push(newTab)
    state.activeTabId = newTab.id
  },
  selectAction(state: ActionsState, name: string) {
    const activeTab = getActiveTabFromState(state)
    activeTab.title = name || DEFAULT_TITLE
    activeTab.actionName = name || null
    if (!name) {
      activeTab.payload = ''
    } else if (!activeTab.payload) {
      activeTab.payload = getDefaultInput(name)
    }
  },
  setActionPayload(state: ActionsState, payload: string) {
    const activeTab = getActiveTabFromState(state)
    activeTab.payload = payload
  },
  setActionResult(state: ActionsState, { tabId, result }) {
    const relevantTab = state.tabs.find(item => item.id === tabId)
    if (relevantTab) {
      relevantTab.result = typeof result === 'string' ? result : JSON.stringify(result, null, 2)
    }
  },
  saveActiveAction(state: ActionsState, bookmark = true) {
    const activeTab = getActiveTabFromState(state)
    const historicTab: ActionTabHistoric = {
      ...activeTab,
      id: getRandomString(),
      bookmark,
      timestamp: Date.now(),
    }

    // Only replace recent tabs that have same action/title
    const reversedHistory = state.history.slice()
    reversedHistory.reverse()
    // ^ Reversing because we store recent most at the bottom

    const recentDuplicateTab = reversedHistory.find(
      item => !item.bookmark && tabsHaveSameAction(item, historicTab) && isTabRecent(item),
    )
    if (recentDuplicateTab) {
      state.history = state.history.filter(item => item.id !== recentDuplicateTab.id)
    }

    state.history.push(historicTab)
    setHistoricTabs(state.history)
  },
  restoreHistoricTab(state: ActionsState, historicTab: ActionTabHistoric) {
    const siblingTab = state.tabs.find(item => tabsAreSame(item, historicTab))
    if (siblingTab) {
      // Activate tab with same state and return
      state.activeTabId = siblingTab.id
      return
    }

    let tabToUse = state.tabs.find(item => isTabInDefaultState(item))
    if (!tabToUse) {
      tabToUse = getActionTab()
      state.tabs.push(tabToUse)
    }

    tabToUse.title = historicTab.title
    tabToUse.actionName = historicTab.actionName
    tabToUse.payload = historicTab.payload
    tabToUse.result = historicTab.result

    state.activeTabId = tabToUse.id
  },
  setHistoricTabs(state: ActionsState, historicTabs: ActionTabHistoric[]) {
    state.history = historicTabs
  },
  destroyHistoricTab(state: ActionsState, tabId: string) {
    state.history = state.history.filter(item => item.id !== tabId)
    setHistoricTabs(state.history)
  },
  toggleHistoricTabBookmark(state: ActionsState, tabId: string) {
    state.history = state.history.map(item => ({
      ...item,
      bookmark: item.id === tabId ? !item.bookmark : item.bookmark,
    }))
    setHistoricTabs(state.history)
  },
  clearHistoricTabs(state: ActionsState) {
    state.history = []
    setHistoricTabs(state.history)
  },
}

const actions = {
  executeActiveAction(context) {
    const activeTab = getActiveTabFromState(context.state)
    const { actionName } = activeTab

    if (!actionName) {
      // No action selected, ignore.
      return
    }

    let parsed
    try {
      parsed = JSON.parse(activeTab.payload)
    } catch (_) {
      /* No Op */
    }
    if (!parsed || typeof parsed !== 'object' || !actionName) {
      // Don't bother
      context.commit('setActionResult', {
        tabId: activeTab.id,
        result: {
          error: 'Payload must be a valid JSON object',
        },
      })
      return
    }
    executeAction({
      name: actionName,
      args: parsed,
    }).then(response => {
      let result = response
      if (result.status === 'ok') {
        // eslint-disable-next-line prefer-destructuring
        result = result.result
      } else if (result.status === 'error') {
        result = { error: result.error }
      }
      context.commit('setActionResult', {
        tabId: activeTab.id,
        result,
      })
      context.commit('saveActiveAction', false)
    })
  },
}

const getters = {
  getHistoricTabs(state: ActionsState): ActionTabHistoric[] {
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
