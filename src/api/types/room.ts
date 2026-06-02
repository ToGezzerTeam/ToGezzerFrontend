import { z } from 'zod'

export const CHANNEL_TYPES = ['TEXT', 'VOICE'] as const
export const RoomDTOSchema = z.object({
  id: z.number().int().nullable().optional(),
  uuid: z.uuid().nullable().optional(),
  name: z.string().nullable().optional(),
  channelType: z.enum(CHANNEL_TYPES),
  createdAt: z.iso.datetime().nullable().optional(),
  serverId: z.number().int().nullable().optional(),
})

export const JoinRoomDTOSchema = z.object({
  roomUuid: z.uuid().nullable().optional(),
})

export const RenameRoomDTOSchema = z.object({
  name: z.string().min(0).max(255),
})

export type RoomDTO = z.infer<typeof RoomDTOSchema>
export type JoinRoomDTO = z.infer<typeof JoinRoomDTOSchema>
export type RenameRoomDTO = z.infer<typeof RenameRoomDTOSchema>
