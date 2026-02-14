import { supabase } from '../lib/supabase';

export const clientsService = {
  async list(params?: { page?: number; limit?: number; search?: string }) {
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase.from('clients').select('*', { count: 'exact' })
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (params?.search) {
      query = query.or(`name.ilike.%${params.search}%,document_number.ilike.%${params.search}%`);
    }

    const { data, count, error } = await query;
    if (error) throw error;
    return { data: data || [], total: count || 0 };
  },

  async getById(id: string) {
    const { data, error } = await supabase.from('clients').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  },

  async checkDocument(documentNumber: string, excludeId?: string) {
    let query = supabase.from('clients').select('id').eq('document_number', documentNumber).is('deleted_at', null);
    if (excludeId) query = query.neq('id', excludeId);
    const { data } = await query;
    return { exists: (data?.length || 0) > 0 };
  },

  async create(input: any) {
    const { data, error } = await supabase.from('clients').insert(input).select().single();
    if (error) throw error;
    return data;
  },

  async update(id: string, input: any) {
    const { data, error } = await supabase.from('clients').update({ ...input, updated_at: new Date().toISOString() }).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase.from('clients').update({ deleted_at: new Date().toISOString() }).eq('id', id);
    if (error) throw error;
  },
};
