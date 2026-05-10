<script setup lang="ts">
import { computed, ref } from 'vue'
import DiscordSidebar from '@/components/DiscordSidebar.vue'
import { fetchMessagesPage, sortMessagesChronologically } from '@/services/messages'
import type { MessageDTO, MessagesPageResponseDto } from '@/types/messages'

type ChannelSelection = {
  roomId: string
  channelName: string
  channelType: 'text' | 'voice'
}

const isSidebarOpen = ref(true)
const selectedChannel = ref<ChannelSelection | null>(null)
const messagesPage = ref<MessagesPageResponseDto | null>(null)
const isLoading = ref(false)
const loadError = ref<string | null>(null)
const pageSize = ref(100)
const messageUuid = ref('')
const currentAbortController = ref<AbortController | null>(null)
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

const messageDateFormatter = new Intl.DateTimeFormat('fr-FR', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

const selectedChannelLabel = computed(() => {
  if (!selectedChannel.value) {
    return 'Aucun salon sélectionné'
  }

  return selectedChannel.value.channelName
})

const selectedChannelKindLabel = computed(() => {
  if (!selectedChannel.value) {
    return 'Choisis un channel pour afficher ses messages.'
  }

  return selectedChannel.value.channelType === 'text' ? 'Salon texte' : 'Salon vocal'
})

const sortedMessages = computed(() => {
  return sortMessagesChronologically(messagesPage.value?.messageDTOS ?? [])
})

const hasMessages = computed(() => sortedMessages.value.length > 0)

const hasMoreMessages = computed(() => messagesPage.value?.hasMore ?? false)

const messageStateLabel = (state: MessageDTO['state']) => {
  if (state === 'created') {
    return 'Créé'
  }

  if (state === 'updated') {
    return 'Modifié'
  }

  return 'Supprimé'
}

const messageStateBadgeClass = (state: MessageDTO['state']) => {
  if (state === 'created') {
    return 'badge-success badge-soft'
  }

  if (state === 'updated') {
    return 'badge-warning badge-soft'
  }

  return 'badge-error badge-soft'
}

const formatMessageDate = (value: string) => {
  return messageDateFormatter.format(new Date(value))
}

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

const loadMessages = async (roomId = selectedChannel.value?.roomId) => {
  if (!roomId) {
    return
  }

  currentAbortController.value?.abort()
  const controller = new AbortController()
  currentAbortController.value = controller

  isLoading.value = true
  loadError.value = null
  messagesPage.value = null

  try {
    const response = await fetchMessagesPage(roomId, {
      messageUuid: messageUuid.value.trim() || undefined,
      pageSize: pageSize.value,
      signal: controller.signal,
      baseUrl: apiBaseUrl,
    })

    if (controller.signal.aborted) {
      return
    }

    messagesPage.value = response
  } catch (error) {
    if (controller.signal.aborted) {
      return
    }

    loadError.value = error instanceof Error ? error.message : 'Erreur inconnue.'
  } finally {
    if (currentAbortController.value === controller) {
      currentAbortController.value = null
      isLoading.value = false
    }
  }
}

const handleChannelSelect = (selection: ChannelSelection) => {
  selectedChannel.value = selection
  messageUuid.value = ''
  void loadMessages(selection.roomId)
}

const handleRefresh = () => {
  void loadMessages()
}
</script>

<template>
  <div class="flex min-h-screen bg-base-100">
    <DiscordSidebar
      v-if="isSidebarOpen"
      :active-room-id="selectedChannel?.roomId"
      @select-channel="handleChannelSelect"
    />

    <main class="flex-1 bg-base-100 p-6">
      <div class="mx-auto flex max-w-5xl flex-col gap-6">
        <div class="flex items-start justify-between gap-3">
          <div class="space-y-1">
            <h1 class="text-2xl font-bold">Messages du salon</h1>
            <p class="text-base-content/70">
              Clique sur un channel pour appeler <code>GET /api/messages/{roomId}</code> et afficher les messages
              dans l’ordre chronologique.
            </p>
          </div>

          <button class="btn btn-sm btn-outline" type="button" @click="toggleSidebar">
            {{ isSidebarOpen ? 'Masquer la sidebar' : 'Afficher la sidebar' }}
          </button>
        </div>

        <div class="card card-border bg-base-200">
          <div class="card-body gap-4">
            <div class="flex flex-wrap items-center gap-2">
              <span class="badge badge-primary badge-soft">Base API: {{ apiBaseUrl }}</span>
              <span v-if="selectedChannel" class="badge badge-neutral badge-soft">{{ selectedChannelKindLabel }}</span>
              <span v-if="messagesPage" class="badge badge-success badge-soft">
                {{ sortedMessages.length }} message(s)
              </span>
              <span v-if="hasMoreMessages" class="badge badge-warning badge-soft">Plus de messages disponibles</span>
            </div>

            <div class="flex flex-col gap-1">
              <h2 class="text-lg font-semibold">{{ selectedChannelLabel }}</h2>
              <p class="text-sm text-base-content/70">{{ selectedChannelKindLabel }}</p>
            </div>

            <form class="grid gap-3 lg:grid-cols-[1fr_1fr_auto]" @submit.prevent="handleRefresh">
              <label class="floating-label">
                <input v-model.number="pageSize" type="number" min="1" max="1000" class="input w-full" />
                <span>pageSize</span>
              </label>

              <label class="floating-label">
                <input v-model.trim="messageUuid" type="text" class="input w-full" placeholder="UUID d’ancrage optionnel" />
                <span>messageUuid</span>
              </label>

              <button class="btn btn-primary" type="submit" :disabled="!selectedChannel || isLoading">
                Recharger
              </button>
            </form>
          </div>
        </div>

        <div v-if="!selectedChannel" class="alert alert-info alert-soft">
          <span>Choisis un salon à gauche pour charger ses messages.</span>
        </div>

        <div v-else class="space-y-4">
          <div v-if="isLoading" class="space-y-3">
            <div class="skeleton h-24 w-full"></div>
            <div class="skeleton h-24 w-full"></div>
            <div class="skeleton h-24 w-full"></div>
          </div>

          <div v-else-if="loadError" role="alert" class="alert alert-error alert-soft">
            <span>{{ loadError }}</span>
          </div>

          <div v-else-if="!hasMessages" class="alert alert-info alert-soft">
            <span>Aucun message n’a été trouvé pour ce salon.</span>
          </div>

          <div v-else class="space-y-3">
            <article v-for="message in sortedMessages" :key="message.uuid" class="card card-border bg-base-200/40">
              <div class="card-body gap-3 p-4">
                <div class="flex items-start justify-between gap-3">
                  <div class="space-y-1">
                    <div class="flex flex-wrap items-center gap-2">
                      <h3 class="text-sm font-semibold">Auteur: {{ message.authorId }}</h3>
                      <span class="badge badge-ghost badge-sm">{{ message.uuid }}</span>
                    </div>
                    <p class="text-xs text-base-content/60">
                      Créé le {{ formatMessageDate(message.createdAt) }}
                      <span v-if="message.updatedAt"> • modifié le {{ formatMessageDate(message.updatedAt) }}</span>
                    </p>
                  </div>

                  <span class="badge badge-sm" :class="messageStateBadgeClass(message.state)">
                    {{ messageStateLabel(message.state) }}
                  </span>
                </div>

                <div
                  class="rounded-box bg-base-100 p-3 text-sm whitespace-pre-wrap"
                  :class="message.state === 'deleted' ? 'italic text-base-content/60 line-through' : 'text-base-content'"
                >
                  {{ message.state === 'deleted' ? 'Message supprimé' : message.content.value }}
                </div>

                <div class="flex flex-wrap gap-2 text-xs text-base-content/60">
                  <span class="badge badge-ghost badge-sm">Type: {{ message.content.type }}</span>
                  <span v-if="message.answerTo" class="badge badge-ghost badge-sm">Répond à: {{ message.answerTo }}</span>
                  <span v-if="message.deletedAt" class="badge badge-ghost badge-sm">
                    Supprimé le {{ formatMessageDate(message.deletedAt) }}
                  </span>
                  <span v-if="message.deletedBy" class="badge badge-ghost badge-sm">Par: {{ message.deletedBy }}</span>
                </div>
              </div>
            </article>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped></style>
