'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Post } from '@/lib/supabase'
import { getGravatarUrl } from '@/lib/gravatar'
import Navigation from '@/components/Navigation'

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [offset, setOffset] = useState(0)
  const [error, setError] = useState('')
  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      setError('')
      const res = await fetch('/api/feed?limit=10&offset=0')
      if (!res.ok) throw new Error('Failed to fetch feed')
      const data = await res.json()
      setPosts(data.posts || [])
      setHasMore(data.hasMore)
      setOffset(data.nextOffset || 10)
    } catch (error) {
      console.error('Error:', error)
      setError('Failed to load feed')
    } finally {
      setLoading(false)
    }
  }

  const loadMore = async () => {
    if (loadingMore || !hasMore) return

    setLoadingMore(true)
    try {
      const res = await fetch(`/api/feed?limit=10&offset=${offset}`)
      if (res.ok) {
        const data = await res.json()
        setPosts([...posts, ...data.posts])
        setHasMore(data.hasMore)
        setOffset(data.nextOffset || offset + 10)
      } else {
        const errorData = await res.json()
        console.error('Failed to load more posts:', errorData)
      }
    } catch (error) {
      console.error('Error loading more posts:', error)
    } finally {
      setLoadingMore(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading feed...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Error: {error}</p>
          <button 
            onClick={fetchPosts}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-2xl mx-auto">
        {/* Posts Feed */}
        <div className="bg-white">
          {posts.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <div className="text-4xl mb-4">📝</div>
              <p className="text-lg">No posts yet</p>
              <p className="text-sm mt-2">Be the first to share something!</p>
            </div>
          ) : (
            <div>
              {posts.map((post) => (
                <div key={post.id} className="border-b border-gray-200 p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                      {post.profiles?.avatar_url ? (
                        <Image 
                          src={post.profiles.avatar_url} 
                          alt={post.profiles.name || post.profiles.handle || 'User'} 
                          width={40} 
                          height={40} 
                          className="w-full h-full rounded-full object-cover" 
                        />
                      ) : post.profiles?.email ? (
                        <Image 
                          src={getGravatarUrl(post.profiles.email, 40)} 
                          alt={post.profiles.name || post.profiles.handle || 'User'} 
                          width={40} 
                          height={40} 
                          className="w-full h-full rounded-full object-cover" 
                        />
                      ) : (
                        <span className="text-sm font-bold text-gray-600">
                          {(post.profiles?.name || 'U')[0].toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex gap-2 text-sm text-gray-500 mb-1">
                        <span className="font-semibold text-gray-900">
                          {post.profiles?.name || post.profiles?.handle}
                        </span>
                        <span>@{post.profiles?.handle}</span>
                        <span>·</span>
                        <span suppressHydrationWarning>{new Date(post.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-gray-900 break-words whitespace-pre-wrap leading-relaxed">
                        {post.text}
                      </p>
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
