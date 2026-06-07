<script setup lang="ts">
import { onMounted, watch } from 'vue';
import { useVoiceChatStore } from '@/api/socket/voiceChat/store.ts';
import VoiceChatHeader from './VoiceChatHeader.vue';
import VoiceChatControls from './VoiceChatControls.vue';
import RoomUsersList from './RoomUsersList.vue';
import VoiceChatError from './VoiceChatError.vue';
import RemoteAudioContainer from './RemoteAudioContainer.vue';

const props = defineProps<{
  roomId: string;
}>();

const voiceChatStore = useVoiceChatStore();

const joinVoiceRoom = async (roomId: string) => {
  try {
    if (voiceChatStore.isConnected && voiceChatStore.currentRoomId === roomId) return
    if (voiceChatStore.isConnected) await voiceChatStore.disconnect()
    await voiceChatStore.connect(roomId)
    await voiceChatStore.startAudio()
  } catch (error) {
    console.error('Failed to initialize voice chat:', error)
  }
}

onMounted(() => joinVoiceRoom(props.roomId))

watch(() => props.roomId, (newId) => joinVoiceRoom(newId))
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

