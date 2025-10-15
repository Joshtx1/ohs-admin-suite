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
      client_trainee_assignments: {
        Row: {
          assigned_date: string
          client_id: string
          created_at: string
          created_by: string | null
          end_date: string | null
          id: string
          notes: string | null
          status: string
          trainee_id: string
          updated_at: string
        }
        Insert: {
          assigned_date?: string
          client_id: string
          created_at?: string
          created_by?: string | null
          end_date?: string | null
          id?: string
          notes?: string | null
          status?: string
          trainee_id: string
          updated_at?: string
        }
        Update: {
          assigned_date?: string
          client_id?: string
          created_at?: string
          created_by?: string | null
          end_date?: string | null
          id?: string
          notes?: string | null
          status?: string
          trainee_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_trainee_assignments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_trainee_assignments_trainee_id_fkey"
            columns: ["trainee_id"]
            isOneToOne: false
            referencedRelation: "trainees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_assignments_client"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_assignments_created_by"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "fk_assignments_trainee"
            columns: ["trainee_id"]
            isOneToOne: false
            referencedRelation: "trainees"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address: string | null
          admin_der: string | null
          billing_city: string | null
          billing_city_state_zip: string | null
          billing_der: string | null
          billing_emails: string[] | null
          billing_id: string | null
          billing_name: string | null
          billing_state: string | null
          billing_street_address: string | null
          billing_zip: string | null
          city: string | null
          comments: string | null
          company_name: string
          contact_person: string
          created_at: string
          created_by: string | null
          email: string
          employee_count: number | null
          id: string
          industry: string | null
          mailing_city_state_zip: string | null
          mailing_street_address: string | null
          mem_status: string | null
          mem_type: string | null
          net_terms: string | null
          payment_status: string | null
          payment_terms: string | null
          phone: string
          physical_city: string | null
          physical_city_state_zip: string | null
          physical_state: string | null
          physical_street_address: string | null
          physical_zip: string | null
          po_required: boolean | null
          postal_code: string | null
          short_code: string | null
          status: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          admin_der?: string | null
          billing_city?: string | null
          billing_city_state_zip?: string | null
          billing_der?: string | null
          billing_emails?: string[] | null
          billing_id?: string | null
          billing_name?: string | null
          billing_state?: string | null
          billing_street_address?: string | null
          billing_zip?: string | null
          city?: string | null
          comments?: string | null
          company_name: string
          contact_person: string
          created_at?: string
          created_by?: string | null
          email: string
          employee_count?: number | null
          id?: string
          industry?: string | null
          mailing_city_state_zip?: string | null
          mailing_street_address?: string | null
          mem_status?: string | null
          mem_type?: string | null
          net_terms?: string | null
          payment_status?: string | null
          payment_terms?: string | null
          phone: string
          physical_city?: string | null
          physical_city_state_zip?: string | null
          physical_state?: string | null
          physical_street_address?: string | null
          physical_zip?: string | null
          po_required?: boolean | null
          postal_code?: string | null
          short_code?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          admin_der?: string | null
          billing_city?: string | null
          billing_city_state_zip?: string | null
          billing_der?: string | null
          billing_emails?: string[] | null
          billing_id?: string | null
          billing_name?: string | null
          billing_state?: string | null
          billing_street_address?: string | null
          billing_zip?: string | null
          city?: string | null
          comments?: string | null
          company_name?: string
          contact_person?: string
          created_at?: string
          created_by?: string | null
          email?: string
          employee_count?: number | null
          id?: string
          industry?: string | null
          mailing_city_state_zip?: string | null
          mailing_street_address?: string | null
          mem_status?: string | null
          mem_type?: string | null
          net_terms?: string | null
          payment_status?: string | null
          payment_terms?: string | null
          phone?: string
          physical_city?: string | null
          physical_city_state_zip?: string | null
          physical_state?: string | null
          physical_street_address?: string | null
          physical_zip?: string | null
          po_required?: boolean | null
          postal_code?: string | null
          short_code?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_clients_created_by"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      conversations: {
        Row: {
          agent_id: string | null
          created_at: string
          id: string
          title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          agent_id?: string | null
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          agent_id?: string | null
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      file_uploads: {
        Row: {
          azure_blob_url: string | null
          conversation_id: string
          created_at: string
          file_size: number
          file_type: string
          filename: string
          id: string
          metadata: Json | null
          processing_status: string | null
        }
        Insert: {
          azure_blob_url?: string | null
          conversation_id: string
          created_at?: string
          file_size: number
          file_type: string
          filename: string
          id?: string
          metadata?: Json | null
          processing_status?: string | null
        }
        Update: {
          azure_blob_url?: string | null
          conversation_id?: string
          created_at?: string
          file_size?: number
          file_type?: string
          filename?: string
          id?: string
          metadata?: Json | null
          processing_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "file_uploads_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          azure_model: string | null
          content: string
          conversation_id: string
          created_at: string
          file_attachments: Json | null
          id: string
          role: string
          tokens_used: number | null
        }
        Insert: {
          azure_model?: string | null
          content: string
          conversation_id: string
          created_at?: string
          file_attachments?: Json | null
          id?: string
          role: string
          tokens_used?: number | null
        }
        Update: {
          azure_model?: string | null
          content?: string
          conversation_id?: string
          created_at?: string
          file_attachments?: Json | null
          id?: string
          role?: string
          tokens_used?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          billing_client_id: string | null
          completed_at: string | null
          created_at: string
          id: string
          notes: string | null
          order_id: string
          price: number
          service_id: string
          status: string
          updated_at: string
        }
        Insert: {
          billing_client_id?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          order_id: string
          price: number
          service_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          billing_client_id?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          order_id?: string
          price?: number
          service_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_order_items_order"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_order_items_service"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_billing_client_id_fkey"
            columns: ["billing_client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          billing_client_id: string | null
          client_id: string | null
          created_at: string
          created_by: string
          id: string
          notes: string | null
          payment_status: string | null
          reason_for_test: string | null
          service_date: string | null
          status: string
          total_amount: number | null
          trainee_id: string
          updated_at: string
        }
        Insert: {
          billing_client_id?: string | null
          client_id?: string | null
          created_at?: string
          created_by: string
          id?: string
          notes?: string | null
          payment_status?: string | null
          reason_for_test?: string | null
          service_date?: string | null
          status?: string
          total_amount?: number | null
          trainee_id: string
          updated_at?: string
        }
        Update: {
          billing_client_id?: string | null
          client_id?: string | null
          created_at?: string
          created_by?: string
          id?: string
          notes?: string | null
          payment_status?: string | null
          reason_for_test?: string | null
          service_date?: string | null
          status?: string
          total_amount?: number | null
          trainee_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_orders_client"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_orders_trainee"
            columns: ["trainee_id"]
            isOneToOne: false
            referencedRelation: "trainees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_billing_client_id_fkey"
            columns: ["billing_client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      permissions: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      pricing: {
        Row: {
          client_id: string | null
          created_at: string
          created_by: string | null
          currency: string
          effective_from: string
          effective_to: string | null
          id: string
          is_active: boolean
          price: number
          pricing_type: string
          service_id: string
          updated_at: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          effective_from?: string
          effective_to?: string | null
          id?: string
          is_active?: boolean
          price: number
          pricing_type?: string
          service_id: string
          updated_at?: string
        }
        Update: {
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          effective_from?: string
          effective_to?: string | null
          id?: string
          is_active?: boolean
          price?: number
          pricing_type?: string
          service_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_pricing_client"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_pricing_created_by"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "fk_pricing_service"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pricing_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pricing_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
          phone: string | null
          status: string
          updated_at: string
          user_code: string | null
          user_id: string
          username: string | null
        }
        Insert: {
          created_at?: string
          email: string
          first_name: string
          id?: string
          last_name: string
          phone?: string | null
          status?: string
          updated_at?: string
          user_code?: string | null
          user_id: string
          username?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          phone?: string | null
          status?: string
          updated_at?: string
          user_code?: string | null
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          created_at: string
          id: string
          permission_id: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          created_at?: string
          id?: string
          permission_id: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          created_at?: string
          id?: string
          permission_id?: string
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          category: string
          created_at: string
          created_by: string | null
          department: string | null
          description: string | null
          duration_minutes: number
          id: string
          is_active: boolean
          member_price: number | null
          name: string
          non_member_price: number | null
          room: string | null
          service_code: string
          status: string | null
          updated_at: string
          valid_for_days: number | null
        }
        Insert: {
          category: string
          created_at?: string
          created_by?: string | null
          department?: string | null
          description?: string | null
          duration_minutes?: number
          id?: string
          is_active?: boolean
          member_price?: number | null
          name: string
          non_member_price?: number | null
          room?: string | null
          service_code: string
          status?: string | null
          updated_at?: string
          valid_for_days?: number | null
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string | null
          department?: string | null
          description?: string | null
          duration_minutes?: number
          id?: string
          is_active?: boolean
          member_price?: number | null
          name?: string
          non_member_price?: number | null
          room?: string | null
          service_code?: string
          status?: string | null
          updated_at?: string
          valid_for_days?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_services_created_by"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      trainee_assignment_services: {
        Row: {
          assignment_id: string
          authorized_by: string | null
          authorized_date: string | null
          created_at: string
          created_by: string | null
          id: string
          notes: string | null
          service_id: string
        }
        Insert: {
          assignment_id: string
          authorized_by?: string | null
          authorized_date?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          service_id: string
        }
        Update: {
          assignment_id?: string
          authorized_by?: string | null
          authorized_date?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          service_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_assignment_services_assignment"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "client_trainee_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_assignment_services_authorized_by"
            columns: ["authorized_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "fk_assignment_services_created_by"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "fk_assignment_services_service"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trainee_assignment_services_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "client_trainee_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trainee_assignment_services_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      trainees: {
        Row: {
          age: number | null
          city: string | null
          council_id: string | null
          country: string | null
          created_at: string
          created_by: string | null
          date_of_birth: string | null
          email: string | null
          eyes: string | null
          first_name: string | null
          gender: string | null
          hair: string | null
          height: string | null
          id: string
          language: string | null
          last_name: string | null
          license_number: string | null
          license_type: string | null
          medical_history: string | null
          middle_name: string | null
          mobile_number: string | null
          name: string
          notes: string | null
          occupation_craft: string | null
          phone: string | null
          photo_url: string | null
          signature_url: string | null
          ssn: string | null
          state: string | null
          status: string
          street: string | null
          unique_id: string | null
          updated_at: string
          zip: string | null
        }
        Insert: {
          age?: number | null
          city?: string | null
          council_id?: string | null
          country?: string | null
          created_at?: string
          created_by?: string | null
          date_of_birth?: string | null
          email?: string | null
          eyes?: string | null
          first_name?: string | null
          gender?: string | null
          hair?: string | null
          height?: string | null
          id?: string
          language?: string | null
          last_name?: string | null
          license_number?: string | null
          license_type?: string | null
          medical_history?: string | null
          middle_name?: string | null
          mobile_number?: string | null
          name: string
          notes?: string | null
          occupation_craft?: string | null
          phone?: string | null
          photo_url?: string | null
          signature_url?: string | null
          ssn?: string | null
          state?: string | null
          status?: string
          street?: string | null
          unique_id?: string | null
          updated_at?: string
          zip?: string | null
        }
        Update: {
          age?: number | null
          city?: string | null
          council_id?: string | null
          country?: string | null
          created_at?: string
          created_by?: string | null
          date_of_birth?: string | null
          email?: string | null
          eyes?: string | null
          first_name?: string | null
          gender?: string | null
          hair?: string | null
          height?: string | null
          id?: string
          language?: string | null
          last_name?: string | null
          license_number?: string | null
          license_type?: string | null
          medical_history?: string | null
          middle_name?: string | null
          mobile_number?: string | null
          name?: string
          notes?: string | null
          occupation_craft?: string | null
          phone?: string | null
          photo_url?: string | null
          signature_url?: string | null
          ssn?: string | null
          state?: string | null
          status?: string
          street?: string | null
          unique_id?: string | null
          updated_at?: string
          zip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_trainees_created_by"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_service_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_trainee_unique_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_user_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_username: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "staff"
        | "user"
        | "master"
        | "manager"
        | "supervisor"
        | "clerk"
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
      app_role: [
        "admin",
        "staff",
        "user",
        "master",
        "manager",
        "supervisor",
        "clerk",
      ],
    },
  },
} as const
