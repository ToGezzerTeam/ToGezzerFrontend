import {
  type CreateMessageDTO,
  CreateMessageDTOSchema,
  type MessagesPageResponseDto,
  MessagesPageResponseDtoSchema,
  type UpdateMessageDTO,
  UpdateMessageDTOSchema,
} from '@/api/types/messages.ts'
import { apiClient, handleHttpError } from '@/api/client.ts'
import { z } from 'zod'

const messageApi = apiClient.extend({ prefix: 'messages' })


export async function fetchMessagesPage(
  roomUuid: string,
  options: {
    lastMessageUuid?: string
    pageSize?: number
    signal?: AbortSignal
  } = {},
): Promise<MessagesPageResponseDto> {
  const normalizedRoomUuid = roomUuid.trim()
  if (!normalizedRoomUuid) throw new Error('Le roomUuid est requis.')

  try {
    const data = await messageApi
      .get(encodeURIComponent(normalizedRoomUuid), {
        signal: options.signal,
        searchParams: {
          ...(options.lastMessageUuid?.trim() && {
            lastMessageUuid: options.lastMessageUuid.trim(),
          }),
          ...(options.pageSize != null && { pageSize: Math.max(1, Math.trunc(options.pageSize)) }),
        },
      })
      .json()

    return MessagesPageResponseDtoSchema.parse(data)
  } catch (err) {
    return handleHttpError(err, `Impossible de charger les messages du salon "${roomUuid}"`)
  }
}

export async function createMessage(roomUuid: string, body: CreateMessageDTO): Promise<void> {
  try {
    await messageApi.post(encodeURIComponent(roomUuid), {
      json: CreateMessageDTOSchema.parse(body),
    })
  } catch (err) {
    return handleHttpError(err, `Impossible de créer le message dans le salon "${roomUuid}"`)
  }
}

export async function updateMessage(
  roomUuid: string,
  messageUuid: string,
  body: UpdateMessageDTO,
): Promise<void> {
  try {
    await messageApi.patch(`${encodeURIComponent(roomUuid)}/${encodeURIComponent(messageUuid)}`, {
      json: UpdateMessageDTOSchema.parse(body),
    })
  } catch (err) {
    return handleHttpError(err, `Impossible de modifier le message "${messageUuid}"`)
  }
}

export async function deleteMessage(roomUuid: string, messageUuid: string): Promise<void> {
  try {
    await messageApi.delete(`${encodeURIComponent(roomUuid)}/${encodeURIComponent(messageUuid)}`)
  } catch (err) {
    return handleHttpError(err, `Impossible de supprimer le message "${messageUuid}"`)
  }
}

export async function uploadFile(roomUuid: string, file: File | Blob): Promise<void> {
  const formData = new FormData()
  formData.append('file', file)

  try {
    await apiClient.post(`messages/${encodeURIComponent(roomUuid)}/files`, {
      body: formData,
    })
  } catch (err) {
    return handleHttpError(err, `Impossible d’envoyer le fichier dans le salon "${roomUuid}"`)
  }
}

export async function getFileUrl(
  roomUuid: string,
  objectName: string,
  userUuid: string,
): Promise<string> {
  try {
    return z.string().parse(
      await apiClient
        .get(`messages/${encodeURIComponent(roomUuid)}/files/${encodeURIComponent(objectName)}`, {
          searchParams: { userUuid },
        })
        .json(),
    )
  } catch (err) {
    return handleHttpError(err, `Impossible de charger le fichier "${objectName}"`)
  }
}

export async function deleteFile(
  roomUuid: string,
  objectName: string,
  messageUuid: string,
): Promise<void> {
  try {
    await apiClient.delete(
      `messages/${encodeURIComponent(roomUuid)}/files/${encodeURIComponent(objectName)}`,
      {
        searchParams: { messageUuid },
      },
    )
  } catch (err) {
    return handleHttpError(err, `Impossible de supprimer le fichier "${objectName}"`)
  }
}
