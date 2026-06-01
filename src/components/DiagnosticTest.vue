<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { io } from 'socket.io-client'

type JoinVoiceRoomResponse = {
  success: boolean
  message?: string
  error?: string
  existingUsers?: unknown[]
}

// État du test
const status = ref<string>('Initialisation...')
const logs = ref<string[]>([])
const isConnected = ref(false)
const roomId = ref('test-room')
const userId = ref('test-user')

// Ajouter un log
const addLog = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
  const timestamp = new Date().toLocaleTimeString()
  logs.value.push(`[${timestamp}] ${type.toUpperCase()}: ${message}`)
  console.log(`[${type}] ${message}`)
}

// Test 1: Vérifier la variable d'environnement
const testEnv = () => {
  addLog('=== TEST 1: Vérifier l\'environnement ===', 'info')
  const wsUrl = import.meta.env.VITE_VOICE_CHAT_WS_URL
  addLog(`VITE_VOICE_CHAT_WS_URL = ${wsUrl || 'NON DÉFINI'}`, wsUrl ? 'success' : 'error')

  if (!wsUrl) {
    addLog('ERREUR: Variable d\'environnement manquante!', 'error')
    return false
  }
  return true
}

// Test 2: Tester la connexion WebSocket
const testWebSocket = async () => {
  addLog('=== TEST 2: Tester la connexion WebSocket ===', 'info')

  const wsUrl = import.meta.env.VITE_VOICE_CHAT_WS_URL
  if (!wsUrl) {
    addLog('Pas d\'URL WebSocket définie', 'error')
    return false
  }

  try {
    const socket = io(`${wsUrl}/voice-chat`, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 3,
      transports: ['websocket', 'polling'],
    })

    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        addLog('TIMEOUT: Pas de réponse du serveur après 5s', 'error')
        socket.disconnect()
        resolve(false)
      }, 5000)

      socket.on('connect', () => {
        clearTimeout(timeout)
        addLog('✓ WebSocket connecté avec succès!', 'success')
        addLog(`Socket ID: ${socket.id}`, 'success')
        socket.disconnect()
        resolve(true)
      })

      socket.on('connect_error', (error) => {
        clearTimeout(timeout)
        addLog(`✗ Erreur de connexion: ${error}`, 'error')
        resolve(false)
      })

      socket.on('error', (error) => {
        clearTimeout(timeout)
        addLog(`✗ Erreur Socket: ${error}`, 'error')
        resolve(false)
      })
    })
  } catch (error) {
    addLog(`✗ Exception: ${error}`, 'error')
    return false
  }
}

// Test 3: Tester joinVoiceRoom
const testJoinRoom = async () => {
  addLog('=== TEST 3: Tester joinVoiceRoom ===', 'info')

  const wsUrl = import.meta.env.VITE_VOICE_CHAT_WS_URL
  if (!wsUrl) {
    addLog('Pas d\'URL WebSocket', 'error')
    return false
  }

  try {
    const socket = io(`${wsUrl}/voice-chat`, {
      reconnection: true,
      transports: ['websocket', 'polling'],
    })

    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        addLog('TIMEOUT: Pas de réponse après 5s', 'error')
        socket.disconnect()
        resolve(false)
      }, 5000)

      socket.on('connect', () => {
        addLog(`Connecté, envoi de joinVoiceRoom...`, 'info')

        socket.emit('joinVoiceRoom', {
          roomId: roomId.value,
          userId: userId.value
        }, (response: JoinVoiceRoomResponse) => {
          clearTimeout(timeout)

          if (!response) {
            addLog('Pas de réponse du serveur', 'error')
            socket.disconnect()
            resolve(false)
            return
          }

          if (response.success) {
            addLog('✓ joinVoiceRoom réussi!', 'success')
            addLog(`Utilisateurs existants: ${response.existingUsers?.length || 0}`, 'success')
            isConnected.value = true
          } else {
            addLog(`✗ Erreur serveur: ${response.message || response.error}`, 'error')
          }

          socket.disconnect()
          resolve(response.success)
        })
      })

      socket.on('connect_error', (error) => {
        clearTimeout(timeout)
        addLog(`Erreur de connexion: ${error}`, 'error')
        resolve(false)
      })
    })
  } catch (error) {
    addLog(`Exception: ${error}`, 'error')
    return false
  }
}

// Test 4: Tester le microphone
const testMicrophone = async () => {
  addLog('=== TEST 4: Tester le microphone ===', 'info')

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    })

    addLog('✓ Microphone accessible!', 'success')
    const audioTracks = stream.getAudioTracks()
    addLog(`Pistes audio: ${audioTracks.length}`, 'success')

    if (audioTracks.length > 0) {
      const track = audioTracks[0]
      if (track) {
        addLog(`Appareil: ${track.getSettings().deviceId ? 'Trouvé' : 'Inconnu'}`, 'success')
      }
    }

    stream.getTracks().forEach((track) => track.stop())
    return true
  } catch (error) {
    addLog(`✗ Erreur microphone: ${error}`, 'error')
    return false
  }
}

// Exécuter tous les tests
const runAllTests = async () => {
  logs.value = []
  addLog('=== DÉMARRAGE DES TESTS ===', 'info')

  const test1 = testEnv()
  if (!test1) {
    addLog('ARRÊT: Variables d\'environnement invalides', 'error')
    return
  }

  status.value = 'Test WebSocket...'
  const test2 = await testWebSocket()

  status.value = 'Test joinVoiceRoom...'
  const test3 = await testJoinRoom()

  status.value = 'Test Microphone...'
  const test4 = await testMicrophone()

  addLog('=== RÉSUMÉ ===', 'info')
  addLog(`Environnement: ${test1 ? '✓' : '✗'}`, test1 ? 'success' : 'error')
  addLog(`WebSocket: ${test2 ? '✓' : '✗'}`, test2 ? 'success' : 'error')
  addLog(`joinVoiceRoom: ${test3 ? '✓' : '✗'}`, test3 ? 'success' : 'error')
  addLog(`Microphone: ${test4 ? '✓' : '✗'}`, test4 ? 'success' : 'error')

  if (test1 && test2 && test3 && test4) {
    status.value = '✓ TOUS LES TESTS RÉUSSIS'
  } else {
    status.value = '✗ CERTAINS TESTS ONT ÉCHOUÉ'
  }
}

onMounted(() => {
  addLog('Page de diagnostic chargée', 'info')
})
</script>

<template>
  <div class="min-h-screen bg-base-100 p-4">
    <div class="container mx-auto max-w-4xl">
      <h1 class="text-4xl font-bold mb-6">🔧 Diagnostic Chat Vocal</h1>

      <!-- Status -->
      <div class="card card-border bg-base-200 shadow-md mb-6">
        <div class="card-body">
          <h2 class="card-title">Status</h2>
          <p class="text-lg" :class="{
            'text-success': status.includes('✓'),
            'text-error': status.includes('✗'),
          }">
            {{ status }}
          </p>
        </div>
      </div>

      <!-- Configuration -->
      <div class="card card-border bg-base-200 shadow-md mb-6">
        <div class="card-body">
          <h2 class="card-title">Configuration de Test</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="form-control">
              <label class="label">
                <span class="label-text">Room ID</span>
              </label>
              <input v-model="roomId" type="text" class="input input-bordered" />
            </div>
            <div class="form-control">
              <label class="label">
                <span class="label-text">User ID</span>
              </label>
              <input v-model="userId" type="text" class="input input-bordered" />
            </div>
          </div>
        </div>
      </div>

      <!-- Bouton de test -->
      <div class="mb-6">
        <button @click="runAllTests" class="btn btn-primary btn-lg w-full">
          🚀 Exécuter les Tests
        </button>
      </div>

      <!-- Logs -->
      <div class="card card-border bg-base-200 shadow-md">
        <div class="card-body">
          <h2 class="card-title mb-4">Logs de Diagnostic</h2>
          <div class="bg-base-100 p-4 rounded font-mono text-sm overflow-auto max-h-96">
            <div v-if="logs.length === 0" class="text-base-content/50">
              Aucun log pour l'instant. Cliquez sur "Exécuter les Tests"
            </div>
            <div v-for="(log, index) in logs" :key="index" class="mb-2">
              <span v-if="log.includes('SUCCESS')" class="text-success">{{ log }}</span>
              <span v-else-if="log.includes('ERROR')" class="text-error">{{ log }}</span>
              <span v-else class="text-base-content">{{ log }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Instructions -->
      <div class="alert alert-info alert-outline mt-6">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
          class="stroke-current shrink-0 h-6 w-6">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <h3 class="font-bold">Comment utiliser</h3>
          <p class="text-sm">
            Ce diagnostic teste chaque partie du système. Si un test échoue, lisez l'erreur pour comprendre le problème.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

