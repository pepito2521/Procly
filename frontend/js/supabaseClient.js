import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

export const supabase = createClient(
  "https://ujnicnvpzkpvqkvwrwhz.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqbmljbnZwemtwdnFrdndyd2h6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDczMjI3MTksImV4cCI6MjA2Mjg5ODcxOX0.t3dz02v_f3gEIN9DsaGJ60DRnEpxPlsCDUATPLXKiTI"
);
