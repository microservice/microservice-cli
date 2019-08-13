export interface ActionOptionsDefault {
  help?: boolean
  directory?: string
}

export interface ActionPayload<T extends ActionOptionsDefault> {
  options: T
  parameters: string[]
}
