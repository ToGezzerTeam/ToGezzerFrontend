import {
  type LoginRequest,
  LoginRequestSchema,
  type LoginResponse,
  LoginResponseSchema,
  type RegisterRequest,
  RegisterRequestSchema,
} from '@/api/types/login.ts'
import { apiClient, handleHttpError } from '@/api/client.ts'

export async function login(body: LoginRequest): Promise<LoginResponse> {
  try {
    const response = LoginResponseSchema.parse(
      await apiClient.post('login', { json: LoginRequestSchema.parse(body) }).json(),
    )
    localStorage.setItem('auth_token', response.token)
    return response
  } catch (err) {
    return handleHttpError(err, 'Impossible de se connecter')
  }
}

export async function register(body: RegisterRequest): Promise<LoginResponse> {
  try {
    const response = LoginResponseSchema.parse(
      await apiClient.post('register', { json: RegisterRequestSchema.parse(body) }).json(),
    )
    localStorage.setItem('auth_token', response.token)
    return response
  } catch (err) {
    return handleHttpError(err, 'Impossible de créer le compte')
  }
}
