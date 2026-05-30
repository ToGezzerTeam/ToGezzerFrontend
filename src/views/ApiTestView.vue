<script setup lang="ts">
import { ref } from 'vue'
import { login, register } from '@/api/route/login'
import {
  createMessage,
  deleteFile,
  deleteMessage,
  fetchMessagesPage,
  getFileUrl,
  updateMessage,
  uploadFile,
} from '@/api/route/message'
import { createRoom, joinRoom, renameRoom } from '@/api/route/room'
import {
  createServer,
  getServer,
  getServerDetail,
  joinServer,
  renameServer,
} from '@/api/route/server'

const isBusy = ref(false)
const output = ref<string>('')

const setOutput = (title: string, payload: unknown) => {
  output.value = `${title}\n${JSON.stringify(payload, null, 2)}`
}

const setError = (title: string, error: unknown) => {
  const message = error instanceof Error ? error.message : String(error)
  output.value = `${title}\nErreur: ${message}`
}

const runAction = async (title: string, action: () => Promise<unknown>) => {
  if (isBusy.value) return
  isBusy.value = true
  output.value = `${title}\nEn cours...`

  try {
    const result = await action()
    setOutput(title, result ?? { ok: true })
  } catch (error) {
    setError(title, error)
  } finally {
    isBusy.value = false
  }
}

const loginEmail = ref('')
const loginPassword = ref('')
const registerEmail = ref('')
const registerPassword = ref('')
const registerUsername = ref('')

const serverCreatedBy = ref('')
const serverName = ref('')
const serverLogo = ref('')
const serverBackground = ref('')
const serverPublic = ref(true)
const serverUuid = ref('')
const serverRename = ref('')

const roomName = ref('')
const roomChannelType = ref<'TEXT' | 'VOICE'>('TEXT')
const roomServerId = ref('')
const roomUuid = ref('')
const roomRename = ref('')

const messageRoomUuid = ref('')
const messageContent = ref('')
const messageAnswerTo = ref('')
const messageUuid = ref('')
const fetchLastMessageUuid = ref('')
const fetchPageSize = ref('')

const fileRoomUuid = ref('')
const fileObjectName = ref('')
const fileMessageUuid = ref('')
const fileUserUuid = ref('')
const uploadFileInput = ref<File | null>(null)

const toOptionalNumber = (value: string): number | undefined => {
  const trimmed = value.trim()
  if (!trimmed) return undefined
  const parsed = Number(trimmed)
  return Number.isFinite(parsed) ? parsed : undefined
}

const onFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement | null
  uploadFileInput.value = target?.files?.[0] ?? null
}
</script>

<template>
  <section class="min-h-screen bg-base-200 px-4 py-8">
    <div class="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 class="text-3xl font-semibold">Tests API HTTP</h1>
          <p class="text-sm text-base-content/70">Teste les routes login, message, room et server.</p>
        </div>
        <div class="badge badge-outline">Etat: {{ isBusy ? 'En cours' : 'Pret' }}</div>
      </div>

      <div class="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div class="space-y-6">
          <div class="card card-border bg-base-100 shadow-sm">
            <div class="card-body space-y-4">
              <h2 class="card-title">Auth</h2>
              <div class="grid gap-4 md:grid-cols-2">
                <div class="space-y-2">
                  <p class="text-sm font-medium">Login</p>
                  <input v-model="loginEmail" class="input input-bordered w-full" type="email" placeholder="email" />
                  <input
                    v-model="loginPassword"
                    class="input input-bordered w-full"
                    type="password"
                    placeholder="password"
                  />
                  <button
                    class="btn btn-primary w-full"
                    type="button"
                    :disabled="isBusy"
                    @click="runAction('Login', () => login({ email: loginEmail, password: loginPassword }))"
                  >
                    Lancer login
                  </button>
                </div>
                <div class="space-y-2">
                  <p class="text-sm font-medium">Register</p>
                  <input v-model="registerEmail" class="input input-bordered w-full" type="email" placeholder="email" />
                  <input
                    v-model="registerPassword"
                    class="input input-bordered w-full"
                    type="password"
                    placeholder="password"
                  />
                  <input
                    v-model="registerUsername"
                    class="input input-bordered w-full"
                    type="text"
                    placeholder="username"
                  />
                  <button
                    class="btn btn-secondary w-full"
                    type="button"
                    :disabled="isBusy"
                    @click="
                      runAction('Register', () =>
                        register({
                          email: registerEmail,
                          password: registerPassword,
                          username: registerUsername,
                        }),
                      )
                    "
                  >
                    Lancer register
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="card card-border bg-base-100 shadow-sm">
            <div class="card-body space-y-4">
              <h2 class="card-title">Server</h2>
              <div class="grid gap-4 md:grid-cols-2">
                <div class="space-y-2">
                  <p class="text-sm font-medium">Creer un serveur</p>
                  <input v-model="serverCreatedBy" class="input input-bordered w-full" placeholder="createdBy" />
                  <input v-model="serverName" class="input input-bordered w-full" placeholder="name" />
                  <input v-model="serverLogo" class="input input-bordered w-full" placeholder="logo url" />
                  <input v-model="serverBackground" class="input input-bordered w-full" placeholder="background url" />
                  <label class="label cursor-pointer justify-start gap-3">
                    <input v-model="serverPublic" type="checkbox" class="checkbox checkbox-sm" />
                    <span class="label-text">Public</span>
                  </label>
                  <button
                    class="btn btn-primary w-full"
                    type="button"
                    :disabled="isBusy"
                    @click="
                      runAction('Create server', () =>
                        createServer({
                          createdBy: serverCreatedBy,
                          name: serverName,
                          logo: serverLogo,
                          background: serverBackground,
                          public: serverPublic,
                        }),
                      )
                    "
                  >
                    Creer
                  </button>
                </div>
                <div class="space-y-2">
                  <p class="text-sm font-medium">Actions serveur</p>
                  <input v-model="serverUuid" class="input input-bordered w-full" placeholder="serverUuid" />
                  <input v-model="serverRename" class="input input-bordered w-full" placeholder="nouveau nom" />
                  <div class="grid gap-2">
                    <button
                      class="btn btn-outline"
                      type="button"
                      :disabled="isBusy"
                      @click="runAction('Join server', () => joinServer(serverUuid))"
                    >
                      Join
                    </button>
                    <button
                      class="btn btn-outline"
                      type="button"
                      :disabled="isBusy"
                      @click="runAction('Rename server', () => renameServer(serverUuid, { name: serverRename }))"
                    >
                      Rename
                    </button>
                    <button
                      class="btn btn-outline"
                      type="button"
                      :disabled="isBusy"
                      @click="runAction('Get server', () => getServer(serverUuid))"
                    >
                      Get server
                    </button>
                    <button
                      class="btn btn-outline"
                      type="button"
                      :disabled="isBusy"
                      @click="runAction('Get server detail', () => getServerDetail(serverUuid))"
                    >
                      Get detail
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="card card-border bg-base-100 shadow-sm">
            <div class="card-body space-y-4">
              <h2 class="card-title">Room</h2>
              <div class="grid gap-4 md:grid-cols-2">
                <div class="space-y-2">
                  <p class="text-sm font-medium">Creer un salon</p>
                  <input v-model="roomName" class="input input-bordered w-full" placeholder="name" />
                  <select v-model="roomChannelType" class="select select-bordered w-full">
                    <option value="TEXT">TEXT</option>
                    <option value="VOICE">VOICE</option>
                  </select>
                  <input
                    v-model="roomServerId"
                    class="input input-bordered w-full"
                    placeholder="serverId (optionnel)"
                  />
                  <button
                    class="btn btn-primary w-full"
                    type="button"
                    :disabled="isBusy"
                    @click="
                      runAction('Create room', () =>
                        createRoom({
                          name: roomName || undefined,
                          channelType: roomChannelType,
                          serverId: toOptionalNumber(roomServerId),
                        }),
                      )
                    "
                  >
                    Creer
                  </button>
                </div>
                <div class="space-y-2">
                  <p class="text-sm font-medium">Actions salon</p>
                  <input v-model="roomUuid" class="input input-bordered w-full" placeholder="roomUuid" />
                  <input v-model="roomRename" class="input input-bordered w-full" placeholder="nouveau nom" />
                  <div class="grid gap-2">
                    <button
                      class="btn btn-outline"
                      type="button"
                      :disabled="isBusy"
                      @click="runAction('Join room', () => joinRoom(roomUuid))"
                    >
                      Join
                    </button>
                    <button
                      class="btn btn-outline"
                      type="button"
                      :disabled="isBusy"
                      @click="runAction('Rename room', () => renameRoom(roomUuid, { name: roomRename }))"
                    >
                      Rename
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="card card-border bg-base-100 shadow-sm">
            <div class="card-body space-y-4">
              <h2 class="card-title">Message</h2>
              <div class="grid gap-4 md:grid-cols-2">
                <div class="space-y-2">
                  <p class="text-sm font-medium">Historique</p>
                  <input
                    v-model="messageRoomUuid"
                    class="input input-bordered w-full"
                    placeholder="roomUuid"
                  />
                  <input
                    v-model="fetchLastMessageUuid"
                    class="input input-bordered w-full"
                    placeholder="lastMessageUuid (optionnel)"
                  />
                  <input v-model="fetchPageSize" class="input input-bordered w-full" placeholder="pageSize" />
                  <button
                    class="btn btn-outline w-full"
                    type="button"
                    :disabled="isBusy"
                    @click="
                      runAction('Fetch messages', () =>
                        fetchMessagesPage(messageRoomUuid, {
                          lastMessageUuid: fetchLastMessageUuid || undefined,
                          pageSize: toOptionalNumber(fetchPageSize),
                        }),
                      )
                    "
                  >
                    Charger
                  </button>
                </div>
                <div class="space-y-2">
                  <p class="text-sm font-medium">Creer un message</p>
                  <input
                    v-model="messageRoomUuid"
                    class="input input-bordered w-full"
                    placeholder="roomUuid"
                  />
                  <input v-model="messageContent" class="input input-bordered w-full" placeholder="message" />
                  <input
                    v-model="messageAnswerTo"
                    class="input input-bordered w-full"
                    placeholder="answerTo (optionnel)"
                  />
                  <button
                    class="btn btn-primary w-full"
                    type="button"
                    :disabled="isBusy"
                    @click="
                      runAction('Create message', () =>
                        createMessage(messageRoomUuid, {
                          message: messageContent,
                          answerTo: messageAnswerTo || undefined,
                        }),
                      )
                    "
                  >
                    Envoyer
                  </button>
                </div>
              </div>

              <div class="grid gap-4 md:grid-cols-2">
                <div class="space-y-2">
                  <p class="text-sm font-medium">Modifier / Supprimer</p>
                  <input
                    v-model="messageRoomUuid"
                    class="input input-bordered w-full"
                    placeholder="roomUuid"
                  />
                  <input v-model="messageUuid" class="input input-bordered w-full" placeholder="messageUuid" />
                  <input v-model="messageContent" class="input input-bordered w-full" placeholder="message" />
                  <div class="grid gap-2">
                    <button
                      class="btn btn-outline"
                      type="button"
                      :disabled="isBusy"
                      @click="
                        runAction('Update message', () =>
                          updateMessage(messageRoomUuid, messageUuid, { message: messageContent }),
                        )
                      "
                    >
                      Update
                    </button>
                    <button
                      class="btn btn-outline"
                      type="button"
                      :disabled="isBusy"
                      @click="runAction('Delete message', () => deleteMessage(messageRoomUuid, messageUuid))"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div class="space-y-2">
                  <p class="text-sm font-medium">Fichiers</p>
                  <input
                    v-model="fileRoomUuid"
                    class="input input-bordered w-full"
                    placeholder="roomUuid"
                  />
                  <input
                    v-model="fileObjectName"
                    class="input input-bordered w-full"
                    placeholder="objectName"
                  />
                  <input
                    v-model="fileUserUuid"
                    class="input input-bordered w-full"
                    placeholder="userUuid"
                  />
                  <input
                    v-model="fileMessageUuid"
                    class="input input-bordered w-full"
                    placeholder="messageUuid"
                  />
                  <input class="file-input file-input-bordered w-full" type="file" @change="onFileChange" />
                  <div class="grid gap-2">
                    <button
                      class="btn btn-outline"
                      type="button"
                      :disabled="isBusy || !uploadFileInput"
                      @click="runAction('Upload file', () => uploadFile(fileRoomUuid, uploadFileInput!))"
                    >
                      Upload
                    </button>
                    <button
                      class="btn btn-outline"
                      type="button"
                      :disabled="isBusy"
                      @click="runAction('Get file url', () => getFileUrl(fileRoomUuid, fileObjectName, fileUserUuid))"
                    >
                      Get URL
                    </button>
                    <button
                      class="btn btn-outline"
                      type="button"
                      :disabled="isBusy"
                      @click="runAction('Delete file', () => deleteFile(fileRoomUuid, fileObjectName, fileMessageUuid))"
                    >
                      Delete file
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="card card-border bg-base-100 shadow-sm">
          <div class="card-body">
            <h2 class="card-title">Resultat</h2>
            <pre class="min-h-[240px] whitespace-pre-wrap break-words rounded-box bg-base-200 p-4 text-xs">
{{ output || 'Aucun appel pour le moment.' }}
            </pre>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

