<script setup lang="ts">
import { computed } from 'vue';
import { useVoiceChatStore } from '@/api/socket/voiceChat/store.ts';

const voiceChatStore = useVoiceChatStore();

const micIcon = computed(() => {
  return voiceChatStore.isMicMuted ? '🔇' : '🎤';
});

const songIcon = computed(() => {
  return voiceChatStore.isSongMuted ? '🔕' : '🎵';
});

const disconnectIcon = '📴';
</script>

<template>
  <div class="card card-border bg-base-100 shadow-md">
    <div class="card-body">
      <p class="text-sm text-base-content/60 mb-4">Audio Controls</p>
      <div class="flex gap-3 justify-center flex-wrap">
        <!-- Mic Toggle Button -->
        <button
          @click="voiceChatStore.toggleMic"
          :disabled="!voiceChatStore.isConnected"
          :class="{
            'btn-error': voiceChatStore.isMicMuted,
            'btn-primary': !voiceChatStore.isMicMuted,
          }"
          class="btn btn-lg btn-circle"
          :title="`Microphone ${voiceChatStore.isMicMuted ? 'muted' : 'active'}`"
        >
          {{ micIcon }}
        </button>

        <!-- Song Toggle Button -->
        <button
          @click="voiceChatStore.toggleSong"
          :disabled="!voiceChatStore.isConnected"
          :class="{
            'btn-error': voiceChatStore.isSongMuted,
            'btn-secondary': !voiceChatStore.isSongMuted,
          }"
          class="btn btn-lg btn-circle"
          :title="`Song ${voiceChatStore.isSongMuted ? 'disabled' : 'enabled'}`"
        >
          {{ songIcon }}
        </button>

        <!-- Disconnect Button -->
        <button
          @click="voiceChatStore.disconnect"
          :disabled="!voiceChatStore.isConnected"
          class="btn btn-lg btn-circle btn-ghost"
          title="Leave voice chat"
        >
          {{ disconnectIcon }}
        </button>
      </div>

      <!-- Status Text -->
      <div class="text-center text-xs text-base-content/50 mt-4">
        <span v-if="voiceChatStore.isMicMuted" class="text-error">
          Microphone muted
        </span>
        <span v-else class="text-success">
          Microphone active
        </span>
        •
        <span v-if="voiceChatStore.isSongMuted" class="text-error">
          Song disabled
        </span>
        <span v-else class="text-success">
          Song enabled
        </span>
      </div>
    </div>
  </div>
</template>

