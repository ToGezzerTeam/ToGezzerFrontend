import { z } from 'zod'
import { RoomDTOSchema } from '@/api/types/room.ts'

export const ServerDTOSchema = z.object({
  id: z.number().int().nullable().optional(),
  uuid: z.uuid().nullable().optional(),
  createdAt: z.iso.datetime().nullable().optional(),
  createdBy: z.string(),
  name: z.string(),
  logo: z.string(),
  background: z.string(),
  public: z.boolean(),
})

export const JoinServerDTOSchema = z.object({
  serverUuid: z.uuid().nullable().optional(),
})

export const RenameServerDTOSchema = z.object({
  name: z.string().min(0).max(255),
})

export const UserDtoSchema = z.object({
  uuid: z.uuid().nullable().optional(),
  username: z.string().nullable().optional(),
})

export const DetailServerDtoSchema = z.object({
  serverId: z.number().int().nullable().optional(),
  roomDTOS: z.array(RoomDTOSchema).nullable().optional(),
  userDtos: z.array(UserDtoSchema).nullable().optional(),
})

export type ServerDTO = z.infer<typeof ServerDTOSchema>
export type JoinServerDTO = z.infer<typeof JoinServerDTOSchema>
export type UserDto = z.infer<typeof UserDtoSchema>
export type DetailServerDto = z.infer<typeof DetailServerDtoSchema>
export type RenameServerDTO = z.infer<typeof RenameServerDTOSchema>
