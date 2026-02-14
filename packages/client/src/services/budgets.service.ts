import { supabase } from '../lib/supabase';

export const budgetsService = {
  async list(params?: { page?: number; limit?: number; search?: string; status?: string; client_id?: string }) {
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase.from('budgets')
      .select('*, client:clients(id, name, document_number), creator:user_profiles!budgets_created_by_fkey(id, full_name)', { count: 'exact' })
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (params?.search) {
      query = query.or(`budget_number.ilike.%${params.search}%,project_name.ilike.%${params.search}%`);
    }
    if (params?.status) query = query.eq('status', params.status);
    if (params?.client_id) query = query.eq('client_id', params.client_id);

    const { data, count, error } = await query;
    if (error) throw error;
    return { data: data || [], total: count || 0 };
  },

  async getById(id: string) {
    const { data, error } = await supabase.from('budgets')
      .select(`*,
        client:clients(id, name, document_number),
        creator:user_profiles!budgets_created_by_fkey(id, full_name),
        approver:user_profiles!budgets_approved_by_fkey(id, full_name),
        sections:budget_sections(
          id, name, sort_order, subtotal,
          items:budget_items(
            id, description, quantity, material_unit_price, labor_unit_price,
            unit_price, subtotal, margin_percentage, final_price, sort_order,
            recipe_id,
            unit:units(id, code, name),
            recipe:recipes(id, code, name)
          )
        )`)
      .eq('id', id).is('deleted_at', null).single();
    if (error) throw error;
    // Sort sections and items
    if (data?.sections) {
      data.sections.sort((a: any, b: any) => a.sort_order - b.sort_order);
      data.sections.forEach((s: any) => s.items?.sort((a: any, b: any) => a.sort_order - b.sort_order));
    }
    return data;
  },

  async create(input: any, userId: string) {
    const { data, error } = await supabase.rpc('fn_create_budget', { p_input: input, p_user_id: userId });
    if (error) throw error;
    return data; // returns budget id
  },

  async update(id: string, input: any, userId: string) {
    const { error } = await supabase.rpc('fn_update_budget', { p_id: id, p_input: input, p_user_id: userId });
    if (error) throw error;
  },

  async delete(id: string) {
    const { error } = await supabase.from('budgets').update({ deleted_at: new Date().toISOString() }).eq('id', id);
    if (error) throw error;
  },

  async changeStatus(id: string, newStatus: string, userId: string, notes?: string) {
    const { error } = await supabase.rpc('fn_change_budget_status', {
      p_id: id, p_new_status: newStatus, p_user_id: userId, p_notes: notes || '',
    });
    if (error) throw error;
  },

  async duplicate(id: string, userId: string) {
    const { data, error } = await supabase.rpc('fn_duplicate_budget', { p_id: id, p_user_id: userId });
    if (error) throw error;
    return data; // returns new budget id
  },

  async newVersion(id: string, userId: string) {
    const { data, error } = await supabase.rpc('fn_create_budget_version', { p_id: id, p_user_id: userId });
    if (error) throw error;
    return data; // returns new budget id
  },

  async getPdf(budgetId: string) {
    const { data: { session } } = await supabase.auth.getSession();
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-pdf`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ budget_id: budgetId }),
      }
    );
    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: 'Error al generar PDF' }));
      throw new Error(err.error);
    }
    return response.blob();
  },

  async importExcel(file: File) {
    const { data: { session } } = await supabase.auth.getSession();
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/parse-excel`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: formData,
      }
    );
    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: 'Error al importar' }));
      throw new Error(err.error);
    }
    return response.json();
  },
};
