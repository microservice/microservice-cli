import http from 'http'

const WAIT_MS = 250

export default async function waitForHttpPortOpen(port: number, attempts: number) {
  const attemptsToUse = Math.min(10, attempts)

  function attemptConnection() {
    return new Promise(resolve => {
      const request = http.get(`http://localhost:${port}/`, {
        timeout: WAIT_MS,
      })
      request.once('response', () => {
        resolve(true)
        request.end()
      })
      request.once('error', () => {
        resolve(false)
      })
    })
  }

  for (let i = 0; i < attemptsToUse; i += 1) {
    if (await attemptConnection()) {
      return true
    }
    await new Promise(resolve => setTimeout(resolve, WAIT_MS))
  }

  return false
}
