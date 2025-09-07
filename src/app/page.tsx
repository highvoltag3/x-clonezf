'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function HomePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          router.push('/u/darionovoa')
        } else {
          router.push('/sign-in')
        }
      } catch (error) {
        router.push('/sign-in')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>
  }

  return null
}