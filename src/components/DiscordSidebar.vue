<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { createRoom, joinRoom } from '@/api/route/room.ts'

type ChannelKind = 'text' | 'voice'

export type ChannelItem = {
  uuid: string
  name: string
  type: ChannelKind
}

const props = defineProps<{
  serverUuid: string
  serverId: number | null | undefined
  channels: ChannelItem[]
  isLoading: boolean
  loadError: string | null
}>()

const emit = defineEmits<{ channelCreated: [] }>()

const route = useRoute()

const textChannels = computed(() => props.channels.filter((c) => c.type === 'text'))
const voiceChannels = computed(() => props.channels.filter((c) => c.type === 'voice'))

const isChannelActive = (uuid: string) => route.params.channelUuid === uuid
const channelPrefix = (kind: ChannelKind) => (kind === 'text' ? '#' : '🔊')

// Create room modal
const modalRef = ref<HTMLDialogElement | null>(null)
const newChannelName = ref('')
const isCreating = ref(false)
const createError = ref<string | null>(null)

const openModal = () => {
  newChannelName.value = ''
  createError.value = null
  modalRef.value?.showModal()
}

const submitCreate = async () => {
  const name = newChannelName.value.trim()
  if (!name || isCreating.value) return
  isCreating.value = true
  createError.value = null
  try {
    const room = await createRoom({ name, channelType: 'TEXT', serverId: props.serverId })
    if (room.uuid) await joinRoom(room.uuid)
    modalRef.value?.close()
    emit('channelCreated')
  } catch (err) {
    createError.value = err instanceof Error ? err.message : 'Erreur lors de la création.'
  } finally {
    isCreating.value = false
  }
}

const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter') submitCreate()
}
</script>

<template>
  <aside class="flex h-screen w-60 flex-col border-r border-base-300 bg-base-200">
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
        <template v-if="textChannels.length > 0 || serverId != null">
          <li class="flex flex-row items-center justify-between px-2 py-1">
            <span class="text-xs font-bold uppercase tracking-wide text-base-content/60">
              Salons texte
            </span>
            <button
              class="btn btn-ghost btn-xs btn-circle"
              type="button"
              title="Ajouter un salon"
              @click="openModal"
            >
              +
            </button>
          </li>
          <li v-for="channel in textChannels" :key="channel.uuid">
            <RouterLink
              :to="{ name: 'channel', params: { serverUuid: props.serverUuid, channelUuid: channel.uuid } }"
              class="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-base-300/60"
              :class="isChannelActive(channel.uuid) ? 'bg-base-300/70' : ''"
            >
              <span class="w-5 text-center text-sm text-base-content/60">{{
                channelPrefix(channel.type)
              }}</span>
              <span class="truncate">{{ channel.name }}</span>
            </RouterLink>
          </li>
        </template>

        <template v-if="voiceChannels.length > 0">
          <li
            class="menu-title mt-2 px-2 text-xs font-bold uppercase tracking-wide text-base-content/60"
          >
            Salons vocaux
          </li>
          <li v-for="channel in voiceChannels" :key="channel.uuid">
            <RouterLink
              :to="{ name: 'channel', params: { serverUuid: props.serverUuid, channelUuid: channel.uuid } }"
              class="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-base-300/60"
              :class="isChannelActive(channel.uuid) ? 'bg-base-300/70' : ''"
            >
              <span class="w-5 text-center text-sm text-base-content/60">{{
                channelPrefix(channel.type)
              }}</span>
              <span class="truncate">{{ channel.name }}</span>
            </RouterLink>
          </li>
        </template>

        <li v-if="!isLoading && channels.length === 0" class="p-3 text-sm text-base-content/50">
          Aucun salon disponible.
        </li>
      </ul>
    </div>
  </aside>

  <!-- Create channel modal -->
  <dialog ref="modalRef" class="modal">
    <div class="modal-box">
      <h3 class="mb-4 text-lg font-bold">Nouveau salon texte</h3>

      <div v-if="createError" role="alert" class="alert alert-error alert-soft mb-3 py-2 text-sm">
        <span>{{ createError }}</span>
      </div>

      <input
        v-model="newChannelName"
        type="text"
        class="input input-bordered w-full"
        placeholder="Nom du salon"
        :disabled="isCreating"
        @keydown="onKeydown"
      />

      <div class="modal-action">
        <form method="dialog">
          <button class="btn btn-ghost" :disabled="isCreating">Annuler</button>
        </form>
        <button
          class="btn btn-primary"
          :disabled="!newChannelName.trim() || isCreating"
          @click="submitCreate"
        >
          <span v-if="isCreating" class="loading loading-spinner loading-sm"></span>
          <span v-else>Créer</span>
        </button>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop"><button>close</button></form>
  </dialog>
</template>
