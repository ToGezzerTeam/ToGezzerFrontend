<script setup lang="ts">
import { ref, computed } from 'vue'
import { useVoiceChat } from '@/composables/useVoiceChat'
import VoiceChat from '@/components/VoiceChat.vue'
import VolumeMeter from '@/components/VolumeMeter.vue'

const roomId = ref<string>('')
const userId = ref<string>('')
const displayName = ref<string>('')
const isInVoiceChat = ref(false)

const {
  connect,
  disconnect,
  toggleMic,
  toggleSong,
  muteMic,
  unmuteMic,
  disableSong,
  enableSong,
  store: voiceChatStore,
} = useVoiceChat()

const canJoin = computed(() => {
  return roomId.value.trim() !== '' && userId.value.trim() !== ''
})

const startVoiceChat = async () => {
  try {
    await connect(roomId.value, userId.value)
    isInVoiceChat.value = true
  } catch (error) {
    console.error('Failed to start voice chat:', error)
  }
}

const exitVoiceChat = async () => {
  try {
    await disconnect()
    isInVoiceChat.value = false
    resetForm()
  } catch (error) {
    console.error('Failed to exit voice chat:', error)
  }
}

const resetForm = () => {
  roomId.value = ''
  userId.value = ''
  displayName.value = ''
}

// Keyboard shortcuts
const handleKeydown = (event: KeyboardEvent) => {
  if (!isInVoiceChat.value) return

  // Space: toggle mic
  if (event.code === 'Space' && !event.ctrlKey && !event.metaKey) {
    event.preventDefault()
    toggleMic()
  }
  // M: quick mute/unmute
  else if (event.code === 'KeyM' && (event.ctrlKey || event.metaKey)) {
    event.preventDefault()
    if (voiceChatStore.isMicMuted) {
      unmuteMic()
    } else {
      muteMic()
    }
  }
  // S: toggle song
  else if (event.code === 'KeyS' && (event.ctrlKey || event.metaKey)) {
    event.preventDefault()
    toggleSong()
  }
}

// Add keyboard listener
if (typeof window !== 'undefined') {
  window.addEventListener('keydown', handleKeydown)
}
</script>

<template>
  <div class="min-h-screen bg-base-100">
    <!-- Entry Screen -->
    <div v-if="!isInVoiceChat" class="container mx-auto max-w-2xl p-4">
      <div class="hero min-h-screen">
        <div class="hero-content text-center">
          <div class="max-w-md w-full">
            <!-- Header -->
            <div class="mb-8">
              <h1 class="text-5xl font-bold mb-2">🎤</h1>
              <h1 class="text-4xl font-bold mb-2">Voice Chat</h1>
              <p class="text-base-content/60">Crystal clear audio communication</p>
            </div>

            <!-- Join Form Card -->
            <div class="card card-border bg-base-200 shadow-2xl">
              <div class="card-body gap-4">
                <h2 class="card-title justify-center text-2xl">Join a Room</h2>

                <!-- Room ID Input -->
                <div class="form-control">
                  <label class="label">
                    <span class="label-text font-semibold">Room ID</span>
                    <span class="label-text-alt text-error">*</span>
                  </label>
                  <input
                    v-model.trim="roomId"
                    type="text"
                    placeholder="e.g., room-123"
                    class="input input-bordered input-lg"
                    @keyup.enter="canJoin && startVoiceChat()"
                  />
                  <label class="label">
                    <span class="label-text-alt text-base-content/50">
                      Unique identifier for the room
                    </span>
                  </label>
                </div>

                <!-- User ID Input -->
                <div class="form-control">
                  <label class="label">
                    <span class="label-text font-semibold">Your User ID</span>
                    <span class="label-text-alt text-error">*</span>
                  </label>
                  <input
                    v-model.trim="userId"
                    type="text"
                    placeholder="e.g., user-456"
                    class="input input-bordered input-lg"
                    @keyup.enter="canJoin && startVoiceChat()"
                  />
                  <label class="label">
                    <span class="label-text-alt text-base-content/50">
                      Your unique identifier
                    </span>
                  </label>
                </div>

                <!-- Display Name Input (Optional) -->
                <div class="form-control">
                  <label class="label">
                    <span class="label-text font-semibold">Display Name</span>
                    <span class="label-text-alt">(optional)</span>
                  </label>
                  <input
                    v-model.trim="displayName"
                    type="text"
                    placeholder="e.g., John Doe"
                    class="input input-bordered input-lg"
                    @keyup.enter="canJoin && startVoiceChat()"
                  />
                </div>

                <!-- Join Button -->
                <button
                  @click="startVoiceChat"
                  :disabled="!canJoin"
                  class="btn btn-primary btn-lg mt-4"
                >
                  <span v-if="!canJoin">Fill in required fields</span>
                  <span v-else>Join Voice Chat</span>
                </button>

                <!-- Divider -->
                <div class="divider my-2">Info</div>

                <!-- Requirements -->
                <div class="alert alert-info alert-outline text-sm">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    class="stroke-current shrink-0 h-5 w-5"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>Make sure your microphone is enabled in browser settings</span>
                </div>

                <!-- Keyboard Shortcuts Info -->
                <div class="alert alert-success alert-outline text-sm">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="stroke-current shrink-0 h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div>
                    <p class="font-bold">Keyboard Shortcuts</p>
                    <ul class="text-xs mt-1 space-y-1">
                      <li><kbd class="kbd kbd-xs">Space</kbd> - Toggle microphone</li>
                      <li><kbd class="kbd kbd-xs">Ctrl</kbd>+<kbd class="kbd kbd-xs">M</kbd> - Quick mute</li>
                      <li><kbd class="kbd kbd-xs">Ctrl</kbd>+<kbd class="kbd kbd-xs">S</kbd> - Toggle song</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Voice Chat Screen -->
    <div v-else class="container mx-auto max-w-6xl p-4 min-h-screen flex flex-col">
      <!-- Top Bar -->
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-3xl font-bold">🎤 {{ displayName || userId }}</h1>
          <p class="text-sm text-base-content/60">Room: {{ roomId }}</p>
        </div>
        <button @click="exitVoiceChat" class="btn btn-outline btn-error">
          Exit Chat
        </button>
      </div>

      <!-- Main Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1">
        <!-- Main Content -->
        <div class="lg:col-span-2">
          <VoiceChat :room-id="roomId" :user-id="userId" />
        </div>

        <!-- Sidebar -->
        <div class="flex flex-col gap-4">
          <!-- Volume Meter -->
          <div class="card card-border bg-base-200 shadow-md">
            <div class="card-body gap-4">
              <h3 class="card-title text-base">Your Audio Level</h3>
              <VolumeMeter :sensitivity="0.8" />
            </div>
          </div>

          <!-- Quick Stats -->
          <div class="card card-border bg-base-200 shadow-md">
            <div class="card-body gap-3">
              <h3 class="card-title text-base">Status</h3>

              <!-- Connection Status -->
              <div class="flex justify-between items-center">
                <span class="text-sm">Connection:</span>
                <span class="badge" :class="{
                  'badge-success': voiceChatStore.isConnected,
                  'badge-warning': voiceChatStore.isConnecting,
                }">
                  {{ voiceChatStore.connectionStatus }}
                </span>
              </div>

              <!-- Microphone Status -->
              <div class="flex justify-between items-center">
                <span class="text-sm">Microphone:</span>
                <span class="badge" :class="{
                  'badge-error': voiceChatStore.isMicMuted,
                  'badge-success': !voiceChatStore.isMicMuted,
                }">
                  {{ voiceChatStore.isMicMuted ? 'Muted' : 'Active' }}
                </span>
              </div>

              <!-- Song Status -->
              <div class="flex justify-between items-center">
                <span class="text-sm">Song:</span>
                <span class="badge" :class="{
                  'badge-error': voiceChatStore.isSongMuted,
                  'badge-success': !voiceChatStore.isSongMuted,
                }">
                  {{ voiceChatStore.isSongMuted ? 'Disabled' : 'Enabled' }}
                </span>
              </div>

              <!-- Users Count -->
              <div class="flex justify-between items-center">
                <span class="text-sm">Users:</span>
                <span class="badge badge-primary">
                  {{ voiceChatStore.userCount }}
                </span>
              </div>
            </div>
          </div>

          <!-- Help -->
          <div class="alert alert-info alert-outline text-xs">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              class="stroke-current h-4 w-4"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <p class="font-bold">Tips</p>
              <ul class="mt-1 text-xs space-y-1">
                <li>• Use headphones to avoid echo</li>
                <li>• Keep microphone at arm's length</li>
                <li>• Minimize background noise</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

