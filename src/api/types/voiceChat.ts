import { types as mediasoupTypes } from 'mediasoup-client'

export interface UserMediaState {
  socketId: string
  userId: string
  isMicMuted: boolean
  isSongMuted: boolean
}

export interface RoomUser extends UserMediaState {
  displayName?: string
  joinedAt?: Date
  audioLevel?: number
  isCurrentUser?: boolean
}

export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected'

export interface VoiceChatConfig {
  wsUrl?: string
  roomId?: string
  userId?: string
  autoConnect?: boolean
}

export interface JoinVoiceRoomPayload {
  roomId: string
  userId: string
}

export interface JoinedVoiceRoomPayload {
  success: boolean
  socketId: string
  existingUsers: RoomUser[]
  rtpCapabilities?: unknown
}

export interface UserLeftPayload {
  socketId: string
  userId: string
}

export interface UserMediaStateChangedPayload extends Partial<UserMediaState> {
  socketId: string
  userId: string
}

export interface ToggleMediaPayload {
  isMuted: boolean
}

export interface ErrorPayload {
  message: string
  code?: string
}

export type VoiceChatEventMap = {
  connected: void
  connecting: void
  disconnected: void
  joinedRoom: JoinedVoiceRoomPayload
  userJoined: RoomUser
  userLeft: UserLeftPayload
  userMediaStateChanged: UserMediaStateChangedPayload
  micToggled: ToggleMediaPayload
  songToggled: ToggleMediaPayload
  audioStarted: { stream: MediaStream }
  audioStopped: void
  error: ErrorPayload
}

export type VoiceChatEvent = keyof VoiceChatEventMap
export type EventListener<E extends VoiceChatEvent = VoiceChatEvent> = (
  data: VoiceChatEventMap[E],
) => void | Promise<void>

export interface VoiceChatState {
  isConnected: boolean
  isConnecting: boolean
  connectionStatus: ConnectionStatus
  currentRoomId: string | null
  currentUserId: string | null
  roomUsers: Map<string, RoomUser>
  userCount: number
  isMicMuted: boolean
  isSongMuted: boolean
  localStream: MediaStream | null
  error: string | null
}

export interface TransportParams {
  id: string
  iceParameters: unknown
  iceCandidates: unknown[]
  dtlsParameters: unknown
  sctpParameters?: unknown
}

export interface ProducerOptions {
  track: MediaStreamTrack
  encodings?: unknown[]
  codecOptions?: unknown
  appData?: Record<string, unknown>
}

export interface ConsumerOptions {
  producerId: string
  rtpCapabilities: unknown
  paused?: boolean
  appData?: Record<string, unknown>
}
export interface UseVoiceChatOptions {
  autoConnect?: boolean
  roomId?: string
  userId?: string
  displayName?: string
}

export interface VoiceChatProps {
  roomId: string
  userId: string
  displayName?: string
}

export interface ConsumeResponse {
  consumer: mediasoupTypes.ConsumerOptions
}

export interface ProducerPayload {
  socketId: string
  producerId: string
}
