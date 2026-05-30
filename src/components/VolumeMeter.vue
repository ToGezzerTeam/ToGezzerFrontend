<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useVoiceChatStore } from '@/api/voiceChat/store.ts'

interface Props {
  updateInterval?: number
  sensitivity?: number
}

const props = withDefaults(defineProps<Props>(), {
  updateInterval: 100,
  sensitivity: 0.5,
})

const voiceChatStore = useVoiceChatStore()
const volumeLevel = ref(0)
const isMeterActive = ref(false)

let audioContext: AudioContext | null = null
let analyser: AnalyserNode | null = null
let dataArray: Uint8Array | null = null
let animationId: number | null = null

const startMeter = async () => {
  try {
    if (!voiceChatStore.localStream) return

    if (!audioContext) {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    }

    const source = audioContext.createMediaStreamSource(voiceChatStore.localStream)
    analyser = audioContext.createAnalyser()
    analyser.fftSize = 256

    source.connect(analyser)

    const bufferLength = analyser.frequencyBinCount
    dataArray = new Uint8Array(bufferLength)

    isMeterActive.value = true
    updateVolume()
  } catch (error) {
    console.error('Failed to start volume meter:', error)
  }
}

const stopMeter = () => {
  isMeterActive.value = false
  if (animationId !== null) {
    cancelAnimationFrame(animationId)
    animationId = null
  }
}

const updateVolume = () => {
  if (!analyser || !dataArray || !isMeterActive.value) return

  analyser.getByteFrequencyData(dataArray)

  let sum = 0
  for (let i = 0; i < dataArray.length; i++) {
    sum += dataArray[i]
  }
  const average = sum / dataArray.length
  volumeLevel.value = (average / 255) * props.sensitivity

  animationId = requestAnimationFrame(updateVolume)
}

watch(
  () => voiceChatStore.localStream,
  (newStream) => {
    if (newStream && voiceChatStore.isConnected) {
      startMeter()
    } else {
      stopMeter()
    }
  },
)

watch(
  () => voiceChatStore.isConnected,
  (isConnected) => {
    if (isConnected && voiceChatStore.localStream) {
      startMeter()
    } else {
      stopMeter()
    }
  },
)

onMounted(() => {
  if (voiceChatStore.localStream && voiceChatStore.isConnected) {
    startMeter()
  }
})

onUnmounted(() => {
  stopMeter()
  if (audioContext) {
    audioContext.close()
    audioContext = null
  }
})
</script>

<template>
  <div v-if="isMeterActive" class="flex items-center gap-2">
    <span class="text-xs font-semibold text-base-content">Volume:</span>
    <div class="flex-1 h-2 bg-base-300 rounded-full overflow-hidden">
      <div
        class="h-full bg-gradient-to-r from-success to-warning transition-all"
        :style="{
          width: `${Math.round(volumeLevel * 100)}%`,
          transitionDuration: '50ms',
        }"
      />
    </div>
    <span class="text-xs text-base-content/60 min-w-max">
      {{ Math.round(volumeLevel * 100) }}%
    </span>
  </div>
</template>

