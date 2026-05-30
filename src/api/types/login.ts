import { z } from 'zod'

export const JwtPayloadSchema = z.object({
  id: z.number().int().nullable().optional(),
  uuid: z.uuid().nullable().optional(),
  email: z.string().nullable().optional(),
  username: z.string().nullable().optional(),
})

export const UserResponseSchema = z.object({
  id: z.number().int().nullable().optional(),
  uuid: z.uuid().nullable().optional(),
  email: z.string().nullable().optional(),
  username: z.string().nullable().optional(),
})

export const LoginResponseSchema = z.object({
  token: z.string(),
  payload: JwtPayloadSchema,
  user: UserResponseSchema,
})

export const LoginRequestSchema = z.object({
  email: z.string(),
  password: z.string(),
})

export const RegisterRequestSchema = z.object({
  email: z.string(),
  password: z.string().min(6).max(255),
  username: z.string().min(3).max(100),
})

export type JwtPayload = z.infer<typeof JwtPayloadSchema>
export type UserResponse = z.infer<typeof UserResponseSchema>
export type LoginResponse = z.infer<typeof LoginResponseSchema>
export type LoginRequest = z.infer<typeof LoginRequestSchema>
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>

