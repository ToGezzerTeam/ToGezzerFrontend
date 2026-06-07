<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getFileUrl } from '@/api/route/message.ts'
import { Paperclip } from '@lucide/vue'

const props = defineProps<{ roomUuid: string; objectName: string }>()

const url = ref<string | null>(null)
const isLoading = ref(true)
const hasError = ref(false)
const imageFailed = ref(false)

const fileName = props.objectName.split('/').pop() ?? props.objectName

onMounted(async () => {
  try {
    url.value = await getFileUrl(props.roomUuid, props.objectName)
  } catch {
    hasError.value = true
  } finally {
    isLoading.value = false
  }
})

const openInTab = () => url.value && window.open(url.value, '_blank')
</script>

<template>
  <span v-if="isLoading" class="loading loading-spinner loading-xs"></span>
  <span v-else-if="hasError" class="text-error text-xs italic">Fichier inaccessible</span>
  <template v-else-if="url">
    <img
      v-if="!imageFailed"
      :src="url"
      :alt="fileName"
      class="max-w-xs max-h-64 rounded cursor-pointer"
      @click="openInTab"
      @error="imageFailed = true"
    />
    <a
      v-else
      :href="url"
      target="_blank"
      rel="noopener noreferrer"
      class="btn btn-ghost btn-sm gap-1 font-normal"
    >
      <Paperclip :size="14" />{{ fileName }}
    </a>
  </template>
</template>
