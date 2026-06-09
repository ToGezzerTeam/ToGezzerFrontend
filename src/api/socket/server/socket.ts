import { getSocket } from '../socket'
import type { RoomEventPayload } from '@/api/types/room.ts'

export interface VoiceUserInfo {
  userId: string
  username: string
  isMicMuted?: boolean
  isSongMuted?: boolean
}

export interface VocalsUsersUpdatePayload {
  roomId: string
  users: VoiceUserInfo[]
}

export interface UserMediaStatePayload {
  roomId: string
  userId: string
  isMicMuted: boolean
  isSongMuted: boolean
}

export const joinServerRoom = (
  serverUuid: string,
  handler: (payload: VocalsUsersUpdatePayload) => void,
): (() => void) => {
  const socket = getSocket()
  socket.emit('connectServer', serverUuid)

  const wrappedHandler = (payload: VocalsUsersUpdatePayload) => {
    console.log('[WS] vocalsUsersUpdate:', payload)
    handler(payload)
  }

  socket.on('vocalsSnapshot', wrappedHandler)
  socket.on('vocalsUsersUpdate', wrappedHandler)
  return () => {
    socket.off('vocalsUsersUpdate', wrappedHandler)
    socket.off('vocalsSnapshot', wrappedHandler)
  }
}

export const leaveServerRoom = (serverUuid: string): void => {
  const socket = getSocket()
  socket.emit('disconnectServer', serverUuid)
}

export const onUserMediaStateChanged = (
  handler: (payload: UserMediaStatePayload) => void,
): (() => void) => {
  const socket = getSocket()

  const wrappedHandler = (payload: UserMediaStatePayload) => {
    console.log('[WS] userMediaStateChanged:', payload)
    handler(payload)
  }

  socket.on('userMediaStateChanged', wrappedHandler)
  return () => {
    console.log('Stop listening to userMediaStateChanged')
    socket.off('userMediaStateChanged', wrappedHandler)
  }
}

export const onRoomEvent = (handler: (event: RoomEventPayload) => void): (() => void) => {
  const socket = getSocket()
  socket.on('room', handler)
  return () => socket.off('room', handler)
}

