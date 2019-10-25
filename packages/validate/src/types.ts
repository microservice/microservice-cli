export type InputType =
  | 'int'
  | 'number'
  | 'float'
  | 'string'
  | 'uuid'
  | 'list'
  | 'map'
  | 'object'
  | 'boolean'
  | 'path'
  | 'enum'
  | 'any'
export const INPUT_TYPES: InputType[] = [
  'int',
  'number',
  'float',
  'string',
  'uuid',
  'list',
  'map',
  'object',
  'boolean',
  'path',
  'enum',
  'any',
]
export type OutputType = InputType | 'none'
export const OUTPUT_TYPES: OutputType[] = [
  'int',
  'number',
  'float',
  'string',
  'uuid',
  'list',
  'map',
  'object',
  'boolean',
  'path',
  'any',
  'none',
]
export type EnvType = 'int' | 'float' | 'string' | 'boolean'
export const ENV_TYPES: EnvType[] = ['int', 'float', 'string', 'boolean']

export type ContentType =
  | 'application/json'
  | 'application/x-www-form-urlencoded'
  | 'multipart/form-data'
  | 'application/octet-stream'
export const CONTENT_TYPES: ContentType[] = [
  'application/json',
  'application/x-www-form-urlencoded',
  'multipart/form-data',
  'application/octet-stream',
]

export type HttpMethod = 'get' | 'post' | 'put' | 'delete' | 'patch'
export const HTTP_METHODS: HttpMethod[] = ['get', 'post', 'put', 'delete', 'patch']

export interface ArgOut<Type> {
  help?: string
  type: Type
  required?: boolean
  pattern?: string
  enum?: string[]
  list?: {
    elements?: ArgOut<Type>[]
  }
  map?: {
    keys: ArgOut<Type>
    values: ArgOut<Type>
  }
  range?: {
    min?: number
    max?: number
  }
  properties: Record<string, ArgOut<Type>>
}

export type Argument = ArgOut<InputType> & {
  in: 'query' | 'path' | 'requestBody' | 'header'
  default: any // <== default value for the argument
}

export interface ActionHttp {
  help?: string
  rpc?: undefined
  events?: undefined
  http: {
    contentType?: ContentType
    method: HttpMethod
  } & (
    | {
        path: string
        port: number
        url?: undefined
      }
    | {
        path?: undefined
        port?: undefined
        url: string
      })
  arguments?: Record<string, Argument>
  output: ArgOut<OutputType> & {
    contentType?: ContentType
  }
}

export interface ActionEvents {
  help?: string
  http?: undefined
  rpc?: undefined
  events: Record<
    string,
    {
      help?: string
      http: {
        port: number
        subscribe: {
          path: string
          method: HttpMethod
          contentType?: ContentType
        }
        unsubscribe?: {
          path: string
          method: HttpMethod
          contentType?: ContentType
        }
      }
      output: ArgOut<OutputType> & {
        actions?: Record<string, any> // TODO: Type this properly
      }
      arguments?: Record<string, Argument> // TODO: Type this properly
    }
  >
}

export interface ActionRpc {
  help?: string
  http?: undefined
  events?: undefined
  rpc: {
    port: number
    framework: {
      grpc: {
        version: number
        proto: {
          path: string
        }
      }
    }
    client: {
      endpoint: string
      port: number
      tls: boolean
    }
  }
}

export type Action = ActionHttp | ActionEvents | ActionRpc

export interface ConfigSchema {
  oms?: 1
  omg?: 1
  info: {
    title: string
    version: string
    description: string
    contact?: {
      name?: string
      url?: string
      email?: string
    }
    license?: {
      name: string
      url: string
    }
  }
  lifecycle?: {
    startup?: {
      command: string | string[]
    }
    shutdown?: {
      command: string | string[]
    }
  }
  actions?: Record<string, Action>
  environment?: Record<
    string,
    {
      type: EnvType
      pattern?: string
      required?: boolean
      default?: any // <== default value for env var
      help?: string
    }
  >
  volumes?: Record<
    string,
    {
      target: string
      persist?: boolean
    }
  >
  metrics?: {
    ssl?: boolean
    port: number
    uri: string
  }
  scale?: {
    metric_type?: 'cpu' | 'mem'
    metric_agg?: 'avg' | 'min' | 'max' | 'mean' | 'mode'
    metric_interval?: number
    metric_target?: number
    min?: number
    max?: number
    desired?: number
    cooldown?: number
  }
  forward?: Record<
    string,
    {
      http: {
        path: string
        port: number
        method: HttpMethod
      }
    }
  >
  health?: {
    http: {
      path: string
      port: number
    }
  }
}

// Generic validation types
export type ErrorCallback = (message: string) => void

export interface State {
  path: string[]
  value: Record<string, any>
  visited: string[]
  onError: ErrorCallback
}

export type Validator =
  | ({
      message: string
      validate(value: any): boolean
    })
  | ({
      validate?: undefined
      validateForMessage(value: any): string | null
    })
