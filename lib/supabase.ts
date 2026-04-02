import { createBrowserClient } from '@supabase/ssr'

// Use createBrowserClient (from @supabase/ssr) instead of createClient.
// This stores the auth session in COOKIES rather than localStorage,
// so the Next.js middleware can read and validate it server-side.
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
