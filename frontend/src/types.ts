export type NavTab = 
  | 'overview' 
  | 'datasources' 
  | 'studio' 
  | 'analytics' 
  | 'reports' 
  | 'history' 
  | 'settings';

export interface KPICardData {
  id: string;
  title: string;
  value: number | string;
  display_value: string;
  sub_value?: string;
  change: string;
  is_positive: boolean;
  icon: string;
  sparkline: number[];
}

export interface DataActivityPoint {
  date: string;
  queries: number;
  successful: number;
  failed: number;
  latency_ms: number;
}

export interface DatasetDistributionItem {
  name: string;
  records: number;
  percentage: number;
  color: string;
}

export interface QueryPerformanceItem {
  category: string;
  avg_duration_ms: number;
  p95_ms: number;
  volume: number;
}

export interface DataQualityData {
  overall_score: number;
  valid_records_pct: number;
  missing_values_pct: number;
  duplicate_records_pct: number;
  schema_conformity_pct: number;
  checks_passed: number;
  checks_failed: number;
}

export interface AIInsightItem {
  id: string;
  type: string;
  title: string;
  description: string;
  impact: string;
  timestamp: string;
  dataset: string;
}

export interface RecentQueryItem {
  id: string;
  description: string;
  dataset: string;
  dataset_id: string;
  execution_time: string;
  status: 'Success' | 'Warning' | 'Failed';
  user: string;
  timestamp: string;
}

export interface DatasetColumn {
  name: string;
  type: string;
}

export interface DatasetMeta {
  id: string;
  name: string;
  table_name: string;
  source: string;
  records: number;
  columns_count: number;
  columns: DatasetColumn[];
  last_updated: string;
  status: string;
  health_score?: number;
}

export interface AIRecommendation {
  id: string;
  title: string;
  description: string;
  action: string;
}

export interface OverviewData {
  kpis: KPICardData[];
  data_activity: DataActivityPoint[];
  dataset_distribution: DatasetDistributionItem[];
  query_performance: QueryPerformanceItem[];
  data_quality: DataQualityData;
  recent_ai_insights: AIInsightItem[];
  recent_queries: RecentQueryItem[];
  recent_datasets: DatasetMeta[];
  ai_recommendations: AIRecommendation[];
}

export interface AIQueryResponse {
  query_prompt: string;
  target_dataset: string;
  generated_sql: string;
  execution_metrics: {
    execution_time_ms: number;
    total_processing_ms: number;
    rows_scanned: number;
    rows_returned: number;
    cache_status: string;
    cost_estimate: string;
    confidence_score: number;
  };
  visualization: {
    recommended_chart: 'bar' | 'line' | 'area' | 'donut' | 'table';
    title: string;
    x_axis: string;
    y_axes: string[];
    supported_types: string[];
  };
  data: {
    columns: string[];
    rows: Record<string, any>[];
    total_rows: number;
  };
  ai_insights: {
    summary: string;
    key_findings: string[];
    recommendations: string[];
  };
}

export interface ReportItem {
  id: string;
  title: string;
  dataset: string;
  dataset_id: string;
  created_at: string;
  author: string;
  format: string;
  status: string;
  summary: string;
}
