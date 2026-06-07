import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import VoiceChatView from '../views/VoiceChatView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/server/:serverUuid',
      name: 'server',
      component: HomeView,
    },
    {
      path: '/server/:serverUuid/channel/:channelUuid',
      name: 'channel',
      component: HomeView,
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
    // {
    //   path: '/about',
    //   name: 'about',
    //   // route level code-splitting
    //   // this generates a separate chunk (About.[hash].js) for this route
    //   // which is lazy-loaded when the route is visited.
    //   component: () => import('../views/AboutView.vue'),
    // },
    {
      path: '/voice-chat',
      name: 'voiceChat',
      component: VoiceChatView,
    },
    {
      path: '/api-test',
      name: 'apiTest',
      component: () => import('../views/ApiTestView.vue'),
    },
  ],
})

export default router
