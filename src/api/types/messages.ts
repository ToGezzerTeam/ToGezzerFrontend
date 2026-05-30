export const MESSAGE_STATES = ['created', 'updated', 'deleted'] as const
export const CONTENT_TYPES = ['text'] as const

export type MessageState = (typeof MESSAGE_STATES)[number]
export type ContentType = (typeof CONTENT_TYPES)[number]

export type ContentDTO = {
  type: ContentType
  value: string
}

export type MessageDTO = {
  uuid: string
  roomId: string
  authorId: string
  content: ContentDTO
  state: MessageState
  createdAt: string
  answerTo?: string | null
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
