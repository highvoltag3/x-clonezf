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
    
    if (postText.length > 280) {
      setPostError('Post is too long. Maximum 280 characters.')
      return
    }

    setPosting(true)
    setPostError('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setPostError('Please sign in to post')
        return
      }

      const { data: post, error } = await supabase
        .from('posts')
        .insert({
          author_id: user.id,
          text: postText.trim()
        })
        .select(`
          *,
          profiles!posts_author_id_fkey (
            id,
            handle,
            name,
            avatar_url
          )
        `)
        .single()

      if (error) {
        console.error('Error creating post:', error)
        setPostError('Failed to create post')
        return
      }

      setPosts([post, ...posts])
      setPostText('')
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <h1 className="text-xl font-bold text-gray-900">Profile</h1>
        </div>
      </div>
      
      <div className="max-w-2xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="p-6">
            <div className="flex gap-4">
              <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                {profile.avatar_url ? (
                  <Image src={profile.avatar_url} alt={profile.name || profile.handle} width={80} height={80} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold text-gray-600">{(profile.name || profile.handle)[0].toUpperCase()}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold text-gray-900 truncate">{profile.name || profile.handle}</h1>
                <p className="text-gray-500 text-lg">@{profile.handle}</p>
                {profile.bio && <p className="mt-3 text-gray-700 leading-relaxed">{profile.bio}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Compose */}
        {isOwner && (
          <div className="bg-white border-b border-gray-200 p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">What&apos;s happening?</h2>
            <div className="flex gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                {profile.avatar_url ? (
                  <Image src={profile.avatar_url} alt={profile.name || profile.handle} width={40} height={40} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span className="text-sm font-bold text-gray-600">{(profile.name || profile.handle)[0].toUpperCase()}</span>
                )}
              </div>
              <div className="flex-1">
                <textarea
                  placeholder="Share your thoughts..."
                  className="w-full p-3 border-0 resize-none text-lg placeholder-gray-500 focus:outline-none"
                  rows={3}
                  maxLength={280}
                  value={postText}
                  onChange={(e) => setPostText(e.target.value)}
                />
                {postError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm mb-3">
                    {postError}
                  </div>
                )}
                <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                  <span className={`text-sm ${postText.length > 260 ? 'text-red-500' : 'text-gray-500'}`}>
                    {postText.length}/280
                  </span>
                  <button 
                    className={`px-6 py-2 rounded-full font-semibold text-sm transition-colors ${
                      postText.trim() && postText.length <= 280 && !posting
                        ? 'bg-blue-500 text-white hover:bg-blue-600'
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
                    disabled={!postText.trim() || postText.length > 280 || posting}
                    onClick={handlePost}
                  >
                    {posting ? 'Posting...' : postText.length > 280 ? 'Too long' : 'Post'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Posts */}
        <div className="bg-white">
          {posts.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <div className="text-4xl mb-4">📝</div>
              <p className="text-lg">No posts yet</p>
              {isOwner && <p className="text-sm mt-2">Share your first thought!</p>}
            </div>
          ) : (
            <div>
              {posts.map((post) => (
                <div key={post.id} className="border-b border-gray-200 p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                      {post.profiles?.avatar_url ? (
                        <Image src={post.profiles.avatar_url} alt={post.profiles.name || post.profiles.handle || 'User'} width={40} height={40} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <span className="text-sm font-bold text-gray-600">{(post.profiles?.name || 'U')[0].toUpperCase()}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex gap-2 text-sm text-gray-500 mb-1">
                        <span className="font-semibold text-gray-900">{post.profiles?.name || post.profiles?.handle}</span>
                        <span>@{post.profiles?.handle}</span>
                        <span>·</span>
                        <span>{new Date(post.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-gray-900 break-words whitespace-pre-wrap leading-relaxed">{post.text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Load More Button */}
        {hasMore && (
          <div className="p-4 text-center bg-white border-t border-gray-200">
            <button 
              className="text-blue-500 hover:text-blue-600 font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={loadMore}
              disabled={loadingMore}
            >
              {loadingMore ? 'Loading...' : 'Load more posts'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}