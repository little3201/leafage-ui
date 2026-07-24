import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useUserStore } from '@/stores/user'
import { hasAction } from '../action'

vi.mock('@/stores/user', () => ({
  useUserStore: vi.fn(),
}))
const mockedUseUserStore = vi.mocked(useUserStore, true)

describe('utils', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('hasAction', () => {
    expect(hasAction(undefined, 'create')).toBe(false)
    expect(mockedUseUserStore).not.toHaveBeenCalled()

    mockedUseUserStore.mockReturnValue({
      privilegeMap: new Map([['users', new Set(['create', 'edit'])]]),
    } as any)

    expect(hasAction('users', 'create')).toBe(true)
  })
})
