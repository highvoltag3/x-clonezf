import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { handle: string } }
) {
  try {
    const { handle } = params
    console.log('API: Looking for profile with handle:', handle)

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('handle', handle)
      .single()

    console.log('API: Profile query result:', { profile, error: profileError })

    if (profileError) {
      console.log('API: Profile not found error:', profileError)
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    console.log('API: Returning profile:', profile)
    return NextResponse.json(profile)
  } catch (error) {
    console.error('API: Error fetching profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}