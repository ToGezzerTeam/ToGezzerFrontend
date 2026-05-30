<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { useVoiceChatStore } from '@/api/voiceChat/store.ts';
import VoiceChatHeader from './VoiceChatHeader.vue';
import VoiceChatControls from './VoiceChatControls.vue';
import RoomUsersList from './RoomUsersList.vue';
import VoiceChatError from './VoiceChatError.vue';
import RemoteAudioContainer from './RemoteAudioContainer.vue';

const props = defineProps<{
  roomId: string;
  userId: string;
}>();

const voiceChatStore = useVoiceChatStore();

onMounted(async () => {
  try {
    await voiceChatStore.connect(props.roomId, props.userId);
    await voiceChatStore.startAudio();
  } catch (error) {
    console.error('Failed to initialize voice chat:', error);
  }
});

onUnmounted(async () => {
  await voiceChatStore.disconnect();
});
</script>

<template>
  <div class="flex flex-col h-full bg-base-100 gap-4 p-4">
    <!-- Remote Audio Container (invisible) -->
    <RemoteAudioContainer />

    <!-- Error Alert -->
    <VoiceChatError v-if="voiceChatStore.error" />

    <!-- Header -->
    <VoiceChatHeader />

    <!-- Main Content -->
    <div class="flex-1 flex flex-col gap-4">
      <!-- Users List -->
      <RoomUsersList />

      <!-- Controls -->
      <VoiceChatControls />
    </div>
  </div>
</template>

