import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';

type Invoice = Database['public']['Tables']['invoices']['Row'];
type InvoiceInsert = Database['public']['Tables']['invoices']['Insert'];
type InvoiceUpdate = Database['public']['Tables']['invoices']['Update'];
type InvoiceItem = Database['public']['Tables']['invoice_items']['Row'];
type InvoiceItemInsert = Database['public']['Tables']['invoice_items']['Insert'];

export const invoiceService = {
  async getAll() {
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        customer:customers(*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        customer:customers(*),
        invoice_items(*)
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async create(invoice: Omit<InvoiceInsert, 'user_id'>, items: Omit<InvoiceItemInsert, 'invoice_id'>[]) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: newInvoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({ ...invoice, user_id: user.id })
      .select()
      .single();

    if (invoiceError) throw invoiceError;

    if (items.length > 0) {
      const itemsWithInvoiceId = items.map(item => ({
        ...item,
        invoice_id: newInvoice.id,
      }));

      const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(itemsWithInvoiceId);

      if (itemsError) throw itemsError;
    }

    return newInvoice;
  },

  async update(id: string, invoice: InvoiceUpdate) {
    const { data, error } = await supabase
      .from('invoices')
      .update(invoice)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};
