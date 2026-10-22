// Tipos de la base de datos con el formato de `supabase gen types typescript`.
// Regenerar después de cada migración con `pnpm db:types` (Supabase local) o
// `pnpm db:types:linked` (proyecto vinculado). No editar a mano.

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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      attachments: {
        Row: {
          created_at: string
          created_by: string | null
          file_name: string
          id: string
          mime_type: string
          org_id: string
          page_id: string
          size_bytes: number
          storage_path: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          file_name: string
          id?: string
          mime_type: string
          org_id: string
          page_id: string
          size_bytes: number
          storage_path: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          file_name?: string
          id?: string
          mime_type?: string
          org_id?: string
          page_id?: string
          size_bytes?: number
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "attachments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attachments_page_fkey"
            columns: ["page_id", "org_id"]
            isOneToOne: false
            referencedRelation: "pages"
            referencedColumns: ["id", "org_id"]
          },
        ]
      }
      group_members: {
        Row: {
          created_at: string
          group_id: string
          org_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          group_id: string
          org_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          group_id?: string
          org_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_members_group_fkey"
            columns: ["group_id", "org_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id", "org_id"]
          },
          {
            foreignKeyName: "group_members_member_fkey"
            columns: ["org_id", "user_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["org_id", "user_id"]
          },
        ]
      }
      groups: {
        Row: {
          created_at: string
          id: string
          name: string
          org_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          org_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          org_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "groups_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string | null
          org_id: string
          role: string
          token_hash: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          org_id: string
          role: string
          token_hash: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          org_id?: string
          role?: string
          token_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "invitations_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invitations_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      members: {
        Row: {
          joined_at: string
          org_id: string
          role: string
          user_id: string
        }
        Insert: {
          joined_at?: string
          org_id: string
          role: string
          user_id: string
        }
        Update: {
          joined_at?: string
          org_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "members_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          logo_url: string | null
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          logo_url?: string | null
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "organizations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pages: {
        Row: {
          content_md: string
          created_at: string
          created_by: string | null
          id: string
          org_id: string
          parent_id: string | null
          position: number
          search: unknown
          slug: string
          space_id: string
          status: string
          title: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          content_md?: string
          created_at?: string
          created_by?: string | null
          id?: string
          org_id: string
          parent_id?: string | null
          position?: number
          search?: never
          slug: string
          space_id: string
          status?: string
          title: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          content_md?: string
          created_at?: string
          created_by?: string | null
          id?: string
          org_id?: string
          parent_id?: string | null
          position?: number
          search?: never
          slug?: string
          space_id?: string
          status?: string
          title?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pages_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pages_parent_fkey"
            columns: ["parent_id", "space_id"]
            isOneToOne: false
            referencedRelation: "pages"
            referencedColumns: ["id", "space_id"]
          },
          {
            foreignKeyName: "pages_space_fkey"
            columns: ["space_id", "org_id"]
            isOneToOne: false
            referencedRelation: "spaces"
            referencedColumns: ["id", "org_id"]
          },
          {
            foreignKeyName: "pages_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string
          id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
        }
        Relationships: []
      }
      space_groups: {
        Row: {
          group_id: string
          org_id: string
          permission: string
          space_id: string
        }
        Insert: {
          group_id: string
          org_id: string
          permission?: string
          space_id: string
        }
        Update: {
          group_id?: string
          org_id?: string
          permission?: string
          space_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "space_groups_group_fkey"
            columns: ["group_id", "org_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id", "org_id"]
          },
          {
            foreignKeyName: "space_groups_space_fkey"
            columns: ["space_id", "org_id"]
            isOneToOne: false
            referencedRelation: "spaces"
            referencedColumns: ["id", "org_id"]
          },
        ]
      }
      spaces: {
        Row: {
          created_at: string
          icon: string
          id: string
          name: string
          org_id: string
          position: number
          slug: string
          visibility: string
        }
        Insert: {
          created_at?: string
          icon?: string
          id?: string
          name: string
          org_id: string
          position?: number
          slug: string
          visibility?: string
        }
        Update: {
          created_at?: string
          icon?: string
          id?: string
          name?: string
          org_id?: string
          position?: number
          slug?: string
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "spaces_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_invitation: { Args: { p_token: string }; Returns: string }
      can_access_attachment_object: {
        Args: { p_edit: boolean; p_name: string }
        Returns: boolean
      }
      can_edit_page: { Args: { p_page: string }; Returns: boolean }
      can_edit_space: { Args: { p_space: string }; Returns: boolean }
      can_read_page: { Args: { p_page: string }; Returns: boolean }
      can_read_space: { Args: { p_space: string }; Returns: boolean }
      create_organization: {
        Args: { p_name: string; p_slug: string }
        Returns: string
      }
      get_invitation: {
        Args: { p_token: string }
        Returns: {
          accepted: boolean
          email: string
          expires_at: string
          org_name: string
          org_slug: string
          role: string
        }[]
      }
      is_org_admin: { Args: { p_org: string }; Returns: boolean }
      is_space_group_member: { Args: { p_space: string }; Returns: boolean }
      keep_alive: { Args: never; Returns: string }
      org_role: { Args: { p_org: string }; Returns: string }
      reorder_pages: {
        Args: { p_ids: string[]; p_parent?: string; p_space: string }
        Returns: undefined
      }
      reorder_spaces: {
        Args: { p_ids: string[]; p_org: string }
        Returns: undefined
      }
      save_space: {
        Args: {
          p_groups?: Json
          p_icon: string
          p_name: string
          p_org: string
          p_slug: string
          p_space?: string
          p_visibility: string
        }
        Returns: string
      }
      search_pages: {
        Args: { p_limit?: number; p_org: string; p_query: string }
        Returns: {
          id: string
          rank: number
          slug: string
          snippet: string
          space_icon: string
          space_id: string
          space_name: string
          space_slug: string
          status: string
          title: string
        }[]
      }
      shares_org_with: { Args: { p_user: string }; Returns: boolean }
      transfer_ownership: {
        Args: { p_org: string; p_user: string }
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
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
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
