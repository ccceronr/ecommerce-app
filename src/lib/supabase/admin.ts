import { createClient } from '@supabase/supabase-js'

// Cliente con service role: bypasea RLS y permite usar auth.admin.*
// Solo usarlo en código de servidor (webhooks, jobs). NUNCA exponer al cliente.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
