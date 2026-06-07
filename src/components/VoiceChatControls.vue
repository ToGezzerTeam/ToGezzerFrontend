<script setup lang="ts">
import { useVoiceChatStore } from '@/api/socket/voiceChat/store.ts'
import { Mic, MicOff, Headphones, HeadphoneOff, PhoneOff } from '@lucide/vue'

const voiceChatStore = useVoiceChatStore()
</script>

<template>
  <div class="card card-border bg-base-100 shadow-md">
    <div class="card-body">
      <p class="text-sm text-base-content/60 mb-4">Audio Controls</p>
      <div class="flex gap-3 justify-center flex-wrap">
        <button
          @click="voiceChatStore.toggleMic"
          :disabled="!voiceChatStore.isConnected"
          :class="voiceChatStore.isMicMuted ? 'btn-error' : 'btn-primary'"
          class="btn btn-lg btn-circle"
          :title="voiceChatStore.isMicMuted ? 'Activer le micro' : 'Couper le micro'"
        >
          <MicOff v-if="voiceChatStore.isMicMuted" :size="22" />
          <Mic v-else :size="22" />
        </button>

        <button
          @click="voiceChatStore.toggleSong"
          :disabled="!voiceChatStore.isConnected"
          :class="voiceChatStore.isSongMuted ? 'btn-error' : 'btn-secondary'"
          class="btn btn-lg btn-circle"
          :title="voiceChatStore.isSongMuted ? 'Activer le son' : 'Couper le son'"
        >
          <HeadphoneOff v-if="voiceChatStore.isSongMuted" :size="22" />
          <Headphones v-else :size="22" />
        </button>

        <button
          @click="voiceChatStore.disconnect"
          :disabled="!voiceChatStore.isConnected"
          class="btn btn-lg btn-circle btn-error btn-outline"
          title="Quitter le salon vocal"
        >
          <PhoneOff :size="22" />
        </button>
      </div>

      <div class="text-center text-xs text-base-content/50 mt-4">
        <span :class="voiceChatStore.isMicMuted ? 'text-error' : 'text-success'">
          {{ voiceChatStore.isMicMuted ? 'Micro coupé' : 'Micro actif' }}
        </span>
        ·
        <span :class="voiceChatStore.isSongMuted ? 'text-error' : 'text-success'">
          {{ voiceChatStore.isSongMuted ? 'Son coupé' : 'Son actif' }}
        </span>
      </div>
    </div>
  </div>
</template>

