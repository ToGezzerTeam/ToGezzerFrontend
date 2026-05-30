import { API_BASE_URL, apiClient, handleHttpError } from '@/api/client.ts'
import {
  type JoinRoomDTO,
  type RenameRoomDTO,
  type RoomDTO,
  RoomDTOSchema,
} from '@/api/types/room.ts'

const roomApi = apiClient.extend({ prefix:`${API_BASE_URL}/api/rooms` })

export async function createRoom(
  body: Omit<RoomDTO, 'id' | 'uuid' | 'createdAt'>,
): Promise<RoomDTO> {
  try {
    return RoomDTOSchema.parse(await apiClient.post('rooms',{ json: body }).json())
  } catch (err) {
    return handleHttpError(err, 'Impossible de créer le salon')
  }
}

export async function joinRoom(roomUuid: string, body?: JoinRoomDTO): Promise<void> {
  try {
    await roomApi.post(`${encodeURIComponent(roomUuid)}/join`, {
      json: body ?? { roomUuid },
    })
  } catch (err) {
    return handleHttpError(err, `Impossible de rejoindre le salon "${roomUuid}"`)
  }
}

export async function renameRoom(roomUuid: string, body: RenameRoomDTO): Promise<void> {
  try {
    await roomApi.patch(`${encodeURIComponent(roomUuid)}`, { json: body })
  } catch (err) {
    return handleHttpError(err, `Impossible de renommer le salon "${roomUuid}"`)
  }
}
