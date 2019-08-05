import { Microservice } from 'omg-validate'

/**
 * Gets the ports that need to be open defined by the given {@link Microservice}.
 *
 * @param  {Microservice} microservice
 * @return {number[]} ports Bond ports
 */
export default function getForwardPorts(microservice: Microservice): number[] {
  const ports = []
  for (let i = 0; i < microservice.forwards.length; i += 1) {
    const forward = microservice.forwards[i]
    if (forward.http !== null) {
      ports.push(forward.http.port)
    }
  }
  return ports
}
