import io from 'socket.io-client'

let socket = null

export function connect() {
  if (socket == null) {
    socket = io()
  }
  return socket
}

export function getSocket() {
  return socket
}
