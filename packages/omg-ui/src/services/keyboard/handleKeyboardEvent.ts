import store from '~/store'

export default function handleKeyboardEvent(event: KeyboardEvent) {
  const globalEvent = document.activeElement === document.body
  const holdingMeta = navigator.platform.startsWith('Mac') ? event.metaKey : event.ctrlKey

  if (globalEvent && event.key === 'h') {
    store.commit('toggleShowHistory')
  } else if (globalEvent && event.key === 'Enter' && holdingMeta) {
    store.dispatch('executeActiveAction')
  }
}
