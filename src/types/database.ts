export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      vendors: {
        Row: {
          id: string
          user_id: string
          name: string
          email: string | null
          phone: string | null
          address: string | null
          tax_id: string | null
          payment_terms: string | null
          status: 'active' | 'inactive'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          email?: string | null
          phone?: string | null
          address?: string | null
          tax_id?: string | null
          payment_terms?: string | null
          status?: 'active' | 'inactive'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          email?: string | null
          phone?: string | null
          address?: string | null
          tax_id?: string | null
          payment_terms?: string | null
          status?: 'active' | 'inactive'
          created_at?: string
          updated_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          user_id: string
          name: string
          email: string | null
          phone: string | null
          address: string | null
          tax_id: string | null
          payment_terms: string | null
          status: 'active' | 'inactive'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          email?: string | null
          phone?: string | null
          address?: string | null
          tax_id?: string | null
          payment_terms?: string | null
          status?: 'active' | 'inactive'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          email?: string | null
          phone?: string | null
          address?: string | null
          tax_id?: string | null
          payment_terms?: string | null
          status?: 'active' | 'inactive'
          created_at?: string
          updated_at?: string
        }
      }
      items: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          sku: string | null
          unit_price: number
          unit: string
          tax_rate: number
          category: string | null
          status: 'active' | 'inactive'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          sku?: string | null
          unit_price: number
          unit?: string
          tax_rate?: number
          category?: string | null
          status?: 'active' | 'inactive'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          sku?: string | null
          unit_price?: number
          unit?: string
          tax_rate?: number
          category?: string | null
          status?: 'active' | 'inactive'
          created_at?: string
          updated_at?: string
        }
      }
      invoices: {
        Row: {
          id: string
          user_id: string
          customer_id: string
          invoice_number: string
          invoice_date: string
          due_date: string
          status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
          subtotal: number
          tax_amount: number
          total_amount: number
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          customer_id: string
          invoice_number: string
          invoice_date: string
          due_date: string
          status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
          subtotal: number
          tax_amount: number
          total_amount: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          customer_id?: string
          invoice_number?: string
          invoice_date?: string
          due_date?: string
          status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
          subtotal?: number
          tax_amount?: number
          total_amount?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      invoice_items: {
        Row: {
          id: string
          invoice_id: string
          item_id: string | null
          description: string
          quantity: number
          unit_price: number
          tax_rate: number
          amount: number
          created_at: string
        }
        Insert: {
          id?: string
          invoice_id: string
          item_id?: string | null
          description: string
          quantity: number
          unit_price: number
          tax_rate?: number
          amount: number
          created_at?: string
        }
        Update: {
          id?: string
          invoice_id?: string
          item_id?: string | null
          description?: string
          quantity?: number
          unit_price?: number
          tax_rate?: number
          amount?: number
          created_at?: string
        }
      }
      bills: {
        Row: {
          id: string
          user_id: string
          vendor_id: string
          bill_number: string
          bill_date: string
          due_date: string
          status: 'draft' | 'pending' | 'paid' | 'overdue' | 'cancelled'
          subtotal: number
          tax_amount: number
          total_amount: number
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          vendor_id: string
          bill_number: string
          bill_date: string
          due_date: string
          status?: 'draft' | 'pending' | 'paid' | 'overdue' | 'cancelled'
          subtotal: number
          tax_amount: number
          total_amount: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          vendor_id?: string
          bill_number?: string
          bill_date?: string
          due_date?: string
          status?: 'draft' | 'pending' | 'paid' | 'overdue' | 'cancelled'
          subtotal?: number
          tax_amount?: number
          total_amount?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      bill_items: {
        Row: {
          id: string
          bill_id: string
          item_id: string | null
          description: string
          quantity: number
          unit_price: number
          tax_rate: number
          amount: number
          created_at: string
        }
        Insert: {
          id?: string
          bill_id: string
          item_id?: string | null
          description: string
          quantity: number
          unit_price: number
          tax_rate?: number
          amount: number
          created_at?: string
        }
        Update: {
          id?: string
          bill_id?: string
          item_id?: string | null
          description?: string
          quantity?: number
          unit_price?: number
          tax_rate?: number
          amount?: number
          created?: string
        }
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
  }
}
