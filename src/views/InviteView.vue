<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { joinServer } from '@/api/route/server.ts'

const route = useRoute()
const router = useRouter()

const serverUuid = route.params.serverUuid as string
const status = ref<'loading' | 'success' | 'error'>('loading')
const errorMessage = ref('')

onMounted(async () => {
  try {
    await joinServer(serverUuid)
    status.value = 'success'
    setTimeout(() => {
      router.push({ name: 'server', params: { serverUuid } })
    }, 1200)
  } catch (err) {
    status.value = 'error'
    errorMessage.value = err instanceof Error ? err.message : 'Impossible de rejoindre le serveur.'
  }
})
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-base-100">
    <div class="card card-border w-full max-w-sm text-center">
      <div class="card-body items-center gap-4">
        <template v-if="status === 'loading'">
          <span class="loading loading-spinner loading-lg text-primary"></span>
          <p class="text-base-content/70">Rejoindre le serveur…</p>
        </template>

        <template v-else-if="status === 'success'">
          <div class="text-success text-5xl">✓</div>
          <h2 class="card-title">Serveur rejoint !</h2>
          <p class="text-base-content/70 text-sm">Redirection en cours…</p>
        </template>

        <template v-else>
          <div class="text-error text-5xl">✕</div>
          <h2 class="card-title">Erreur</h2>
          <p class="text-sm text-error">{{ errorMessage }}</p>
          <div class="card-actions mt-2">
            <RouterLink :to="{ name: 'home' }" class="btn btn-primary btn-sm">
              Retour à l'accueil
            </RouterLink>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
