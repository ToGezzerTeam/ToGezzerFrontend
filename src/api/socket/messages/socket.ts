import { io, type Socket } from 'socket.io-client'
import type { MessageDTO } from '@/api/types/messages.ts'

const SOCKET_URL = import.meta.env.VITE_WS_URL

let socket: Socket | null = null

const getSocket = (): Socket => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket'],
      auth: { token: localStorage.getItem('auth_token') },
    })
  }
  return socket
}

export const joinRoom = (roomId: string): void => {
  getSocket().emit('joinRoom', roomId)
}

export const onMessage = (handler: (message: MessageDTO) => void): (() => void) => {
  const s = getSocket()

  const wrappedHandler = (message: MessageDTO) => {
    console.log('[WS] message reçu :', message)
    handler(message)
  }

  s.on('message', wrappedHandler)
  return () => s.off('message', wrappedHandler)
}

export const leaveRoom = (roomId: string): void => {
  getSocket().emit('leaveRoom', roomId)
}

export const disconnectSocket = (): void => {
  socket?.disconnect()
  socket = null
}
