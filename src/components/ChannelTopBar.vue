<script setup lang="ts">
import { deleteRoom, renameRoom } from '@/api/route/room'
import { Hash, Volume2, ChevronLeft, ChevronRight, Trash, Edit } from '@lucide/vue'
import { type ChannelItem } from '@/api/socket/server/store.ts'
import { ref } from 'vue'

const props = defineProps<{ channel: ChannelItem; isSidebarOpen: boolean }>()
const emit = defineEmits<{
  (e: 'toggle-sidebar'): void
}>()

const renameChannelModalRef = ref<HTMLDialogElement | null>(null)
const deleteChannelModalRef = ref<HTMLDialogElement | null>(null)
const newChannelName = ref('')
const isExecutingAction = ref(false)

const toggleSidebar = () => {
  emit('toggle-sidebar')
}

const openRenameModal = () => {
  newChannelName.value = props.channel.name
  renameChannelModalRef.value?.showModal()
}

const openDeleteModal = () => {
  deleteChannelModalRef.value?.showModal()
}

const renameChannel = () => {
  if (!newChannelName.value.trim()) return

  isExecutingAction.value = true
  renameRoom(props.channel.uuid, { name: newChannelName.value.trim() })
    .catch((err) => {
      console.error('Failed to rename channel:', err)
    })
    .finally(() => {
      isExecutingAction.value = false
      newChannelName.value = ''
      renameChannelModalRef.value?.close()
    })
}

const deleteChannel = () => {
  isExecutingAction.value = true
  deleteRoom(props.channel.uuid)
    .catch((err) => {
      console.error('Failed to delete channel:', err)
    })
    .finally(() => {
      isExecutingAction.value = false
      deleteChannelModalRef.value?.close()
    })
}
</script>
<template>
  <div class="flex flex-1 flex-col overflow-hidden">
    <div class="navbar min-h-12 border-b border-base-300 bg-base-100 px-4">
      <div class="navbar-start gap-2">
        <template v-if="channel.type === 'text'">
          <Hash :size="16" class="text-base-content/60" />
        </template>
        <template v-else-if="channel.type === 'voice'">
          <Volume2 :size="16" class="text-base-content/60" />
        </template>
        <span class="font-semibold">{{ channel.name }}</span>
      </div>
      <div class="navbar-end">
        <button class="btn btn-ghost btn-sm" type="button" @click="openRenameModal">
          <Edit :size="16" />
        </button>
        <button class="btn btn-ghost btn-sm" type="button" @click="openDeleteModal">
          <Trash class="text-error" :size="16" />
        </button>

        <div class="divider-vertical w-0.5 h-8"></div>

        <button class="btn btn-ghost btn-sm" type="button" @click="toggleSidebar">
          <ChevronLeft v-if="isSidebarOpen" :size="16" />
          <ChevronRight v-else :size="16" />
        </button>
      </div>
    </div>
    <TextChat :room-uuid="channel.uuid" class="flex-1 overflow-hidden" />
  </div>

  <dialog ref="renameChannelModalRef" class="modal">
    <div class="modal-box">
      <h3 class="text-lg font-bold">Renommer le salon "{{ channel.name }}" ?</h3>
      <input
        type="text"
        placeholder="Nouveau nom du salon"
        class="input input-bordered w-full mt-4"
        v-model="newChannelName"
      />
      <div class="modal-action">
        <form method="dialog">
          <button class="btn btn-ghost">Annuler</button>
        </form>
        <button class="btn btn-primary" @click="renameChannel" :disabled="isExecutingAction">
          Renommer
        </button>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop"><button>close</button></form>
  </dialog>

  <dialog ref="deleteChannelModalRef" class="modal">
    <div class="modal-box">
      <h3 class="text-lg font-bold">Supprimer le salon "{{ channel.name }}" ?</h3>
      <p class="py-4">Cette action est irréversible. Tous les messages du salon seront perdus.</p>
      <div class="modal-action">
        <form method="dialog">
          <button class="btn btn-ghost">Annuler</button>
        </form>
        <button class="btn btn-error" @click="deleteChannel" :disabled="isExecutingAction">
          Supprimer
        </button>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop"><button>close</button></form>
  </dialog>
</template>
