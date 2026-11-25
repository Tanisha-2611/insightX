import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { OverviewDashboard } from './components/OverviewDashboard';
import { AIQueryStudio } from './components/AIQueryStudio';
import { DataSourcesView } from './components/DataSourcesView';
import { AnalyticsView } from './components/AnalyticsView';
import { ReportsView } from './components/ReportsView';
import { QueryHistoryView } from './components/QueryHistoryView';
import { SettingsView } from './components/SettingsView';
import { ReportPreviewModal } from './components/ReportPreviewModal';
import { NavTab, OverviewData, DatasetMeta, ReportItem } from './types';
import { apiService } from './services/api';
import { RotateCw, AlertCircle } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>('overview');
  const [datasets, setDatasets] = useState<DatasetMeta[]>([]);
  const [selectedDataset, setSelectedDataset] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('30d');
  const [overviewData, setOverviewData] = useState<OverviewData | null>(null);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastSynced, setLastSynced] = useState<string>('Just now');
  const [previewReport, setPreviewReport] = useState<ReportItem | null>(null);
  const [studioInitialQuery, setStudioInitialQuery] = useState<string>('');
  const [studioInitialDataset, setStudioInitialDataset] = useState<string>('enterprise_sales');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Load initial application data
  const loadInitialData = async () => {
    try {
      const [fetchedDatasets, fetchedOverview, fetchedReports] = await Promise.all([
        apiService.getDatasets().catch(() => []),
        apiService.getOverview().catch(() => null),
        apiService.getReports().catch(() => [])
      ]);

      setDatasets(fetchedDatasets);
      setOverviewData(fetchedOverview);
      setReports(fetchedReports);
      setLastSynced('Just now');
    } catch (err) {
      console.error('Failed to load initial data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Handle explicit refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const [fetchedDatasets, fetchedOverview, fetchedReports] = await Promise.all([
        apiService.getDatasets(),
        apiService.getOverview(selectedDataset),
        apiService.getReports()
      ]);
      setDatasets(fetchedDatasets);
      setOverviewData(fetchedOverview);
      setReports(fetchedReports);
      setLastSynced(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } catch (err) {
      console.error('Refresh error:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Re-fetch overview when dataset changes
  const handleSelectDataset = async (datasetId: string) => {
    setSelectedDataset(datasetId);
    try {
      const updatedOverview = await apiService.getOverview(datasetId);
      setOverviewData(updatedOverview);
    } catch (e) {
      console.error(e);
    }
  };

  // Switch to studio with pre-loaded prompt
  const handleRunQueryInStudio = (queryText: string, datasetId?: string) => {
    setStudioInitialQuery(queryText);
    if (datasetId) setStudioInitialDataset(datasetId);
    setActiveTab('studio');
  };

  const handleExportGlobalReport = () => {
    if (reports.length > 0) {
      setPreviewReport(reports[0]);
    } else {
      setActiveTab('reports');
    }
  };

  const getPageTitleAndSubtitle = () => {
    switch (activeTab) {
      case 'overview':
        return {
          title: 'Business Intelligence Overview',
          subtitle: 'Understand your data. Discover insights.'
        };
      case 'datasources':
        return {
          title: 'Connected Enterprise Data Sources',
          subtitle: 'Inspect database schemas, partition health, and relational connectors.'
        };
      case 'studio':
        return {
          title: 'AI Query Studio',
          subtitle: 'Schema-grounded natural language to validated SQL compiler & dynamic analytics.'
        };
      case 'analytics':
        return {
          title: 'Deep-Dive Analytics Slicer',
          subtitle: 'Multi-dimensional cohort analysis and interactive visual breakdown.'
        };
      case 'reports':
        return {
          title: 'Executive Intelligence Reports',
          subtitle: 'Certified PDF and CSV analytical publications for leadership.'
        };
      case 'history':
        return {
          title: 'Query Telemetry & Audit History',
          subtitle: 'High-resolution latency tracing and execution audit trail.'
        };
      case 'settings':
        return {
          title: 'System Preferences & LLM Configuration',
          subtitle: 'Fine-tune AI model inference, database pools, and workspace density.'
        };
      default:
        return {
          title: 'Business Intelligence Overview',
          subtitle: 'Understand your data. Discover insights.'
        };
    }
  };

  const { title, subtitle } = getPageTitleAndSubtitle();

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#090B10] text-[#F3F4F8]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#7755E8]/20 border border-[#7755E8]/40 flex items-center justify-center text-[#9A7AFF]">
            <RotateCw className="w-5 h-5 animate-spin" />
          </div>
          <span className="text-xs font-mono tracking-wider text-[#9299AA]">INITIALIZING INSIGHTX BI ENGINE...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen bg-[#090B10] overflow-hidden text-[#F3F4F8]">
      {/* Fixed compact Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        datasetsCount={datasets.length}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main App Container */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Header Bar */}
        <Header
          title={title}
          subtitle={subtitle}
          datasets={datasets}
          selectedDataset={selectedDataset}
          onSelectDataset={handleSelectDataset}
          dateRange={dateRange}
          onSelectDateRange={setDateRange}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
          lastSynced={lastSynced}
          onExportReport={handleExportGlobalReport}
          isMobileMenuOpen={isMobileMenuOpen}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />

        {/* Dynamic Tab Body */}
        <main className="flex-1 overflow-y-auto bg-[#090B10]">
          {activeTab === 'overview' && overviewData && (
            <OverviewDashboard
              data={overviewData}
              onNavigateTab={setActiveTab}
              onRunQueryInStudio={handleRunQueryInStudio}
            />
          )}

          {activeTab === 'studio' && (
            <AIQueryStudio
              datasets={datasets}
              initialQuery={studioInitialQuery}
              initialDatasetId={studioInitialDataset}
            />
          )}

          {activeTab === 'datasources' && (
            <DataSourcesView
              datasets={datasets}
              onRefreshDatasets={handleRefresh}
              onNavigateToStudio={(dsId) => {
                setStudioInitialDataset(dsId);
                setActiveTab('studio');
              }}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView datasets={datasets} />
          )}

          {activeTab === 'reports' && (
            <ReportsView
              reports={reports}
              datasets={datasets}
              onRefreshReports={handleRefresh}
              onPreviewReport={setPreviewReport}
            />
          )}

          {activeTab === 'history' && (
            <QueryHistoryView onRunQueryInStudio={handleRunQueryInStudio} />
          )}

          {activeTab === 'settings' && (
            <SettingsView />
          )}
        </main>
      </div>

      {/* Report Preview Modal */}
      <ReportPreviewModal
        report={previewReport}
        onClose={() => setPreviewReport(null)}
      />
    </div>
  );
};

export default App;
