/** Tipos gerados para o Supabase (tabelas do marketplace) */

export interface Database {
  public: {
    Tables: {
      marketplace_watchlists: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          search_term: string;
          min_price: number | null;
          max_price: number | null;
          state: string | null;
          city: string | null;
          is_active: boolean;
          last_run_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['marketplace_watchlists']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['marketplace_watchlists']['Insert']>;
      };
      marketplace_listings: {
        Row: {
          id: string;
          source: string;
          external_id: string | null;
          external_url: string;
          title: string;
          price: number | null;
          location_text: string | null;
          city: string | null;
          state: string | null;
          posted_at: string | null;
          first_seen_at: string;
          last_seen_at: string;
          dedupe_hash: string | null;
          raw_data: Record<string, unknown> | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['marketplace_listings']['Row'], 'id' | 'first_seen_at' | 'last_seen_at' | 'created_at' | 'updated_at'> & {
          id?: string;
          first_seen_at?: string;
          last_seen_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['marketplace_listings']['Insert']>;
      };
      marketplace_matches: {
        Row: {
          id: string;
          watchlist_id: string;
          listing_id: string;
          score: number | null;
          matched_at: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['marketplace_matches']['Row'], 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Database['public']['Tables']['marketplace_matches']['Insert']>;
      };
      marketplace_alerts: {
        Row: {
          id: string;
          user_id: string;
          watchlist_id: string;
          listing_id: string;
          title: string;
          message: string | null;
          is_read: boolean;
          read_at: string | null;
          dismissed_at: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['marketplace_alerts']['Row'], 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Database['public']['Tables']['marketplace_alerts']['Insert']>;
      };
      marketplace_scrape_runs: {
        Row: {
          id: string;
          watchlist_id: string;
          status: string;
          total_found: number;
          total_new: number;
          error_message: string | null;
          started_at: string;
          finished_at: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['marketplace_scrape_runs']['Row'], 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Database['public']['Tables']['marketplace_scrape_runs']['Insert']>;
      };
    };
  };
}
