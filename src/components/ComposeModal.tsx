'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { supabase } from '@/lib/supabase'

interface ComposeModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ComposeModal({ isOpen, onClose }: ComposeModalProps) {
  const [postText, setPostText] = useState('')
  const [posting, setPosting] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  const handleCompose = async () => {
    if (!postText.trim() || postText.length > 280) return

    setPosting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('posts')
        .insert({
          author_id: user.id,
          text: postText.trim()
        })

      if (error) throw error

      setPostText('')
      onClose()
      window.location.reload()
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setPosting(false)
    }
  }

  if (!mounted || !isOpen) return null

  return createPortal(
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Compose Tweet</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>
        
        <div className="p-4">
          <textarea
            placeholder="What's happening?"
            className="w-full p-3 border-0 resize-none text-lg placeholder-gray-500 focus:outline-none"
            style={{ color: '#121212' }}
            rows={4}
            maxLength={280}
            value={postText}
            onChange={(e) => setPostText(e.target.value)}
          />
          
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
              onClick={handleCompose}
            >
              {posting ? 'Posting...' : postText.length > 280 ? 'Too long' : 'Tweet'}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
