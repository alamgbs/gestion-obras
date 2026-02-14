import { supabase } from '../lib/supabase';

export const usersService = {
  async list(params?: { page?: number; limit?: number; search?: string }) {
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase.from('user_profiles').select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (params?.search) {
      query = query.or(`full_name.ilike.%${params.search}%,role.ilike.%${params.search}%`);
    }

    const { data, count, error } = await query;
    if (error) throw error;
    return { data: data || [], total: count || 0 };
  },

  async getById(id: string) {
    const { data, error } = await supabase.from('user_profiles').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  },

  async create(input: any) {
    const { data: { session } } = await supabase.auth.getSession();
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-users`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      }
    );
    const result = await response.json();
    if (!response.ok) throw new Error(result.error);
    return result.data;
  },

  async update(id: string, input: any) {
    const { data: { session } } = await supabase.auth.getSession();
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-users`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, ...input }),
      }
    );
    const result = await response.json();
    if (!response.ok) throw new Error(result.error);
    return result.data;
  },
};
