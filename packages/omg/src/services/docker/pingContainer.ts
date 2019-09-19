import got from 'got'

import waitForHttpPortOpen from '~/helpers/waitForHttpPortOpen'
import { ConfigSchema } from '~/types'

import isContainerRunning from './isContainerRunning'

interface PingContainerOptions {
  container: string
  config: ConfigSchema
  portsMap: Map<number, number>
}

const MAX_ATTEMPTS = 10
const ATTEMPT_TIMEOUT = 1000 // 1s

export default async function pingContainer({ container, config, portsMap }: PingContainerOptions): Promise<boolean> {
  if (!(await isContainerRunning(container))) {
    return false
  }

  const { health } = config
  if (!health || !health.http) {
    const firstPort = Array.from(portsMap.values())[0]
    if (firstPort) {
      const status = await waitForHttpPortOpen(firstPort, 10)
      if (status) {
        // Port opened up
        return true
      }
    }

    // Assume it works I guess
    // Wait 2 seconds, just in case...
    await new Promise(resolve => setTimeout(resolve, 2000))
    return true
  }

  const healthCheckPort = portsMap.get(health.http.port)
  if (!healthCheckPort) {
    // Should never happen but just in case.
    throw new Error(`Mapped port for healthcheck port '${health.http.port}' not found`)
  }

  const uri = `http://localhost:${healthCheckPort}${health.http.path}`
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    try {
      // eslint-disable-next-line no-await-in-loop
      const response = await got(uri, {
        timeout: ATTEMPT_TIMEOUT,
      })
      if (response.statusCode >= 200 && response.statusCode < 400) {
        return true
      }
    } catch (_) {
      /* No Op */
    }
    // eslint-disable-next-line no-await-in-loop
    await new Promise(resolve => setTimeout(resolve, ATTEMPT_TIMEOUT))
  }

  return false
}
