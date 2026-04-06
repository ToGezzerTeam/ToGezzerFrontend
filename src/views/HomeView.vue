<script setup lang="ts">
import { ref } from 'vue'
import DiscordSidebar from '@/components/DiscordSidebar.vue'

const isSidebarOpen = ref(true)

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}
</script>

<template>
	<div class="flex min-h-screen">
		<DiscordSidebar v-if="isSidebarOpen" />

		<main class="flex-1 bg-base-100 p-6">
			<div class="mx-auto max-w-3xl space-y-4">
				<div class="flex items-center justify-between gap-3">
					<h1 class="text-2xl font-bold">Espace principal</h1>
					<button class="btn btn-sm btn-outline" type="button" @click="toggleSidebar">
						{{ isSidebarOpen ? 'Masquer la sidebar' : 'Afficher la sidebar' }}
					</button>
				</div>
				<p class="text-base-content/70">
					La sidebar à gauche fonctionne comme Discord, avec les salons textuels et vocaux configurés depuis
					le JSON.
				</p>
				<div class="alert alert-info alert-soft">
					<span>Modifie public/channel-layout.json pour changer l'ordre, les dossiers et les salons.</span>
				</div>
			</div>
		</main>
	</div>
</template>

<style scoped></style>
