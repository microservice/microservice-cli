import { ConfigSchema } from 'omg-validate'

export type RecordVal<T> = T extends Record<any, infer T> ? T : never

export interface CommandOptionsDefault {
  help?: boolean
  directory?: string
}

export interface CommandPayload<T extends CommandOptionsDefault> {
  options: T
  parameters: string[]
}

export { ConfigSchema }
