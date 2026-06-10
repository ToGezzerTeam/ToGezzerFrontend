<script setup lang="ts">
import type { OnlineUser } from '@/api/socket/server/store.ts'

defineProps<{ users: OnlineUser[] }>()
</script>

<template>
  <div class="flex w-56 shrink-0 flex-col border-l border-base-300 bg-base-200">
    <div class="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-base-content/50">
      En ligne — {{ users.length }}
    </div>
    <ul class="menu flex-1 gap-0.5 overflow-y-auto p-2">
      <li v-for="user in users" :key="user.uuid">
        <div class="flex items-center gap-2 rounded px-2 py-1.5">
          <div class="avatar">
            <div class="w-8 rounded-full">
              <img
                :src="`https://api.dicebear.com/10.x/dylan/svg?skinColor=c061cb&backgroundColor=619eff,29e051,f6d32d&moodVariant=confused,happy,hopeful,neutral,superHappy&facialHairProbability=0&hairColorFill=radial&hairColor=000000,1d5dff,ff543d,ffffff&seed=${encodeURIComponent(user.username)}`"
                :alt="user.username"
              />
            </div>
          </div>
          <span class="truncate text-sm">{{ user.username }}</span>
        </div>
      </li>
    </ul>
  </div>
</template>
