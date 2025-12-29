"use client"

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { AdminUser, AdminRole } from '@/types'

interface AdminAuthState {
  user: User | null
  adminUser: AdminUser | null
  role: AdminRole | null
  isLoading: boolean
  error: string | null
}

export function useAdminAuth() {
  const [state, setState] = useState<AdminAuthState>({
    user: null,
    adminUser: null,
    role: null,
    isLoading: true,
    error: null,
  })

  const supabase = createClient()

  const fetchAdminUser = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('admin_users')
      .select(`
        id,
        user_id,
        role,
        is_active
      `)
      .eq('user_id', userId)
      .eq('is_active', true)
      .single()

    if (error) {
      return null
    }

    return data as AdminUser
  }, [supabase])

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser()

        if (userError) {
          setState({
            user: null,
            adminUser: null,
            role: null,
            isLoading: false,
            error: userError.message,
          })
          return
        }

        if (!user) {
          setState({
            user: null,
            adminUser: null,
            role: null,
            isLoading: false,
            error: null,
          })
          return
        }

        const adminUser = await fetchAdminUser(user.id)

        if (!adminUser) {
          setState({
            user,
            adminUser: null,
            role: null,
            isLoading: false,
            error: 'Not an admin user',
          })
          return
        }

        setState({
          user,
          adminUser,
          role: adminUser.role,
          isLoading: false,
          error: null,
        })
      } catch (err) {
        setState({
          user: null,
          adminUser: null,
          role: null,
          isLoading: false,
          error: err instanceof Error ? err.message : 'Unknown error',
        })
      }
    }

    initAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT' || !session?.user) {
          setState({
            user: null,
            adminUser: null,
            role: null,
            isLoading: false,
            error: null,
          })
          return
        }

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setState(prev => ({ ...prev, isLoading: true }))
          const adminUser = await fetchAdminUser(session.user.id)

          setState({
            user: session.user,
            adminUser,
            role: adminUser?.role ?? null,
            isLoading: false,
            error: adminUser ? null : 'Not an admin user',
          })
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, fetchAdminUser])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
  }, [supabase])

  const refreshAdminUser = useCallback(async () => {
    if (!state.user) return

    setState(prev => ({ ...prev, isLoading: true }))
    const adminUser = await fetchAdminUser(state.user.id)

    setState(prev => ({
      ...prev,
      adminUser,
      role: adminUser?.role ?? null,
      isLoading: false,
      error: adminUser ? null : 'Not an admin user',
    }))
  }, [state.user, fetchAdminUser])

  return {
    ...state,
    signOut,
    refreshAdminUser,
  }
}
