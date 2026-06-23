export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      akses_log: {
        Row: {
          halaman: string
          id: string
          paket_id: string | null
          user_id: string
          waktu_akses: string
        }
        Insert: {
          halaman: string
          id?: string
          paket_id?: string | null
          user_id: string
          waktu_akses?: string
        }
        Update: {
          halaman?: string
          id?: string
          paket_id?: string | null
          user_id?: string
          waktu_akses?: string
        }
        Relationships: [
          {
            foreignKeyName: "akses_log_paket_id_fkey"
            columns: ["paket_id"]
            isOneToOne: false
            referencedRelation: "paket_pembelajaran"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "akses_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      authorized_emails: {
        Row: {
          created_at: string
          email: string
          id: number
        }
        Insert: {
          created_at?: string
          email: string
          id?: number
        }
        Update: {
          created_at?: string
          email?: string
          id?: number
        }
        Relationships: []
      }
      blog_article_tags: {
        Row: {
          article_id: string
          created_at: string
          tag_id: string
        }
        Insert: {
          article_id: string
          created_at?: string
          tag_id: string
        }
        Update: {
          article_id?: string
          created_at?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_article_tags_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "blog_articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_article_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "blog_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_article_views: {
        Row: {
          article_id: string
          id: string
          ip_hash: string | null
          referrer: string | null
          user_agent: string | null
          viewed_at: string
        }
        Insert: {
          article_id: string
          id?: string
          ip_hash?: string | null
          referrer?: string | null
          user_agent?: string | null
          viewed_at?: string
        }
        Update: {
          article_id?: string
          id?: string
          ip_hash?: string | null
          referrer?: string | null
          user_agent?: string | null
          viewed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_article_views_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "blog_articles"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_articles: {
        Row: {
          author_id: string
          canonical_url: string | null
          category_id: string | null
          content: Json | null
          content_html: string | null
          created_at: string
          excerpt: string | null
          featured_image: string | null
          focus_keyword: string | null
          id: string
          meta_description: string | null
          meta_keywords: string | null
          og_description: string | null
          og_image: string | null
          og_title: string | null
          published_at: string | null
          reading_time_minutes: number | null
          robots_meta: string | null
          seo_score: number | null
          seo_title: string | null
          slug: string
          status: string
          thumbnail_seo: string | null
          title: string
          twitter_image: string | null
          updated_at: string
          views_count: number
          word_count: number | null
        }
        Insert: {
          author_id: string
          canonical_url?: string | null
          category_id?: string | null
          content?: Json | null
          content_html?: string | null
          created_at?: string
          excerpt?: string | null
          featured_image?: string | null
          focus_keyword?: string | null
          id?: string
          meta_description?: string | null
          meta_keywords?: string | null
          og_description?: string | null
          og_image?: string | null
          og_title?: string | null
          published_at?: string | null
          reading_time_minutes?: number | null
          robots_meta?: string | null
          seo_score?: number | null
          seo_title?: string | null
          slug: string
          status?: string
          thumbnail_seo?: string | null
          title: string
          twitter_image?: string | null
          updated_at?: string
          views_count?: number
          word_count?: number | null
        }
        Update: {
          author_id?: string
          canonical_url?: string | null
          category_id?: string | null
          content?: Json | null
          content_html?: string | null
          created_at?: string
          excerpt?: string | null
          featured_image?: string | null
          focus_keyword?: string | null
          id?: string
          meta_description?: string | null
          meta_keywords?: string | null
          og_description?: string | null
          og_image?: string | null
          og_title?: string | null
          published_at?: string | null
          reading_time_minutes?: number | null
          robots_meta?: string | null
          seo_score?: number | null
          seo_title?: string | null
          slug?: string
          status?: string
          thumbnail_seo?: string | null
          title?: string
          twitter_image?: string | null
          updated_at?: string
          views_count?: number
          word_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "blog_articles_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_articles_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "blog_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          meta_description: string | null
          name: string
          seo_title: string | null
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          meta_description?: string | null
          name: string
          seo_title?: string | null
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          meta_description?: string | null
          name?: string
          seo_title?: string | null
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      blog_related_articles: {
        Row: {
          article_id: string
          created_at: string
          position: number | null
          related_id: string
        }
        Insert: {
          article_id: string
          created_at?: string
          position?: number | null
          related_id: string
        }
        Update: {
          article_id?: string
          created_at?: string
          position?: number | null
          related_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_related_articles_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "blog_articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_related_articles_related_id_fkey"
            columns: ["related_id"]
            isOneToOne: false
            referencedRelation: "blog_articles"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_tags: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      credit_topups: {
        Row: {
          applied: boolean
          created_at: string
          credits_added: number
          email: string
          external_order_id: string
          id: string
        }
        Insert: {
          applied?: boolean
          created_at?: string
          credits_added: number
          email: string
          external_order_id: string
          id?: string
        }
        Update: {
          applied?: boolean
          created_at?: string
          credits_added?: number
          email?: string
          external_order_id?: string
          id?: string
        }
        Relationships: []
      }
      kelas: {
        Row: {
          created_at: string
          deskripsi: string | null
          durasi_menit: number | null
          durasi_text: string | null
          harga_asli: number | null
          harga_diskon: number | null
          id: string
          is_active: boolean | null
          judul: string
          jumlah_review: number | null
          jumlah_user: number | null
          level: string | null
          paket_id: string
          pengajar: string
          rating: number | null
          thumbnail_url: string | null
          updated_at: string
          urutan: number | null
        }
        Insert: {
          created_at?: string
          deskripsi?: string | null
          durasi_menit?: number | null
          durasi_text?: string | null
          harga_asli?: number | null
          harga_diskon?: number | null
          id?: string
          is_active?: boolean | null
          judul: string
          jumlah_review?: number | null
          jumlah_user?: number | null
          level?: string | null
          paket_id: string
          pengajar: string
          rating?: number | null
          thumbnail_url?: string | null
          updated_at?: string
          urutan?: number | null
        }
        Update: {
          created_at?: string
          deskripsi?: string | null
          durasi_menit?: number | null
          durasi_text?: string | null
          harga_asli?: number | null
          harga_diskon?: number | null
          id?: string
          is_active?: boolean | null
          judul?: string
          jumlah_review?: number | null
          jumlah_user?: number | null
          level?: string | null
          paket_id?: string
          pengajar?: string
          rating?: number | null
          thumbnail_url?: string | null
          updated_at?: string
          urutan?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "kelas_paket_id_fkey"
            columns: ["paket_id"]
            isOneToOne: false
            referencedRelation: "paket_pembelajaran"
            referencedColumns: ["id"]
          },
        ]
      }
      materi: {
        Row: {
          created_at: string
          deskripsi: string | null
          id: string
          judul: string
          kelas_id: string
          link_video: string | null
          order: number
          parent_id: string | null
          thumbnail: string | null
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          deskripsi?: string | null
          id?: string
          judul: string
          kelas_id: string
          link_video?: string | null
          order?: number
          parent_id?: string | null
          thumbnail?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          deskripsi?: string | null
          id?: string
          judul?: string
          kelas_id?: string
          link_video?: string | null
          order?: number
          parent_id?: string | null
          thumbnail?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "materi_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "materi"
            referencedColumns: ["id"]
          },
        ]
      }
      paket_content: {
        Row: {
          created_at: string
          id: string
          judul: string
          konten: string | null
          paket_id: string
          updated_at: string
          urutan: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          judul: string
          konten?: string | null
          paket_id: string
          updated_at?: string
          urutan?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          judul?: string
          konten?: string | null
          paket_id?: string
          updated_at?: string
          urutan?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "paket_content_paket_id_fkey"
            columns: ["paket_id"]
            isOneToOne: false
            referencedRelation: "paket_pembelajaran"
            referencedColumns: ["id"]
          },
        ]
      }
      paket_pembelajaran: {
        Row: {
          background_color: string | null
          button_text: string | null
          category_link: string | null
          created_at: string
          deskripsi: string | null
          durasi_hari: number
          gradient_from: string | null
          gradient_to: string | null
          harga: number | null
          icon_url: string | null
          id: string
          nama_paket: string
          thumbnail_url: string | null
          updated_at: string
        }
        Insert: {
          background_color?: string | null
          button_text?: string | null
          category_link?: string | null
          created_at?: string
          deskripsi?: string | null
          durasi_hari?: number
          gradient_from?: string | null
          gradient_to?: string | null
          harga?: number | null
          icon_url?: string | null
          id?: string
          nama_paket: string
          thumbnail_url?: string | null
          updated_at?: string
        }
        Update: {
          background_color?: string | null
          button_text?: string | null
          category_link?: string | null
          created_at?: string
          deskripsi?: string | null
          durasi_hari?: number
          gradient_from?: string | null
          gradient_to?: string | null
          harga?: number | null
          icon_url?: string | null
          id?: string
          nama_paket?: string
          thumbnail_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      payment_transactions: {
        Row: {
          amount: number
          created_at: string
          credits_amount: number
          customer_email: string
          id: string
          lynk_transaction_id: string | null
          order_id: string
          payment_method: string | null
          processed_at: string | null
          status: string
          updated_at: string
          webhook_data: Json | null
        }
        Insert: {
          amount: number
          created_at?: string
          credits_amount: number
          customer_email: string
          id?: string
          lynk_transaction_id?: string | null
          order_id?: string
          payment_method?: string | null
          processed_at?: string | null
          status?: string
          updated_at?: string
          webhook_data?: Json | null
        }
        Update: {
          amount?: number
          created_at?: string
          credits_amount?: number
          customer_email?: string
          id?: string
          lynk_transaction_id?: string | null
          order_id?: string
          payment_method?: string | null
          processed_at?: string | null
          status?: string
          updated_at?: string
          webhook_data?: Json | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          credits: number
          cv_credits: number | null
          email: string | null
          full_name: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"] | null
          skripsi_credits: number | null
        }
        Insert: {
          credits?: number
          cv_credits?: number | null
          email?: string | null
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"] | null
          skripsi_credits?: number | null
        }
        Update: {
          credits?: number
          cv_credits?: number | null
          email?: string | null
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"] | null
          skripsi_credits?: number | null
        }
        Relationships: []
      }
      progress: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          materi_id: string
          skor: number | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          materi_id: string
          skor?: number | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          materi_id?: string
          skor?: number | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          created_at: string
          id: string
          materi_id: string
          rating: number
          review_text: string
          student_role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          materi_id: string
          rating: number
          review_text: string
          student_role: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          materi_id?: string
          rating?: number
          review_text?: string
          student_role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      soal: {
        Row: {
          created_at: string
          id: string
          jawaban_benar: string
          materi_id: string
          pertanyaan: string
          pilihan_a: string
          pilihan_b: string
          pilihan_c: string
          pilihan_d: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          jawaban_benar: string
          materi_id: string
          pertanyaan: string
          pilihan_a: string
          pilihan_b: string
          pilihan_c: string
          pilihan_d: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          jawaban_benar?: string
          materi_id?: string
          pertanyaan?: string
          pilihan_a?: string
          pilihan_b?: string
          pilihan_c?: string
          pilihan_d?: string
          updated_at?: string
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string
          durasi_akhir: string
          durasi_mulai: string
          id: string
          paket_id: string
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          durasi_akhir: string
          durasi_mulai?: string
          id?: string
          paket_id: string
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          durasi_akhir?: string
          durasi_mulai?: string
          id?: string
          paket_id?: string
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscribers_paket_id_fkey"
            columns: ["paket_id"]
            isOneToOne: false
            referencedRelation: "paket_pembelajaran"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscribers_user_id_profiles_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      video_links: {
        Row: {
          created_at: string
          deskripsi: string | null
          id: string
          judul: string
          link_youtube: string
          materi_id: string
          thumbnail: string | null
          updated_at: string
          urutan: number
        }
        Insert: {
          created_at?: string
          deskripsi?: string | null
          id?: string
          judul: string
          link_youtube: string
          materi_id: string
          thumbnail?: string | null
          updated_at?: string
          urutan?: number
        }
        Update: {
          created_at?: string
          deskripsi?: string | null
          id?: string
          judul?: string
          link_youtube?: string
          materi_id?: string
          thumbnail?: string | null
          updated_at?: string
          urutan?: number
        }
        Relationships: [
          {
            foreignKeyName: "video_links_materi_id_fkey"
            columns: ["materi_id"]
            isOneToOne: false
            referencedRelation: "materi"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      decrement_credits: { Args: never; Returns: number }
      get_user_role: {
        Args: never
        Returns: Database["public"]["Enums"]["user_role"]
      }
      has_paket_access: { Args: { paket_id_input: string }; Returns: boolean }
      is_email_authorized: {
        Args: { email_to_check: string }
        Returns: boolean
      }
      is_superadmin: { Args: never; Returns: boolean }
      is_writer: { Args: never; Returns: boolean }
      kurangi_cv_credit: {
        Args: { jumlah: number; user_id_input: string }
        Returns: undefined
      }
      kurangi_skripsi_credit: {
        Args: { jumlah: number; user_id_input: string }
        Returns: undefined
      }
    }
    Enums: {
      user_role: "superadmin" | "subscriber" | "writer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      user_role: ["superadmin", "subscriber", "writer"],
    },
  },
} as const
