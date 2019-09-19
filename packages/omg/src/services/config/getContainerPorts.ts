import { ConfigSchema } from '~/types'

export default function getContainerPorts(config: ConfigSchema): number[] {
  const ports: Set<number> = new Set()

  // Collect from
  // - Actions
  // - Forwards
  // - Health checks

  if (config.actions) {
    Object.values(config.actions).forEach(action => {
      if (action.http && action.http.port) {
        ports.add(action.http.port)
      }
      if (action.events) {
        Object.values(action.events).forEach(actionEvent => {
          if (actionEvent.http) {
            ports.add(actionEvent.http.port)
          }
        })
      }
    })
  }
  if (config.forward) {
    Object.values(config.forward).forEach(forward => {
      if (forward.http) {
        ports.add(forward.http.port)
      }
    })
  }
  if (config.health) {
    ports.add(config.health.http.port)
  }

  return Array.from(ports)
}
