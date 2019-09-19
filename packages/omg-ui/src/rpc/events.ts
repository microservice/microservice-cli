import { Emitter } from 'event-kit'

import { ConfigSchema } from '~/types'

const emitter = new Emitter()

export function handleConfigUpdated(callback: (config: ConfigSchema) => void) {
  return emitter.on('config-updated', callback)
}

async function main() {
  const response = await fetch('/api/events')
  const reader = response.body.getReader()

  async function read() {
    const { done, value } = await reader.read()
    const contents = new TextDecoder('utf-8').decode(value)
    let parsed
    try {
      parsed = JSON.parse(contents)
    } catch (error) {
      /* No Op */
    }
    if (parsed) {
      emitter.emit(parsed.type, parsed.payload)
    }
    if (done) {
      setTimeout(() => {
        main().catch(console.error)
      }, 1000)
    } else {
      // Reset stack
      setTimeout(read, 100)
    }
  }

  read()
}

main().catch(console.error)
