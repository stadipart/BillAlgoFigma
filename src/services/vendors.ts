import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';

type Vendor = Database['public']['Tables']['vendors']['Row'];
type VendorInsert = Database['public']['Tables']['vendors']['Insert'];
type VendorUpdate = Database['public']['Tables']['vendors']['Update'];

export const vendorService = {
  async getAll() {
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async create(vendor: Omit<VendorInsert, 'user_id'>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('vendors')
      .insert({ ...vendor, user_id: user.id })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, vendor: VendorUpdate) {
    const { data, error } = await supabase
      .from('vendors')
      .update(vendor)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('vendors')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};
