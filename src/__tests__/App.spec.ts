import { afterEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'

import HomeView from '../views/HomeView.vue'
import { buildMessagesUrl, sortMessagesChronologically } from '@/services/messages'

const DiscordSidebarStub = {
  template: `
    <div>
      <button
        type="button"
        data-test="channel-general"
        @click="$emit('select-channel', { roomId: 'general', channelName: 'général', channelType: 'text' })"
      >
        général
      </button>
    </div>
  `,
}

describe('messages api helpers', () => {
  it('builds a proper messages URL', () => {
    expect(
      buildMessagesUrl('ROOM123', {
        baseUrl: 'http://localhost:8080/',
        messageUuid: 'UUID123',
        pageSize: 50,
      }),
    ).toBe('http://localhost:8080/api/messages/ROOM123?messageUuid=UUID123&pageSize=50')
  })

  it('sorts messages chronologically', () => {
    const sorted = sortMessagesChronologically([
      {
        uuid: 'later',
        roomId: 'general',
        authorId: 'user-2',
        content: { type: 'text', value: 'Message récent' },
        state: 'created',
        createdAt: '2026-05-10T11:00:00Z',
      },
      {
        uuid: 'earlier',
        roomId: 'general',
        authorId: 'user-1',
        content: { type: 'text', value: 'Message ancien' },
        state: 'created',
        createdAt: '2026-05-10T10:00:00Z',
      },
    ])

    expect(sorted.map((message) => message.uuid)).toEqual(['earlier', 'later'])
  })
})

describe('HomeView', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('loads and sequences messages when a channel is selected', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        messageDTOS: [
          {
            uuid: 'msg-2',
            roomId: 'general',
            authorId: 'user-2',
            content: { type: 'text', value: 'Message récent' },
            state: 'updated',
            createdAt: '2026-05-10T11:00:00Z',
            updatedAt: '2026-05-10T11:05:00Z',
          },
          {
            uuid: 'msg-1',
            roomId: 'general',
            authorId: 'user-1',
            content: { type: 'text', value: 'Message ancien' },
            state: 'created',
            createdAt: '2026-05-10T10:00:00Z',
          },
        ],
        hasMore: true,
      }),
    })

    vi.stubGlobal('fetch', fetchMock)

    const wrapper = mount(HomeView, {
      global: {
        stubs: {
          DiscordSidebar: DiscordSidebarStub,
        },
      },
    })

    await wrapper.get('[data-test="channel-general"]').trigger('click')
    await flushPromises()

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8080/api/messages/general?pageSize=100',
      expect.objectContaining({
        method: 'GET',
      }),
    )

    expect(wrapper.text()).toContain('Message ancien')
    expect(wrapper.text()).toContain('Message récent')
    expect(wrapper.text()).toContain('Plus de messages disponibles')
    expect(wrapper.text().indexOf('Message ancien')).toBeLessThan(wrapper.text().indexOf('Message récent'))
  })
})
