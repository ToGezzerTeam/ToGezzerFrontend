<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

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

onMounted(async () => {
  try {
    const response = await fetch('/channel-layout.json')

    if (!response.ok) {
      throw new Error('Impossible de charger la configuration des salons.')
    }

    const data = (await response.json()) as ChannelLayout

    if (!Array.isArray(data.items)) {
      throw new Error('Le JSON de configuration est invalide.')
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
                <a class="active:bg-base-300/70 flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-base-300/60">
                  <span class="w-5 text-center text-sm text-base-content/60">{{ channelPrefix(channel.type) }}</span>
                  <span class="truncate">{{ channel.name }}</span>
                </a>
              </li>
            </ul>
          </li>

          <li v-else>
            <a class="active:bg-base-300/70 flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-base-300/60">
              <span class="w-5 text-center text-sm text-base-content/60">{{ channelPrefix(node.type) }}</span>
              <span class="truncate">{{ node.name }}</span>
            </a>
          </li>
        </template>
      </ul>
    </div>
  </aside>
</template>
