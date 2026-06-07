<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { getMyServers, joinServer } from '@/api/route/server.ts'
import type { ServerDTO } from '@/api/types/server.ts'
import { Plus } from '@lucide/vue'

const servers = ref<ServerDTO[]>([])
const isLoading = ref(true)
const route = useRoute()

const modalRef = ref<HTMLDialogElement | null>(null)
const serverUuidInput = ref('')
const isJoining = ref(false)
const joinError = ref<string | null>(null)

const isActive = (uuid: string | null | undefined) =>
  !!uuid && route.params.serverUuid === uuid

const loadServers = async () => {
  try {
    servers.value = await getMyServers()
  } finally {
    isLoading.value = false
  }
}

const openModal = () => {
  serverUuidInput.value = ''
  joinError.value = null
  modalRef.value?.showModal()
}

const submitJoin = async () => {
  const uuid = serverUuidInput.value.trim()
  if (!uuid || isJoining.value) return
  isJoining.value = true
  joinError.value = null
  try {
    await joinServer(uuid)
    await loadServers()
    modalRef.value?.close()
  } catch (err) {
    joinError.value = err instanceof Error ? err.message : 'Erreur lors de la connexion.'
  } finally {
    isJoining.value = false
  }
}

const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter') submitJoin()
}

onMounted(loadServers)
</script>

<template>
  <nav class="flex h-screen w-[72px] flex-col items-center bg-base-300 py-3">
    <!-- Server list -->
    <div class="flex flex-1 flex-col items-center gap-2 overflow-y-auto">
      <div v-if="isLoading" class="mt-4">
        <span class="loading loading-spinner loading-sm text-base-content/40"></span>
      </div>

      <template v-else>
        <div
          v-for="server in servers"
          :key="server.uuid!"
          class="tooltip tooltip-right"
          :data-tip="server.name"
        >
          <RouterLink :to="{ name: 'server', params: { serverUuid: server.uuid } }">
            <div
              class="flex h-12 w-12 items-center justify-center overflow-hidden transition-all duration-150"
              :class="
                isActive(server.uuid)
                  ? 'rounded-2xl bg-primary text-primary-content'
                  : 'rounded-full bg-base-content/20 text-base-content hover:rounded-2xl hover:bg-primary hover:text-primary-content'
              "
            >
              <img
                v-if="server.logo"
                :src="server.logo"
                :alt="server.name"
                class="h-full w-full object-cover"
              />
              <span v-else class="text-lg font-bold">
                {{ server.name.charAt(0).toUpperCase() }}
              </span>
            </div>
          </RouterLink>
        </div>
      </template>
    </div>

    <!-- Divider + join button -->
    <div class="divider my-1 w-8"></div>
    <div class="tooltip tooltip-right pb-1" data-tip="Rejoindre un serveur">
      <button
        class="flex h-12 w-12 items-center justify-center rounded-full bg-base-content/10 text-success transition-all duration-150 hover:rounded-2xl hover:bg-success hover:text-success-content"
        type="button"
        @click="openModal"
      >
        <Plus :size="20" />
      </button>
    </div>
  </nav>

  <!-- Join server modal -->
  <dialog ref="modalRef" class="modal">
    <div class="modal-box">
      <h3 class="mb-1 text-lg font-bold">Rejoindre un serveur</h3>
      <p class="mb-4 text-sm text-base-content/60">Entre l'UUID du serveur pour le rejoindre.</p>

      <div v-if="joinError" role="alert" class="alert alert-error alert-soft mb-3 py-2 text-sm">
        <span>{{ joinError }}</span>
      </div>

      <input
        v-model="serverUuidInput"
        type="text"
        class="input input-bordered w-full font-mono"
        placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
        :disabled="isJoining"
        @keydown="onKeydown"
      />

      <div class="modal-action">
        <form method="dialog">
          <button class="btn btn-ghost" :disabled="isJoining">Annuler</button>
        </form>
        <button
          class="btn btn-primary"
          :disabled="!serverUuidInput.trim() || isJoining"
          @click="submitJoin"
        >
          <span v-if="isJoining" class="loading loading-spinner loading-sm"></span>
          <span v-else>Rejoindre</span>
        </button>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop"><button>close</button></form>
  </dialog>
</template>
