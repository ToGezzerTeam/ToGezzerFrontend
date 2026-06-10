<script setup lang="ts">
import { ref, watch, onUnmounted, nextTick, computed } from 'vue'
import {
  fetchMessagesPage,
  createMessage,
  updateMessage,
  deleteMessage,
  uploadFile,
} from '@/api/route/message.ts'
import {
  joinRoom,
  leaveRoom,
  onMessage,
  startTyping,
  stopTyping,
  onUserTyping,
} from '@/api/socket/messages/socket.ts'
import type { MessageDTO } from '@/api/types/messages.ts'
import FileMessage from '@/components/FileMessage.vue'
import { Reply, X, Paperclip, Pencil, Trash2 } from '@lucide/vue'

const props = defineProps<{ roomUuid: string }>()

const currentUserUuid = localStorage.getItem('user_uuid') ?? ''

const messages = ref<MessageDTO[]>([])
const hasMore = ref(false)
const isLoading = ref(false)
const isLoadingMore = ref(false)
const isSending = ref(false)
const newMessage = ref('')
const error = ref<string | null>(null)
const messagesEl = ref<HTMLElement | null>(null)
const inputEl = ref<HTMLTextAreaElement | null>(null)
const fileInputEl = ref<HTMLInputElement | null>(null)
const isUploadingFile = ref(false)

// Edit state
const editingUuid = ref<string | null>(null)
const editText = ref('')
const isSavingEdit = ref(false)

// Reply state
const replyingTo = ref<MessageDTO | null>(null)

const startReply = (msg: MessageDTO) => {
  replyingTo.value = msg
  nextTick(() => inputEl.value?.focus())
}

const messageMap = computed(() => {
  const map = new Map<string, MessageDTO>()
  for (const m of messages.value) map.set(m.uuid, m)
  return map
})

let offMessage: (() => void) | null = null
let offTyping: (() => void) | null = null

// Typing indicator
const typingUsers = ref(new Map<string, string>())
let typingTimer: ReturnType<typeof setTimeout> | null = null
let isCurrentlyTyping = false

const typingText = computed(() => {
  const names = [...typingUsers.value.values()]
  if (names.length === 0) return null
  if (names.length === 1) return `${names[0]} est en train d'écrire`
  if (names.length === 2) return `${names[0]} et ${names[1]} sont en train d'écrire`
  return "Plusieurs personnes sont en train d'écrire"
})

const handleTypingEvent = (payload: { userId: string; userName: string; isTyping: boolean }) => {
  if (payload.userId === currentUserUuid) return
  if (payload.isTyping) {
    typingUsers.value.set(payload.userId, payload.userName)
  } else {
    typingUsers.value.delete(payload.userId)
  }
}

const autoResize = () => {
  const el = inputEl.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = `${el.scrollHeight}px`
}

const onInput = () => {
  autoResize()
  if (!isCurrentlyTyping) {
    startTyping(props.roomUuid)
    isCurrentlyTyping = true
  }
  if (typingTimer) clearTimeout(typingTimer)
  typingTimer = setTimeout(() => {
    stopTyping(props.roomUuid)
    isCurrentlyTyping = false
    typingTimer = null
  }, 2000)
}

const scrollToBottom = async () => {
  await nextTick()
  if (messagesEl.value) messagesEl.value.scrollTop = messagesEl.value.scrollHeight
}

const loadMessages = async () => {
  isLoading.value = true
  error.value = null
  messages.value = []
  try {
    const page = await fetchMessagesPage(props.roomUuid, { pageSize: 50 })
    messages.value = page.messageDTOS
    hasMore.value = page.hasMore
    isLoading.value = false
    await scrollToBottom()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Erreur lors du chargement.'
  } finally {
    isLoading.value = false
  }
}

const loadMore = async () => {
  if (!hasMore.value || isLoadingMore.value || messages.value.length === 0) return
  isLoadingMore.value = true
  try {
    const page = await fetchMessagesPage(props.roomUuid, {
      lastMessageUuid: messages.value[0]?.uuid,
      pageSize: 50,
    })
    messages.value = [...page.messageDTOS, ...messages.value]
    hasMore.value = page.hasMore
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Erreur lors du chargement.'
  } finally {
    isLoadingMore.value = false
  }
}

const handleSocketMessage = (msg: MessageDTO) => {
  if (msg.state === 'created') {
    messages.value.push(msg)
    scrollToBottom()
    return
  }
  const idx = messages.value.findIndex((m) => m.uuid === msg.uuid)
  if (idx !== -1) messages.value[idx] = msg
}

const setupRoom = (roomId: string) => {
  offMessage?.()
  offTyping?.()
  joinRoom(roomId)
  offMessage = onMessage(handleSocketMessage)
  offTyping = onUserTyping(handleTypingEvent)
  loadMessages()
}

const teardownRoom = (roomId: string) => {
  if (typingTimer) {
    clearTimeout(typingTimer)
    typingTimer = null
  }
  if (isCurrentlyTyping) {
    stopTyping(roomId)
    isCurrentlyTyping = false
  }
  offMessage?.()
  offMessage = null
  offTyping?.()
  offTyping = null
  typingUsers.value.clear()
  leaveRoom(roomId)
}

watch(
  () => props.roomUuid,
  (next, prev) => {
    if (prev) teardownRoom(prev)
    if (next) setupRoom(next)
  },
  { immediate: true },
)

onUnmounted(() => teardownRoom(props.roomUuid))

const send = async () => {
  const text = newMessage.value.trim()
  if (!text || isSending.value) return
  if (typingTimer) {
    clearTimeout(typingTimer)
    typingTimer = null
  }
  if (isCurrentlyTyping) {
    stopTyping(props.roomUuid)
    isCurrentlyTyping = false
  }
  isSending.value = true
  error.value = null
  try {
    await createMessage(props.roomUuid, {
      message: text,
      answerTo: replyingTo.value?.uuid ?? null,
    })
    newMessage.value = ''
    replyingTo.value = null
    if (inputEl.value) inputEl.value.style.height = 'auto'
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Impossible d'envoyer le message."
  } finally {
    isSending.value = false
  }
}

const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    send()
  }
  if (e.key === 'Escape') replyingTo.value = null
}

// Edit
const startEdit = (msg: MessageDTO) => {
  editingUuid.value = msg.uuid
  editText.value = msg.content.value
}

const cancelEdit = () => {
  editingUuid.value = null
  editText.value = ''
}

const saveEdit = async (msg: MessageDTO) => {
  const text = editText.value.trim()
  if (!text || isSavingEdit.value) return
  isSavingEdit.value = true
  try {
    await updateMessage(props.roomUuid, msg.uuid, { message: text })
    editingUuid.value = null
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Impossible de modifier le message.'
  } finally {
    isSavingEdit.value = false
  }
}

const onEditKeydown = (e: KeyboardEvent, msg: MessageDTO) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    saveEdit(msg)
  }
  if (e.key === 'Escape') cancelEdit()
}

// Delete
const confirmDelete = async (msg: MessageDTO) => {
  try {
    await deleteMessage(props.roomUuid, msg.uuid)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Impossible de supprimer le message.'
  }
}

const sendFile = async (file: File) => {
  if (isUploadingFile.value) return
  isUploadingFile.value = true
  error.value = null
  try {
    await uploadFile(props.roomUuid, file)
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Impossible d'envoyer le fichier."
  } finally {
    isUploadingFile.value = false
    if (fileInputEl.value) fileInputEl.value.value = ''
  }
}

const onFileChange = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) sendFile(file)
}

const isOwn = (msg: MessageDTO) => msg.authorId === currentUserUuid

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

const truncate = (text: string, max = 60) => (text.length > max ? text.slice(0, max) + '…' : text)

const formatMessage = (content: string) =>
  content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>')

const scrollToMessage = (uuid: string) => {
  document.getElementById(`msg-${uuid}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}
</script>

<template>
  <div class="flex h-full flex-col">
    <div ref="messagesEl" class="flex max-w-full flex-1 flex-col gap-0.5 overflow-y-auto px-4 py-3">
      <div v-if="hasMore" class="flex justify-center py-2">
        <button class="btn btn-ghost btn-sm" :disabled="isLoadingMore" @click="loadMore">
          <span v-if="isLoadingMore" class="loading loading-spinner loading-xs"></span>
          Charger les messages précédents
        </button>
      </div>

      <div v-if="isLoading" class="flex flex-1 items-center justify-center">
        <span class="loading loading-dots loading-md"></span>
      </div>

      <p
        v-else-if="messages.length === 0"
        class="flex flex-1 items-center justify-center text-sm text-base-content/50"
      >
        Aucun message. Soyez le premier à écrire !
      </p>

      <template v-else>
        <div
          v-for="msg in messages"
          :key="msg.uuid"
          :id="`msg-${msg.uuid}`"
          class="group chat chat-start"
        >
          <div class="chat-image avatar pb-4 pr-1">
            <div class="w-8 rounded-full">
              <img
                :src="`https://api.dicebear.com/10.x/dylan/svg?skinColor=c061cb&backgroundColor=619eff,29e051,f6d32d&moodVariant=confused,happy,hopeful,neutral,superHappy&facialHairProbability=0&hairColorFill=radial&hairColor=000000,1d5dff,ff543d,ffffff&seed=${encodeURIComponent(msg.authorName)}`"
                :alt="msg.authorName"
              />
            </div>
          </div>
          <div class="min-w-0 max-w-full">
            <div class="chat-header mb-0.5 text-xs opacity-60">
              {{ msg.authorName }}
              <time class="ml-1">{{ formatTime(msg.createdAt) }}</time>
            </div>
            <div
              v-if="msg.state === 'deleted'"
              class="chat-bubble chat-bubble-neutral text-sm italic opacity-50"
            >
              Message supprimé
            </div>

            <!-- Editing inline -->
            <div v-else-if="editingUuid === msg.uuid" class="flex w-full max-w-sm flex-col gap-1">
              <input
                v-model="editText"
                class="input input-sm input-bordered w-full"
                :disabled="isSavingEdit"
                @keydown="(e) => onEditKeydown(e, msg)"
              />
              <div class="flex justify-end gap-1 text-xs">
                <button class="btn btn-ghost btn-xs" @click="cancelEdit">Annuler</button>
                <button
                  class="btn btn-primary btn-xs"
                  :disabled="!editText.trim() || isSavingEdit"
                  @click="saveEdit(msg)"
                >
                  <span v-if="isSavingEdit" class="loading loading-spinner loading-xs"></span>
                  <span v-else>Sauvegarder</span>
                </button>
              </div>
            </div>

            <template v-else>
              <div class="chat-bubble space-y-1.5 break-words max-w-full">
                <div
                  v-if="msg.answerTo && messageMap.get(msg.answerTo)"
                  class="cursor-pointer rounded border-l-2 border-current/40 bg-black/10 px-2 py-1 text-xs opacity-70 transition-opacity hover:opacity-100"
                  @click="scrollToMessage(msg.answerTo!)"
                >
                  <span class="font-semibold">{{ messageMap.get(msg.answerTo)!.authorName }}</span>
                  <span class="ml-1">{{
                    truncate(messageMap.get(msg.answerTo)!.content.value)
                  }}</span>
                </div>
                <FileMessage
                  v-if="msg.content.type === 'file'"
                  :room-uuid="roomUuid"
                  :object-name="msg.content.value"
                />
                <span v-else>
                  <span v-html="formatMessage(msg.content.value)"></span>
                  <span v-if="msg.state === 'updated'" class="ml-1 text-xs opacity-60"
                    >(modifié)</span
                  >
                </span>
              </div>

              <!-- Actions on hover -->
              <div
                class="chat-footer mt-0.5 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100"
              >
                <button class="btn btn-ghost btn-xs" title="Répondre" @click="startReply(msg)">
                  <Reply :size="14" />
                </button>
                <template v-if="isOwn(msg)">
                  <button
                    v-if="msg.content.type === 'text'"
                    class="btn btn-ghost btn-xs"
                    title="Modifier"
                    @click="startEdit(msg)"
                  >
                    <Pencil :size="14" />
                  </button>
                  <button
                    class="btn btn-ghost btn-xs text-error"
                    title="Supprimer"
                    @click="confirmDelete(msg)"
                  >
                    <Trash2 :size="14" />
                  </button>
                </template>
              </div>
            </template>
          </div>
        </div>
      </template>
    </div>

    <div
      v-if="typingText"
      class="flex h-4 items-center gap-1 px-4 text-xs italic text-base-content/50"
    >
      <span>{{ typingText }}</span>
      <span class="loading loading-dots loading-xs"></span>
    </div>

    <div class="border-t border-base-300 bg-base-100 px-4 py-3">
      <div v-if="error" role="alert" class="alert alert-error alert-soft mb-2 py-2 text-sm">
        <span>{{ error }}</span>
        <button class="btn btn-ghost btn-xs" @click="error = null"><X :size="14" /></button>
      </div>

      <!-- Reply preview -->
      <div
        v-if="replyingTo"
        class="mb-2 flex items-center gap-2 rounded border-l-2 border-primary bg-base-200 px-3 py-1.5 text-sm"
      >
        <span class="flex-1 text-base-content/70">
          <span class="font-semibold text-base-content">{{ replyingTo.authorName }}</span>
          <span class="ml-1">{{ truncate(replyingTo.content.value) }}</span>
        </span>
        <button class="btn btn-ghost btn-xs" @click="replyingTo = null"><X :size="14" /></button>
      </div>

      <div class="flex items-end gap-2">
        <input ref="fileInputEl" type="file" class="hidden" @change="onFileChange" />
        <button
          class="btn btn-ghost btn-square"
          :disabled="isUploadingFile"
          title="Envoyer un fichier"
          @click="fileInputEl?.click()"
        >
          <span v-if="isUploadingFile" class="loading loading-spinner loading-sm"></span>
          <Paperclip v-else :size="18" />
        </button>
        <textarea
          ref="inputEl"
          v-model="newMessage"
          rows="1"
          class="textarea flex-1 resize-none overflow-y-auto leading-normal"
          style="min-height: unset; max-height: 8rem"
          :placeholder="replyingTo ? `Répondre à ${replyingTo.authorName}…` : 'Écrire un message…'"
          :disabled="isSending"
          @keydown="onKeydown"
          @input="onInput"
        />
        <button class="btn btn-primary" :disabled="!newMessage.trim() || isSending" @click="send">
          <span v-if="isSending" class="loading loading-spinner loading-sm"></span>
          <span v-else>Envoyer</span>
        </button>
      </div>
    </div>
  </div>
</template>
