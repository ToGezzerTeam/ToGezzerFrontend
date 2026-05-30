import {
  type DetailServerDto,
  DetailServerDtoSchema,
  type JoinServerDTO,
  type RenameServerDTO,
  type ServerDTO,
  ServerDTOSchema,
} from '@/api/types/server.ts'
import { apiClient, handleHttpError } from '@/api/client.ts'


const serverApi = apiClient.extend({ prefix: 'servers' })
export async function createServer(
  body: Omit<ServerDTO, 'id' | 'uuid' | 'createdAt'>,
): Promise<ServerDTO> {
  try {
    return ServerDTOSchema.parse(await serverApi.post('', { json: body }).json())
  } catch (err) {
    return handleHttpError(err, 'Impossible de créer le serveur')
  }
}

export async function joinServer(serverUuid: string, body?: JoinServerDTO): Promise<void> {
  try {
    await serverApi.post(`${encodeURIComponent(serverUuid)}/join`, {
      json: body ?? { serverUuid },
    })
  } catch (err) {
    return handleHttpError(err, `Impossible de rejoindre le serveur "${serverUuid}"`)
  }
}

export async function getServer(serverUuid: string): Promise<ServerDTO> {
  try {
    return ServerDTOSchema.parse(await serverApi.get(`${encodeURIComponent(serverUuid)}`).json())
  } catch (err) {
    return handleHttpError(err, `Impossible de charger le serveur "${serverUuid}"`)
  }
}

export async function getServerDetail(serverUuid: string): Promise<DetailServerDto> {
  try {
    return DetailServerDtoSchema.parse(
      await serverApi.get(`${encodeURIComponent(serverUuid)}/detail`).json(),
    )
  } catch (err) {
    return handleHttpError(err, `Impossible de charger le détail du serveur "${serverUuid}"`)
  }
}

export async function renameServer(serverUuid: string, body: RenameServerDTO): Promise<void> {
  try {
    await serverApi.patch(`${encodeURIComponent(serverUuid)}/rename`, { json: body })
  } catch (err) {
    return handleHttpError(err, `Impossible de renommer le serveur "${serverUuid}"`)
  }
}
