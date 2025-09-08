'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function Navigation() {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<{ id: string } | null>(null)
  const [profileHandle, setProfileHandle] = useState<string | null>(null)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('handle')
          .eq('id', user.id)
          .single()
        if (profile) {
          setProfileHandle(profile.handle)
        }
      }
    }
    getUser()

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
      if (!session) {
        setProfileHandle(null)
      } else {
        const fetchProfile = async () => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('handle')
            .eq('id', session.user.id)
            .single()
          if (profile) {
            setProfileHandle(profile.handle)
          }
        }
        fetchProfile()
      }
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/sign-in')
  }

  if (!user) return null

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-2xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex space-x-6">
            <Link 
              href="/feed"
              className={`text-sm font-medium ${
                pathname === '/feed' 
                  ? 'text-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Feed
            </Link>
            {profileHandle && (
              <Link 
                href={`/u/${profileHandle}`}
                className={`text-sm font-medium ${
                  pathname.startsWith('/u/') 
                    ? 'text-blue-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Profile
              </Link>
            )}
          </div>
          <button
            onClick={handleSignOut}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}
