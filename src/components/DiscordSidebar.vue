<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

type ChannelKind = 'text' | 'voice'

type ChannelItem = {
  id: string
  name: string
  type: ChannelKind
  order?: number
}

type ChannelFolder = {
  id: string
  name: string
  type: 'folder'
  order?: number
  children: ChannelItem[]
}

type SidebarNode = ChannelItem | ChannelFolder

type ChannelLayout = {
  items: SidebarNode[]
}

const layout = ref<ChannelLayout | null>(null)
const isLoading = ref(true)
const loadError = ref<string | null>(null)
const openedFolders = ref<Record<string, boolean>>({})
const route = useRoute()

const props = defineProps<{
  activeRoomId?: string
}>()

const emit = defineEmits<{
  (event: 'select-channel', payload: { roomId: string; channelName: string; channelType: ChannelKind }): void
}>()

const isFolder = (node: SidebarNode): node is ChannelFolder => node.type === 'folder'

const sortByOrder = <T extends { order?: number; name: string }>(items: T[]) => {
  return [...items].sort((a, b) => {
    const orderA = a.order ?? Number.MAX_SAFE_INTEGER
    const orderB = b.order ?? Number.MAX_SAFE_INTEGER

    if (orderA !== orderB) {
      return orderA - orderB
    }

    return a.name.localeCompare(b.name, 'fr')
  })
}

const sortedItems = computed(() => {
  if (!layout.value) {
    return []
  }

  return sortByOrder(layout.value.items).map((node) => {
    if (isFolder(node)) {
      return {
        ...node,
        children: sortByOrder(node.children),
      }
    }

    return node
  })
})

const toggleFolder = (folderId: string) => {
  openedFolders.value[folderId] = !openedFolders.value[folderId]
}

const isFolderOpen = (folderId: string) => {
  return openedFolders.value[folderId] ?? false
}

const channelPrefix = (kind: ChannelKind) => {
  return kind === 'text' ? '#' : '🔊'
}

const isActiveChannel = (roomId: string) => {
  return props.activeRoomId === roomId
}

const selectChannel = (channel: ChannelItem) => {
  emit('select-channel', {
    roomId: channel.id,
    channelName: channel.name,
    channelType: channel.type,
  })
const isChannelActive = (channelId: string) => {
  return route.params.channelId === channelId
}

onMounted(async () => {
  try {
    const response = await fetch('/channel-layout.json')

    if (!response.ok) {
      loadError.value = 'Impossible de charger la configuration des salons.'
      return
    }

    const data = (await response.json()) as ChannelLayout

    if (!Array.isArray(data.items)) {
      loadError.value = 'Le JSON de configuration est invalide.'
      return
    }

    layout.value = data

    for (const node of data.items) {
      if (node.type === 'folder') {
        openedFolders.value[node.id] = true
      }
    }
  } catch (error) {
    loadError.value = error instanceof Error ? error.message : 'Erreur inconnue.'
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <aside class="flex h-screen w-80 flex-col border-r border-base-300 bg-base-200">
    <div class="navbar min-h-14 bg-base-300 px-4">
      <div class="navbar-start">
        <span class="font-semibold">ToGezzer</span>
      </div>
    </div>

    <div class="grow overflow-y-auto p-2">
      <div v-if="isLoading" class="flex items-center gap-2 p-3 text-sm text-base-content/70">
        <span class="loading loading-dots loading-sm"></span>
        Chargement des salons...
      </div>

      <div v-else-if="loadError" role="alert" class="alert alert-error alert-soft text-sm">
        <span>{{ loadError }}</span>
      </div>

      <ul v-else class="menu menu-sm w-full gap-1">
        <template v-for="node in sortedItems" :key="node.id">
          <li v-if="node.type === 'folder'">
            <button
              type="button"
              class="btn btn-ghost btn-sm mb-1 h-auto min-h-0 justify-start px-2 py-1 text-xs font-bold uppercase tracking-wide text-base-content/60"
              @click="toggleFolder(node.id)"
            >
              <span class="text-[10px]">{{ isFolderOpen(node.id) ? '▾' : '▸' }}</span>
              <span>{{ node.name }}</span>
            </button>

            <ul v-show="isFolderOpen(node.id)" class="ml-2 border-l border-base-300 pl-2">
              <li v-for="channel in node.children" :key="channel.id">
<<<<<<< HEAD
                <button
                  type="button"
                  class="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors"
                  :class="isActiveChannel(channel.id) ? 'bg-primary/10 text-primary' : 'hover:bg-base-300/60 text-base-content'"
                  :aria-current="isActiveChannel(channel.id) ? 'page' : undefined"
                  @click="selectChannel(channel)"
                >
                  <span class="w-5 text-center text-sm text-base-content/60">{{ channelPrefix(channel.type) }}</span>
                  <span class="truncate">{{ channel.name }}</span>
                </button>
=======
                <RouterLink
                  :to="{ name: 'channel', params: { channelId: channel.id } }"
                  class="active:bg-base-300/70 flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-base-300/60"
                  :class="{ 'bg-base-300/70': isChannelActive(channel.id) }"
                >
                  <span class="w-5 text-center text-sm text-base-content/60">{{ channelPrefix(channel.type) }}</span>
                  <span class="truncate">{{ channel.name }}</span>
                </RouterLink>
>>>>>>> d3198cf (feat: implement login and registration views, add channel routing)
              </li>
            </ul>
          </li>

          <li v-else>
<<<<<<< HEAD
            <button
              type="button"
              class="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors"
              :class="isActiveChannel(node.id) ? 'bg-primary/10 text-primary' : 'hover:bg-base-300/60 text-base-content'"
              :aria-current="isActiveChannel(node.id) ? 'page' : undefined"
              @click="selectChannel(node)"
            >
              <span class="w-5 text-center text-sm text-base-content/60">{{ channelPrefix(node.type) }}</span>
              <span class="truncate">{{ node.name }}</span>
            </button>
=======
            <RouterLink
              :to="{ name: 'channel', params: { channelId: node.id } }"
              class="active:bg-base-300/70 flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-base-300/60"
              :class="{ 'bg-base-300/70': isChannelActive(node.id) }"
            >
              <span class="w-5 text-center text-sm text-base-content/60">{{ channelPrefix(node.type) }}</span>
              <span class="truncate">{{ node.name }}</span>
            </RouterLink>
>>>>>>> d3198cf (feat: implement login and registration views, add channel routing)
          </li>
        </template>
      </ul>
    </div>
  </aside>
</template>
