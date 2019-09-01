import got from 'got'
import getPort from 'get-port'
import generateUUID from 'uuid/v4'
import { createServer } from 'http'
import { Disposable } from 'event-kit'

import * as logger from '~/logger'
import { Daemon } from '~/services/daemon'
import { lifecycleDisposables } from '~/common'
import { Args, ConfigSchemaAction } from '~/types'

interface ExecuteEventsActionOptions {
  daemon: Daemon
  args: Args
  action: ConfigSchemaAction
  actionName: string
  eventName: string
  callback: (payload: any) => void | Promise<void>
}

export default async function executeEventsAction({
  daemon,
  args,
  action,
  actionName,
  eventName,
  callback,
}: ExecuteEventsActionOptions): Promise<{ disposable: Disposable }> {
  const event = action.events![eventName]
  if (!event) {
    throw new Error(`Action '${actionName}' has no event named '${eventName}'`)
  }

  const httpServer = createServer((req, res) => {
    let data: Buffer[] | null = []

    req.on('error', () => {
      data = null
    })
    req.on('data', chunk => {
      if (data) {
        data.push(chunk)
      }
    })

    req.on('end', () => {
      if (Array.isArray(data)) {
        // TODO: Validate
        try {
          const parsed = JSON.parse(data.join(''))
          const retval = callback(parsed)
          if (retval && typeof retval.then === 'function') {
            retval.catch(logger.error)
          }
        } catch (error) {
          logger.error(error)
        }
      }
    })
  })

  const httpServerPort = await getPort()
  const httpServerSocket = httpServer.listen({
    port: httpServerPort,
    hostname: '127.0.0.1',
  })
  const disposable = new Disposable(() => {
    httpServerSocket.close()
  })
  // Add to lifecycle disposables until the end of function
  // So if something happens during execution, the process
  // can end gracefully.
  lifecycleDisposables.add(disposable)

  const id = generateUUID()
  const containerEventPort = daemon.getContainerPort(event.http.port)

  // Subscribe to events
  await got(`http://localhost:${containerEventPort}`, {
    json: true,
    method: event.http.subscribe.method,
    body: {
      id,
      endpoint: `http://host.docker.internal:${httpServerPort}`,
      event: eventName,
      data: args,
    },
  })

  // Remove from lifecycle disposables now that we're about to
  // return the disposable to caller function
  lifecycleDisposables.remove(disposable)

  return { disposable }
}
