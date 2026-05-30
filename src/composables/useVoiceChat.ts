import { ref, onUnmounted } from 'vue'
import { useVoiceChatStore } from '@/api/voiceChat/store.ts'

export interface UseVoiceChatOptions {
  autoConnect?: boolean
  roomId?: string
  userId?: string
}

/**
 * Composable for using voice chat in Vue components
 *
 * @example
 * ```typescript
 * const {
 *   connect,
 *   disconnect,
 *   toggleMic,
 *   toggleSong,
 *   isConnected,
 *   isMicMuted,
 *   roomUsers,
 * } = useVoiceChat({
 *   autoConnect: false,
 *   roomId: 'my-room',
 *   userId: 'user-123',
 * })
 *
 * // Manual connection
 * await connect('room-id', 'user-id')
 *
 * // Or auto-connect
 * useVoiceChat({ autoConnect: true, roomId: 'room-id', userId: 'user-id' })
 * ```
 */
export function useVoiceChat(options: UseVoiceChatOptions = {}) {
  const voiceChatStore = useVoiceChatStore()
  const isInitializing = ref(false)

  // Connect to voice chat
  const connect = async (roomId?: string, userId?: string) => {
    try {
      isInitializing.value = true
      const actualRoomId = roomId || options.roomId
      const actualUserId = userId || options.userId

      if (!actualRoomId || !actualUserId) {
        throw new Error('Room ID and User ID are required')
      }

      await voiceChatStore.connect(actualRoomId, actualUserId)
      await voiceChatStore.startAudio()
    } catch (error) {
      console.error('Failed to connect:', error)
      throw error
    } finally {
      isInitializing.value = false
    }
  }

  // Disconnect from voice chat
  const disconnect = async () => {
    try {
      await voiceChatStore.disconnect()
    } catch (error) {
      console.error('Failed to disconnect:', error)
      throw error
    }
  }

  // Toggle microphone
  const toggleMic = async () => {
    try {
      await voiceChatStore.toggleMic()
    } catch (error) {
      console.error('Failed to toggle mic:', error)
      throw error
    }
  }

  // Toggle song
  const toggleSong = async () => {
    try {
      await voiceChatStore.toggleSong()
    } catch (error) {
      console.error('Failed to toggle song:', error)
      throw error
    }
  }

  // Mute microphone
  const muteMic = async () => {
    if (!voiceChatStore.isMicMuted) {
      await toggleMic()
    }
  }

  // Unmute microphone
  const unmuteMic = async () => {
    if (voiceChatStore.isMicMuted) {
      await toggleMic()
    }
  }

  // Disable song
  const disableSong = async () => {
    if (!voiceChatStore.isSongMuted) {
      await toggleSong()
    }
  }

  // Enable song
  const enableSong = async () => {
    if (voiceChatStore.isSongMuted) {
      await toggleSong()
    }
  }

  // Auto-connect if requested
  if (options.autoConnect && options.roomId && options.userId) {
    connect(options.roomId, options.userId).catch((error) => {
      console.error('Auto-connect failed:', error)
    })
  }

  // Cleanup on unmount
  onUnmounted(() => {
    if (voiceChatStore.isConnected) {
      disconnect().catch((error) => {
        console.error('Cleanup disconnect failed:', error)
      })
    }
  })

  return {
    // Methods
    connect,
    disconnect,
    toggleMic,
    toggleSong,
    muteMic,
    unmuteMic,
    disableSong,
    enableSong,

    // State (reactive)
    isInitializing,
    isConnected: () => voiceChatStore.isConnected,
    isConnecting: () => voiceChatStore.isConnecting,
    connectionStatus: () => voiceChatStore.connectionStatus,
    isMicMuted: () => voiceChatStore.isMicMuted,
    isSongMuted: () => voiceChatStore.isSongMuted,
    roomUsers: () => voiceChatStore.roomUsers,
    userCount: () => voiceChatStore.userCount,
    error: () => voiceChatStore.error,
    localStream: () => voiceChatStore.localStream,

    // Store reference
    store: voiceChatStore,
  }
}

/**
 * Get user's media state
 */
export function getUserMediaState(userId: string) {
  const voiceChatStore = useVoiceChatStore()

  return Array.from(voiceChatStore.roomUsers.values()).find(
    (user) => user.userId === userId,
  )
}

/**
 * Get user by socket ID
 */
export function getUserBySocketId(socketId: string) {
  const voiceChatStore = useVoiceChatStore()
  return voiceChatStore.roomUsers.get(socketId)
}

