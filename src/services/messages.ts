import {
  CONTENT_TYPES,
  DEFAULT_MESSAGE_PAGE_SIZE,
  MESSAGE_STATES,
  type ContentDTO,
  type MessageDTO,
  type MessagesPageRequestOptions,
  type MessagesPageResponseDto,
} from '@/types/messages'

const DEFAULT_API_BASE_URL = 'http://localhost:8080'

const normalizeBaseUrl = (baseUrl?: string) => {
  const resolvedBaseUrl = baseUrl ?? import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL
  return resolvedBaseUrl.replace(/\/+$/, '')
}

const normalizePageSize = (pageSize?: number) => {
  if (!Number.isFinite(pageSize)) {
    return DEFAULT_MESSAGE_PAGE_SIZE
  }

  return Math.max(1, Math.trunc(pageSize ?? DEFAULT_MESSAGE_PAGE_SIZE))
}

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null
}

const isString = (value: unknown): value is string => typeof value === 'string'

const isContentDTO = (value: unknown): value is ContentDTO => {
  return (
    isRecord(value) &&
    CONTENT_TYPES.includes(value.type as (typeof CONTENT_TYPES)[number]) &&
    isString(value.value)
  )
}

const isMessageDTO = (value: unknown): value is MessageDTO => {
  return (
    isRecord(value) &&
    isString(value.uuid) &&
    isString(value.roomId) &&
    isString(value.authorId) &&
    (value.answerTo === undefined || value.answerTo === null || isString(value.answerTo)) &&
    isContentDTO(value.content) &&
    MESSAGE_STATES.includes(value.state as (typeof MESSAGE_STATES)[number]) &&
    isString(value.createdAt) &&
    (value.updatedAt === undefined || value.updatedAt === null || isString(value.updatedAt)) &&
    (value.deletedAt === undefined || value.deletedAt === null || isString(value.deletedAt)) &&
    (value.deletedBy === undefined || value.deletedBy === null || isString(value.deletedBy))
  )
}

const isMessagesPageResponseDto = (value: unknown): value is MessagesPageResponseDto => {
  return (
    isRecord(value) &&
    Array.isArray(value.messageDTOS) &&
    value.messageDTOS.every(isMessageDTO) &&
    typeof value.hasMore === 'boolean'
  )
}

const formatRequestError = (roomId: string, message: string) => {
  return `Impossible de charger les messages du salon "${roomId}" : ${message}`
}

export const buildMessagesUrl = (
  roomId: string,
  options: Pick<MessagesPageRequestOptions, 'baseUrl' | 'messageUuid' | 'pageSize'> = {},
) => {
  const normalizedRoomId = roomId.trim()

  if (!normalizedRoomId) {
    throw new Error('Le roomId est requis.')
  }

  const url = new URL(`/api/messages/${encodeURIComponent(normalizedRoomId)}`, normalizeBaseUrl(options.baseUrl))

  if (options.messageUuid?.trim()) {
    url.searchParams.set('messageUuid', options.messageUuid.trim())
  }

  url.searchParams.set('pageSize', String(normalizePageSize(options.pageSize)))
  return url.toString()
}

export async function fetchMessagesPage(
  roomId: string,
  options: MessagesPageRequestOptions = {},
): Promise<MessagesPageResponseDto> {
  const url = buildMessagesUrl(roomId, options)
  const response = await fetch(url, {
    method: 'GET',
    signal: options.signal,
    headers: {
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    const fallbackMessage = `${response.status} ${response.statusText}`.trim()

    throw new Error(formatRequestError(roomId, fallbackMessage || 'réponse invalide'))
  }

  const data: unknown = await response.json()

  if (!isMessagesPageResponseDto(data)) {
    throw new Error(formatRequestError(roomId, 'format de réponse invalide'))
  }

  return data
}

export const sortMessagesChronologically = (messages: MessageDTO[]) => {
  return [...messages].sort((firstMessage, secondMessage) => {
    const firstTimestamp = Date.parse(firstMessage.createdAt)
    const secondTimestamp = Date.parse(secondMessage.createdAt)

    if (firstTimestamp !== secondTimestamp) {
      return firstTimestamp - secondTimestamp
    }

    return firstMessage.uuid.localeCompare(secondMessage.uuid, 'fr')
  })
}

