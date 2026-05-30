import type { MessageDTO } from '@/api/guards/message.guards.ts'

export const sortMessagesChronologically = (messages: MessageDTO[]): MessageDTO[] =>
  [...messages].sort((a, b) => {
    const diff = Date.parse(a.createdAt) - Date.parse(b.createdAt)
    return diff !== 0 ? diff : a.uuid.localeCompare(b.uuid, 'fr')
  })
