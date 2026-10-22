/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Public Supabase settings (D-044). Missing → sign-in is unavailable. */
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string;
}
