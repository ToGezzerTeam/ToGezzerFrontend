import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import VoiceChatView from '../views/VoiceChatView.vue'
import SettingsView from '../views/SettingsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true },
    },
    {
      path: '/server/:serverUuid',
      name: 'server',
      component: HomeView,
      meta: { requiresAuth: true },
    },
    {
      path: '/server/:serverUuid/channel/:channelUuid',
      name: 'channel',
      component: HomeView,
      meta: { requiresAuth: true },
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/RegisterView.vue'),
    },
    {
      path: '/voice-chat',
      name: 'voiceChat',
      component: VoiceChatView,
      meta: { requiresAuth: true },
    },
    {
      path: '/settings',
      name: 'settings',
      component: SettingsView,
      meta: { requiresAuth: true },
    },
    {
      path: '/invite/:serverUuid',
      name: 'invite',
      component: () => import('../views/InviteView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/api-test',
      name: 'apiTest',
      component: () => import('../views/ApiTestView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'notFound',
      component: () => import('../views/NotFoundView.vue'),
    },
  ],
})

router.beforeEach((to) => {
  if (to.meta.requiresAuth && !localStorage.getItem('auth_token')) {
    return { name: 'login' }
  }
})

export default router
