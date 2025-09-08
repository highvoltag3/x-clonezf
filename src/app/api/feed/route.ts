import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select(`
        *,
        profiles!posts_author_id_fkey (
          id,
          handle,
          name,
          avatar_url,
          email
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (postsError) {
      return NextResponse.json({ error: 'Failed to fetch feed' }, { status: 500 })
    }

    return NextResponse.json({
      posts,
      hasMore: posts.length === limit,
      nextOffset: offset + limit
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
