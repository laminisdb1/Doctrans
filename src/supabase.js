import { createClientComponentClient } from '@supabase/auth-helpers-react'

export const supabase = createClientComponentClient({
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
  supabaseKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
})