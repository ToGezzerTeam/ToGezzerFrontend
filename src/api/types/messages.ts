import { z } from 'zod'

export const MESSAGE_STATES = ['created', 'updated', 'deleted'] as const
export const CONTENT_TYPES = ['text', 'file'] as const

export type MessagesPageRequestOptions = {
  userUuid?: string
  lastMessageUuid?: string
  messageUuid?: string
  pageSize?: number
  signal?: AbortSignal
  baseUrl?: string
}

export const ContentDTOSchema = z.object({
  type: z.enum(CONTENT_TYPES),
  value: z.string(),
})

export const MessageDTOSchema = z.object({
  uuid: z.string(),
  roomId: z.string(),
  authorId: z.string(),
  authorName: z.string(),
  answerTo: z.string().nullable().optional(),
  content: ContentDTOSchema,
  state: z.enum(MESSAGE_STATES),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime().nullable().optional(),
  deletedAt: z.iso.datetime().nullable().optional(),
  deletedBy: z.string().nullable().optional(),
})

export const CreateMessageDTOSchema = z.object({
  message: z.string().min(1),
  answerTo: z.string().nullable().optional(),
})

export const UpdateMessageDTOSchema = z.object({
  message: z.string().min(1),
})


export const MessagesPageResponseDtoSchema = z.object({
  messageDTOS: z.array(MessageDTOSchema),
  hasMore: z.boolean(),
})

export type MessageDTO = z.infer<typeof MessageDTOSchema>
export type CreateMessageDTO = z.infer<typeof CreateMessageDTOSchema>
export type UpdateMessageDTO = z.infer<typeof UpdateMessageDTOSchema>
export type MessagesPageResponseDto = z.infer<typeof MessagesPageResponseDtoSchema>
