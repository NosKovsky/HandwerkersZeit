import { vi, describe, it, expect, beforeEach } from 'vitest'

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

const mockSupabase = (profile: any, task: any, updateData: any = {}, deleteErr: any = null) => {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: profile.id } } }),
    },
    from: (table: string) => {
      if (table === 'profiles') {
        return {
          select: () => ({ eq: () => ({ single: async () => ({ data: profile }) }) }),
        }
      }
      if (table === 'comments') {
        return {
          select: (cols: string) => ({
            eq: () => ({
              single: async () => {
                if (cols.includes('author_id')) {
                  return { data: task, error: null }
                }
                return { data: updateData, error: null }
              },
            }),
          }),
          update: () => ({
            eq: () => ({
              select: () => ({ single: async () => ({ data: updateData, error: null }) }),
            }),
          }),
          delete: () => ({
            eq: () => ({ error: deleteErr }),
          }),
        }
      }
      return {} as any
    },
  }
}

let actions: typeof import('../app/tasks/actions')

describe('updateTaskStatus authorization', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('allows author to update', async () => {
    vi.doMock('@/lib/supabase/actions', () => ({
      createSupabaseServerActionClient: async () => mockSupabase(
        { id: 'user1', role: 'user' },
        { author_id: 'user1', recipient_ids: [] },
        { id: 'task1', status: 'OFFEN' },
      ),
    }))
    actions = await import('../app/tasks/actions')
    const res = await actions.updateTaskStatus('task1', 'OFFEN')
    expect(res.success).toBe(true)
  })

  it('rejects when not authorized', async () => {
    vi.doMock('@/lib/supabase/actions', () => ({
      createSupabaseServerActionClient: async () => mockSupabase(
        { id: 'user2', role: 'user' },
        { author_id: 'user1', recipient_ids: [] },
      ),
    }))
    actions = await import('../app/tasks/actions')
    const res = await actions.updateTaskStatus('task1', 'OFFEN')
    expect(res.success).toBe(false)
    expect(res.error).toMatch(/Keine Berechtigung/)
  })
})
