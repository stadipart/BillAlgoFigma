import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';

type Bill = Database['public']['Tables']['bills']['Row'];
type BillInsert = Database['public']['Tables']['bills']['Insert'];
type BillUpdate = Database['public']['Tables']['bills']['Update'];
type BillItem = Database['public']['Tables']['bill_items']['Row'];
type BillItemInsert = Database['public']['Tables']['bill_items']['Insert'];

export const billService = {
  async getAll() {
    const { data, error } = await supabase
      .from('bills')
      .select(`
        *,
        vendor:vendors(*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('bills')
      .select(`
        *,
        vendor:vendors(*),
        bill_items(*)
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async create(bill: Omit<BillInsert, 'user_id'>, items: Omit<BillItemInsert, 'bill_id'>[]) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: newBill, error: billError } = await supabase
      .from('bills')
      .insert({ ...bill, user_id: user.id })
      .select()
      .single();

    if (billError) throw billError;

    if (items.length > 0) {
      const itemsWithBillId = items.map(item => ({
        ...item,
        bill_id: newBill.id,
      }));

      const { error: itemsError } = await supabase
        .from('bill_items')
        .insert(itemsWithBillId);

      if (itemsError) throw itemsError;
    }

    return newBill;
  },

  async update(id: string, bill: BillUpdate) {
    const { data, error } = await supabase
      .from('bills')
      .update(bill)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('bills')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};
