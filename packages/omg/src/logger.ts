// NOTE: This logger is important because it knows when a spinner is running
// and logs accordingly.

export function info(...payload: any) {
  console.log(...payload)
}

export function warn(...payload: any) {
  console.warn(...payload)
}

export function error(...payload: any) {
  console.error(...payload)
}
