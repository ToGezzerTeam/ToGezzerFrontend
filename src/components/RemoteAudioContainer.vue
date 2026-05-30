<script setup lang="ts">
/**
 * Composant pour afficher et gérer les flux audio distants
 * Ce composant reste invisible mais contient les éléments audio
 */

import { onMounted, onUnmounted } from 'vue'

onMounted(() => {
  // Le conteneur audio est créé automatiquement par service.ts
  // dans la méthode createAudioElement()
  console.log('Remote Audio Container initialized')
})

onUnmounted(() => {
  // Nettoyer les éléments audio si nécessaire
  const container = document.getElementById('remote-audio-container')
  if (container) {
    container.innerHTML = ''
  }
})
</script>

<template>
  <!-- Ce composant ne rend rien visiblement -->
  <!-- Les éléments audio sont créés dynamiquement par le service -->
  <div id="remote-audio-container" style="display: none;"></div>
</template>

