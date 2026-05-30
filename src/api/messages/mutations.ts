// src/api/messages/mutations.ts
import { HTTPError } from 'ky'
import { messageApi } from '@/api/client'
import type { CreateMessageDTO, UpdateMessageDTO, DeleteMessageDTO } from '@/api/guards/message.guards'

const messagePath = (roomUuid: string, messageUuid: string) =>
  `${encodeURIComponent(roomUuid)}/${encodeURIComponent(messageUuid)}`

const handleHttpError = (err: unknown, context: string): never => {
  if (err instanceof HTTPError) {
    throw new Error(`${context} : ${err.response.status} ${err.response.statusText}`)
  }
  throw err
}

export const createMessage = async (roomUuid: string, body: CreateMessageDTO): Promise<void> => {
  try {
    await messageApi.post(encodeURIComponent(roomUuid), { json: body })
  } catch (err) {
    handleHttpError(err, `Impossible de créer le message dans le salon "${roomUuid}"`)
  }
}

export const updateMessage = async (
  roomUuid: string,
  messageUuid: string,
  body: UpdateMessageDTO,
): Promise<void> => {
  try {
    await messageApi.patch(messagePath(roomUuid, messageUuid), { json: body })
  } catch (err) {
    handleHttpError(err, `Impossible de modifier le message "${messageUuid}"`)
  }
}

export const deleteMessage = async (
  roomUuid: string,
  messageUuid: string,
  body: DeleteMessageDTO,
): Promise<void> => {
  try {
    await messageApi.delete(messagePath(roomUuid, messageUuid), { json: body })
  } catch (err) {
    handleHttpError(err, `Impossible de supprimer le message "${messageUuid}"`)
  }
}
