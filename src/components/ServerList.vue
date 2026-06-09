<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { getMyServers, joinServer, createServer } from '@/api/route/server.ts'
import type { ServerDTO } from '@/api/types/server.ts'
import { Plus } from '@lucide/vue'

const servers = ref<ServerDTO[]>([])
const isLoading = ref(true)
const route = useRoute()

const modalRef = ref<HTMLDialogElement | null>(null)
const activeTab = ref<'join' | 'create'>('join')

const serverUuidInput = ref('')
const isJoining = ref(false)
const joinError = ref<string | null>(null)

const serverNameInput = ref('')
const isCreating = ref(false)
const createError = ref<string | null>(null)

const isActive = (uuid: string | null | undefined) => !!uuid && route.params.serverUuid === uuid

const loadServers = async () => {
  try {
    servers.value = await getMyServers()
  } finally {
    isLoading.value = false
  }
}

const openModal = () => {
  activeTab.value = 'join'
  serverUuidInput.value = ''
  joinError.value = null
  serverNameInput.value = ''
  createError.value = null
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

const submitCreate = async () => {
  const name = serverNameInput.value.trim()
  if (!name || isCreating.value) return
  isCreating.value = true
  createError.value = null
  try {
    const server = await createServer({
      name,
      logo: '',
      background: '',
      public: false,
      createdBy: localStorage.getItem('user_name') ?? '',
    })
    if (server.uuid) await joinServer(server.uuid)
    await loadServers()
    modalRef.value?.close()
  } catch (err) {
    createError.value = err instanceof Error ? err.message : 'Erreur lors de la création.'
  } finally {
    isCreating.value = false
  }
}

const onKeydown = (e: KeyboardEvent) => {
  if (e.key !== 'Enter') return
  if (activeTab.value === 'join') submitJoin()
  else submitCreate()
}

onMounted(loadServers)

defineExpose({ openModal })
</script>

<template>
  <nav class="flex h-screen w-[72px] flex-col items-center overflow-hidden bg-base-300 py-3">
    <!-- Server list -->
    <div class="flex flex-1 flex-col items-center gap-2">
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

  <!-- Join/Create server modal -->
  <dialog ref="modalRef" class="modal">
    <div class="modal-box">
      <h3 class="mb-4 text-lg font-bold">Ajouter un serveur</h3>

      <div class="tabs tabs-box mb-4 w-full">
        <button
          class="tab flex-1"
          :class="activeTab === 'join' ? 'tab-active' : ''"
          type="button"
          @click="activeTab = 'join'"
        >
          Rejoindre
        </button>
        <button
          class="tab flex-1"
          :class="activeTab === 'create' ? 'tab-active' : ''"
          type="button"
          @click="activeTab = 'create'"
        >
          Créer
        </button>
      </div>

      <!-- Join tab -->
      <template v-if="activeTab === 'join'">
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
      </template>

      <!-- Create tab -->
      <template v-else>
        <p class="mb-4 text-sm text-base-content/60">Choisis un nom pour ton nouveau serveur.</p>
        <div v-if="createError" role="alert" class="alert alert-error alert-soft mb-3 py-2 text-sm">
          <span>{{ createError }}</span>
        </div>
        <input
          v-model="serverNameInput"
          type="text"
          class="input input-bordered w-full"
          placeholder="Mon super serveur"
          :disabled="isCreating"
          @keydown="onKeydown"
        />
        <div class="modal-action">
          <form method="dialog">
            <button class="btn btn-ghost" :disabled="isCreating">Annuler</button>
          </form>
          <button
            class="btn btn-primary"
            :disabled="!serverNameInput.trim() || isCreating"
            @click="submitCreate"
          >
            <span v-if="isCreating" class="loading loading-spinner loading-sm"></span>
            <span v-else>Créer</span>
          </button>
        </div>
      </template>
    </div>
    <form method="dialog" class="modal-backdrop"><button>close</button></form>
  </dialog>
</template>
