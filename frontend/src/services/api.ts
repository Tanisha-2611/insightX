import { OverviewData, DatasetMeta, AIQueryResponse, ReportItem } from '../types';

async function requestApi(path: string, options?: RequestInit): Promise<Response> {
  try {
    const res = await fetch(`/api${path}`, options);
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && (contentType.includes('application/json') || contentType.includes('text/csv'))) {
      return res;
    }
    // If proxy returned HTML or error, fallback to direct backend URL
    if (!contentType.includes('application/json') && !contentType.includes('text/csv')) {
      return await fetch(`http://127.0.0.1:8000/api${path}`, options);
    }
    return res;
  } catch (err) {
    // If /api failed, fallback to direct 8000
    return await fetch(`http://127.0.0.1:8000/api${path}`, options);
  }
}

export const apiService = {
  async getHealth() {
    const res = await requestApi('/health');
    return res.json();
  },

  async getOverview(datasetId?: string): Promise<OverviewData> {
    const path = datasetId && datasetId !== 'all' 
      ? `/overview?dataset_id=${encodeURIComponent(datasetId)}`
      : `/overview`;
    const res = await requestApi(path);
    if (!res.ok) throw new Error('Failed to fetch overview data');
    return res.json();
  },

  async getDatasets(): Promise<DatasetMeta[]> {
    const res = await requestApi('/datasets');
    if (!res.ok) throw new Error('Failed to fetch datasets');
    return res.json();
  },

  async getDatasetDetails(datasetId: string) {
    const res = await requestApi(`/datasets/${encodeURIComponent(datasetId)}`);
    if (!res.ok) throw new Error('Failed to fetch dataset details');
    return res.json();
  },

  async executeQuery(prompt: string, datasetId?: string): Promise<AIQueryResponse> {
    const res = await requestApi('/query/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, dataset_id: datasetId || 'enterprise_sales' })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Query execution failed');
    }
    return res.json();
  },

  async uploadDataset(file: File, displayName?: string) {
    const formData = new FormData();
    formData.append('file', file);
    if (displayName) {
      formData.append('display_name', displayName);
    }
    const res = await requestApi('/datasets/upload', {
      method: 'POST',
      body: formData
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Upload failed');
    }
    return res.json();
  },

  async testConnection(config: { host: string; port: number; database: string; username: string; password?: string; ssl_mode?: string }) {
    const res = await requestApi('/datasets/test-connection', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });
    return res.json();
  },

  async getAnalytics(datasetId: string, metric: string, dimension: string) {
    const res = await requestApi(`/analytics?dataset_id=${encodeURIComponent(datasetId)}&metric=${encodeURIComponent(metric)}&dimension=${encodeURIComponent(dimension)}`);
    if (!res.ok) throw new Error('Failed to fetch analytics');
    return res.json();
  },

  async getReports(): Promise<ReportItem[]> {
    const res = await requestApi('/reports');
    if (!res.ok) throw new Error('Failed to fetch reports');
    return res.json();
  },

  async generateReport(title: string, datasetId: string, description?: string) {
    const res = await requestApi('/reports/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, dataset_id: datasetId, description })
    });
    if (!res.ok) throw new Error('Failed to generate report');
    return res.json();
  },

  async getQueryHistory() {
    const res = await requestApi('/history');
    if (!res.ok) throw new Error('Failed to fetch history');
    return res.json();
  },

  async getSettings() {
    const res = await requestApi('/settings');
    if (!res.ok) throw new Error('Failed to fetch settings');
    return res.json();
  },

  async updateSettings(settings: Record<string, any>) {
    const res = await requestApi('/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    if (!res.ok) throw new Error('Failed to update settings');
    return res.json();
  }
};
