<script setup lang="ts">
import { useVoiceChatStore } from '@/api/voiceChat/store.ts';

const voiceChatStore = useVoiceChatStore();
</script>

<template>
  <div class="card card-border bg-base-100 shadow-md">
    <div class="card-body">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="card-title text-lg">Voice Chat</h3>
          <p class="text-sm text-base-content/60">
            Room: {{ voiceChatStore.currentRoomId }}
          </p>
        </div>
        <div class="flex items-center gap-2">
          <div class="badge" :class="{
            'badge-success': voiceChatStore.connectionStatus === 'connected',
            'badge-warning': voiceChatStore.connectionStatus === 'connecting',
            'badge-error': voiceChatStore.connectionStatus === 'disconnected',
          }">
            {{ voiceChatStore.connectionStatus }}
          </div>
          <div class="badge badge-primary">
            {{ voiceChatStore.userCount }} user(s)
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

