import React, { useState } from 'react';
import { 
  Database, 
  Upload, 
  Plus, 
  Search, 
  Eye, 
  Code, 
  Download, 
  Trash2, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  FileText, 
  Table as TableIcon,
  Server,
  Layers,
  ArrowRight
} from 'lucide-react';
import { DatasetMeta, NavTab } from '../types';
import { apiService } from '../services/api';

interface DataSourcesViewProps {
  datasets: DatasetMeta[];
  onRefreshDatasets: () => void;
  onNavigateToStudio: (datasetId: string) => void;
}

export const DataSourcesView: React.FC<DataSourcesViewProps> = ({
  datasets,
  onRefreshDatasets,
  onNavigateToStudio
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isPostgresModalOpen, setIsPostgresModalOpen] = useState(false);
  const [previewDatasetId, setPreviewDatasetId] = useState<string | null>(null);
  const [schemaDatasetId, setSchemaDatasetId] = useState<string | null>(null);
  
  // Preview / Schema state
  const [datasetDetails, setDatasetDetails] = useState<any | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // Upload state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadName, setUploadName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Postgres form state
  const [pgHost, setPgHost] = useState('postgres-prod.internal.insightx.io');
  const [pgPort, setPgPort] = useState(5432);
  const [pgDatabase, setPgDatabase] = useState('insightx_enterprise');
  const [pgUser, setPgUser] = useState('svc_bi_reader');
  const [pgPass, setPgPass] = useState('••••••••••••');
  const [pgTesting, setPgTesting] = useState(false);
  const [pgTestResult, setPgTestResult] = useState<{ success: boolean; message: string; latency_ms?: number } | null>(null);

  const filteredDatasets = datasets.filter(d => 
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.source.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenPreview = async (id: string) => {
    setPreviewDatasetId(id);
    setIsLoadingDetails(true);
    try {
      const data = await apiService.getDatasetDetails(id);
      setDatasetDetails(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleOpenSchema = async (id: string) => {
    setSchemaDatasetId(id);
    setIsLoadingDetails(true);
    try {
      const data = await apiService.getDatasetDetails(id);
      setDatasetDetails(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      await apiService.uploadDataset(uploadFile, uploadName || undefined);
      setIsUploadModalOpen(false);
      setUploadFile(null);
      setUploadName('');
      onRefreshDatasets();
    } catch (err: any) {
      setUploadError(err.message || 'File upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleTestPostgres = async () => {
    setPgTesting(true);
    setPgTestResult(null);
    try {
      const res = await apiService.testConnection({
        host: pgHost,
        port: pgPort,
        database: pgDatabase,
        username: pgUser,
        password: pgPass,
        ssl_mode: 'require'
      });
      setPgTestResult(res);
    } catch (err: any) {
      setPgTestResult({ success: false, message: err.message || 'Connection test failed' });
    } finally {
      setPgTesting(false);
    }
  };

  return (
    <div className="p-6 space-y-5 max-w-[1720px] mx-auto">
      {/* Top Banner & Actions */}
      <div className="bg-[#121620] border border-[#252B38] rounded-lg p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-[#F3F4F8] flex items-center gap-2">
            <span>Enterprise Data Sources & Warehouses</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#43B581]/15 text-[#43B581] border border-[#43B581]/25">
              {datasets.length} Active Catalogs
            </span>
          </h2>
          <p className="text-xs text-[#9299AA] mt-1">
            Manage your connected relational databases, data lakehouses, and uploaded analytical datasets.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsPostgresModalOpen(true)}
            className="flex items-center gap-1.5 bg-[#171C29] hover:bg-[#252B38] text-[#F3F4F8] border border-[#252B38] px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer"
          >
            <Server className="w-3.5 h-3.5 text-[#9A7AFF]" />
            <span>Connect PostgreSQL</span>
          </button>
          
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center gap-1.5 bg-[#7755E8] hover:bg-[#6844db] text-white px-3.5 py-1.5 rounded-md text-xs font-medium shadow-xs transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Dataset (CSV/XLSX)</span>
          </button>
        </div>
      </div>

      {/* Datasets Table Container */}
      <div className="bg-[#121620] border border-[#252B38] rounded-lg overflow-hidden flex flex-col">
        {/* Search & Filter Bar */}
        <div className="p-4 border-b border-[#252B38] flex items-center justify-between">
          <div className="relative w-72">
            <Search className="w-3.5 h-3.5 text-[#9299AA] absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search datasets by name or source..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#171C29] border border-[#252B38] rounded-md pl-8 pr-3 py-1.5 text-xs text-[#F3F4F8] focus:border-[#7755E8] focus:outline-hidden"
            />
          </div>

          <div className="text-xs text-[#9299AA] flex items-center gap-2">
            <span>Showing <strong className="text-[#F3F4F8]">{filteredDatasets.length}</strong> datasets</span>
            <button 
              onClick={onRefreshDatasets}
              className="p-1.5 rounded bg-[#171C29] border border-[#252B38] hover:text-[#F3F4F8] text-[#9299AA] cursor-pointer"
              title="Refresh metadata"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0D1018] border-b border-[#252B38] text-[#9299AA] text-[10px] font-mono uppercase tracking-wider">
              <tr>
                <th className="px-4 py-2.5 font-medium">Dataset Name</th>
                <th className="px-4 py-2.5 font-medium">Source / Driver</th>
                <th className="px-4 py-2.5 font-medium">Records</th>
                <th className="px-4 py-2.5 font-medium">Columns</th>
                <th className="px-4 py-2.5 font-medium">Last Synced</th>
                <th className="px-4 py-2.5 font-medium">Health Status</th>
                <th className="px-4 py-2.5 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#252B38]/60 bg-[#121620]">
              {filteredDatasets.map((ds) => (
                <tr key={ds.id} className="hover:bg-[#171C29]/60 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded bg-[#7755E8]/15 border border-[#7755E8]/30 flex items-center justify-center text-[#9A7AFF] shrink-0">
                        <Database className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-semibold text-[#F3F4F8] text-xs">
                          {ds.name}
                        </div>
                        <div className="text-[10px] font-mono text-[#9299AA]">
                          table: {ds.table_name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono bg-[#171C29] text-[#9A7AFF] border border-[#252B38]">
                      {ds.source}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-[#F3F4F8] font-medium">
                    {ds.records.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 font-mono text-[#9299AA]">
                    {ds.columns_count} fields
                  </td>
                  <td className="px-4 py-3 text-[11px] text-[#9299AA]">
                    {ds.last_updated}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono bg-[#43B581]/15 text-[#43B581] border border-[#43B581]/25">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#43B581]" />
                      Healthy (99.2%)
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenPreview(ds.id)}
                        className="p-1.5 rounded bg-[#171C29] hover:bg-[#252B38] text-[#9299AA] hover:text-[#F3F4F8] border border-[#252B38] transition-colors cursor-pointer"
                        title="Preview Table Data"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenSchema(ds.id)}
                        className="p-1.5 rounded bg-[#171C29] hover:bg-[#252B38] text-[#9299AA] hover:text-[#F3F4F8] border border-[#252B38] transition-colors cursor-pointer"
                        title="Explore Schema & Types"
                      >
                        <Code className="w-3.5 h-3.5" />
                      </button>
                      <a
                        href={`/api/datasets/${ds.id}/download`}
                        download={`${ds.id}.csv`}
                        className="p-1.5 rounded bg-[#171C29] hover:bg-[#252B38] text-[#9299AA] hover:text-[#F3F4F8] border border-[#252B38] transition-colors cursor-pointer inline-flex items-center"
                        title="Download Dataset as CSV"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                      <button
                        onClick={() => onNavigateToStudio(ds.id)}
                        className="flex items-center gap-1 bg-[#7755E8]/20 hover:bg-[#7755E8] text-[#9A7AFF] hover:text-white border border-[#7755E8]/40 px-2 py-1 rounded text-xs font-medium transition-colors cursor-pointer"
                      >
                        <span>Query in Studio</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: CSV / EXCEL UPLOAD */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-[#121620] border border-[#252B38] rounded-xl w-full max-w-md p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#252B38] pb-3">
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4 text-[#9A7AFF]" />
                <h3 className="text-sm font-semibold text-[#F3F4F8]">Upload New Dataset</h3>
              </div>
              <button 
                onClick={() => setIsUploadModalOpen(false)}
                className="text-[#9299AA] hover:text-[#F3F4F8] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#9299AA] mb-1">
                  Dataset Display Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Q4 Regional Operations"
                  value={uploadName}
                  onChange={(e) => setUploadName(e.target.value)}
                  className="w-full bg-[#171C29] border border-[#252B38] rounded-md px-3 py-1.5 text-xs text-[#F3F4F8] focus:border-[#7755E8] focus:outline-hidden"
                />
              </div>

              {/* Drag and Drop Zone */}
              <div>
                <label className="block text-xs font-medium text-[#9299AA] mb-1">
                  Select CSV or Excel File
                </label>
                <div className="border-2 border-dashed border-[#252B38] hover:border-[#7755E8]/60 rounded-lg p-6 flex flex-col items-center justify-center text-center bg-[#0D1018] cursor-pointer transition-colors relative">
                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setUploadFile(e.target.files[0]);
                      }
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <Upload className="w-8 h-8 text-[#9A7AFF] mb-2" />
                  <span className="text-xs font-medium text-[#F3F4F8]">
                    {uploadFile ? uploadFile.name : "Drag & drop file here or click to browse"}
                  </span>
                  <span className="text-[10px] text-[#9299AA] mt-1">
                    Supports .CSV, .XLSX up to 50MB
                  </span>
                </div>
              </div>

              {uploadError && (
                <div className="text-[11px] text-[#E36F75] bg-[#E36F75]/10 p-2 rounded border border-[#E36F75]/20">
                  {uploadError}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#252B38]">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-3 py-1.5 rounded-md text-xs text-[#9299AA] hover:text-[#F3F4F8] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!uploadFile || isUploading}
                  className="bg-[#7755E8] hover:bg-[#6844db] disabled:opacity-50 text-white px-4 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer"
                >
                  {isUploading ? "Processing & Ingesting..." : "Ingest Dataset"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: POSTGRESQL CONNECTION */}
      {isPostgresModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-[#121620] border border-[#252B38] rounded-xl w-full max-w-lg p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#252B38] pb-3">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-[#9A7AFF]" />
                <h3 className="text-sm font-semibold text-[#F3F4F8]">Connect PostgreSQL Enterprise Database</h3>
              </div>
              <button 
                onClick={() => setIsPostgresModalOpen(false)}
                className="text-[#9299AA] hover:text-[#F3F4F8] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-[11px] text-[#9299AA] mb-1">Host / Endpoint</label>
                  <input
                    type="text"
                    value={pgHost}
                    onChange={(e) => setPgHost(e.target.value)}
                    className="w-full bg-[#171C29] border border-[#252B38] rounded-md px-3 py-1.5 text-xs text-[#F3F4F8] focus:border-[#7755E8]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#9299AA] mb-1">Port</label>
                  <input
                    type="number"
                    value={pgPort}
                    onChange={(e) => setPgPort(Number(e.target.value))}
                    className="w-full bg-[#171C29] border border-[#252B38] rounded-md px-3 py-1.5 text-xs text-[#F3F4F8] focus:border-[#7755E8]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-[#9299AA] mb-1">Database Name</label>
                <input
                  type="text"
                  value={pgDatabase}
                  onChange={(e) => setPgDatabase(e.target.value)}
                  className="w-full bg-[#171C29] border border-[#252B38] rounded-md px-3 py-1.5 text-xs text-[#F3F4F8] focus:border-[#7755E8]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-[#9299AA] mb-1">Username</label>
                  <input
                    type="text"
                    value={pgUser}
                    onChange={(e) => setPgUser(e.target.value)}
                    className="w-full bg-[#171C29] border border-[#252B38] rounded-md px-3 py-1.5 text-xs text-[#F3F4F8] focus:border-[#7755E8]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#9299AA] mb-1">Password</label>
                  <input
                    type="password"
                    value={pgPass}
                    onChange={(e) => setPgPass(e.target.value)}
                    className="w-full bg-[#171C29] border border-[#252B38] rounded-md px-3 py-1.5 text-xs text-[#F3F4F8] focus:border-[#7755E8]"
                  />
                </div>
              </div>

              {/* Test status banner */}
              {pgTestResult && (
                <div className={`p-3 rounded-md text-xs border ${
                  pgTestResult.success 
                    ? 'bg-[#43B581]/15 border-[#43B581]/30 text-[#43B581]' 
                    : 'bg-[#E36F75]/15 border-[#E36F75]/30 text-[#E36F75]'
                }`}>
                  <div className="font-semibold flex items-center gap-1.5">
                    {pgTestResult.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    <span>{pgTestResult.success ? `Connected (${pgTestResult.latency_ms}ms latency)` : 'Connection Error'}</span>
                  </div>
                  <p className="mt-1 text-[11px] opacity-90">{pgTestResult.message}</p>
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-[#252B38]">
                <button
                  type="button"
                  onClick={handleTestPostgres}
                  disabled={pgTesting}
                  className="bg-[#171C29] hover:bg-[#252B38] border border-[#252B38] text-[#9A7AFF] px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer"
                >
                  {pgTesting ? "Pinging..." : "Test Connection"}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsPostgresModalOpen(false)}
                    className="px-3 py-1.5 rounded-md text-xs text-[#9299AA] hover:text-[#F3F4F8] cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsPostgresModalOpen(false);
                      onRefreshDatasets();
                    }}
                    className="bg-[#7755E8] hover:bg-[#6844db] text-white px-4 py-1.5 rounded-md text-xs font-medium cursor-pointer"
                  >
                    Save & Sync Catalogs
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: DATASET PREVIEW */}
      {previewDatasetId && datasetDetails && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-[#121620] border border-[#252B38] rounded-xl w-full max-w-4xl p-5 space-y-4 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-[#252B38] pb-3">
              <div className="flex items-center gap-2">
                <TableIcon className="w-4 h-4 text-[#9A7AFF]" />
                <h3 className="text-sm font-semibold text-[#F3F4F8]">
                  Table Preview: {datasetDetails.metadata.name}
                </h3>
              </div>
              <button 
                onClick={() => setPreviewDatasetId(null)}
                className="text-[#9299AA] hover:text-[#F3F4F8] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-auto border border-[#252B38] rounded-md">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#171C29] sticky top-0">
                  <tr className="border-b border-[#252B38] text-[#9299AA] text-[10px] font-mono uppercase">
                    {datasetDetails.columns.map((col: any) => (
                      <th key={col.name} className="px-3 py-2 font-medium">
                        {col.name} ({col.type})
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#252B38]/60 bg-[#121620]">
                  {datasetDetails.sample_rows.map((row: any, idx: number) => (
                    <tr key={idx} className="hover:bg-[#171C29]/60">
                      {datasetDetails.columns.map((col: any) => (
                        <td key={col.name} className="px-3 py-1.5 text-[#F3F4F8] font-mono text-[11px] truncate max-w-[200px]">
                          {String(row[col.name] ?? '')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between text-xs text-[#9299AA] pt-2 border-t border-[#252B38]">
              <span>Sample limited to first 20 records</span>
              <button
                onClick={() => {
                  setPreviewDatasetId(null);
                  onNavigateToStudio(previewDatasetId);
                }}
                className="bg-[#7755E8] hover:bg-[#6844db] text-white px-3 py-1 rounded-md text-xs cursor-pointer"
              >
                Open in AI Query Studio
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: SCHEMA EXPLORATION */}
      {schemaDatasetId && datasetDetails && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-[#121620] border border-[#252B38] rounded-xl w-full max-w-2xl p-5 space-y-4 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-[#252B38] pb-3">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-[#9A7AFF]" />
                <h3 className="text-sm font-semibold text-[#F3F4F8]">
                  Schema & Data Quality: {datasetDetails.metadata.name}
                </h3>
              </div>
              <button 
                onClick={() => setSchemaDatasetId(null)}
                className="text-[#9299AA] hover:text-[#F3F4F8] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-auto border border-[#252B38] rounded-md">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#171C29] sticky top-0">
                  <tr className="border-b border-[#252B38] text-[#9299AA] text-[10px] font-mono uppercase">
                    <th className="px-3 py-2 font-medium">Column Name</th>
                    <th className="px-3 py-2 font-medium">Data Type</th>
                    <th className="px-3 py-2 font-medium">Distinct Values</th>
                    <th className="px-3 py-2 font-medium">Null Percentage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#252B38]/60 bg-[#121620]">
                  {datasetDetails.schema_details.map((col: any) => (
                    <tr key={col.name} className="hover:bg-[#171C29]/60">
                      <td className="px-3 py-2 font-mono text-[#F3F4F8] font-medium">
                        {col.name}
                      </td>
                      <td className="px-3 py-2">
                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#171C29] text-[#9A7AFF] border border-[#252B38]">
                          {col.type}
                        </span>
                      </td>
                      <td className="px-3 py-2 font-mono text-[#9299AA]">
                        ~{col.distinct_count}
                      </td>
                      <td className="px-3 py-2 font-mono text-[#43B581]">
                        {col.null_pct}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-end pt-2 border-t border-[#252B38]">
              <button
                onClick={() => setSchemaDatasetId(null)}
                className="bg-[#252B38] hover:bg-[#363F52] text-[#F3F4F8] px-3 py-1 rounded-md text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
