import { Microservice } from '@microservices/validate'

/**
 * Get's the ports that need to be open defined by the given {@link Microservice}.
 *
 * @param {Microservice} microservice The given {@link Microservice}
 * @return {Array<Integer>} The ports that need to be opened for the given {@link Microservice}
 */
export default function getNeededPorts(microservice: Microservice): number[] {
  const ports = []
  for (let i = 0; i < microservice.actions.length; i += 1) {
    const action = microservice.actions[i]
    if (action.http !== null) {
      if (!ports.includes(action.http.port)) {
        ports.push(action.http.port)
      }
    }
    if (action.events !== null) {
      for (let j = 0; j < action.events.length; j += 1) {
        if (!ports.includes(action.events[j].subscribe.port)) {
          ports.push(action.events[j].subscribe.port)
        }
        if (action.events[j].unsubscribe && !ports.includes(action.events[j].unsubscribe.port)) {
          ports.push(action.events[j].unsubscribe.port)
        }
      }
    }
  }
  for (let i = 0; i < microservice.forwards.length; i += 1) {
    const forward = microservice.forwards[i]
    if (forward.http !== null) {
      ports.push(forward.http.port)
    }
  }
  if (microservice.health && microservice.health.port !== null && !ports.includes(microservice.health.port)) {
    ports.push(microservice.health.port)
  }
  return ports
}
