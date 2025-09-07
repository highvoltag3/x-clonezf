import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { handle: string } }
) {
  try {
    const { handle } = params
    const { searchParams } = new URL(request.url)
    const cursor = searchParams.get('cursor')
    const limit = parseInt(searchParams.get('limit') || '10')

    // First get the profile to get the author_id
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('handle', handle)
      .single()

    if (profileError) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    // Build query for posts
    let query = supabase
      .from('posts')
      .select(`
        *,
        profiles!posts_author_id_fkey (
          id,
          handle,
          name,
          avatar_url
        )
      `)
      .eq('author_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(limit)

    // Add cursor-based pagination if provided
    if (cursor) {
      query = query.lt('created_at', cursor)
    }

    const { data: posts, error: postsError } = await query

    if (postsError) {
      return NextResponse.json(
        { error: 'Failed to fetch posts' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      posts,
      nextCursor: posts.length === limit ? posts[posts.length - 1]?.created_at : null
    })
  } catch (error) {
    console.error('Error fetching posts:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
