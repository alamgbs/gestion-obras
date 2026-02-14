import { supabase } from '../lib/supabase';

export const laborService = {
  async list(params?: { page?: number; limit?: number; search?: string }) {
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase.from('labor_types').select('*', { count: 'exact' })
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (params?.search) {
      query = query.or(`code.ilike.%${params.search}%,description.ilike.%${params.search}%`);
    }

    const { data, count, error } = await query;
    if (error) throw error;
    return { data: data || [], total: count || 0 };
  },

  async getById(id: string) {
    const { data, error } = await supabase.from('labor_types').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  },

  async create(input: any) {
    const { data, error } = await supabase.from('labor_types').insert(input).select().single();
    if (error) throw error;
    return data;
  },

  async update(id: string, input: any) {
    const { data, error } = await supabase.from('labor_types').update({ ...input, updated_at: new Date().toISOString() }).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase.from('labor_types').update({ deleted_at: new Date().toISOString() }).eq('id', id);
    if (error) throw error;
  },
};
