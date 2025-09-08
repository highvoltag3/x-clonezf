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
    <nav className="bg-white/95 backdrop-blur-md border-b border-gray-200/60 sticky top-0 z-50 shadow-sm">
      <div className="max-w-2xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <Link 
              href="/feed"
              className={`px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                pathname === '/feed' 
                  ? 'bg-blue-500 text-white shadow-md transform scale-105' 
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 hover:scale-105'
              }`}
            >
              Feed
            </Link>
            {profileHandle && (
              <Link 
                href={`/u/${profileHandle}`}
                className={`px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                  pathname.startsWith('/u/') 
                    ? 'bg-blue-500 text-white shadow-md transform scale-105' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 hover:scale-105'
                }`}
              >
                Profile
              </Link>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="hidden sm:block text-sm text-gray-500 font-medium">
              @{profileHandle}
            </div>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-red-50 hover:text-red-600 rounded-full transition-all duration-200 hover:scale-105 border border-transparent hover:border-red-200"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
