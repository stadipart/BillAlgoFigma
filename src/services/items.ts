import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';

type Item = Database['public']['Tables']['items']['Row'];
type ItemInsert = Database['public']['Tables']['items']['Insert'];
type ItemUpdate = Database['public']['Tables']['items']['Update'];

export const itemService = {
  async getAll() {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .order('created_at', { ascending: false});

    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async create(item: Omit<ItemInsert, 'user_id'>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('items')
      .insert({ ...item, user_id: user.id })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, item: ItemUpdate) {
    const { data, error } = await supabase
      .from('items')
      .update(item)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('items')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};
