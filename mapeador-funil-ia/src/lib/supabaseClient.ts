import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Variáveis VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY não configuradas. Copie .env.example para .env.'
  )
}

// Tabelas tipadas manualmente em ./types (Mapeamento, FunilGerado, CampoPadrao);
// o client fica sem o generic Database para evitar fricção de inferência do supabase-js
// com jsonb genérico — as chamadas fazem cast via <T> nos selects quando necessário.
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
