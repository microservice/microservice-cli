import { Action, ConfigSchema } from 'oms-validate'

export type Args = [string, string][]
export type ArgsTransformed = [string, any][]
// ^ These args are pre-transformed, they come from the UI probably
// They do not need to be parsed as strings and unraveled
export type RecordVal<T> = T extends Record<any, infer T> ? T : never

export interface CommandOptionsDefault {
  help?: boolean
  directory?: string
}

export interface CommandPayload<T extends CommandOptionsDefault> {
  options: T
  parameters: string[]
}

export enum UIAppStatus {
  stopped = 'stopped',
  starting = 'starting',
  started = 'started',
}

export { ConfigSchema, Action as ConfigSchemaAction }
