// La URL y la llave anon son públicas por diseño: la seguridad está en RLS.
// Se leen con el nombre completo para que Next.js las incluya en el bundle.
export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY. Copia .env.example como .env.local y complétalo.",
    )
  }
  return { url, anonKey }
}
