import { Emitter } from 'event-kit'

import { ConfigSchema, ConsoleLine, DockerLine, AppStatus } from '~/types'

const emitter = new Emitter()

export function handleConfigUpdated(callback: (payload: { config: ConfigSchema; validationErrors: string[] }) => void) {
  return emitter.on('config-updated', callback)
}
export function handleConsoleLog(callback: (logLine: ConsoleLine) => void) {
  return emitter.on('console-log', callback)
}
export function handleDockerLog(callback: (logLine: DockerLine) => void) {
  return emitter.on('docker-log', callback)
}
export function handleAppStatusUpdated(callback: (payload: { status: AppStatus }) => void) {
  return emitter.on('app-status-updated', callback)
}

async function main() {
  const response = await fetch('/api/events')
  // @ts-ignore
  const reader = response.body.getReader()

  function retry() {
    setTimeout(() => {
      main().catch(console.error)
    }, 5000)
  }

  async function read() {
    let result

    try {
      result = await reader.read()
    } catch (error) {
      console.error('Error reading from event stream', error)
      retry()
      return
    }

    const { done, value } = result
    const contents = new TextDecoder('utf-8')
      .decode(value)
      .split('\n')
      .filter(Boolean)

    contents.forEach(item => {
      let parsed
      try {
        parsed = JSON.parse(item)
      } catch (error) {
        /* No Op */
      }
      if (parsed) {
        if (localStorage.getItem('__OMS_DEBUG')) {
          console.log(`${parsed.type}:`, parsed.payload)
        }
        emitter.emit(parsed.type, parsed.payload)
      }
    })
    if (done) {
      retry()
    } else {
      // Reset stack
      setTimeout(read, 100)
    }
  }

  read()
}

main().catch(console.error)
