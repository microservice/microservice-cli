import { UIAppStatus } from '@microservices/cli/src/types'
import { ConfigSchema } from '@microservices/validate'
import { InputType, Argument } from '@microservices/validate/src/types'

export interface ConsoleLine {
  contents: string
  severity: 'info' | 'warn' | 'error'
}
export interface DockerLine {
  contents: string
  stream: 'stdout' | 'stderr'
}

export { ConfigSchema, InputType, Argument, UIAppStatus as AppStatus }
