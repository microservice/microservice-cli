import got from 'got'
import FormData from 'form-data'
import querystring from 'querystring'

import * as logger from '~/logger'
import { Daemon } from '~/services/daemon'
import { argsToMap } from '~/common'
import { Args, ConfigSchema, ConfigSchemaAction } from '~/types'

interface ExecuteHttpActionOptions {
  daemon: Daemon
  config: ConfigSchema
  action: ConfigSchemaAction
  actionName: string
  args: Args
}

export default async function executeHttpAction({
  daemon,
  config,
  action,
  actionName,
  args,
}: ExecuteHttpActionOptions): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const { path, method, port, contentType } = action.http!
  const containerPort = daemon.getContainerPort(port)

  let hasQueryArgs = false
  const bodyArgs: Record<string, any> = {}
  const queryArgs: Record<string, any> = {}
  const argsMap = argsToMap(args)

  let uri = `http://localhost:${containerPort}${path}`

  Object.entries(action.arguments || {}).forEach(([argName, arg]) => {
    const argValue = argsMap[argName] || arg.default
    if (arg.in === 'query' && argValue) {
      hasQueryArgs = true
      queryArgs[argName] = argValue
    }
    if (arg.in === 'requestBody' && argValue) {
      bodyArgs[argName] = argValue
    }
    if (arg.in === 'path') {
      // Replace arg with empty value if non-existent
      uri.replace(`{${argName}}`, argValue || '')
    }
  })

  if (hasQueryArgs) {
    uri += uri.includes('?') ? '&' : '?'
    uri += querystring.stringify(queryArgs)
  }

  let payload: any
  const headers: Record<string, string> = {}
  if (contentType === 'application/x-www-form-urlencoded') {
    payload = querystring.stringify(bodyArgs)
    headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8'
  } else if (contentType === 'multipart/form-data') {
    payload = new FormData()
    Object.entries(bodyArgs).forEach(([k, v]) => {
      payload.append(k, v)
    })
  } else {
    // JSON is the "default"
    payload = JSON.stringify(bodyArgs)
    headers['Content-Type'] = 'application/json'
  }

  let response: got.Response<string>
  try {
    response = await got(uri, {
      method,
      headers,
      body: payload,
      retry: 0,
      // ^ Disable retry
      followRedirect: false,
      throwHttpErrors: false,
    })
  } catch (error) {
    if (error && typeof error === 'object') {
      // Strip any sensitive info from error message
      error.gotOptions = undefined
    }
    throw error
  }

  logger.info('hi ' + response.body)
}
