import { ConfigSchema } from 'omg-validate'
import { UIAppStatus } from 'omg/src/types'
import { InputType, Argument } from 'omg-validate/src/types'

export interface ConsoleLine {
  contents: string
  severity: 'info' | 'warn' | 'error'
}
export interface DockerLine {
  contents: string
  stream: 'stdout' | 'stderr'
}

export { ConfigSchema, InputType, Argument, UIAppStatus as AppStatus }
