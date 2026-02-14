import { supabase } from '../lib/supabase';

interface DashboardStats {
  active_projects: number;
  pending_budgets: number;
  approved_this_month: number;
  total_approved_amount: number;
  budgets_by_status: Array<{ status: string; count: number }>;
  recent_budgets: Array<{
    id: string;
    budget_number: string;
    project_name: string;
    client_name: string;
    total: number;
    status: string;
    created_at: string;
  }>;
}

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    const { data, error } = await supabase.rpc('fn_get_dashboard_stats');
    if (error) throw error;
    return data as unknown as DashboardStats;
  },
};
