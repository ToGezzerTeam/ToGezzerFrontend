import { HTTPError } from 'ky'
import { messageApi } from '@/api/client'
import { MessagesPageSchema, type MessagesPageResponseDto } from '@/api/guards/message.guards'
import type { MessagesPageRequestOptions } from '@/api/types/messages'

export async function fetchMessagesPage(
  roomId: string,
  options: MessagesPageRequestOptions = {},
): Promise<MessagesPageResponseDto> {
  const normalizedRoomId = roomId.trim()
  if (!normalizedRoomId) throw new Error('Le roomId est requis.')

  try {
    const data = await messageApi
      .get(encodeURIComponent(normalizedRoomId), {
        signal: options.signal,
        searchParams: {
          ...(options.messageUuid?.trim() && { messageUuid: options.messageUuid.trim() }),
          ...(options.pageSize != null && { pageSize: Math.max(1, Math.trunc(options.pageSize)) }),
        },
      })
      .json()

    return MessagesPageSchema.parse(data)
  } catch (err) {
    if (err instanceof HTTPError) {
      throw new Error(
        `Impossible de charger les messages du salon "${roomId}" : ${err.response.status} ${err.response.statusText}`,
      )
    }
    throw err
  }
}
