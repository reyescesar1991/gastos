// Representa la respuesta directa de Supabase / BD
export interface SupabaseProfileDto {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  created_at: string;
}