<script setup lang="ts">
import { useVoiceChatStore } from '@/api/socket/voiceChat/store.ts'
import { Mic, MicOff, Headphones, HeadphoneOff } from '@lucide/vue'

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
          <div class="avatar">
            <div class="rounded-full w-10">
              <img
                :src="`https://api.dicebear.com/10.x/dylan/svg?skinColor=c061cb&backgroundColor=619eff,29e051,f6d32d&moodVariant=confused,happy,hopeful,neutral,superHappy&facialHairProbability=0&hairColorFill=radial&hairColor=000000,1d5dff,ff543d,ffffff&seed=${encodeURIComponent(user.username)}`"
                :alt="user.username"
              />
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
              :class="user.isMicMuted ? 'badge-error' : 'badge-success'"
              :title="user.isMicMuted ? 'Micro coupé' : 'Micro actif'"
            >
              <MicOff v-if="user.isMicMuted" :size="12" />
              <Mic v-else :size="12" />
            </div>

            <div
              class="badge"
              :class="user.isSongMuted ? 'badge-error' : 'badge-success'"
              :title="user.isSongMuted ? 'Son coupé' : 'Son actif'"
            >
              <HeadphoneOff v-if="user.isSongMuted" :size="12" />
              <Headphones v-else :size="12" />
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>
