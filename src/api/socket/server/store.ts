import { ref } from 'vue'
import { defineStore } from 'pinia'

import { getServer, getServerDetail } from '@/api/route/server'
import { joinServerRoom, leaveServerRoom, type VoiceUserInfo } from '@/api/socket/server/socket'
import type { RoomDTO } from '@/api/types/room'

export type ChannelKind = 'text' | 'voice'

export type ChannelItem = {
  uuid: string
  name: string
  type: ChannelKind
}

const normalizeChannels = (roomDTOS: RoomDTO[] | null | undefined): ChannelItem[] =>
  (roomDTOS ?? [])
    .filter((room): room is RoomDTO & { uuid: string; name: string } => !!room.uuid && !!room.name)
    .map((room) => ({
      uuid: room.uuid,
      name: room.name,
      type: room.channelType === 'TEXT' ? 'text' : 'voice',
    }))

export const ServerStore = defineStore('server', () => {
  const currentServerUuid = ref<string | null>(null)
  const serverId = ref<number | null>(null)
  const serverName = ref<string | null>(null)
  const channels = ref<ChannelItem[]>([])
  const isLoadingChannels = ref(false)
  const loadChannelsError = ref<string | null>(null)

  // Voice users by room UUID
  const voiceUsersByRoom = ref<Map<string, VoiceUserInfo[]>>(new Map())
  let unsubscribeVocalsUpdate: (() => void) | null = null

  const getVoiceUsersForRoom = (roomUuid: string): VoiceUserInfo[] => {
    console.log(
      `[ServerStore] getVoiceUsersForRoom(${roomUuid}) =>`,
      voiceUsersByRoom.value.get(roomUuid) ?? [],
    )
    return voiceUsersByRoom.value.get(roomUuid) ?? []
  }

  const loadServerDetail = async (serverUuid: string) => {
    isLoadingChannels.value = true
    loadChannelsError.value = null

    try {
      if (serverUuid !== currentServerUuid.value) {
        if (currentServerUuid.value) {
          leaveServerRoom(currentServerUuid.value)
          unsubscribeVocalsUpdate?.()
        }

        currentServerUuid.value = serverUuid
        unsubscribeVocalsUpdate = joinServerRoom(serverUuid, (payload) => {
          voiceUsersByRoom.value.set(payload.roomId, payload.users)
        })
      }

      const [detail, server] = await Promise.all([
        getServerDetail(serverUuid),
        getServer(serverUuid),
      ])
      serverId.value = detail.serverId ?? null
      serverName.value = server.name
      channels.value = normalizeChannels(detail.roomDTOS)
    } catch (err) {
      loadChannelsError.value = err instanceof Error ? err.message : 'Erreur inconnue.'
      channels.value = []
      serverId.value = null
      serverName.value = null
    } finally {
      isLoadingChannels.value = false
    }
  }

  const clearServerState = () => {
    serverId.value = null
    serverName.value = null
    channels.value = []
    loadChannelsError.value = null
    isLoadingChannels.value = false
    voiceUsersByRoom.value.clear()

    if (currentServerUuid.value) {
      leaveServerRoom(currentServerUuid.value)
      currentServerUuid.value = null
    }
    unsubscribeVocalsUpdate?.()
    unsubscribeVocalsUpdate = null
  }

  return {
    currentServerUuid,
    serverId,
    serverName,
    channels,
    isLoadingChannels,
    loadChannelsError,
    voiceUsersByRoom,
    loadServerDetail,
    clearServerState,
    getVoiceUsersForRoom,
  }
})
