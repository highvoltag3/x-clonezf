'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { Profile, Post, supabase } from '@/lib/supabase'

export default function ProfilePage() {
  const params = useParams()
  const handle = params.handle as string
  const [profile, setProfile] = useState<Profile | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [isOwner, setIsOwner] = useState(false)
  const [postText, setPostText] = useState('')
  const [posting, setPosting] = useState(false)
  const [user, setUser] = useState<{ id: string } | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [offset, setOffset] = useState(0)
  const [error, setError] = useState('')
  const [postError, setPostError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError('')
        
        // Check auth
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)

        // Fetch profile
        const profileRes = await fetch(`/api/profile/${handle}`)
        if (!profileRes.ok) {
          const errorData = await profileRes.json()
          throw new Error(errorData.error || 'Failed to fetch profile')
        }
        const profileData = await profileRes.json()
        setProfile(profileData)
        setIsOwner(user?.id === profileData.id)

        // Fetch posts
        const postsRes = await fetch(`/api/profile/${handle}/posts?limit=10&offset=0`)
        if (!postsRes.ok) {
          const errorData = await postsRes.json()
          throw new Error(errorData.error || 'Failed to fetch posts')
        }
        const postsData = await postsRes.json()
        setPosts(postsData.posts || [])
        setHasMore(postsData.hasMore)
        setOffset(postsData.nextOffset || 10)
      } catch (error) {
        console.error('Error fetching data:', error)
        setError(error instanceof Error ? error.message : 'Failed to load profile')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [handle])

  const handlePost = async () => {
    if (!postText.trim()) return
    
    // Double check, though we're handing this now in the frontend so it shouldn't happen under normal circumstances
    if (postText.length > 280) {
      setPostError('Post is too long. Maximum 280 characters.')
      return
    }

    setPosting(true)
    setPostError('')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setPostError('Please sign in to post')
        return
      }

      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ text: postText }),
      })

      if (res.ok) {
        const newPost = await res.json()
        setPosts([newPost, ...posts])
        setPostText('')
      } else {
        const errorData = await res.json()
        setPostError(errorData.error || 'Failed to create post')
      }
    } catch (error) {
      console.error('Error creating post:', error)
      setPostError('Network error. Please try again.')
    } finally {
      setPosting(false)
    }
  }

  const loadMore = async () => {
    if (loadingMore || !hasMore) return
    
    setLoadingMore(true)
    try {
      const postsRes = await fetch(`/api/profile/${handle}/posts?limit=10&offset=${offset}`)
      if (postsRes.ok) {
        const postsData = await postsRes.json()
        setPosts([...posts, ...postsData.posts])
        setHasMore(postsData.hasMore)
        setOffset(postsData.nextOffset || offset + 10)
      } else {
        const errorData = await postsRes.json()
        console.error('Failed to load more posts:', errorData)
      }
    } catch (error) {
      console.error('Error loading more posts:', error)
    } finally {
      setLoadingMore(false)
    }
  }

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>
  }

  if (error) {
    return <div className="p-8 text-center text-red-600">Error: {error}</div>
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
              <Image src={profile.avatar_url} alt={profile.name || profile.handle} width={64} height={64} className="w-full h-full rounded-full" />
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
            <h2 className="font-semibold mb-2">What&apos;s happening?</h2>
          <textarea
            placeholder="Share your thoughts..."
            className="w-full p-2 border rounded mb-2 resize-none"
            rows={3}
            maxLength={280}
            value={postText}
            onChange={(e) => setPostText(e.target.value)}
          />
          {postError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-2 text-sm">
              {postError}
            </div>
          )}
          <div className="flex justify-between">
            <span className={`text-sm ${postText.length > 260 ? 'text-red-500' : 'text-gray-500'}`}>
              {postText.length}/280
            </span>
            <button 
              className={`px-4 py-1 rounded ${
                postText.trim() && postText.length <= 280 && !posting
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              disabled={!postText.trim() || postText.length > 280 || posting}
              onClick={handlePost}
            >
              {posting ? 'Posting...' : postText.length > 280 ? 'Too long' : 'Post'}
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
                      <Image src={post.profiles.avatar_url} alt={post.profiles.name || post.profiles.handle || 'User'} width={40} height={40} className="w-full h-full rounded-full" />
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
                    <p className="break-words whitespace-pre-wrap">{post.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="mt-6 text-center">
          <button 
            className="bg-white text-gray-700 px-6 py-2 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
            onClick={loadMore}
            disabled={loadingMore}
          >
            {loadingMore ? 'Loading...' : 'Load more posts'}
          </button>
        </div>
      )}
    </div>
  )
}