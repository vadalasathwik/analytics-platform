export interface UserProfile {
  id: number;
  name: string;
  email: string;
  created_at?: string;
}

export interface Organization {
  id: number;
  name: string;
  slug?: string;
  created_at?: string;
}

export interface ApiKey {
  id: number;
  key?: string;
  name: string;
  created_at: string;
}

export interface EventRecord {
  id?: number;
  event_name: string;
  properties?: Record<string, unknown>;
  created_at: string;
}

export interface TopEvent {
  event_name: string;
  count: number;
}

export interface AnalyticsSummary {
  total_users: number;
  total_organizations: number;
  total_memberships: number;
}

export interface PaginationState {
  page: number;
  pageSize: number;
}
