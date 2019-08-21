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
  'any',
]
export type OutputType = InputType | 'null'
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
  'null',
]

export type ContentType = 'application/json' | 'application/x-www-form-urlencoded' | 'multipart/form-data'
export const CONTENT_TYPES: ContentType[] = ['application/json', 'application/x-www-form-urlencoded', 'multipart/form-data']

export type HttpMethod = 'get' | 'post' | 'put' | 'delete' | 'patch'
export const HTTP_METHODS: HttpMethod[] = ['get', 'post', 'put', 'delete', 'patch']

export interface Action {
  help?: string
  format?: Record<
    string,
    {
      command: string | string[]
    }
  >
  events?: Record<
    string,
    {
      help?: string
      http: {
        port: number
        subscribe: Record<string, any> // TODO: Type this properly
        unsubscribe?: Record<string, any> // TODO: Type this properly
      }
      output?: {
        actions?: Record<string, any> // TODO: Type this properly
        type?: OutputType
        contentType?: ContentType
        properties?: Record<
          string,
          {
            type: OutputType
            help?: string
          }
        >
      }
      arguments?: Record<string, any> // TODO: Type this properly
    }
  >
  rpc?: Record<string, any> // TODO: Type this properly
  http?: {
    path: string
    method: HttpMethod
    port: number
    contentType?: ContentType
  }
  arguments?: Record<
    string,
    {
      type: InputType | InputType[]
      help?: string
      in: 'query' | 'path' | 'requestBody'
      pattern?: string
      enum?: string[]
      range?: {
        min?: number
        max?: number
      }
      required?: boolean
      default: any // <== default value for the argument
    }
  >
  output?: {
    type?: OutputType
    contentType?: ContentType
    properties?: Record<
      string,
      {
        type: OutputType
        help?: string
      }
    >
  }
}

export interface ConfigSchema {
  omg: 1
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
      type: InputType | InputType[]
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
