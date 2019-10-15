import getPort from 'get-port'

/**
 * Get's an open port.
 *
 * @return {Promise<Number>} The open port
 */
export default function getOpenPort(increment: number = 0): Promise<number> {
  return getPort({ port: getPort.makeRange(8000 + increment, 9000) })
}
