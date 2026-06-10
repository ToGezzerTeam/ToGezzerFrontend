<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ServerList from '@/components/ServerList.vue'
import DiscordSidebar from '@/components/DiscordSidebar.vue'
import TextChat from '@/components/TextChat.vue'
import VoiceChat from '@/components/VoiceChat.vue'
import { Plus, LogOut } from '@lucide/vue'
import { joinRoom } from '@/api/route/room.ts'
import { ServerStore } from '@/api/socket/server/store.ts'
import ChannelTopBar from '@/components/ChannelTopBar.vue'
import OnlineUsersList from '@/components/OnlineUsersList.vue'

const route = useRoute()
const router = useRouter()
const serverStore = ServerStore()
const isSidebarOpen = ref(true)
const isUsersListOpen = ref(false)
const serverListRef = ref<InstanceType<typeof ServerList> | null>(null)
const logoutModalRef = ref<HTMLDialogElement | null>(null)

const logout = () => {
  localStorage.removeItem('auth_token')
  localStorage.removeItem('user_uuid')
  localStorage.removeItem('user_id')
  localStorage.removeItem('user_name')
  router.push({ name: 'login' })
}

const serverUuid = computed(() => {
  const v = route.params.serverUuid
  return typeof v === 'string' ? v : undefined
})

const channelUuid = computed(() => {
  const v = route.params.channelUuid
  return typeof v === 'string' ? v : undefined
})

const selectedChannel = computed(() =>
  channelUuid.value
    ? (serverStore.channels.find((c) => c.uuid === channelUuid.value) ?? null)
    : null,
)

const loadServerDetail = async (uuid: string) => {
  await serverStore.loadServerDetail(uuid)
}

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

const reloadServer = () => {
  if (!serverUuid.value) return
  return loadServerDetail(serverUuid.value)
}

watch(
  serverUuid,
  (uuid) => {
    if (!uuid) {
      serverStore.clearServerState()
      return
    }
    reloadServer()
  },
  { immediate: true },
)

onMounted(reloadServer)

watch(channelUuid, (uuid) => {
  if (uuid) joinRoom(uuid).catch(() => {})
})

onUnmounted(() => {
  serverStore.clearServerState()
})
</script>

<template>
  <div class="flex h-screen bg-base-100">
    <!-- Server list column -->
    <ServerList ref="serverListRef" />

    <!-- Channel sidebar -->
    <DiscordSidebar
      v-if="isSidebarOpen && serverUuid"
      :server-uuid="serverUuid"
      :server-id="serverStore.serverId"
      :server-name="serverStore.serverName"
      :channels="serverStore.channels"
      :is-loading="serverStore.isLoadingChannels"
      :load-error="serverStore.loadChannelsError"
    />

    <!-- Text channel -->
    <template v-if="selectedChannel?.type === 'text'">
      <div class="flex flex-1 flex-col overflow-hidden">
        <ChannelTopBar
          :channel="selectedChannel"
          :is-sidebar-open="isSidebarOpen"
          :is-users-list-open="isUsersListOpen"
          @toggle-sidebar="toggleSidebar"
          @toggle-users="isUsersListOpen = !isUsersListOpen"
        />
        <div class="flex flex-1 overflow-hidden">
          <TextChat :room-uuid="selectedChannel.uuid" class="flex-1 overflow-hidden" />
          <OnlineUsersList v-if="isUsersListOpen" :users="serverStore.onlineUsers" />
        </div>
      </div>
    </template>

    <!-- Voice channel -->
    <template v-else-if="selectedChannel?.type === 'voice'">
      <div class="flex flex-1 flex-col overflow-hidden">
        <ChannelTopBar
          :channel="selectedChannel"
          :is-sidebar-open="isSidebarOpen"
          :is-users-list-open="isUsersListOpen"
          @toggle-sidebar="toggleSidebar"
          @toggle-users="isUsersListOpen = !isUsersListOpen"
        />
        <div class="flex flex-1 overflow-hidden">
          <VoiceChat
            :room-id="selectedChannel.uuid"
            :server-id="serverUuid!"
            class="flex-1 overflow-hidden"
          />
          <OnlineUsersList v-if="isUsersListOpen" :users="serverStore.onlineUsers" />
        </div>
      </div>
    </template>

    <!-- Server selected, no channel -->
    <template v-else-if="serverUuid">
      <div class="flex flex-1 flex-col overflow-hidden">
        <ChannelTopBar
          :channel="null"
          :is-sidebar-open="isSidebarOpen"
          :is-users-list-open="isUsersListOpen"
          @toggle-sidebar="toggleSidebar"
          @toggle-users="isUsersListOpen = !isUsersListOpen"
        />
        <div class="flex flex-1 overflow-hidden">
          <main class="flex flex-1 items-center justify-center overflow-y-auto p-6">
            <p class="text-base-content/70">
              Sélectionne un channel dans la sidebar pour afficher sa page.
            </p>
          </main>
          <OnlineUsersList v-if="isUsersListOpen" :users="serverStore.onlineUsers" />
        </div>
      </div>
    </template>

    <!-- No server selected -->
    <main v-else class="flex flex-1 flex-col items-center justify-center overflow-y-auto p-6">
      <div class="flex w-full max-w-sm flex-col items-center gap-6 text-center">
        <h1 class="text-3xl font-bold">Bienvenue sur ToGezzer</h1>
        <p class="text-base-content/60">Rejoins ou crée un serveur pour commencer.</p>
        <div class="flex w-full flex-col gap-3">
          <button
            class="btn btn-primary w-full gap-2"
            type="button"
            @click="serverListRef?.openModal()"
          >
            <Plus :size="18" />
            Créer / Rejoindre un serveur
          </button>
          <button
            class="btn btn-error btn-outline w-full gap-2"
            type="button"
            @click="logoutModalRef?.showModal()"
          >
            <LogOut :size="18" />
            Se déconnecter
          </button>
        </div>
      </div>
    </main>
  </div>

  <dialog ref="logoutModalRef" class="modal">
    <div class="modal-box">
      <h3 class="text-lg font-bold">Se déconnecter ?</h3>
      <p class="py-4 text-base-content/70">
        Vous devrez vous reconnecter pour accéder à l'application.
      </p>
      <div class="modal-action">
        <form method="dialog">
          <button class="btn btn-ghost">Annuler</button>
        </form>
        <button class="btn btn-error" @click="logout">Se déconnecter</button>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop"><button>close</button></form>
  </dialog>
</template>
