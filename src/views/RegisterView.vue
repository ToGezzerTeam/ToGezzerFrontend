<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'

const router = useRouter()

const fullName = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const acceptTerms = ref(false)
const isSubmitting = ref(false)
const errorMessage = ref<string | null>(null)

const canSubmit = computed(() => {
  return (
    fullName.value.trim().length >= 2
    && email.value.trim().length > 3
    && password.value.length >= 6
    && confirmPassword.value.length >= 6
    && acceptTerms.value
    && !isSubmitting.value
  )
})

const handleRegister = async () => {
  errorMessage.value = null

  if (fullName.value.trim().length < 2) {
    errorMessage.value = 'Le nom doit contenir au moins 2 caractères.'
    return
  }

  if (!email.value.includes('@')) {
    errorMessage.value = 'Adresse e-mail invalide.'
    return
  }

  if (password.value.length < 6) {
    errorMessage.value = 'Le mot de passe doit contenir au moins 6 caractères.'
    return
  }

  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Les mots de passe ne correspondent pas.'
    return
  }

  if (!acceptTerms.value) {
    errorMessage.value = 'Tu dois accepter les conditions d\'utilisation.'
    return
  }

  isSubmitting.value = true

  try {
    await new Promise((resolve) => setTimeout(resolve, 650))

    // Placeholder signup flow until backend auth is connected.
    console.log('Register payload', {
      fullName: fullName.value,
      email: email.value,
    })

    await router.push('/login')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <section class="min-h-screen bg-base-200">
    <div class="mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-8 sm:px-6 lg:px-8">
      <div class="grid w-full overflow-hidden rounded-box border border-base-300 bg-base-100 shadow-xl md:grid-cols-[1.05fr_1fr]">
        <div class="relative min-h-56 bg-secondary p-7 text-secondary-content sm:min-h-0 sm:p-10">
          <div class="absolute right-6 top-6">
            <RouterLink class="btn btn-sm btn-outline border-secondary-content/35 text-secondary-content hover:bg-secondary-content/15" to="/">
              Retour
            </RouterLink>
          </div>

          <div class="max-w-sm space-y-4">
            <p class="text-xs uppercase tracking-[0.25em] text-secondary-content/75">ToGezzer</p>
            <h1 class="text-3xl font-semibold leading-tight sm:text-4xl">
              Crée ton espace
              <span class="block text-secondary-content/80">et démarre en équipe.</span>
            </h1>
            <p class="text-secondary-content/75">
              Inscris-toi pour créer ton compte, rejoindre les channels, et gérer tes discussions en temps réel.
            </p>
          </div>
        </div>

        <div class="p-6 sm:p-10">
          <div class="mb-7 space-y-2">
            <h2 class="text-2xl font-semibold">Inscription</h2>
            <p class="text-sm text-base-content/65">Renseigne tes informations pour créer ton compte ToGezzer.</p>
          </div>

          <form class="space-y-4" @submit.prevent="handleRegister">
            <label class="form-control w-full gap-2">
              <span class="label-text font-medium">Nom complet</span>
              <input
                v-model="fullName"
                type="text"
                autocomplete="name"
                class="input input-bordered w-full"
                placeholder="Ton nom"
                required
              />
            </label>

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
                autocomplete="new-password"
                class="input input-bordered w-full"
                placeholder="••••••••"
                required
                minlength="6"
              />
            </label>

            <label class="form-control w-full gap-2">
              <span class="label-text font-medium">Confirmer le mot de passe</span>
              <input
                v-model="confirmPassword"
                type="password"
                autocomplete="new-password"
                class="input input-bordered w-full"
                placeholder="••••••••"
                required
                minlength="6"
              />
            </label>

            <label class="label cursor-pointer justify-start gap-3 pt-1">
              <input v-model="acceptTerms" type="checkbox" class="checkbox checkbox-sm checkbox-secondary" />
              <span class="label-text">J'accepte les conditions d'utilisation</span>
            </label>

            <div v-if="errorMessage" role="alert" class="alert alert-error alert-soft text-sm">
              <span>{{ errorMessage }}</span>
            </div>

            <button type="submit" class="btn btn-secondary w-full" :disabled="!canSubmit">
              <span v-if="isSubmitting" class="loading loading-spinner loading-sm"></span>
              <span>{{ isSubmitting ? 'Création...' : 'Créer mon compte' }}</span>
            </button>
          </form>

          <p class="mt-4 text-center text-sm text-base-content/70">
            Déjà inscrit ?
            <RouterLink class="link link-hover link-secondary font-medium" to="/login">Se connecter</RouterLink>
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
