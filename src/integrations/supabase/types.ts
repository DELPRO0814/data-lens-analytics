export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      claims: {
        Row: {
          claim_id: number
          confidence_score: number | null
          contact_id: number
          predicted_claim_level: string
          predicted_claim_probability: number | null
          predicted_claim_type: string | null
          prediction_date: string
        }
        Insert: {
          claim_id?: number
          confidence_score?: number | null
          contact_id: number
          predicted_claim_level: string
          predicted_claim_probability?: number | null
          predicted_claim_type?: string | null
          prediction_date: string
        }
        Update: {
          claim_id?: number
          confidence_score?: number | null
          contact_id?: number
          predicted_claim_level?: string
          predicted_claim_probability?: number | null
          predicted_claim_type?: string | null
          prediction_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_claims_contact"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["contact_id"]
          },
        ]
      }
      contacts: {
        Row: {
          contact_date: string | null
          contact_id: number
          customer_id: number
          department: string | null
          email: string | null
          is_executive: string
          is_keyman: string
          name: string
          phone: string | null
          position: string | null
          preferred_channel: string | null
        }
        Insert: {
          contact_date?: string | null
          contact_id?: number
          customer_id: number
          department?: string | null
          email?: string | null
          is_executive: string
          is_keyman: string
          name: string
          phone?: string | null
          position?: string | null
          preferred_channel?: string | null
        }
        Update: {
          contact_date?: string | null
          contact_id?: number
          customer_id?: number
          department?: string | null
          email?: string | null
          is_executive?: string
          is_keyman?: string
          name?: string
          phone?: string | null
          position?: string | null
          preferred_channel?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contacts_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["customer_id"]
          },
        ]
      }
      customer_order_forecast: {
        Row: {
          cof_id: number
          customer_id: number
          forecast_generation_datetime: string
          mape: number | null
          predicted_date: string
          predicted_quantity: number | null
          prediction_model: string
        }
        Insert: {
          cof_id?: number
          customer_id: number
          forecast_generation_datetime: string
          mape?: number | null
          predicted_date: string
          predicted_quantity?: number | null
          prediction_model: string
        }
        Update: {
          cof_id?: number
          customer_id?: number
          forecast_generation_datetime?: string
          mape?: number | null
          predicted_date?: string
          predicted_quantity?: number | null
          prediction_model?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_order_forecast_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["customer_id"]
          },
        ]
      }
      customer_profit_analysis: {
        Row: {
          contact_id: number
          customer_grade: string
          profit_margin: number | null
          total_cost: number | null
          total_profit: number | null
          total_sales: number | null
        }
        Insert: {
          contact_id: number
          customer_grade: string
          profit_margin?: number | null
          total_cost?: number | null
          total_profit?: number | null
          total_sales?: number | null
        }
        Update: {
          contact_id?: number
          customer_grade?: string
          profit_margin?: number | null
          total_cost?: number | null
          total_profit?: number | null
          total_sales?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_cpa_contact"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["contact_id"]
          },
        ]
      }
      customer_profit_grade: {
        Row: {
          contact_id: number
          customer_grade: string
          profit_margin: number | null
          total_cost: number | null
          total_profit: number | null
          total_sales: number | null
        }
        Insert: {
          contact_id: number
          customer_grade: string
          profit_margin?: number | null
          total_cost?: number | null
          total_profit?: number | null
          total_sales?: number | null
        }
        Update: {
          contact_id?: number
          customer_grade?: string
          profit_margin?: number | null
          total_cost?: number | null
          total_profit?: number | null
          total_sales?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_cpg_contact"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["contact_id"]
          },
        ]
      }
      customers: {
        Row: {
          company_name: string
          company_size: string | null
          company_type: string
          country: string | null
          customer_id: number
          industry_type: string | null
          reg_date: string | null
          region: string | null
        }
        Insert: {
          company_name: string
          company_size?: string | null
          company_type: string
          country?: string | null
          customer_id?: number
          industry_type?: string | null
          reg_date?: string | null
          region?: string | null
        }
        Update: {
          company_name?: string
          company_size?: string | null
          company_type?: string
          country?: string | null
          customer_id?: number
          industry_type?: string | null
          reg_date?: string | null
          region?: string | null
        }
        Relationships: []
      }
      engagements: {
        Row: {
          customer_id: number
          engagement_id: number
          last_active_date: string | null
          newsletter_opens: number | null
          site_visits: number | null
          survey_response: string
        }
        Insert: {
          customer_id: number
          engagement_id?: number
          last_active_date?: string | null
          newsletter_opens?: number | null
          site_visits?: number | null
          survey_response: string
        }
        Update: {
          customer_id?: number
          engagement_id?: number
          last_active_date?: string | null
          newsletter_opens?: number | null
          site_visits?: number | null
          survey_response?: string
        }
        Relationships: [
          {
            foreignKeyName: "engagements_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["customer_id"]
          },
        ]
      }
      issues: {
        Row: {
          description: string | null
          issue_date: string | null
          issue_id: number
          issue_type: string | null
          order_id: number | null
          resolved_date: string | null
          severity: string | null
          status: string
        }
        Insert: {
          description?: string | null
          issue_date?: string | null
          issue_id?: number
          issue_type?: string | null
          order_id?: number | null
          resolved_date?: string | null
          severity?: string | null
          status: string
        }
        Update: {
          description?: string | null
          issue_date?: string | null
          issue_id?: number
          issue_type?: string | null
          order_id?: number | null
          resolved_date?: string | null
          severity?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_issues_order"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["order_id"]
          },
        ]
      }
      orders: {
        Row: {
          amount: number | null
          contact_id: number
          cost: number | null
          delivery_status: string
          margin_rate: number | null
          order_date: string | null
          order_id: number
          payment_status: string
          product_id: string | null
          quantity: number | null
        }
        Insert: {
          amount?: number | null
          contact_id: number
          cost?: number | null
          delivery_status: string
          margin_rate?: number | null
          order_date?: string | null
          order_id?: number
          payment_status: string
          product_id?: string | null
          quantity?: number | null
        }
        Update: {
          amount?: number | null
          contact_id?: number
          cost?: number | null
          delivery_status?: string
          margin_rate?: number | null
          order_date?: string | null
          order_id?: number
          payment_status?: string
          product_id?: string | null
          quantity?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_orders_contact"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["contact_id"]
          },
          {
            foreignKeyName: "fk_orders_product"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["product_id"]
          },
        ]
      }
      predictions: {
        Row: {
          contact_id: number
          predicted_date: string | null
          predicted_product: string | null
          predicted_quantity: number | null
          prediction_id: number
        }
        Insert: {
          contact_id: number
          predicted_date?: string | null
          predicted_product?: string | null
          predicted_quantity?: number | null
          prediction_id?: number
        }
        Update: {
          contact_id?: number
          predicted_date?: string | null
          predicted_product?: string | null
          predicted_quantity?: number | null
          prediction_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_predictions_contact"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["contact_id"]
          },
        ]
      }
      products: {
        Row: {
          category: string | null
          inch: number | null
          model: string
          notes: string | null
          originalprice: number | null
          product_id: string
          sellingprice: number | null
        }
        Insert: {
          category?: string | null
          inch?: number | null
          model: string
          notes?: string | null
          originalprice?: number | null
          product_id: string
          sellingprice?: number | null
        }
        Update: {
          category?: string | null
          inch?: number | null
          model?: string
          notes?: string | null
          originalprice?: number | null
          product_id?: string
          sellingprice?: number | null
        }
        Relationships: []
      }
      sales_activities: {
        Row: {
          activity_date: string | null
          activity_details: string | null
          activity_id: number
          activity_type: string | null
          contact_id: number | null
          customer_id: number
          outcome: string | null
        }
        Insert: {
          activity_date?: string | null
          activity_details?: string | null
          activity_id?: number
          activity_type?: string | null
          contact_id?: number | null
          customer_id: number
          outcome?: string | null
        }
        Update: {
          activity_date?: string | null
          activity_details?: string | null
          activity_id?: number
          activity_type?: string | null
          contact_id?: number | null
          customer_id?: number
          outcome?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_activities_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["contact_id"]
          },
          {
            foreignKeyName: "sales_activities_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["customer_id"]
          },
        ]
      }
      sales_contact_forecast: {
        Row: {
          customer_id: number
          scf_generated_at: string
          scf_id: number
          scf_mape: number | null
          scf_recommended_date: string
          scf_type: string
        }
        Insert: {
          customer_id: number
          scf_generated_at: string
          scf_id?: number
          scf_mape?: number | null
          scf_recommended_date: string
          scf_type: string
        }
        Update: {
          customer_id?: number
          scf_generated_at?: string
          scf_id?: number
          scf_mape?: number | null
          scf_recommended_date?: string
          scf_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_contact_forecast_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["customer_id"]
          },
        ]
      }
      segments: {
        Row: {
          arr: number
          clv: number
          contact_id: number
          high_risk_probability: number | null
          predicted_risk_level: string
          segment_label: string | null
        }
        Insert: {
          arr: number
          clv: number
          contact_id: number
          high_risk_probability?: number | null
          predicted_risk_level: string
          segment_label?: string | null
        }
        Update: {
          arr?: number
          clv?: number
          contact_id?: number
          high_risk_probability?: number | null
          predicted_risk_level?: string
          segment_label?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_segments_contact"
            columns: ["contact_id"]
            isOneToOne: true
            referencedRelation: "contacts"
            referencedColumns: ["contact_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
