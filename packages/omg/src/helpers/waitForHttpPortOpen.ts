import http from 'http'

const WAIT_MS = 250

export default async function waitForHttpPortOpen(port: number, attempts: number) {
  const attemptsToUse = Math.min(10, attempts)

  function attemptConnection() {
    return new Promise((resolve, reject) => {
      const request = http.get(`http://localhost:${port}/`, {
        timeout: WAIT_MS,
      })
      request.once('response', () => {
        resolve()
        request.end()
      })
      request.once('error', reject)
    })
  }

  for (let i = 0; i < attemptsToUse; i += 1) {
    try {
      await attemptConnection()
      return true
    } catch (_) {
      /* No Op */
    }
    await new Promise(resolve => setTimeout(resolve, WAIT_MS))
  }

  return false
}
