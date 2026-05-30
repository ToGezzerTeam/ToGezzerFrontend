export const MESSAGE_STATES = ['created', 'updated', 'deleted'] as const
export type MessageState = (typeof MESSAGE_STATES)[number]

export const CONTENT_TYPES = ['text'] as const
export type ContentType = (typeof CONTENT_TYPES)[number]

export type ContentDTO = {
  type: ContentType
  value: string
}

export type MessageDTO = {
  uuid: string
  roomId: string
  authorId: string
  answerTo?: string | null
  content: ContentDTO
  state: MessageState
  createdAt: string
  updatedAt?: string | null
  deletedAt?: string | null
  deletedBy?: string | null
}

export type MessagesPageResponseDto = {
  messageDTOS: MessageDTO[]
  hasMore: boolean
}

export type MessagesPageRequestOptions = {
  messageUuid?: string
  pageSize?: number
  signal?: AbortSignal
  baseUrl?: string
}

export const DEFAULT_MESSAGE_PAGE_SIZE = 100

