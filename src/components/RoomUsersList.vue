<script setup lang="ts">
import { useVoiceChatStore } from '@/api/socket/voiceChat/store.ts'

const voiceChatStore = useVoiceChatStore()
</script>

<template>
  <div class="card card-border bg-base-100 shadow-md">
    <div class="card-body">
      <h3 class="card-title text-base">Room Members ({{ voiceChatStore.userCount }})</h3>

      <div v-if="voiceChatStore.userCount === 0" class="text-center text-base-content/50 py-8">
        No other users in this room
      </div>

      <ul v-else class="list list-col-grow">
        <li
          v-for="[socketId, user] of voiceChatStore.roomUsers"
          :key="socketId"
          class="list-row gap-3 p-3 rounded-lg bg-base-200/50 hover:bg-base-200 transition-colors"
        >
          <!-- User Avatar with Status -->
          <div class="avatar placeholder">
            <div class="bg-primary text-primary-content rounded-full w-10">
              <span class="text-sm font-bold">
                {{ user.userId.charAt(0).toUpperCase() }}
              </span>
            </div>
          </div>

          <!-- User Info -->
          <div class="flex-1">
            <div class="font-semibold text-sm">{{ user.username }}</div>
            <div class="text-xs text-base-content/60">
              {{ user.userId }}
            </div>
          </div>

          <!-- User Status Badges -->
          <div class="flex gap-2 justify-end">
            <!-- Mic Status -->
            <div
              class="badge"
              :class="{
                'badge-error': user.isMicMuted,
                'badge-success': !user.isMicMuted,
              }"
              :title="user.isMicMuted ? 'Microphone muted' : 'Microphone active'"
            >
              {{ user.isMicMuted ? '🔇' : '🎤' }}
            </div>

            <!-- Song Status -->
            <div
              class="badge"
              :class="{
                'badge-error': user.isSongMuted,
                'badge-success': !user.isSongMuted,
              }"
              :title="user.isSongMuted ? 'Song disabled' : 'Song enabled'"
            >
              {{ user.isSongMuted ? '🔕' : '🎵' }}
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>
