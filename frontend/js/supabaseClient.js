import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

export const supabase = createClient(
  "https://ujnicnvpzkpvqkvwrwhz.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqbmljbnZwemtwdnFrdndyd2h6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDczMjI3MTksImV4cCI6MjA2Mjg5ODcxOX0.t3dz02v_f3gEIN9DsaGJ60DRnEpxPlsCDUATPLXKiTI"
);

// Configurar manejo de errores de autenticación
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
    // Limpiar token del localStorage si se cerró sesión o se refrescó el token
    if (event === 'SIGNED_OUT') {
      localStorage.removeItem('supabaseToken');
    }
  }
});

export async function setSupabaseAuthToken(token) {
  await supabase.auth.setSession({
    access_token: token,
    refresh_token: token
  });
}