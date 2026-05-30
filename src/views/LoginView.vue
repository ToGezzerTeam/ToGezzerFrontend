<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'

const router = useRouter()

const email = ref('')
const password = ref('')
const rememberMe = ref(true)
const isSubmitting = ref(false)
const errorMessage = ref<string | null>(null)

const canSubmit = computed(() => {
  return email.value.trim().length > 3 && password.value.length >= 6 && !isSubmitting.value
})

const handleLogin = async () => {
  errorMessage.value = null

  if (!email.value.includes('@')) {
    errorMessage.value = 'Adresse e-mail invalide.'
    return
  }

  if (password.value.length < 6) {
    errorMessage.value = 'Le mot de passe doit contenir au moins 6 caractères.'
    return
  }

  isSubmitting.value = true

  try {
    await new Promise((resolve) => setTimeout(resolve, 550))

    // Placeholder login flow until backend auth is connected.
    console.log('Login payload', {
      email: email.value,
      rememberMe: rememberMe.value,
    })

    await router.push('/')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <section class="min-h-screen bg-base-200">
    <div class="mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-8 sm:px-6 lg:px-8">
      <div class="grid w-full overflow-hidden rounded-box border border-base-300 bg-base-100 shadow-xl md:grid-cols-[1.05fr_1fr]">
        <div class="relative min-h-56 bg-primary p-7 text-primary-content sm:min-h-0 sm:p-10">
        <div class="absolute right-6 top-6">
          <RouterLink class="btn btn-sm btn-outline border-primary-content/35 text-primary-content hover:bg-primary-content/15" to="/">
            Retour
          </RouterLink>
        </div>

        <div class="max-w-sm space-y-4">
          <p class="text-xs uppercase tracking-[0.25em] text-primary-content/75">ToGezzer</p>
          <h1 class="text-3xl font-semibold leading-tight sm:text-4xl">
            Reprends la discussion
            <span class="block text-primary-content/80">avec ton channel.</span>
          </h1>
          <p class="text-primary-content/75">
            Connecte-toi pour retrouver tes salons textuels et vocaux, ton historique, et tes équipes en un clic.
          </p>
        </div>
        </div>

        <div class="p-6 sm:p-10">
          <div class="mb-7 space-y-2">
            <h2 class="text-2xl font-semibold">Connexion</h2>
            <p class="text-sm text-base-content/65">Utilise ton e-mail et ton mot de passe pour accéder à ToGezzer.</p>
          </div>

          <form class="space-y-5" @submit.prevent="handleLogin">
            <label class="form-control w-full gap-2">
              <span class="label-text font-medium">E-mail</span>
              <input
                v-model="email"
                type="email"
                autocomplete="email"
                class="input input-bordered w-full"
                placeholder="nom@exemple.com"
                required
              />
            </label>

            <label class="form-control w-full gap-2">
              <span class="label-text font-medium">Mot de passe</span>
              <input
                v-model="password"
                type="password"
                autocomplete="current-password"
                class="input input-bordered w-full"
                placeholder="••••••••"
                required
                minlength="6"
              />
            </label>

            <div class="flex flex-wrap items-center justify-between gap-3">
              <label class="label cursor-pointer gap-2">
                <input v-model="rememberMe" type="checkbox" class="checkbox checkbox-sm checkbox-primary" />
                <span class="label-text">Se souvenir de moi</span>
              </label>

              <a href="#" class="link link-hover link-primary text-sm">Mot de passe oublié ?</a>
            </div>

            <div v-if="errorMessage" role="alert" class="alert alert-error alert-soft text-sm">
              <span>{{ errorMessage }}</span>
            </div>

            <button type="submit" class="btn btn-primary w-full" :disabled="!canSubmit">
              <span v-if="isSubmitting" class="loading loading-spinner loading-sm"></span>
              <span>{{ isSubmitting ? 'Connexion...' : 'Se connecter' }}</span>
            </button>
          </form>

          <p class="mt-4 text-center text-sm text-base-content/70">
            Pas encore de compte ?
            <RouterLink class="link link-hover link-primary font-medium" to="/register">S'inscrire</RouterLink>
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
