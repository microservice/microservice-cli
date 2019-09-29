import got from 'got'
import pick from 'lodash/pick'
import FormData from 'form-data'
import querystring from 'querystring'
import { OutputType } from 'omg-validate/src/types'

import { CLIError } from '~/errors'
import { Daemon } from '~/services/daemon'
import { ConfigSchemaAction } from '~/types'

import validateActionOutput from './validateActionOutput'

const OUTPUT_TYPES_TO_PARSE: OutputType[] = ['map', 'object']
const OUTPUT_TYPE_TO_IGNORE: OutputType = 'none'

interface ExecuteHttpActionOptions {
  daemon: Daemon
  action: ConfigSchemaAction
  actionName: string
  argsMap: Record<string, any>
}

export default async function executeHttpAction({
  daemon,
  action,
  actionName,
  argsMap,
}: ExecuteHttpActionOptions): Promise<{ response: any; disposable: null }> {
  const { path, method, port, url, contentType } = action.http!

  let uri: string

  if (port) {
    const containerPort = daemon.getContainerPort(port)

    uri = `http://localhost:${containerPort}${path}`
  } else if (url) {
    uri = url
  } else {
    throw new CLIError(`Action#${actionName} has neither port+path nor url specified in config`)
  }

  let hasQueryArgs = false
  const bodyArgs: Record<string, any> = {}
  const queryArgs: Record<string, any> = {}
  const headers: Record<string, string> = {
    Accept: 'application/json,text/plain,*/*',
  }

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
    if (arg.in === 'header') {
      headers[argName] = String(argValue)
    }
  })

  if (hasQueryArgs) {
    uri += uri.includes('?') ? '&' : '?'
    uri += querystring.stringify(queryArgs)
  }

  let payload: any
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
    // Got HTTP Error
    if (error && error.gotOptions) {
      const err = new CLIError(`Net Error ${error.code} on ${error.url}`)
      throw err
    }
    throw error
  }

  // Non 2XX Response
  if (response.statusCode < 200 || response.statusCode > 299) {
    const err = new CLIError(`Action#${actionName} returned non-OK Http Status ${response.statusCode}`)
    let { body } = response
    try {
      body = JSON.parse(body)
    } catch (_) {
      /* No op */
    }
    // @ts-ignore
    err.response = body
    throw err
  }

  const outputType: any = action.output.type

  let parsed: any = response.body
  if (OUTPUT_TYPES_TO_PARSE.includes(outputType)) {
    try {
      parsed = JSON.parse(parsed)
    } catch (_) {
      throw new CLIError(`Action#${actionName} returned non-JSON output`)
    }
  } else if (outputType === OUTPUT_TYPE_TO_IGNORE) {
    parsed = null
  }

  validateActionOutput({
    action,
    actionName,
    output: parsed,
  })

  return {
    response: parsed,
    disposable: null,
  }
}
