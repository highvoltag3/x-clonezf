import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Profile {
  id: string
  handle: string
  name: string | null
  avatar_url: string | null
  bio: string | null
  email: string | null
  created_at: string
}

export interface Post {
  id: string
  author_id: string
  text: string
  created_at: string
  profiles?: Profile
}
