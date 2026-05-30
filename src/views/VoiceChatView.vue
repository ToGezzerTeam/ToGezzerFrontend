<script setup lang="ts">
import { ref } from 'vue'
import VoiceChat from '@/components/VoiceChat.vue'

const roomId = ref<string>('')
const userId = ref<string>('')
const isInVoiceChat = ref(false)

const startVoiceChat = () => {
  if (!roomId.value ) {
    alert('Please enter room ID ')
    return
  }
  isInVoiceChat.value = true
}

const exitVoiceChat = () => {
  isInVoiceChat.value = false
  roomId.value = ''
  userId.value = ''
}
</script>

<template>
  <div class="min-h-screen bg-base-100">
    <!-- Main Container -->
    <div v-if="!isInVoiceChat" class="container mx-auto max-w-2xl p-4">
      <div class="hero min-h-screen">
        <div class="hero-content text-center">
          <div class="max-w-md">
            <h1 class="text-5xl font-bold mb-8">🎤 Voice Chat</h1>

            <!-- Join Form -->
            <div class="card card-border bg-base-200 shadow-lg">
              <div class="card-body gap-4">
                <h2 class="card-title justify-center">Join a Room</h2>

                <!-- Room ID Input -->
                <div class="form-control">
                  <label class="label">
                    <span class="label-text">Room ID</span>
                  </label>
                  <input
                    v-model="roomId"
                    type="text"
                    placeholder="Enter room ID"
                    class="input input-bordered"
                    @keyup.enter="startVoiceChat"
                  />
                </div>


                <!-- Join Button -->
                <button
                  @click="startVoiceChat"
                  :disabled="!roomId"
                  class="btn btn-primary mt-4"
                >
                  Join Voice Chat
                </button>
              </div>
            </div>

            <!-- Info Section -->
            <div class="mt-8 text-left">
              <div class="alert alert-info alert-outline">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  class="stroke-current shrink-0 w-6 h-6"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <h3 class="font-bold">Getting started</h3>
                  <div class="text-xs">
                    <p>• Enter a room ID to join or create a room</p>
                    <p>• Choose your user ID for identification</p>
                    <p>• Make sure your microphone is enabled</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Voice Chat View -->
    <div v-else class="container mx-auto max-w-4xl p-4 min-h-screen flex flex-col">
      <!-- Exit Button -->
      <div class="flex justify-end mb-4">
        <button @click="exitVoiceChat" class="btn btn-outline btn-sm">Exit Chat</button>
      </div>

      <!-- Voice Chat Component -->
      <VoiceChat :room-id="roomId" :user-id="userId" />
    </div>
  </div>
</template>
