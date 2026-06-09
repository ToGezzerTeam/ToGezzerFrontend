import { io, type Socket } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_WS_URL

let socket: Socket | null = null

export const getSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: true,
      transports: ['websocket'],
      auth: {
        token: localStorage.getItem('auth_token'),
      },
    })
  }
  return socket
}

export const disconnectSocket = () => {
  socket?.disconnect()
  socket = null
}
