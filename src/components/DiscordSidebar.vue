<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { createRoom } from '@/api/route/room.ts'
import { useVoiceChatStore } from '@/api/socket/voiceChat/store.ts'
import { ServerStore } from '@/api/socket/server/store.ts'
import {
  Hash,
  Volume2,
  Plus,
  Mic,
  MicOff,
  Headphones,
  HeadphoneOff,
  PhoneOff,
  Settings,
  UserPlus,
  Link,
  Copy,
} from '@lucide/vue'
import QRCode from 'qrcode'

// Invite modal
const inviteModalRef = ref<HTMLDialogElement | null>(null)
const copiedLink = ref(false)
const copiedUuid = ref(false)
const qrDataUrl = ref('')

const inviteUrl = computed(
  () => `${window.location.origin}/invite/${props.serverUuid}`,
)

const openInviteModal = async () => {
  qrDataUrl.value = await QRCode.toDataURL(inviteUrl.value, { width: 200, margin: 1 })
  inviteModalRef.value?.showModal()
}

const copyLink = async () => {
  await navigator.clipboard.writeText(inviteUrl.value)
  copiedLink.value = true
  setTimeout(() => { copiedLink.value = false }, 2000)
}

const copyUuid = async () => {
  await navigator.clipboard.writeText(props.serverUuid)
  copiedUuid.value = true
  setTimeout(() => { copiedUuid.value = false }, 2000)
}

const username = localStorage.getItem('user_name') ?? 'user'
const avatarUrl = `https://api.dicebear.com/10.x/dylan/svg?skinColor=c061cb&backgroundColor=619eff,29e051,f6d32d&moodVariant=confused,happy,hopeful,neutral,superHappy&facialHairProbability=0&hairColorFill=radial&hairColor=000000,1d5dff,ff543d,ffffff&seed=${encodeURIComponent(username)}`

const getAvatarUrl = (userName: string): string => {
  return `https://api.dicebear.com/10.x/dylan/svg?skinColor=c061cb&backgroundColor=619eff,29e051,f6d32d&moodVariant=confused,happy,hopeful,neutral,superHappy&facialHairProbability=0&hairColorFill=radial&hairColor=000000,1d5dff,ff543d,ffffff&seed=${encodeURIComponent(userName)}`
}

type ChannelKind = 'text' | 'voice'

export type ChannelItem = {
  uuid: string
  name: string
  type: ChannelKind
}

const props = defineProps<{
  serverUuid: string
  serverId: number | null | undefined
  serverName: string | null
  channels: ChannelItem[]
  isLoading: boolean
  loadError: string | null
}>()

const route = useRoute()
const serverStore = ServerStore()

const textChannels = computed(() => props.channels.filter((c) => c.type === 'text'))
const voiceChannels = computed(() => props.channels.filter((c) => c.type === 'voice'))

const isChannelActive = (uuid: string) => route.params.channelUuid === uuid
const channelIcon = (kind: ChannelKind) => (kind === 'text' ? Hash : Volume2)

// Create room modal
const modalRef = ref<HTMLDialogElement | null>(null)
const newChannelName = ref('')
const newChannelType = ref<'TEXT' | 'VOICE'>('TEXT')
const isCreating = ref(false)
const createError = ref<string | null>(null)

const openModal = () => {
  newChannelName.value = ''
  newChannelType.value = 'TEXT'
  createError.value = null
  modalRef.value?.showModal()
}

const submitCreate = async () => {
  const name = newChannelName.value.trim()
  if (!name || isCreating.value) return
  isCreating.value = true
  createError.value = null
  try {
    await createRoom({
      name,
      channelType: newChannelType.value,
      serverId: props.serverId,
    })
    modalRef.value?.close()
  } catch (err) {
    createError.value = err instanceof Error ? err.message : 'Erreur lors de la création.'
  } finally {
    isCreating.value = false
  }
}

const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter') submitCreate()
}

const voiceStore = useVoiceChatStore()
const connectedChannel = computed(() =>
  voiceStore.isConnected
    ? (props.channels.find((c) => c.uuid === voiceStore.currentRoomId) ?? null)
    : null,
)
</script>

<template>
  <aside class="flex h-screen w-60 flex-col border-r border-base-300 bg-base-200">
    <div class="navbar min-h-14 bg-base-300 px-4">
      <div class="navbar-start min-w-0 flex-1">
        <span class="truncate font-semibold">{{ serverName ?? 'ToGezzer' }}</span>
      </div>
      <div class="navbar-end">
        <div class="tooltip tooltip-bottom" data-tip="Inviter">
          <button class="btn btn-ghost btn-sm btn-circle" type="button" @click="openInviteModal">
            <UserPlus :size="16" />
          </button>
        </div>
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
          <div class="flex flex-row items-center justify-between px-2 py-1">
            <span class="text-xs font-bold uppercase tracking-wide text-base-content/60">
              Salons texte
            </span>
            <button
              class="btn btn-ghost btn-xs btn-circle"
              type="button"
              title="Ajouter un salon"
              @click="openModal"
            >
              <Plus :size="18" />
            </button>
          </div>
          <li v-for="channel in textChannels" :key="channel.uuid">
            <RouterLink
              :to="{
                name: 'channel',
                params: { serverUuid: props.serverUuid, channelUuid: channel.uuid },
              }"
              class="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-base-300/60"
              :class="isChannelActive(channel.uuid) ? 'bg-base-300/70' : ''"
            >
              <component
                :is="channelIcon(channel.type)"
                :size="15"
                class="shrink-0 text-base-content/60"
              />
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
              :to="{
                name: 'channel',
                params: { serverUuid: props.serverUuid, channelUuid: channel.uuid },
              }"
              class="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-base-300/60"
              :class="isChannelActive(channel.uuid) ? 'bg-base-300/70' : ''"
            >
              <component
                :is="channelIcon(channel.type)"
                :size="15"
                class="shrink-0 text-base-content/60"
              />
              <span class="truncate flex-1">{{ channel.name }}</span>
              <!-- Connected users avatars -->
              <div
                v-if="serverStore.getVoiceUsersForRoom(channel.uuid).length > 0"
                class="flex items-center gap-1 ml-1"
              >
                <div class="avatar-group -space-x-2">
                  <template
                    v-for="user in serverStore.getVoiceUsersForRoom(channel.uuid).slice(0, 3)"
                    :key="user.userId"
                  >
                    <div class="avatar">
                      <div class="w-5 h-5 rounded-full">
                        <img
                          :src="getAvatarUrl(user.username)"
                          :alt="user.username"
                          :title="user.username"
                          class="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  </template>
                  <div
                    v-if="serverStore.getVoiceUsersForRoom(channel.uuid).length > 3"
                    class="avatar"
                  >
                    <div
                      class="w-5 h-5 rounded-full bg-base-300 text-base-content flex items-center justify-center text-xs"
                    >
                      +{{ serverStore.getVoiceUsersForRoom(channel.uuid).length - 3 }}
                    </div>
                  </div>
                </div>
              </div>
            </RouterLink>
          </li>
        </template>

        <li v-if="!isLoading && channels.length === 0" class="p-3 text-sm text-base-content/50">
          Aucun salon disponible.
        </li>
      </ul>
    </div>
    <!-- Voice status bar -->
    <div class="border-t border-base-300 bg-base-300/60 px-3 py-2">
      <div class="mb-1 flex items-center gap-1.5">
        <span
          class="h-2 w-2 rounded-full"
          :class="connectedChannel ? 'bg-success' : 'bg-base-content/30'"
        ></span>
        <span
          class="text-xs font-semibold"
          :class="connectedChannel ? 'text-success' : 'text-base-content/50'"
        >
          {{ connectedChannel ? 'Vocal connecté' : 'Vocal déconnecté' }}
        </span>
      </div>
      <p class="mb-2 flex items-center gap-1.5 truncate text-xs text-base-content/70">
        <Volume2 :size="13" />{{ connectedChannel ? connectedChannel.name : '—' }}
      </p>
      <div class="flex items-center gap-1">
        <img :src="avatarUrl" :alt="username" class="h-7 w-7 rounded-full bg-base-300" />
        <div class="flex-1" />
        <button
          class="btn btn-ghost btn-xs btn-circle"
          :class="[
            voiceStore.isMicMuted ? 'text-error' : '',
            !connectedChannel ? 'opacity-30' : '',
          ]"
          :disabled="!connectedChannel"
          :title="voiceStore.isMicMuted ? 'Activer le micro' : 'Couper le micro'"
          @click="voiceStore.toggleMic"
        >
          <MicOff v-if="voiceStore.isMicMuted" :size="14" />
          <Mic v-else :size="14" />
        </button>
        <button
          class="btn btn-ghost btn-xs btn-circle"
          :class="[
            voiceStore.isSongMuted ? 'text-error' : '',
            !connectedChannel ? 'opacity-30' : '',
          ]"
          :disabled="!connectedChannel"
          :title="voiceStore.isSongMuted ? 'Activer le son' : 'Couper le son'"
          @click="voiceStore.toggleSong"
        >
          <HeadphoneOff v-if="voiceStore.isSongMuted" :size="14" />
          <Headphones v-else :size="14" />
        </button>
        <button
          class="btn btn-ghost btn-xs btn-circle text-error"
          :class="!connectedChannel ? 'opacity-30' : ''"
          :disabled="!connectedChannel"
          title="Quitter le salon vocal"
          @click="voiceStore.disconnect"
        >
          <PhoneOff :size="14" />
        </button>
        <RouterLink
          :to="{ name: 'settings' }"
          class="btn btn-ghost btn-xs btn-circle"
          title="Paramètres"
        >
          <Settings :size="14" />
        </RouterLink>
      </div>
    </div>
  </aside>

  <!-- Invite modal -->
  <dialog ref="inviteModalRef" class="modal">
    <div class="modal-box flex flex-col items-center gap-4">
      <h3 class="text-lg font-bold self-start">Inviter sur {{ serverName ?? 'ce serveur' }}</h3>

      <img v-if="qrDataUrl" :src="qrDataUrl" alt="QR code d'invitation" class="rounded-lg" width="200" height="200" />

      <div class="w-full flex flex-col gap-2">
        <button class="btn btn-primary w-full gap-2" @click="copyLink">
          <Link :size="16" />
          {{ copiedLink ? 'Lien copié !' : 'Copier le lien d\'invitation' }}
        </button>
        <button class="btn btn-ghost btn-sm w-full gap-2 font-mono text-xs text-base-content/60" @click="copyUuid">
          <Copy :size="14" />
          {{ copiedUuid ? 'UUID copié !' : serverUuid }}
        </button>
      </div>

      <p class="text-xs text-base-content/50 text-center">
        Scannez le QR code ou partagez le lien pour rejoindre directement le serveur.
      </p>
    </div>
    <form method="dialog" class="modal-backdrop"><button>close</button></form>
  </dialog>

  <!-- Create channel modal -->
  <dialog ref="modalRef" class="modal">
    <div class="modal-box">
      <h3 class="mb-4 text-lg font-bold">
        Nouveau salon {{ newChannelType === 'TEXT' ? 'texte' : 'vocal' }}
      </h3>

      <div v-if="createError" role="alert" class="alert alert-error alert-soft mb-3 py-2 text-sm">
        <span>{{ createError }}</span>
      </div>

      <fieldset class="fieldset mb-3">
        <legend class="fieldset-legend">Type de salon</legend>
        <label class="flex cursor-pointer items-center gap-3">
          <span class="flex items-center gap-1.5 text-sm"> <Hash :size="14" /> Texte </span>
          <input
            type="checkbox"
            class="toggle toggle-primary"
            :checked="newChannelType === 'VOICE'"
            @change="newChannelType = newChannelType === 'TEXT' ? 'VOICE' : 'TEXT'"
          />
          <span class="flex items-center gap-1.5 text-sm"> <Volume2 :size="14" /> Vocal </span>
        </label>
      </fieldset>

      <input
        v-model="newChannelName"
        type="text"
        class="input input-bordered w-full"
        :placeholder="newChannelType === 'TEXT' ? 'Nom du salon texte' : 'Nom du salon vocal'"
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
