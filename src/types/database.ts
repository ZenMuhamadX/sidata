/**
 * File ini disiapkan sebagai wadah type definition untuk Supabase PostgreSQL Database.
 * Ketika code generation dijalankan (misal melalui Supabase CLI: supabase gen types typescript),
 * tipe skema 'assyifa' dapat diintegrasikan di sini.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// Placeholder database type structure agar extensible
export interface Database {
  assyifa: {
    Tables: Record<string, unknown>;
    Views: Record<string, unknown>;
    Functions: Record<string, unknown>;
    Enums: Record<string, unknown>;
    CompositeTypes: Record<string, unknown>;
  };
}
