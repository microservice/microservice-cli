import got from 'got'
import express from 'express'
import bodyParser from 'body-parser'
import getPort from 'get-port'
import generateUUID from 'uuid/v4'
import { Disposable } from 'event-kit'

import * as logger from '~/logger'
import argsToMap from '~/helpers/argsToMap'
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

  const httpServer = express()
  httpServer.use(bodyParser.json())
  httpServer.use(bodyParser.text())
  httpServer.use(
    bodyParser.urlencoded({
      extended: false,
    }),
  )
  httpServer.post('/', (req, res) => {
    try {
      const retval = callback(req.body)
      if (retval && typeof retval.then === 'function') {
        retval.catch(logger.error)
      }
    } catch (error) {
      logger.error(error)
    }
    res.end('Done')
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

  const argsMap = argsToMap(args)
  const subscribePath = event.http.subscribe.path

  // Subscribe to events
  await got(`http://localhost:${containerEventPort}${subscribePath}`, {
    method: event.http.subscribe.method,
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      id,
      endpoint: `http://host.docker.internal:${httpServerPort}`,
      event: eventName,
      data: argsMap,
    }),
  })

  // Remove from lifecycle disposables now that we're about to
  // return the disposable to caller function
  lifecycleDisposables.remove(disposable)

  return { disposable }
}
