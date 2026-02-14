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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      app_settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      budget_items: {
        Row: {
          description: string
          final_price: number
          id: string
          labor_unit_price: number
          margin_percentage: number
          material_unit_price: number
          quantity: number
          recipe_id: string | null
          section_id: string
          sort_order: number
          subtotal: number
          unit_id: string
          unit_price: number
        }
        Insert: {
          description: string
          final_price?: number
          id?: string
          labor_unit_price?: number
          margin_percentage?: number
          material_unit_price?: number
          quantity: number
          recipe_id?: string | null
          section_id: string
          sort_order?: number
          subtotal?: number
          unit_id: string
          unit_price?: number
        }
        Update: {
          description?: string
          final_price?: number
          id?: string
          labor_unit_price?: number
          margin_percentage?: number
          material_unit_price?: number
          quantity?: number
          recipe_id?: string | null
          section_id?: string
          sort_order?: number
          subtotal?: number
          unit_id?: string
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "budget_items_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_items_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "budget_sections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_items_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      budget_sections: {
        Row: {
          budget_id: string
          id: string
          name: string
          sort_order: number
          subtotal: number
        }
        Insert: {
          budget_id: string
          id?: string
          name: string
          sort_order?: number
          subtotal?: number
        }
        Update: {
          budget_id?: string
          id?: string
          name?: string
          sort_order?: number
          subtotal?: number
        }
        Relationships: [
          {
            foreignKeyName: "budget_sections_budget_id_fkey"
            columns: ["budget_id"]
            isOneToOne: false
            referencedRelation: "budgets"
            referencedColumns: ["id"]
          },
        ]
      }
      budget_status_history: {
        Row: {
          budget_id: string
          changed_by: string
          created_at: string
          from_status: string | null
          id: string
          notes: string | null
          to_status: string
        }
        Insert: {
          budget_id: string
          changed_by: string
          created_at?: string
          from_status?: string | null
          id?: string
          notes?: string | null
          to_status: string
        }
        Update: {
          budget_id?: string
          changed_by?: string
          created_at?: string
          from_status?: string | null
          id?: string
          notes?: string | null
          to_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "budget_status_history_budget_id_fkey"
            columns: ["budget_id"]
            isOneToOne: false
            referencedRelation: "budgets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_status_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      budgets: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          budget_number: string
          budget_type: string
          client_id: string
          created_at: string
          created_by: string
          deleted_at: string | null
          description: string | null
          discount_amount: number
          discount_percentage: number
          id: string
          location: string | null
          notes: string | null
          parent_id: string | null
          project_name: string
          status: string
          subtotal: number
          tax_amount: number
          tax_percentage: number
          total: number
          updated_at: string
          valid_until: string | null
          version: number
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          budget_number: string
          budget_type: string
          client_id: string
          created_at?: string
          created_by: string
          deleted_at?: string | null
          description?: string | null
          discount_amount?: number
          discount_percentage?: number
          id?: string
          location?: string | null
          notes?: string | null
          parent_id?: string | null
          project_name: string
          status?: string
          subtotal?: number
          tax_amount?: number
          tax_percentage?: number
          total?: number
          updated_at?: string
          valid_until?: string | null
          version?: number
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          budget_number?: string
          budget_type?: string
          client_id?: string
          created_at?: string
          created_by?: string
          deleted_at?: string | null
          description?: string | null
          discount_amount?: number
          discount_percentage?: number
          id?: string
          location?: string | null
          notes?: string | null
          parent_id?: string | null
          project_name?: string
          status?: string
          subtotal?: number
          tax_amount?: number
          tax_percentage?: number
          total?: number
          updated_at?: string
          valid_until?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "budgets_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budgets_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budgets_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budgets_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "budgets"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address: string | null
          city: string | null
          client_type: string
          created_at: string
          deleted_at: string | null
          document_number: string
          document_type: string
          email: string | null
          id: string
          is_active: boolean
          legal_name: string | null
          name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          client_type: string
          created_at?: string
          deleted_at?: string | null
          document_number: string
          document_type: string
          email?: string | null
          id?: string
          is_active?: boolean
          legal_name?: string | null
          name: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          city?: string | null
          client_type?: string
          created_at?: string
          deleted_at?: string | null
          document_number?: string
          document_type?: string
          email?: string | null
          id?: string
          is_active?: boolean
          legal_name?: string | null
          name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      labor_rate_history: {
        Row: {
          changed_by: string
          created_at: string
          id: string
          labor_type_id: string
          new_rate: number
          old_rate: number
        }
        Insert: {
          changed_by: string
          created_at?: string
          id?: string
          labor_type_id: string
          new_rate: number
          old_rate: number
        }
        Update: {
          changed_by?: string
          created_at?: string
          id?: string
          labor_type_id?: string
          new_rate?: number
          old_rate?: number
        }
        Relationships: [
          {
            foreignKeyName: "labor_rate_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "labor_rate_history_labor_type_id_fkey"
            columns: ["labor_type_id"]
            isOneToOne: false
            referencedRelation: "labor_types"
            referencedColumns: ["id"]
          },
        ]
      }
      labor_types: {
        Row: {
          code: string
          created_at: string
          deleted_at: string | null
          description: string
          id: string
          is_active: boolean
          rate_amount: number
          rate_unit: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          deleted_at?: string | null
          description: string
          id?: string
          is_active?: boolean
          rate_amount: number
          rate_unit: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          deleted_at?: string | null
          description?: string
          id?: string
          is_active?: boolean
          rate_amount?: number
          rate_unit?: string
          updated_at?: string
        }
        Relationships: []
      }
      material_categories: {
        Row: {
          id: string
          name: string
          sort_order: number
        }
        Insert: {
          id?: string
          name: string
          sort_order?: number
        }
        Update: {
          id?: string
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      material_price_history: {
        Row: {
          changed_by: string
          created_at: string
          id: string
          material_id: string
          new_price: number
          old_price: number
        }
        Insert: {
          changed_by: string
          created_at?: string
          id?: string
          material_id: string
          new_price: number
          old_price: number
        }
        Update: {
          changed_by?: string
          created_at?: string
          id?: string
          material_id?: string
          new_price?: number
          old_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "material_price_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "material_price_history_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
        ]
      }
      materials: {
        Row: {
          category_id: string
          code: string
          conversion_factor: number
          created_at: string
          deleted_at: string | null
          description: string
          id: string
          is_active: boolean
          min_stock: number
          purchase_price: number
          purchase_unit_id: string
          recipe_unit_id: string
          recipe_unit_price: number
          stock_quantity: number
          supplier_name: string | null
          updated_at: string
        }
        Insert: {
          category_id: string
          code: string
          conversion_factor: number
          created_at?: string
          deleted_at?: string | null
          description: string
          id?: string
          is_active?: boolean
          min_stock?: number
          purchase_price: number
          purchase_unit_id: string
          recipe_unit_id: string
          recipe_unit_price: number
          stock_quantity?: number
          supplier_name?: string | null
          updated_at?: string
        }
        Update: {
          category_id?: string
          code?: string
          conversion_factor?: number
          created_at?: string
          deleted_at?: string | null
          description?: string
          id?: string
          is_active?: boolean
          min_stock?: number
          purchase_price?: number
          purchase_unit_id?: string
          recipe_unit_id?: string
          recipe_unit_price?: number
          stock_quantity?: number
          supplier_name?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "materials_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "material_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "materials_purchase_unit_id_fkey"
            columns: ["purchase_unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "materials_recipe_unit_id_fkey"
            columns: ["recipe_unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_categories: {
        Row: {
          depth: number
          id: string
          is_active: boolean
          name: string
          parent_id: string | null
          sort_order: number
        }
        Insert: {
          depth?: number
          id?: string
          is_active?: boolean
          name: string
          parent_id?: string | null
          sort_order?: number
        }
        Update: {
          depth?: number
          id?: string
          is_active?: boolean
          name?: string
          parent_id?: string | null
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "recipe_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "recipe_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_labor: {
        Row: {
          id: string
          labor_type_id: string
          quantity: number
          rate_amount: number
          recipe_id: string
          sort_order: number
          subtotal: number
        }
        Insert: {
          id?: string
          labor_type_id: string
          quantity: number
          rate_amount: number
          recipe_id: string
          sort_order?: number
          subtotal: number
        }
        Update: {
          id?: string
          labor_type_id?: string
          quantity?: number
          rate_amount?: number
          recipe_id?: string
          sort_order?: number
          subtotal?: number
        }
        Relationships: [
          {
            foreignKeyName: "recipe_labor_labor_type_id_fkey"
            columns: ["labor_type_id"]
            isOneToOne: false
            referencedRelation: "labor_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_labor_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_materials: {
        Row: {
          id: string
          material_id: string
          quantity: number
          recipe_id: string
          sort_order: number
          subtotal: number
          unit_price: number
        }
        Insert: {
          id?: string
          material_id: string
          quantity: number
          recipe_id: string
          sort_order?: number
          subtotal: number
          unit_price: number
        }
        Update: {
          id?: string
          material_id?: string
          quantity?: number
          recipe_id?: string
          sort_order?: number
          subtotal?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "recipe_materials_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_materials_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipes: {
        Row: {
          category_id: string
          code: string
          cost_type: string
          created_at: string
          deleted_at: string | null
          description: string | null
          final_price: number
          id: string
          is_active: boolean
          margin_percentage: number
          name: string
          output_quantity: number
          output_unit_id: string
          total_cost: number
          total_labor_cost: number
          total_material_cost: number
          updated_at: string
        }
        Insert: {
          category_id: string
          code: string
          cost_type: string
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          final_price?: number
          id?: string
          is_active?: boolean
          margin_percentage?: number
          name: string
          output_quantity?: number
          output_unit_id: string
          total_cost?: number
          total_labor_cost?: number
          total_material_cost?: number
          updated_at?: string
        }
        Update: {
          category_id?: string
          code?: string
          cost_type?: string
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          final_price?: number
          id?: string
          is_active?: boolean
          margin_percentage?: number
          name?: string
          output_quantity?: number
          output_unit_id?: string
          total_cost?: number
          total_labor_cost?: number
          total_material_cost?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipes_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "recipe_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipes_output_unit_id_fkey"
            columns: ["output_unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      units: {
        Row: {
          code: string
          id: string
          name: string
        }
        Insert: {
          code: string
          id?: string
          name: string
        }
        Update: {
          code?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          created_at: string
          full_name: string
          id: string
          is_active: boolean
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name: string
          id: string
          is_active?: boolean
          role: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          is_active?: boolean
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      fn_cascade_labor_rate: {
        Args: { p_labor_type_id: string }
        Returns: undefined
      }
      fn_cascade_material_price: {
        Args: { p_material_id: string }
        Returns: undefined
      }
      fn_change_budget_status: {
        Args: {
          p_id: string
          p_new_status: string
          p_notes?: string
          p_user_id: string
        }
        Returns: undefined
      }
      fn_create_budget: {
        Args: { p_input: Json; p_user_id: string }
        Returns: string
      }
      fn_create_budget_version: {
        Args: { p_id: string; p_user_id: string }
        Returns: string
      }
      fn_create_recipe: { Args: { p_input: Json }; Returns: string }
      fn_duplicate_budget: {
        Args: { p_id: string; p_user_id: string }
        Returns: string
      }
      fn_duplicate_recipe: { Args: { p_id: string }; Returns: string }
      fn_generate_budget_number: { Args: Record<PropertyKey, never>; Returns: string }
      fn_get_dashboard_stats: { Args: Record<PropertyKey, never>; Returns: Json }
      fn_recalculate_all_recipes: { Args: Record<PropertyKey, never>; Returns: Json }
      fn_recalculate_recipe_totals: {
        Args: { p_recipe_id: string }
        Returns: undefined
      }
      fn_update_budget: {
        Args: { p_id: string; p_input: Json; p_user_id: string }
        Returns: undefined
      }
      fn_update_recipe: {
        Args: { p_id: string; p_input: Json }
        Returns: undefined
      }
      get_user_role: { Args: Record<PropertyKey, never>; Returns: string }
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
