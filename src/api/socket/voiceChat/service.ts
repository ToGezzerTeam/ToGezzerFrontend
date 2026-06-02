import { Device, types as mediasoupTypes } from 'mediasoup-client'
import { io, Socket } from 'socket.io-client'
import type {
  RoomUser,
  UserMediaState,
  TransportParams,
  VoiceChatEvent,
  VoiceChatEventMap,
  EventListener,
  ProducerPayload,
  ConsumeResponse,
} from '@/api/types/voiceChat.ts'

export class VoiceChatService {
  private readonly wsUrl: string

  private socket: Socket | null = null
  private device: Device | null = null
  private producerTransport: mediasoupTypes.Transport | null = null
  private consumerTransports = new Map<string, mediasoupTypes.Transport>()
  private producers = new Map<string, mediasoupTypes.Producer>()
  private consumers = new Map<string, mediasoupTypes.Consumer>()
  private audioElements = new Map<string, HTMLAudioElement>()
  private remoteAudioTracks = new Map<string, MediaStreamTrack>()

  private audioContext: AudioContext | null = null
  private localStream: MediaStream | null = null

  private roomId: string | null = null

  private listeners = new Map<string, Set<EventListener>>()

  constructor(wsUrl?: string) {
    this.wsUrl = wsUrl ?? this.resolveWsUrl()
  }

  private resolveWsUrl(): string {
    const env = import.meta.env.VITE_WS_URL
    if (env) return env

    const protocol = window.location.protocol.replace('http', 'ws')
    const port = window.location.port ? `:${window.location.port}` : ''
    return `${protocol}//${window.location.hostname}${port}`
  }

  private emit<E extends VoiceChatEvent>(event: E, data?: VoiceChatEventMap[E]): void {
    this.listeners.get(event)?.forEach((cb) => cb(data))
  }

  on<E extends VoiceChatEvent>(event: E, callback: EventListener<E>): void {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set())
    this.listeners.get(event)!.add(callback as EventListener)
  }

  off<E extends VoiceChatEvent>(event: E, callback: EventListener<E>): void {
    this.listeners.get(event)?.delete(callback as EventListener)
  }

  async connect(roomId: string): Promise<boolean> {
    try {
      this.roomId = roomId

      this.socket = io(`${this.wsUrl}/voice-chat`, {
        transports: ['websocket'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
        auth: {
          token: localStorage.getItem('auth_token'),
        },
      })

      await this.initSocketEvents()
      await this.joinRoom(roomId)

      return true
    } catch (error) {
      this.emit('error', { message: 'Failed to connect to voice chat' })
      return false
    }
  }

  private initSocketEvents(): Promise<void> {
    return new Promise((resolve, reject) => {
      const socket = this.socket
      if (!socket) return reject(new Error('Socket not initialized'))

      socket.on('connect', () => {
        this.emit('connected')
        resolve()
      })

      socket.on('connect_error', (error) => {
        this.emit('error', { message: 'Connection error' })
        reject(error)
      })

      socket.on('joinedVoiceRoom', (data) => this.emit('joinedRoom', data))

      socket.on('userJoined', (data: RoomUser) => {
        this.emit('userJoined', data)
        this.createConsumerTransport(data.socketId)
      })

      socket.on('userLeft', (data) => {
        this.removeConsumer(data.socketId)
        this.emit('userLeft', data)
      })

      socket.on('userMediaStateChanged', (data: UserMediaState) => {
        this.emit('userMediaStateChanged', data)
      })

      socket.on('producerAdded', (producer: ProducerPayload) => {
        this.consumeProducer(producer.socketId, producer)
      })

      socket.on('error', (data) => this.emit('error', data))

      socket.on('disconnect', () => this.emit('disconnected'))
    })
  }

  private joinRoom(roomId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const socket = this.socket
      if (!socket) return reject(new Error('Socket not initialized'))

      const timeout = setTimeout(() => reject(new Error('Join room timeout')), 5000)

      socket.emit('joinVoiceRoom', { roomId }, async (response?: any) => {
        clearTimeout(timeout)

        if (!response) return resolve()

        if (response.success === false || response.error) {
          return reject(new Error(response.error ?? response.message ?? 'Failed to join room'))
        }

        try {
          const rtpCapabilities = response.rtpCapabilities
            ? (response.rtpCapabilities.rtpCapabilities ?? response.rtpCapabilities)
            : await this.fetchRtpCapabilities()

          await this.initDevice(rtpCapabilities)

          for (const user of response.existingUsers ?? []) {
            await this.createConsumerTransport(user.socketId)
          }
        } catch {
          // Fallback: continue without full audio support
        }

        this.emit('joinedRoom', response)
        resolve()
      })
    })
  }

  private fetchRtpCapabilities(): Promise<unknown> {
    return new Promise((resolve, reject) => {
      this.socket?.emit(
        'getRtpCapabilities',
        { roomId: this.roomId },
        (res: any) => {
          if (!res?.rtpCapabilities) return reject(new Error('Invalid RTP capabilities response'))
          resolve(res.rtpCapabilities)
        },
      )
    })
  }

  private async initDevice(rtpCapabilities: unknown): Promise<void> {
    if (!rtpCapabilities) throw new Error('RTP Capabilities not provided')
    if (!this.device) this.device = new Device()
    await this.device.load({ routerRtpCapabilities: rtpCapabilities as any })
  }

  async startAudio(): Promise<void> {
    try {
      this.audioContext ??= new AudioContext()

      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      })

      this.emit('audioStarted', { stream: this.localStream })
      await this.createProducerTransport()
    } catch (error) {
      this.emit('error', { message: 'Failed to access microphone' })
      throw error
    }
  }

  async stopAudio(): Promise<void> {
    this.localStream?.getTracks().forEach((t) => t.stop())
    this.localStream = null

    if (this.audioContext) {
      await this.audioContext.close()
      this.audioContext = null
    }

    this.emit('audioStopped')
  }

  async toggleMic(isMuted: boolean): Promise<void> {
    if (!this.socket) return

    this.socket.emit('toggleMic', { isMuted })
    this.localStream?.getAudioTracks().forEach((t) => (t.enabled = !isMuted))
    this.emit('micToggled', { isMuted })
  }

  async toggleSong(isMuted: boolean): Promise<void> {
    if (!this.socket) return

    this.socket.emit('toggleSong', { isMuted })
    this.consumers.forEach((consumer) => {
      if (consumer.kind === 'audio') consumer.track.enabled = !isMuted
    })
    this.emit('songToggled', { isMuted })
  }

  async createProducerTransport(): Promise<void> {
    if (!this.socket || !this.device) return

    this.socket.emit(
      'createProducerTransport',
      { roomId: this.roomId},
      async (response: any) => {
        if (!response?.transport) return

        const transport = await this.device!.createSendTransport(response.transport)

        transport.on('connect', ({ dtlsParameters }, callback) => {
          this.socket?.emit(
            'connectProducerTransport',
            { transportId: transport.id, dtlsParameters, roomId: this.roomId },
            callback,
          )
        })

        transport.on('produce', ({ kind, rtpParameters }, callback) => {
          this.socket?.emit(
            'produce',
            {
              transportId: transport.id,
              kind,
              rtpParameters,
              roomId: this.roomId,
            },
            ({ id }: { id: string }) => callback({ id }),
          )
        })

        this.producerTransport = transport
        await this.produceAudio()
      },
    )
  }

  private async produceAudio(): Promise<void> {
    if (!this.producerTransport || !this.localStream) return

    const track = this.localStream.getAudioTracks()[0]
    if (!track) return

    const producer = await this.producerTransport.produce({ track })
    this.producers.set(producer.id, producer)
  }

  async createConsumerTransport(socketId: string): Promise<void> {
    if (!this.socket || !this.device) return

    this.socket.emit(
      'createConsumerTransport',
      { socketId, roomId: this.roomId },
      async (response: any) => {
        const params: TransportParams = response?.transport
        if (!params?.id) return

        try {
          const transport = this.device!.createRecvTransport(params as any)

          transport.on('connect', async ({ dtlsParameters }, callback) => {
            this.socket?.emit(
              'connectConsumerTransport',
              {
                transportId: transport.id,
                dtlsParameters,
                socketId,
                roomId: this.roomId,
              },
              callback,
            )
          })

          this.consumerTransports.set(socketId, transport)

          this.socket?.emit('getProducers', {}, (producers: ProducerPayload[]) => {
            producers.forEach((producer) => this.consumeProducer(socketId, producer))
          })
        } catch {
          // transport creation failed silently
        }
      },
    )
  }

  async consumeProducer(socketId: string, producer: ProducerPayload): Promise<void> {
    if (!this.socket) return

    const transport = this.consumerTransports.get(socketId)
    if (!transport) return

    this.socket.emit(
      'consume',
      {
        rtpCapabilities: this.device?.rtpCapabilities,
        producerId: producer.producerId,
        socketId,
        roomId: this.roomId,
      },
      async (res: ConsumeResponse) => {
        if (!res?.consumer) return

        try {
          const consumer = await transport.consume(res.consumer)

          this.socket!.emit('consumerResume', { consumerId: consumer.id })

          consumer.on('transportclose', () => {
            this.consumers.delete(consumer.id)
            this.remoteAudioTracks.delete(consumer.id)
          })

          this.consumers.set(consumer.id, consumer)
          this.remoteAudioTracks.set(consumer.id, consumer.track)
          this.mountAudioElement(socketId, consumer.track)

          this.socket?.emit('consumerReady', {
            consumerId: consumer.id,
            socketId,
            roomId: this.roomId,
          })
        } catch {
          // consumer creation failed silently
        }
      },
    )
  }

  private mountAudioElement(socketId: string, track: MediaStreamTrack): void {
    let container = document.getElementById('remote-audio-container')
    if (!container) {
      container = document.createElement('div')
      container.id = 'remote-audio-container'
      container.style.display = 'none'
      document.body.appendChild(container)
    }

    let el = this.audioElements.get(socketId)
    if (!el) {
      el = Object.assign(document.createElement('audio'), {
        id: `audio-${socketId}`,
        autoplay: true,
        playsInline: true,
      })
      container.appendChild(el)
      this.audioElements.set(socketId, el)
    }

    el.srcObject = new MediaStream([track])
  }

  removeConsumer(socketId: string): void {
    this.consumerTransports.get(socketId)?.close()
    this.consumerTransports.delete(socketId)

    const el = this.audioElements.get(socketId)
    if (el) {
      el.pause()
      el.srcObject = null
      el.remove()
      this.audioElements.delete(socketId)
    }
  }

  async disconnect(): Promise<void> {
    await this.stopAudio()

    this.consumerTransports.forEach((t) => t.close())
    this.consumerTransports.clear()

    this.consumers.forEach((c) => c.close())
    this.consumers.clear()

    this.producerTransport?.close()
    this.producerTransport = null

    this.producers.forEach((p) => p.close())
    this.producers.clear()

    if (this.socket) {
      if (this.roomId) this.socket.emit('leaveVoiceRoom')
      this.socket.disconnect()
      this.socket = null
    }

    this.device = null
    this.emit('disconnected')
  }

  getLocalStream(): MediaStream | null {
    return this.localStream
  }
  getRoomId(): string | null {
    return this.roomId
  }

  getSocketId(): string | null {
    return this.socket?.id ?? null
  }
  isConnected(): boolean {
    return this.socket?.connected ?? false
  }
}

let instance: VoiceChatService | null = null

export function getVoiceChatService(): VoiceChatService {
  return (instance ??= new VoiceChatService())
}
