<script setup lang="ts">
/**
 * QUICK START GUIDE
 * Copy-paste these examples into your existing views
 */

// ============================================================================
// EXAMPLE 1: Minimal Setup - Just add voice chat to a page
// ============================================================================

/*
<script setup lang="ts">
import VoiceChatView from '@/views/VoiceChatView.vue'
</script>

<template>
  <VoiceChatView />
</template>
*/

// ============================================================================
// EXAMPLE 2: Inline Voice Chat - Embed in existing view
// ============================================================================

/*
<script setup lang="ts">
import { ref } from 'vue'
import { useVoiceChat } from '@/composables/useVoiceChat'
import VoiceChat from '@/components/VoiceChat.vue'

const roomId = 'my-room'
const userId = 'user-123'

const {
  isConnected,
  connect,
  disconnect,
  toggleMic,
} = useVoiceChat({ roomId, userId, autoConnect: false })
</script>

<template>
  <div class="container">
    <!-- Your existing content -->
    <div class="content">
      <!-- ... -->
    </div>

    <!-- Voice Chat Section -->
    <aside class="sidebar">
      <button v-if="!isConnected()" @click="() => connect()">
        Start Voice Chat
      </button>
      <button v-else @click="disconnect">
        End Voice Chat
      </button>

      <VoiceChat v-if="isConnected()" :room-id="roomId" :user-id="userId" />
    </aside>
  </div>
</template>
*/

// ============================================================================
// EXAMPLE 3: Channel with Voice Chat - Discord-like integration
// ============================================================================

/*
<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { useVoiceChat } from '@/composables/useVoiceChat'
import VoiceChat from '@/components/VoiceChat.vue'

const route = useRoute()
const channelId = ref(String(route.params.channelId))

// In real app, get userId from auth store
const userId = ref('current-user-id')

const {
  connect,
  disconnect,
  isConnected,
  isMicMuted,
  toggleMic,
  store,
} = useVoiceChat()

const startVoiceChat = async () => {
  await connect(channelId.value, userId.value)
}
</script>

<template>
  <div class="flex h-screen">
    <!-- Channel Content -->
    <main class="flex-1 flex flex-col">
      <!-- Channel Header with Voice Button -->
      <header class="navbar bg-base-200 border-b">
        <div class="flex-1">
          <h2 class="text-2xl font-bold"># {{ channelId }}</h2>
        </div>

        <button
          @click="isConnected() ? disconnect() : startVoiceChat()"
          :class="{
            'btn-success': isConnected(),
            'btn-outline': !isConnected(),
          }"
          class="btn btn-circle"
        >
          🎤
        </button>
      </header>

      <!-- Channel Messages -->
      <div class="flex-1 overflow-auto">
        <!-- Your messages here -->
      </div>

      <!-- Voice Controls (if connected) -->
      <footer v-if="isConnected()" class="navbar bg-base-200 border-t gap-4 px-4">
        <button
          @click="toggleMic"
          :class="{ 'btn-error': isMicMuted(), 'btn-success': !isMicMuted() }"
          class="btn btn-circle"
        >
          {{ isMicMuted() ? '🔇' : '🎤' }}
        </button>

        <span class="text-sm">
          {{ store.userCount }} user{{ store.userCount === 1 ? '' : 's' }} in voice
        </span>

        <button @click="disconnect" class="btn btn-sm btn-outline btn-error ml-auto">
          Leave
        </button>
      </footer>
    </main>

    <!-- Voice Chat Sidebar (if connected) -->
    <aside v-if="isConnected()" class="w-80 border-l bg-base-100">
      <VoiceChat :room-id="channelId" :user-id="userId" />
    </aside>
  </div>
</template>
*/

// ============================================================================
// EXAMPLE 4: Using in a server channel list
// ============================================================================

/*
<script setup lang="ts">
import { computed } from 'vue'
import { useVoiceChatStore } from '@/api/voiceChat/store.ts'

defineProps<{
  channelId: string
  channelName: string
}>()

const voiceChatStore = useVoiceChatStore()

// Check if this channel has active voice chat
const hasVoiceActive = computed(() => {
  return voiceChatStore.currentRoomId === channelId && voiceChatStore.isConnected
})

const voiceUserCount = computed(() => {
  return hasVoiceActive.value ? voiceChatStore.userCount : 0
})
</script>

<template>
  <div class="menu-item p-2 hover:bg-base-300 rounded cursor-pointer">
    <div class="flex items-center gap-2">
      <span class="text-lg">#</span>
      <span class="flex-1">{{ channelName }}</span>

      <!-- Show voice badge if active -->
      <div v-if="hasVoiceActive" class="badge badge-success badge-sm">
        🎤 {{ voiceUserCount }}
      </div>
    </div>
  </div>
</template>
*/

// ============================================================================
// EXAMPLE 5: Floating Voice Control Widget
// ============================================================================

/*
<script setup lang="ts">
import { useVoiceChat } from '@/composables/useVoiceChat'

const {
  isConnected,
  disconnect,
  toggleMic,
  toggleSong,
  isMicMuted,
  isSongMuted,
  store,
} = useVoiceChat()
</script>

<template>
  <!-- Floating Widget (stays visible while scrolling) -->
  <div
    v-if="isConnected()"
    class="fixed bottom-4 right-4 card bg-base-100 shadow-xl max-w-xs z-40"
  >
    <div class="card-body gap-2">
      <h4 class="card-title text-sm">Voice Active</h4>

      <div class="flex gap-2">
        <button
          @click="toggleMic"
          :class="{ 'btn-error': isMicMuted(), 'btn-success': !isMicMuted() }"
          class="btn btn-sm btn-circle"
        >
          {{ isMicMuted() ? '🔇' : '🎤' }}
        </button>

        <button
          @click="toggleSong"
          :class="{ 'btn-error': isSongMuted(), 'btn-success': !isSongMuted() }"
          class="btn btn-sm btn-circle"
        >
          {{ isSongMuted() ? '🔕' : '🎵' }}
        </button>

        <button @click="disconnect" class="btn btn-sm btn-error flex-1">
          Leave
        </button>
      </div>

      <div class="text-xs text-base-content/60 text-center">
        {{ store.userCount }} user{{ store.userCount === 1 ? '' : 's' }}
      </div>
    </div>
  </div>
</template>
*/

// ============================================================================
// EXAMPLE 6: Voice Chat with Keyboard Shortcuts
// ============================================================================

/*
<script setup lang="ts">
import { onMounted } from 'vue'
import { useVoiceChat } from '@/composables/useVoiceChat'

const { toggleMic, muteMic, unmuteMic, disconnect, isMicMuted, isConnected } =
  useVoiceChat()

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

const handleKeydown = (e: KeyboardEvent) => {
  if (!isConnected()) return

  // Space: toggle mic
  if (e.code === 'Space' && !e.ctrlKey && !e.metaKey) {
    e.preventDefault()
    toggleMic()
  }

  // Ctrl+M: mute/unmute
  if (e.code === 'KeyM' && (e.ctrlKey || e.metaKey)) {
    e.preventDefault()
    if (isMicMuted()) {
      unmuteMic()
    } else {
      muteMic()
    }
  }

  // Escape: disconnect
  if (e.code === 'Escape') {
    e.preventDefault()
    disconnect()
  }
}
</script>

<template>
  <div>
    <!-- Your component content -->
    <p class="text-xs text-base-content/50">
      Keyboard: SPACE toggle mic | CTRL+M quick mute | ESC disconnect
    </p>
  </div>
</template>
*/

// ============================================================================
// EXAMPLE 7: Error Handling
// ============================================================================

/*
<script setup lang="ts">
import { watch } from 'vue'
import { useVoiceChat } from '@/composables/useVoiceChat'

const { store } = useVoiceChat()

watch(
  () => store.error,
  (error) => {
    if (error) {
      console.error('Voice chat error:', error)

      // Show toast notification
      showNotification({
        type: 'error',
        message: error,
        duration: 5000,
      })
    }
  },
)
</script>

<template>
  <!-- Your component -->
</template>
*/

// ============================================================================
// EXAMPLE 8: User Status Indicators
// ============================================================================

/*
<script setup lang="ts">
import { computed } from 'vue'
import { useVoiceChatStore } from '@/api/voiceChat/store.ts'

interface UserInfo {
  userId: string
  name: string
}

defineProps<{
  user: UserInfo
}>()

const voiceChatStore = useVoiceChatStore()

const userInVoice = computed(() => {
  return Array.from(voiceChatStore.roomUsers.values()).find(
    (u) => u.userId === user.userId,
  )
})

const isMicMuted = computed(() => {
  return userInVoice.value?.isMicMuted ?? false
})
</script>

<template>
  <div class="flex items-center gap-2">
    <span>{{ user.name }}</span>

    <!-- Show voice status badge -->
    <div v-if="userInVoice" class="flex gap-1">
      <span :title="`Microphone ${isMicMuted ? 'muted' : 'active'}`">
        {{ isMicMuted ? '🔇' : '🎤' }}
      </span>
    </div>
  </div>
</template>
*/

// ============================================================================
// EXAMPLE 9: Room Browser
// ============================================================================

/*
<script setup lang="ts">
import { ref } from 'vue'
import { useVoiceChat } from '@/composables/useVoiceChat'

interface Room {
  id: string
  name: string
  users: number
}

const rooms = ref<Room[]>([
  { id: 'room-1', name: 'General', users: 5 },
  { id: 'room-2', name: 'Gaming', users: 2 },
  { id: 'room-3', name: 'Music', users: 0 },
])

const selectedRoom = ref<string>('')
const userId = ref('user-123')

const { connect, disconnect, isConnected } = useVoiceChat()

const joinRoom = async (roomId: string) => {
  selectedRoom.value = roomId
  await connect(roomId, userId.value)
}

const leaveRoom = async () => {
  await disconnect()
  selectedRoom.value = ''
}
</script>

<template>
  <div class="container">
    <h1 class="text-3xl font-bold mb-6">Voice Rooms</h1>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="room in rooms"
        :key="room.id"
        class="card bg-base-200 shadow-md cursor-pointer hover:shadow-lg"
      >
        <div class="card-body">
          <h2 class="card-title">{{ room.name }}</h2>
          <p class="text-sm">
            {{ room.users }} user{{ room.users === 1 ? '' : 's' }}
          </p>

          <div class="card-actions justify-end">
            <button
              @click="joinRoom(room.id)"
              :disabled="isConnected() && selectedRoom !== room.id"
              class="btn btn-primary btn-sm"
            >
              {{ selectedRoom === room.id && isConnected() ? 'Connected' : 'Join' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Leave Button -->
    <button
      v-if="isConnected()"
      @click="leaveRoom"
      class="btn btn-error mt-8 fixed bottom-4 right-4"
    >
      Leave Voice
    </button>
  </div>
</template>
*/

export default {}
</script>

<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-4">Quick Start Examples</h1>
    <p class="text-base-content/60">
      See the source code for copy-paste examples you can use in your views.
    </p>
  </div>
</template>

