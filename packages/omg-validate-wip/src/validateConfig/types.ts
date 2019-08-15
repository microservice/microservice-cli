export type ErrorCallback = (message: string) => void

export interface State {
  path: string[]
  value: Record<string, any>
}

export interface Validator {
  message: string
  validate(value: any): boolean
}
