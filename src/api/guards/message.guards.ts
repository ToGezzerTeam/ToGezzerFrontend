import { z } from 'zod'
import { CONTENT_TYPES, MESSAGE_STATES } from '@/api/types/messages.ts'

const ContentSchema = z.object({
  type: z.enum(CONTENT_TYPES),
  value: z.string(),
})

const MessageSchema = z.object({
  uuid: z.string(),
  roomId: z.string(),
  authorId: z.string(),
  content: ContentSchema,
  state: z.enum(MESSAGE_STATES),
  createdAt: z.string(),
  answerTo: z.string().nullish(),
  updatedAt: z.string().nullish(),
  deletedAt: z.string().nullish(),
  deletedBy: z.string().nullish(),
})

export const CreateMessageSchema = z.object({
  userUuid: z.string().uuid(),
  message: z.string().min(1),
  answerTo: z.string().uuid().nullish(),
})

export const UpdateMessageSchema = z.object({
  userUuid: z.string().uuid(),
  message: z.string().min(1),
})

export const DeleteMessageSchema = z.object({
  userUuid: z.string().uuid(),
})

export type CreateMessageDTO = z.infer<typeof CreateMessageSchema>
export type UpdateMessageDTO = z.infer<typeof UpdateMessageSchema>
export type DeleteMessageDTO = z.infer<typeof DeleteMessageSchema>

export const MessagesPageSchema = z.object({
  messageDTOS: z.array(MessageSchema),
  hasMore: z.boolean(),
})

export type MessageDTO = z.infer<typeof MessageSchema>
export type MessagesPageResponseDto = z.infer<typeof MessagesPageSchema>
