import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getVoiceChatService } from '@/api/socket/voiceChat/service.ts'
import type {
  RoomUser,
  UserMediaState,
  JoinedVoiceRoomPayload,
  UserLeftPayload,
  UserMediaStateChangedPayload,
  ErrorPayload,
} from '@/api/types/voiceChat.ts'


export const useVoiceChatStore = defineStore('voiceChat', () => {
  const voiceService = getVoiceChatService()


  const isConnected = ref(false)
  const isConnecting = ref(false)
  const currentRoomId = ref<string | null>(null)
  const currentUserId = ref<string | null>(null)
  const currentUsername = ref<string | null>(null)
  const roomUsers = ref<Map<string, RoomUser>>(new Map())
  const isMicMuted = ref(false)
  const isSongMuted = ref(false)
  const localStream = ref<MediaStream | null>(null)
  const error = ref<string | null>(null)

  const userCount = computed(() => roomUsers.value.size)

  const connectionStatus = computed(() => {
    if (isConnecting.value) return 'connecting'
    if (isConnected.value) return 'connected'
    return 'disconnected'
  })

  const addUser = (user: RoomUser) => {
    roomUsers.value.set(user.socketId, user)
  }

  const removeUser = (socketId: string) => {
    roomUsers.value.delete(socketId)
  }

  const updateUserMediaState = (socketId: string, state: Partial<UserMediaState>) => {
    const user = roomUsers.value.get(socketId)
    if (user) Object.assign(user, state)
  }

  const connect = async (roomId: string) => {
    try {
      isConnecting.value = true
      error.value = null

      setupListeners()

      const connected = await voiceService.connect(roomId)
      if (!connected) throw new Error('Failed to connect')

      currentRoomId.value = roomId
      isConnected.value = true


    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error'
      isConnected.value = false
    } finally {
      isConnecting.value = false
    }
  }

  const disconnect = async () => {
    try {
      await voiceService.disconnect()
      reset()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to disconnect'
    }
  }

  const startAudio = async () => {
    try {
      await voiceService.startAudio()
      localStream.value = voiceService.getLocalStream()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to start audio'
    }
  }

  const stopAudio = async () => {
    try {
      await voiceService.stopAudio()
      localStream.value = null
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to stop audio'
    }
  }

  const toggleMic = async () => {
    isMicMuted.value = !isMicMuted.value
    try {
      await voiceService.toggleMic(isMicMuted.value)
    } catch (err) {
      isMicMuted.value = !isMicMuted.value // rollback
      error.value = err instanceof Error ? err.message : 'Failed to toggle mic'
    }
  }

  const toggleSong = async () => {
    isSongMuted.value = !isSongMuted.value
    try {
      await voiceService.toggleSong(isSongMuted.value)
    } catch (err) {
      isSongMuted.value = !isSongMuted.value // rollback
      error.value = err instanceof Error ? err.message : 'Failed to toggle song'
    }
  }

  const clearError = () => {
    error.value = null
  }

  const reset = () => {
    isConnected.value = false
    isConnecting.value = false
    currentRoomId.value = null
    currentUserId.value = null
    currentUsername.value = null
    roomUsers.value.clear()
    isMicMuted.value = false
    isSongMuted.value = false
    localStream.value = null
  }

  const setupListeners = () => {
    voiceService.on('joinedRoom', (data: JoinedVoiceRoomPayload) => {
      if (data.currentUser) {
        currentUserId.value = data.currentUser.userId
        currentUsername.value = data.currentUser.username
        addUser({
          socketId: voiceService.getSocketId() ?? '',
          userId: currentUserId.value,
          username: currentUsername.value,
          isMicMuted: false,
          isSongMuted: false,
          isCurrentUser: true,
        })
      }

      data.existingUsers?.forEach((user) =>
        addUser({
          ...user,
          isCurrentUser: false,
        }),
      )
    })

    voiceService.on('userJoined', (user: RoomUser) => addUser(user))

    voiceService.on('userLeft', (data: UserLeftPayload) => removeUser(data.socketId))

    voiceService.on('userMediaStateChanged', (state: UserMediaStateChangedPayload) =>
      updateUserMediaState(state.socketId, state),
    )

    voiceService.on('disconnected', reset)

    voiceService.on('error', (data: ErrorPayload) => {
      error.value = data.message ?? 'An error occurred'
    })
  }

  return {
    isConnected,
    isConnecting,
    currentRoomId,
    currentUserId,
    currentUsername,
    roomUsers,
    isMicMuted,
    isSongMuted,
    localStream,
    error,

    userCount,
    connectionStatus,

    connect,
    disconnect,
    startAudio,
    stopAudio,
    toggleMic,
    toggleSong,
    addUser,
    removeUser,
    updateUserMediaState,
    clearError,
  }
})
