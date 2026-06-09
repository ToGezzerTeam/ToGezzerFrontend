import { afterEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'

import HomeView from '../views/HomeView.vue'

vi.mock('@/api/route/server.ts', () => ({
  getServer: vi.fn().mockResolvedValue({
    name: 'Serveur Test',
  }),
  getServerDetail: vi.fn().mockResolvedValue({
    serverId: 42,
    roomDTOS: [
      {
        uuid: 'general',
        name: 'général',
        channelType: 'TEXT',
      },
      {
        uuid: 'voice-1',
        name: 'Vocal',
        channelType: 'VOICE',
      },
    ],
  }),
}))

vi.mock('@/api/route/room.ts', () => ({
  joinRoom: vi.fn().mockResolvedValue(undefined),
}))

const DiscordSidebarStub = {
  props: ['serverName', 'channels', 'isLoading', 'loadError'],
  template: `
    <aside>
      <p data-test="server-name">{{ serverName }}</p>
      <p data-test="channel-count">{{ channels.length }}</p>
      <p v-if="isLoading" data-test="loading">loading</p>
      <p v-if="loadError" data-test="error">{{ loadError }}</p>
    </aside>
  `,
}

const TextChatStub = {
  props: ['roomUuid'],
  template: `<div data-test="text-chat">{{ roomUuid }}</div>`,
}

const VoiceChatStub = {
  props: ['roomId'],
  template: `<div data-test="voice-chat">{{ roomId }}</div>`,
}

describe('HomeView', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('loads server data from store and renders selected channel', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', component: HomeView },
        { path: '/server/:serverUuid/channel/:channelUuid', component: HomeView },
      ],
    })

    await router.push('/server/server-1/channel/general')
    await router.isReady()

    const wrapper = mount(HomeView, {
      global: {
        plugins: [createPinia(), router],
        stubs: {
          ServerList: true,
          DiscordSidebar: DiscordSidebarStub,
          TextChat: TextChatStub,
          VoiceChat: VoiceChatStub,
        },
      },
    })

    await flushPromises()

    expect(wrapper.get('[data-test="server-name"]').text()).toBe('Serveur Test')
    expect(wrapper.get('[data-test="channel-count"]').text()).toBe('2')
    expect(wrapper.get('[data-test="text-chat"]').text()).toBe('general')
    expect(wrapper.text()).toContain('général')
  })
})

