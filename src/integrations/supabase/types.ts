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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      companies: {
        Row: {
          cnpj: string | null
          created_at: string
          id: string
          logo_url: string | null
          max_users: number
          name: string
          plan: string
          segment: string | null
          trial_ends_at: string | null
          trial_started_at: string | null
        }
        Insert: {
          cnpj?: string | null
          created_at?: string
          id?: string
          logo_url?: string | null
          max_users?: number
          name: string
          plan?: string
          segment?: string | null
          trial_ends_at?: string | null
          trial_started_at?: string | null
        }
        Update: {
          cnpj?: string | null
          created_at?: string
          id?: string
          logo_url?: string | null
          max_users?: number
          name?: string
          plan?: string
          segment?: string | null
          trial_ends_at?: string | null
          trial_started_at?: string | null
        }
        Relationships: []
      }
      invitations: {
        Row: {
          company_id: string
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string
          status: string
          token: string
        }
        Insert: {
          company_id: string
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by: string
          status?: string
          token?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          status?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "invitations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invitations_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      periodic_services: {
        Row: {
          alert_days_before: number
          category_id: string | null
          company_id: string
          created_at: string
          created_by: string | null
          frequency_days: number | null
          frequency_preset: string | null
          frequency_type: string
          id: string
          last_done_at: string
          name: string
          next_due_at: string
          notes: string | null
          supplier: string | null
          updated_at: string
        }
        Insert: {
          alert_days_before?: number
          category_id?: string | null
          company_id: string
          created_at?: string
          created_by?: string | null
          frequency_days?: number | null
          frequency_preset?: string | null
          frequency_type?: string
          id?: string
          last_done_at: string
          name: string
          next_due_at: string
          notes?: string | null
          supplier?: string | null
          updated_at?: string
        }
        Update: {
          alert_days_before?: number
          category_id?: string | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          frequency_days?: number | null
          frequency_preset?: string | null
          frequency_type?: string
          id?: string
          last_done_at?: string
          name?: string
          next_due_at?: string
          notes?: string | null
          supplier?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "periodic_services_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "periodic_services_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "periodic_services_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company_id: string
          created_at: string
          email: string
          full_name: string
          id: string
          role: string
        }
        Insert: {
          avatar_url?: string | null
          company_id: string
          created_at?: string
          email: string
          full_name: string
          id: string
          role?: string
        }
        Update: {
          avatar_url?: string | null
          company_id?: string
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      service_attachments: {
        Row: {
          company_id: string
          file_name: string
          file_type: string
          file_url: string
          id: string
          service_id: string
          uploaded_at: string
          uploaded_by: string | null
        }
        Insert: {
          company_id: string
          file_name: string
          file_type?: string
          file_url: string
          id?: string
          service_id: string
          uploaded_at?: string
          uploaded_by?: string | null
        }
        Update: {
          company_id?: string
          file_name?: string
          file_type?: string
          file_url?: string
          id?: string
          service_id?: string
          uploaded_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_attachments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_attachments_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "periodic_services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_attachments_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      service_categories: {
        Row: {
          color: string
          company_id: string
          created_at: string
          id: string
          name: string
        }
        Insert: {
          color?: string
          company_id: string
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          color?: string
          company_id?: string
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_categories_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      service_history: {
        Row: {
          company_id: string
          created_at: string
          done_at: string
          id: string
          notes: string | null
          registered_by: string | null
          service_id: string
          supplier: string | null
        }
        Insert: {
          company_id: string
          created_at?: string
          done_at: string
          id?: string
          notes?: string | null
          registered_by?: string | null
          service_id: string
          supplier?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string
          done_at?: string
          id?: string
          notes?: string | null
          registered_by?: string | null
          service_id?: string
          supplier?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_history_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_history_registered_by_fkey"
            columns: ["registered_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_history_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "periodic_services"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_company_id: { Args: never; Returns: string }
      seed_default_categories: {
        Args: { p_company_id: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
