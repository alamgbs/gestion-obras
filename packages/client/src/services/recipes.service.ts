import { supabase } from '../lib/supabase';

export const recipesService = {
  async list(params?: { page?: number; limit?: number; search?: string; cost_type?: string; category_id?: string }) {
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase.from('recipes').select('*, category:recipe_categories(id, name), output_unit:units(id, code, name)', { count: 'exact' })
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (params?.search) {
      query = query.or(`code.ilike.%${params.search}%,name.ilike.%${params.search}%`);
    }
    if (params?.cost_type) query = query.eq('cost_type', params.cost_type);
    if (params?.category_id) query = query.eq('category_id', params.category_id);

    const { data, count, error } = await query;
    if (error) throw error;
    return { data: data || [], total: count || 0 };
  },

  async getById(id: string) {
    const { data, error } = await supabase.from('recipes')
      .select(`*, category:recipe_categories(id, name), output_unit:units(id, code, name),
        materials:recipe_materials(*, material:materials(id, code, description, recipe_unit_price, recipe_unit:units!materials_recipe_unit_id_fkey(id, code))),
        labor:recipe_labor(*, labor_type:labor_types(id, code, description, rate_unit, rate_amount))`)
      .eq('id', id).is('deleted_at', null).single();
    if (error) throw error;
    return data;
  },

  async create(input: any) {
    const { data, error } = await supabase.rpc('fn_create_recipe', { p_input: input });
    if (error) throw error;
    return data; // returns recipe id
  },

  async update(id: string, input: any) {
    const { error } = await supabase.rpc('fn_update_recipe', { p_id: id, p_input: input });
    if (error) throw error;
  },

  async delete(id: string) {
    const { error } = await supabase.from('recipes').update({ deleted_at: new Date().toISOString() }).eq('id', id);
    if (error) throw error;
  },

  async duplicate(id: string) {
    const { data, error } = await supabase.rpc('fn_duplicate_recipe', { p_id: id });
    if (error) throw error;
    return data; // returns new recipe id
  },

  async recalculate(id: string) {
    const { error } = await supabase.rpc('fn_recalculate_recipe_totals', { p_recipe_id: id });
    if (error) throw error;
  },

  async recalculateAll() {
    const { data, error } = await supabase.rpc('fn_recalculate_all_recipes');
    if (error) throw error;
    return data;
  },

  async listCategories() {
    const { data, error } = await supabase.from('recipe_categories')
      .select('*').eq('is_active', true).order('depth').order('sort_order');
    if (error) throw error;
    // Build tree
    return buildCategoryTree(data || []);
  },

  async createCategory(input: { name: string; parent_id?: string | null; sort_order?: number }) {
    let depth = 0;
    if (input.parent_id) {
      const { data: parent } = await supabase.from('recipe_categories').select('depth').eq('id', input.parent_id).single();
      if (parent) depth = parent.depth + 1;
    }
    const { data, error } = await supabase.from('recipe_categories')
      .insert({ ...input, depth }).select().single();
    if (error) throw error;
    return data;
  },
};

function buildCategoryTree(cats: any[], parentId: string | null = null): any[] {
  return cats
    .filter((c) => c.parent_id === parentId)
    .map((c) => ({ ...c, children: buildCategoryTree(cats, c.id) }));
}
