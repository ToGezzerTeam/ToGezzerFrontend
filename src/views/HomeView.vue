<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import DiscordSidebar from '@/components/DiscordSidebar.vue'
// import { fetchMessagesPage, joinRoom, leaveRoom, onMessage } from '@/api/messages'
// import type { MessageDTO, MessagesPageResponseDto } from '@/api/messages'
// import { sortMessagesChronologically } from '@/api/utils/messages.utils.ts'

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

const route = useRoute()
const isSidebarOpen = ref(true)
const layout = ref<ChannelLayout | null>(null)
const isLoading = ref(true)
const loadError = ref<string | null>(null)

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

const channels = computed(() => {
  const result: ChannelItem[] = []

  for (const node of sortedItems.value) {
    if (node.type === 'folder') {
      result.push(...node.children)
    } else {
      result.push(node)
    }
  }

  return result
})

const selectedChannelId = computed(() => {
  const { channelId } = route.params
  return typeof channelId === 'string' ? channelId : undefined
})

const selectedChannel = computed(() => {
  if (!selectedChannelId.value) {
    return null
  }

  return channels.value.find((channel) => channel.id === selectedChannelId.value) ?? null
})

const selectedFolderName = computed(() => {
  if (!selectedChannelId.value) {
    return null
  }

  for (const node of sortedItems.value) {
    if (node.type === 'folder' && node.children.some((channel) => channel.id === selectedChannelId.value)) {
      return node.name
    }
  }

  return null
})

const channelPrefix = (kind: ChannelKind) => {
  return kind === 'text' ? '#' : '🔊'
}

const hasUnknownChannel = computed(() => {
  return Boolean(selectedChannelId.value) && !selectedChannel.value
})

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
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
  } catch (error) {
    loadError.value = error instanceof Error ? error.message : 'Erreur inconnue.'
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="flex min-h-screen bg-base-100">
    <DiscordSidebar v-if="isSidebarOpen" />

    <main class="flex-1 bg-base-100 p-6">
      <div class="mx-auto flex max-w-3xl flex-col gap-4">
        <div class="flex items-center justify-between gap-3">
          <h1 class="text-2xl font-bold">{{ selectedChannel ? selectedChannel.name : 'Espace principal' }}</h1>
          <button class="btn btn-sm btn-outline" type="button" @click="toggleSidebar">
            {{ isSidebarOpen ? 'Masquer la sidebar' : 'Afficher la sidebar' }}
          </button>
        </div>

        <div v-if="isLoading" class="flex items-center gap-2 text-base-content/70">
          <span class="loading loading-dots loading-sm"></span>
          Chargement du channel...
        </div>

        <div v-else-if="loadError" role="alert" class="alert alert-error alert-soft">
          <span>{{ loadError }}</span>
        </div>

        <div v-else-if="hasUnknownChannel" role="alert" class="alert alert-warning alert-soft">
          <span>Le channel "{{ selectedChannelId }}" n'existe pas dans la configuration.</span>
        </div>

        <template v-else-if="selectedChannel">
          <p class="text-base-content/70">
            Channel actif: {{ channelPrefix(selectedChannel.type) }}{{ selectedChannel.name }}
          </p>

          <div class="card border border-base-300 bg-base-200/50">
            <div class="card-body gap-3">
              <div class="flex flex-wrap items-center gap-2">
                <span class="badge badge-neutral">{{ selectedChannel.type === 'text' ? 'Texte' : 'Vocal' }}</span>
                <span v-if="selectedFolderName" class="badge badge-outline">{{ selectedFolderName }}</span>
              </div>
              <p class="text-base-content/80">
                Cette page est dynamique: l'URL détermine le channel affiché et les données viennent de
                public/channel-layout.json.
              </p>
              <div class="text-sm text-base-content/60">Identifiant: {{ selectedChannel.id }}</div>
            </div>
          </div>
        </template>

        <template v-else>
          <p class="text-base-content/70">
            Sélectionne un channel dans la sidebar pour afficher sa page dynamique.
          </p>
          <div class="alert alert-info alert-soft">
            <span>Modifie public/channel-layout.json pour changer l'ordre, les dossiers et les salons.</span>
          </div>
        </template>
      </div>
    </main>
  </div>
</template>
