'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '@/types'

interface UseUserReturn {
  user: User | null
  profile: Profile | null
  isLoading: boolean
  isAdmin: boolean
}

export function useUser(): UseUserReturn {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    const fetchProfile = async (userId: string) => {
      try {
        console.log('4. Buscando perfil para:', userId)

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle()

        console.log('5. PROFILE:', data, error)

        if (error) {
          setProfile(null)
          return
        }

        setProfile(data ?? null)
      } catch (err) {
        console.error('6. ERROR fetchProfile:', err)
        setProfile(null)
      }
    }

    const loadUser = async () => {
      try {
        console.log('1. loadUser iniciado')

        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        console.log('2. SESSION:', session, error)

        const currentUser = session?.user ?? null
        setUser(currentUser)

        // Bajamos loading de una vez
        setIsLoading(false)
        console.log('3. isLoading false')

        if (currentUser) {
          fetchProfile(currentUser.id)
        } else {
          setProfile(null)
        }
      } catch (err) {
        console.error('ERROR loadUser:', err)
        setUser(null)
        setProfile(null)
        setIsLoading(false)
      }
    }

    loadUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('8. onAuthStateChange:', event, session)

      const currentUser = session?.user ?? null
      setUser(currentUser)

      // Nunca dejar loading pegado aquí
      setIsLoading(false)

      if (currentUser) {
        fetchProfile(currentUser.id)
      } else {
        setProfile(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return {
    user,
    profile,
    isLoading,
    isAdmin: profile?.role === 'admin',
  }
}