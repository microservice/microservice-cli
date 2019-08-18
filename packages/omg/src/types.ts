import { ConfigSchema } from 'omg-validate'

export interface ActionOptionsDefault {
  help?: boolean
  directory?: string
}

export interface ActionPayload<T extends ActionOptionsDefault> {
  options: T
  parameters: string[]
}

export { ConfigSchema }
