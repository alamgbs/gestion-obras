export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface DashboardStats {
  active_projects: number;
  pending_budgets: number;
  approved_this_month: number;
  total_approved_amount: number;
  budgets_by_status: { status: string; count: number }[];
  recent_budgets: {
    id: string;
    budget_number: string;
    project_name: string;
    client_name: string;
    total: number;
    status: string;
    created_at: string;
  }[];
}
