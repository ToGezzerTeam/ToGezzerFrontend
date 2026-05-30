<script setup lang="ts">
import { useVoiceChatStore } from '@/api/socket/voiceChat/store.ts';

const voiceChatStore = useVoiceChatStore();
</script>

<template>
  <div
    v-if="voiceChatStore.error"
    role="alert"
    class="alert alert-error alert-outline shadow-md"
  >
    <div class="flex items-start gap-3">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="stroke-current shrink-0 h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 9v2m0 4v2m0 4v2m0-8a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <div class="flex-1">
        <h3 class="font-bold">Error</h3>
        <p class="text-sm">{{ voiceChatStore.error }}</p>
      </div>
    </div>
    <button
      @click="voiceChatStore.clearError"
      class="btn btn-sm btn-ghost"
    >
      Dismiss
    </button>
  </div>
</template>

