import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("⚠️ Cảnh báo: Thiếu biến môi trường Supabase! Kiểm tra lại file .env.local");
}

export const supabase = createClient(supabaseUrl || 'https://supabase.co',supabaseAnonKey || 'placeholder')
)
