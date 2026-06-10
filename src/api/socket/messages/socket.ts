import type { MessageDTO } from '@/api/types/messages.ts'
import { getSocket } from '../socket'

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

export const startTyping = (roomId: string): void => {
  getSocket().emit('startTyping', roomId)
}

export const stopTyping = (roomId: string): void => {
  getSocket().emit('stopTyping', roomId)
}

export const onUserTyping = (
  handler: (payload: { userId: string; userName: string; isTyping: boolean }) => void,
): (() => void) => {
  const s = getSocket()
  s.on('userTyping', handler)
  return () => s.off('userTyping', handler)
}
