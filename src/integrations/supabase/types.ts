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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      buyer_requests: {
        Row: {
          buyer_id: string
          created_at: string
          crop_name: string
          delivery_date: string | null
          delivery_location: string
          id: string
          max_price_per_unit: number | null
          notes: string | null
          quality_grade: string | null
          quantity: number
          status: string
          unit: string
          updated_at: string
        }
        Insert: {
          buyer_id: string
          created_at?: string
          crop_name: string
          delivery_date?: string | null
          delivery_location: string
          id?: string
          max_price_per_unit?: number | null
          notes?: string | null
          quality_grade?: string | null
          quantity: number
          status?: string
          unit?: string
          updated_at?: string
        }
        Update: {
          buyer_id?: string
          created_at?: string
          crop_name?: string
          delivery_date?: string | null
          delivery_location?: string
          id?: string
          max_price_per_unit?: number | null
          notes?: string | null
          quality_grade?: string | null
          quantity?: number
          status?: string
          unit?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "buyer_requests_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      group_contributions: {
        Row: {
          created_at: string
          farmer_id: string
          group_order_id: string
          id: string
          listing_id: string | null
          other_selling_cost: number
          price_per_unit: number
          quantity: number
          status: string
          transport_cost: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          farmer_id: string
          group_order_id: string
          id?: string
          listing_id?: string | null
          other_selling_cost?: number
          price_per_unit: number
          quantity: number
          status?: string
          transport_cost?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          farmer_id?: string
          group_order_id?: string
          id?: string
          listing_id?: string | null
          other_selling_cost?: number
          price_per_unit?: number
          quantity?: number
          status?: string
          transport_cost?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_contributions_farmer_id_fkey"
            columns: ["farmer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_contributions_group_order_id_fkey"
            columns: ["group_order_id"]
            isOneToOne: false
            referencedRelation: "group_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_contributions_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "produce_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      group_orders: {
        Row: {
          buyer_id: string
          buyer_request_id: string | null
          created_at: string
          crop_name: string
          delivery_date: string | null
          delivery_location: string | null
          id: string
          initiator_farmer_id: string
          message: string | null
          proposed_price_per_unit: number
          quality_grade: string
          status: string
          total_quantity: number
          unit: string
          updated_at: string
        }
        Insert: {
          buyer_id: string
          buyer_request_id?: string | null
          created_at?: string
          crop_name: string
          delivery_date?: string | null
          delivery_location?: string | null
          id?: string
          initiator_farmer_id: string
          message?: string | null
          proposed_price_per_unit: number
          quality_grade?: string
          status?: string
          total_quantity: number
          unit?: string
          updated_at?: string
        }
        Update: {
          buyer_id?: string
          buyer_request_id?: string | null
          created_at?: string
          crop_name?: string
          delivery_date?: string | null
          delivery_location?: string | null
          id?: string
          initiator_farmer_id?: string
          message?: string | null
          proposed_price_per_unit?: number
          quality_grade?: string
          status?: string
          total_quantity?: number
          unit?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_orders_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_orders_buyer_request_id_fkey"
            columns: ["buyer_request_id"]
            isOneToOne: false
            referencedRelation: "buyer_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_orders_initiator_farmer_id_fkey"
            columns: ["initiator_farmer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          link: string | null
          message: string
          notification_type: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message: string
          notification_type: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message?: string
          notification_type?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      offers: {
        Row: {
          buyer_id: string
          buyer_request_id: string | null
          counter_message: string | null
          counter_price_per_unit: number | null
          counter_quantity: number | null
          created_at: string
          crop_name: string
          delivery_date: string | null
          delivery_location: string | null
          farmer_id: string
          group_order_id: string | null
          id: string
          is_group: boolean
          listing_id: string | null
          message: string | null
          other_selling_cost: number
          parent_offer_id: string | null
          price_per_unit: number
          quality_grade: string
          quantity: number
          status: string
          transport_cost: number
          unit: string
          updated_at: string
        }
        Insert: {
          buyer_id: string
          buyer_request_id?: string | null
          counter_message?: string | null
          counter_price_per_unit?: number | null
          counter_quantity?: number | null
          created_at?: string
          crop_name: string
          delivery_date?: string | null
          delivery_location?: string | null
          farmer_id: string
          group_order_id?: string | null
          id?: string
          is_group?: boolean
          listing_id?: string | null
          message?: string | null
          other_selling_cost?: number
          parent_offer_id?: string | null
          price_per_unit: number
          quality_grade?: string
          quantity: number
          status?: string
          transport_cost?: number
          unit?: string
          updated_at?: string
        }
        Update: {
          buyer_id?: string
          buyer_request_id?: string | null
          counter_message?: string | null
          counter_price_per_unit?: number | null
          counter_quantity?: number | null
          created_at?: string
          crop_name?: string
          delivery_date?: string | null
          delivery_location?: string | null
          farmer_id?: string
          group_order_id?: string | null
          id?: string
          is_group?: boolean
          listing_id?: string | null
          message?: string | null
          other_selling_cost?: number
          parent_offer_id?: string | null
          price_per_unit?: number
          quality_grade?: string
          quantity?: number
          status?: string
          transport_cost?: number
          unit?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "offers_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offers_buyer_request_id_fkey"
            columns: ["buyer_request_id"]
            isOneToOne: false
            referencedRelation: "buyer_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offers_farmer_id_fkey"
            columns: ["farmer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offers_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "produce_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      order_events: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          note: string | null
          order_id: string
          status: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          note?: string | null
          order_id: string
          status: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          note?: string | null
          order_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_events_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          agreed_price_per_unit: number
          buyer_confirmed: boolean
          buyer_confirmed_at: string | null
          buyer_id: string
          buyer_request_id: string | null
          completed_at: string | null
          created_at: string
          crop_name: string
          delivery_date: string | null
          delivery_location: string | null
          farmer_confirmed: boolean
          farmer_id: string | null
          final_quantity: number | null
          group_order_id: string | null
          id: string
          offer_id: string | null
          status: string
          total_quantity: number
          transport_details: string | null
          unit: string
          updated_at: string
        }
        Insert: {
          agreed_price_per_unit: number
          buyer_confirmed?: boolean
          buyer_confirmed_at?: string | null
          buyer_id: string
          buyer_request_id?: string | null
          completed_at?: string | null
          created_at?: string
          crop_name: string
          delivery_date?: string | null
          delivery_location?: string | null
          farmer_confirmed?: boolean
          farmer_id?: string | null
          final_quantity?: number | null
          group_order_id?: string | null
          id?: string
          offer_id?: string | null
          status?: string
          total_quantity: number
          transport_details?: string | null
          unit?: string
          updated_at?: string
        }
        Update: {
          agreed_price_per_unit?: number
          buyer_confirmed?: boolean
          buyer_confirmed_at?: string | null
          buyer_id?: string
          buyer_request_id?: string | null
          completed_at?: string | null
          created_at?: string
          crop_name?: string
          delivery_date?: string | null
          delivery_location?: string | null
          farmer_confirmed?: boolean
          farmer_id?: string | null
          final_quantity?: number | null
          group_order_id?: string | null
          id?: string
          offer_id?: string | null
          status?: string
          total_quantity?: number
          transport_details?: string | null
          unit?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_buyer_request_id_fkey"
            columns: ["buyer_request_id"]
            isOneToOne: false
            referencedRelation: "buyer_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_farmer_id_fkey"
            columns: ["farmer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_group_order_id_fkey"
            columns: ["group_order_id"]
            isOneToOne: false
            referencedRelation: "group_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offers"
            referencedColumns: ["id"]
          },
        ]
      }
      produce_listings: {
        Row: {
          availability_status: string
          created_at: string
          crop_name: string
          delivery_areas: string | null
          farm_location: string
          farmer_id: string
          harvest_date: string | null
          id: string
          image_url: string | null
          notes: string | null
          price_per_unit: number
          quality_grade: string
          quantity: number
          unit: string
          updated_at: string
        }
        Insert: {
          availability_status?: string
          created_at?: string
          crop_name: string
          delivery_areas?: string | null
          farm_location: string
          farmer_id: string
          harvest_date?: string | null
          id?: string
          image_url?: string | null
          notes?: string | null
          price_per_unit: number
          quality_grade?: string
          quantity: number
          unit?: string
          updated_at?: string
        }
        Update: {
          availability_status?: string
          created_at?: string
          crop_name?: string
          delivery_areas?: string | null
          farm_location?: string
          farmer_id?: string
          harvest_date?: string | null
          id?: string
          image_url?: string | null
          notes?: string | null
          price_per_unit?: number
          quality_grade?: string
          quantity?: number
          unit?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "produce_listings_farmer_id_fkey"
            columns: ["farmer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          bio: string | null
          business_name: string | null
          created_at: string
          farm_name: string | null
          full_name: string
          id: string
          location: string | null
          phone: string | null
          updated_at: string
          user_type: string
        }
        Insert: {
          bio?: string | null
          business_name?: string | null
          created_at?: string
          farm_name?: string | null
          full_name: string
          id: string
          location?: string | null
          phone?: string | null
          updated_at?: string
          user_type: string
        }
        Update: {
          bio?: string | null
          business_name?: string | null
          created_at?: string
          farm_name?: string | null
          full_name?: string
          id?: string
          location?: string | null
          phone?: string | null
          updated_at?: string
          user_type?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          buyer_id: string
          created_at: string
          description: string | null
          farmer_id: string | null
          id: string
          order_id: string
          transaction_type: string
        }
        Insert: {
          amount: number
          buyer_id: string
          created_at?: string
          description?: string | null
          farmer_id?: string | null
          id?: string
          order_id: string
          transaction_type: string
        }
        Update: {
          amount?: number
          buyer_id?: string
          created_at?: string
          description?: string | null
          farmer_id?: string | null
          id?: string
          order_id?: string
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_farmer_id_fkey"
            columns: ["farmer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      notify_user: {
        Args: {
          _link: string
          _message: string
          _title: string
          _type: string
          _user_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "farmer" | "buyer" | "admin"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["farmer", "buyer", "admin"],
    },
  },
} as const
