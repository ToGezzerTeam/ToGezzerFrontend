<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import ServerList from '@/components/ServerList.vue'
import DiscordSidebar from '@/components/DiscordSidebar.vue'
import type { ChannelItem } from '@/components/DiscordSidebar.vue'
import TextChat from '@/components/TextChat.vue'
import { getServerDetail } from '@/api/route/server.ts'
import { joinRoom } from '@/api/route/room.ts'
import type { RoomDTO } from '@/api/types/room.ts'

const route = useRoute()
const isSidebarOpen = ref(true)
const channels = ref<ChannelItem[]>([])
const serverId = ref<number | null>(null)
const isLoadingChannels = ref(false)
const loadChannelsError = ref<string | null>(null)

const serverUuid = computed(() => {
  const v = route.params.serverUuid
  return typeof v === 'string' ? v : undefined
})

const channelUuid = computed(() => {
  const v = route.params.channelUuid
  return typeof v === 'string' ? v : undefined
})

const selectedChannel = computed(() =>
  channelUuid.value ? (channels.value.find((c) => c.uuid === channelUuid.value) ?? null) : null,
)

const loadServerDetail = async (uuid: string) => {
  isLoadingChannels.value = true
  loadChannelsError.value = null
  try {
    const detail = await getServerDetail(uuid)
    serverId.value = detail.serverId ?? null
    channels.value = (detail.roomDTOS ?? [])
      .filter((r): r is RoomDTO & { uuid: string; name: string } => !!r.uuid && !!r.name)
      .map((r) => ({
        uuid: r.uuid!,
        name: r.name!,
        type: r.channelType === 'TEXT' ? 'text' : 'voice',
      }))
  } catch (err) {
    loadChannelsError.value = err instanceof Error ? err.message : 'Erreur inconnue.'
    channels.value = []
    serverId.value = null
  } finally {
    isLoadingChannels.value = false
  }
}

watch(channelUuid, (uuid) => {
  if (uuid) joinRoom(uuid).catch(() => {})
})

watch(
  serverUuid,
  (uuid) => {
    if (!uuid) {
      channels.value = []
      serverId.value = null
      return
    }
    loadServerDetail(uuid)
  },
  { immediate: true },
)
</script>

<template>
  <div class="flex h-screen bg-base-100">
    <!-- Server list column -->
    <ServerList />

    <!-- Channel sidebar -->
    <DiscordSidebar
      v-if="isSidebarOpen && serverUuid"
      :server-uuid="serverUuid"
      :server-id="serverId"
      :channels="channels"
      :is-loading="isLoadingChannels"
      :load-error="loadChannelsError"
      @channel-created="loadServerDetail(serverUuid!)"
    />

    <!-- Text channel: full-height chat layout -->
    <template v-if="selectedChannel?.type === 'text'">
      <div class="flex flex-1 flex-col overflow-hidden">
        <div class="navbar min-h-12 border-b border-base-300 bg-base-100 px-4">
          <div class="navbar-start gap-2">
            <span class="text-base-content/60">#</span>
            <span class="font-semibold">{{ selectedChannel.name }}</span>
          </div>
          <div class="navbar-end">
            <button
              class="btn btn-ghost btn-sm"
              type="button"
              @click="isSidebarOpen = !isSidebarOpen"
            >
              {{ isSidebarOpen ? '◀' : '▶' }}
            </button>
          </div>
        </div>
        <TextChat :room-uuid="selectedChannel.uuid" class="flex-1 overflow-hidden" />
      </div>
    </template>

    <!-- Other states -->
    <main v-else class="flex flex-1 flex-col overflow-y-auto p-6">
      <div class="mx-auto flex w-full max-w-3xl flex-col gap-4">
        <div class="flex items-center justify-between gap-3">
          <h1 class="text-2xl font-bold">
            {{ selectedChannel ? selectedChannel.name : 'Bienvenue sur ToGezzer' }}
          </h1>
          <button
            v-if="serverUuid"
            class="btn btn-outline btn-sm"
            type="button"
            @click="isSidebarOpen = !isSidebarOpen"
          >
            {{ isSidebarOpen ? 'Masquer la sidebar' : 'Afficher la sidebar' }}
          </button>
        </div>

        <template v-if="selectedChannel?.type === 'voice'">
          <div class="card border border-base-300 bg-base-200/50">
            <div class="card-body gap-3">
              <div class="flex items-center gap-2">
                <span class="text-2xl">🔊</span>
                <span class="font-semibold">{{ selectedChannel.name }}</span>
                <span class="badge badge-neutral">Vocal</span>
              </div>
              <p class="text-base-content/70">
                Rejoignez le salon vocal pour discuter avec les membres.
              </p>
            </div>
          </div>
        </template>

        <template v-else-if="!serverUuid">
          <p class="text-base-content/70">Sélectionne un serveur dans la barre de gauche.</p>
        </template>

        <template v-else>
          <p class="text-base-content/70">
            Sélectionne un channel dans la sidebar pour afficher sa page.
          </p>
        </template>
      </div>
    </main>
  </div>
</template>
