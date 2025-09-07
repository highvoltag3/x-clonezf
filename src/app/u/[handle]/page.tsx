'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Profile, Post } from '@/lib/supabase'

const mockProfile: Profile = {
  id: '1',
  handle: 'darionovoa',
  name: 'Dario Novoa',
  avatar_url: null,
  bio: 'Software developer',
  created_at: '2025-09-07T00:00:00Z'
}

const mockPosts: Post[] = [
  {
    id: '1',
    author_id: '1',
    text: 'Just built my first Twitter clone! 🚀',
    created_at: '2025-09-07T10:30:00Z',
    profiles: mockProfile
  },
  {
    id: '2',
    author_id: '1',
    text: 'Working on real-time features and pagination.',
    created_at: '2025-09-07T09:15:00Z',
    profiles: mockProfile
  },
  {
    id: '3',
    author_id: '1',
    text: 'Zellerfeld is the best! Can\'t wait to merge my love for 3D and Code',
    created_at: '2025-09-07T08:45:00Z',
    profiles: mockProfile
  }
]

export default function ProfilePage() {
  const params = useParams()
  const handle = params.handle as string
  const [profile, setProfile] = useState<Profile | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [isOwner, setIsOwner] = useState(false)

  useEffect(() => {
    setProfile(mockProfile)
    setPosts(mockPosts)
    setLoading(false)
    setIsOwner(handle === 'darionovoa')
  }, [handle])

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>
  }

  if (!profile) {
    return <div className="p-8 text-center">Profile not found</div>
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* Profile */}
      <div className="bg-white border rounded p-6 mb-4">
        <div className="flex gap-4">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.name} className="w-full h-full rounded-full" />
            ) : (
              <span className="text-xl font-bold">{(profile.name || profile.handle)[0]}</span>
            )}
          </div>
          <div>
            <h1 className="text-xl font-bold">{profile.name || profile.handle}</h1>
            <p className="text-gray-600">@{profile.handle}</p>
            {profile.bio && <p className="mt-2">{profile.bio}</p>}
          </div>
        </div>
      </div>

      {/* Compose */}
      {isOwner && (
        <div className="bg-white border rounded p-4 mb-4">
          <h2 className="font-semibold mb-2">What's happening?</h2>
          <textarea
            placeholder="Share your thoughts..."
            className="w-full p-2 border rounded mb-2"
            rows={3}
            maxLength={280}
          />
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">0/280</span>
            <button className="bg-blue-500 text-white px-4 py-1 rounded" disabled>
              Post
            </button>
          </div>
        </div>
      )}

      {/* Posts */}
      <div>
        <h2 className="font-semibold mb-4">{isOwner ? 'Your Posts' : 'Posts'}</h2>
        {posts.length === 0 ? (
          <div className="bg-white border rounded p-8 text-center text-gray-500">
            No posts yet
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="bg-white border rounded p-4">
                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    {post.profiles?.avatar_url ? (
                      <img src={post.profiles.avatar_url} alt="" className="w-full h-full rounded-full" />
                    ) : (
                      <span className="text-sm font-bold">{(post.profiles?.name || 'U')[0]}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex gap-2 text-sm text-gray-600 mb-1">
                      <span className="font-semibold text-black">{post.profiles?.name || post.profiles?.handle}</span>
                      <span>@{post.profiles?.handle}</span>
                      <span>·</span>
                      <span>{new Date(post.created_at).toLocaleDateString()}</span>
                    </div>
                    <p>{post.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}