import { getSocket } from '../socket'
import type { RoomEventPayload } from '@/api/types/room.ts'

export type UserPayload = {
  uuid: string
  userName: string
  serverUuid: string
}

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


export const onRoomEvent = (handler: (event: RoomEventPayload) => void): (() => void) => {
  const socket = getSocket()
  socket.on('room', handler)
  return () => socket.off('room', handler)
}

export const onUserEvent = (handler: (payload: UserPayload) => void): (() => void) => {
  const socket = getSocket()
  socket.on('user', handler)
  return () => socket.off('user', handler)
}

