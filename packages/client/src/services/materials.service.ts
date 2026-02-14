import { supabase } from '../lib/supabase';

export const materialsService = {
  async list(params?: { page?: number; limit?: number; search?: string; category_id?: string }) {
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase.from('materials').select('*, category:material_categories(id, name), purchase_unit:units!materials_purchase_unit_id_fkey(id, code, name), recipe_unit:units!materials_recipe_unit_id_fkey(id, code, name)', { count: 'exact' })
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (params?.search) {
      query = query.or(`code.ilike.%${params.search}%,description.ilike.%${params.search}%`);
    }
    if (params?.category_id) {
      query = query.eq('category_id', params.category_id);
    }

    const { data, count, error } = await query;
    if (error) throw error;
    return { data: data || [], total: count || 0 };
  },

  async getById(id: string) {
    const { data, error } = await supabase.from('materials')
      .select('*, category:material_categories(id, name), purchase_unit:units!materials_purchase_unit_id_fkey(id, code, name), recipe_unit:units!materials_recipe_unit_id_fkey(id, code, name)')
      .eq('id', id).single();
    if (error) throw error;
    return data;
  },

  async create(input: any) {
    const recipe_unit_price = input.purchase_price / input.conversion_factor;
    const { data, error } = await supabase.from('materials').insert({ ...input, recipe_unit_price }).select().single();
    if (error) throw error;
    return data;
  },

  async update(id: string, input: any) {
    const updateData: any = { ...input, updated_at: new Date().toISOString() };
    if (input.purchase_price !== undefined && input.conversion_factor !== undefined) {
      updateData.recipe_unit_price = input.purchase_price / input.conversion_factor;
    }
    const { data, error } = await supabase.from('materials').update(updateData).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase.from('materials').update({ deleted_at: new Date().toISOString() }).eq('id', id);
    if (error) throw error;
  },

  async listUnits() {
    const { data, error } = await supabase.from('units').select('*').order('name');
    if (error) throw error;
    return data || [];
  },

  async listCategories() {
    const { data, error } = await supabase.from('material_categories').select('*').order('sort_order');
    if (error) throw error;
    return data || [];
  },

  async createCategory(input: { name: string; sort_order?: number }) {
    const { data, error } = await supabase.from('material_categories').insert(input).select().single();
    if (error) throw error;
    return data;
  },
};
