import { ConfigSchema } from 'oms-validate'
import { UIAppStatus } from 'oms/src/types'
import { InputType, Argument } from 'oms-validate/src/types'

export interface ConsoleLine {
  contents: string
  severity: 'info' | 'warn' | 'error'
}
export interface DockerLine {
  contents: string
  stream: 'stdout' | 'stderr'
}

export { ConfigSchema, InputType, Argument, UIAppStatus as AppStatus }
