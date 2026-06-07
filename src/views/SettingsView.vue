<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { ArrowLeft } from '@lucide/vue'

const themes = [
  'light', 'dark', 'cupcake', 'bumblebee', 'emerald', 'corporate',
  'synthwave', 'retro', 'cyberpunk', 'valentine', 'halloween', 'garden',
  'forest', 'aqua', 'lofi', 'pastel', 'fantasy', 'wireframe', 'black',
  'luxury', 'dracula', 'cmyk', 'autumn', 'business', 'acid', 'lemonade',
  'night', 'coffee', 'winter', 'dim', 'nord', 'sunset',
]

const currentTheme = ref(localStorage.getItem('theme') ?? 'light')

const applyTheme = (theme: string) => {
  currentTheme.value = theme
  localStorage.setItem('theme', theme)
  document.documentElement.setAttribute('data-theme', theme)
}
</script>

<template>
  <div class="min-h-screen bg-base-100">
    <div class="navbar border-b border-base-300 bg-base-200 px-4">
      <div class="navbar-start">
        <RouterLink :to="{ name: 'home' }" class="btn btn-ghost btn-sm gap-2">
          <ArrowLeft :size="16" />
          Retour
        </RouterLink>
      </div>
      <div class="navbar-center">
        <span class="font-semibold">Paramètres</span>
      </div>
    </div>

    <div class="mx-auto max-w-3xl p-8">
      <section>
        <h2 class="mb-1 text-lg font-bold">Thème</h2>
        <p class="mb-5 text-sm text-base-content/60">Choisissez l'apparence de l'application.</p>

        <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          <button
            v-for="theme in themes"
            :key="theme"
            :data-theme="theme"
            class="group relative cursor-pointer overflow-hidden rounded-xl border-2 transition-all"
            :class="currentTheme === theme ? 'border-primary ring-2 ring-primary ring-offset-2 ring-offset-base-100' : 'border-base-300 hover:border-base-content/30'"
            @click="applyTheme(theme)"
          >
            <div class="bg-base-100 p-3">
              <div class="mb-2 flex gap-1.5">
                <div class="h-3 w-3 rounded-full bg-primary"></div>
                <div class="h-3 w-3 rounded-full bg-secondary"></div>
                <div class="h-3 w-3 rounded-full bg-accent"></div>
              </div>
              <div class="flex flex-col gap-1">
                <div class="h-1.5 w-full rounded-full bg-base-content/20"></div>
                <div class="h-1.5 w-3/4 rounded-full bg-base-content/20"></div>
              </div>
            </div>
            <div class="border-t border-base-300 bg-base-200 px-3 py-1.5">
              <span class="text-xs font-medium capitalize text-base-content">{{ theme }}</span>
            </div>
          </button>
        </div>
      </section>
    </div>
  </div>
</template>
