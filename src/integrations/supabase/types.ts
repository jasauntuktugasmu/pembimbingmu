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
          id: string
          is_active: boolean | null
          judul: string
          jumlah_review: number | null
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
          id?: string
          is_active?: boolean | null
          judul: string
          jumlah_review?: number | null
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
          id?: string
          is_active?: boolean | null
          judul?: string
          jumlah_review?: number | null
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
      profiles: {
        Row: {
          credits: number
          cv_credits: number | null
          email: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"] | null
          skripsi_credits: number | null
        }
        Insert: {
          credits?: number
          cv_credits?: number | null
          email?: string | null
          id: string
          role?: Database["public"]["Enums"]["user_role"] | null
          skripsi_credits?: number | null
        }
        Update: {
          credits?: number
          cv_credits?: number | null
          email?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"] | null
          skripsi_credits?: number | null
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
            foreignKeyName: "subscribers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      decrement_credits: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["user_role"]
      }
      has_paket_access: {
        Args: { paket_id_input: string }
        Returns: boolean
      }
      is_email_authorized: {
        Args: { email_to_check: string }
        Returns: boolean
      }
      is_superadmin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
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
      user_role: "superadmin" | "subscriber"
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
      user_role: ["superadmin", "subscriber"],
    },
  },
} as const
