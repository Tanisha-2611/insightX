import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Play, 
  Database, 
  Filter, 
  RefreshCw,
  Terminal,
  Cpu
} from 'lucide-react';
import { apiService } from '../services/api';

interface QueryHistoryViewProps {
  onRunQueryInStudio: (queryText: string, datasetId?: string) => void;
}

export const QueryHistoryView: React.FC<QueryHistoryViewProps> = ({
  onRunQueryInStudio
}) => {
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'Success' | 'Warning' | 'Failed'>('all');
  const [searchFilter, setSearchFilter] = useState('');

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const data = await apiService.getQueryHistory();
      setHistory(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const filteredHistory = history.filter(item => {
    if (statusFilter !== 'all' && item.status !== statusFilter) return false;
    if (searchFilter && !item.dataset.toLowerCase().includes(searchFilter.toLowerCase()) && !item.query_type.toLowerCase().includes(searchFilter.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="p-6 space-y-5 max-w-[1720px] mx-auto">
      {/* Top Banner */}
      <div className="bg-[#121620] border border-[#252B38] rounded-lg p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-[#F3F4F8] flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#9A7AFF]" />
            <span>Query Audit Trail & Telemetry Logs</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#171C29] text-[#9A7AFF] border border-[#252B38]">
              {history.length} Executions Logged
            </span>
          </h2>
          <p className="text-xs text-[#9299AA] mt-1">
            Real-time operational audit log of SQL transactions, latency profiles, and optimizer cache hits.
          </p>
        </div>

        <button
          onClick={fetchHistory}
          className="flex items-center gap-1.5 bg-[#171C29] hover:bg-[#252B38] text-[#F3F4F8] border border-[#252B38] px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#9A7AFF]' : ''}`} />
          <span>Refresh Audit Feed</span>
        </button>
      </div>

      {/* History Table Container */}
      <div className="bg-[#121620] border border-[#252B38] rounded-lg overflow-hidden flex flex-col">
        {/* Controls Bar */}
        <div className="p-4 border-b border-[#252B38] flex flex-wrap items-center justify-between gap-3">
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 text-[#9299AA] absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search by dataset or query type..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full bg-[#171C29] border border-[#252B38] rounded-md pl-8 pr-3 py-1.5 text-xs text-[#F3F4F8] focus:border-[#7755E8] focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[#9299AA]">Status:</span>
            {(['all', 'Success', 'Warning', 'Failed'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2 py-0.5 rounded text-[11px] transition-colors cursor-pointer ${
                  statusFilter === st ? 'bg-[#7755E8] text-white font-medium' : 'bg-[#171C29] text-[#9299AA] hover:text-[#F3F4F8]'
                }`}
              >
                {st === 'all' ? 'All' : st}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto max-h-[550px] overflow-y-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0D1018] border-b border-[#252B38] text-[#9299AA] text-[10px] font-mono uppercase tracking-wider sticky top-0 z-10">
              <tr>
                <th className="px-4 py-2.5 font-medium">Query ID</th>
                <th className="px-4 py-2.5 font-medium">Timestamp</th>
                <th className="px-4 py-2.5 font-medium">Dataset</th>
                <th className="px-4 py-2.5 font-medium">Operation Type</th>
                <th className="px-4 py-2.5 font-medium">Duration</th>
                <th className="px-4 py-2.5 font-medium">Rows Scanned</th>
                <th className="px-4 py-2.5 font-medium">User</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#252B38]/60 bg-[#121620]">
              {filteredHistory.map((item) => (
                <tr key={item.query_id} className="hover:bg-[#171C29]/60 transition-colors">
                  <td className="px-4 py-2.5 font-mono text-[#9A7AFF] font-medium">
                    {item.query_id}
                  </td>
                  <td className="px-4 py-2.5 text-[#9299AA] font-mono text-[11px]">
                    {item.timestamp}
                  </td>
                  <td className="px-4 py-2.5 text-[#F3F4F8] font-medium">
                    {item.dataset}
                  </td>
                  <td className="px-4 py-2.5 text-[#9299AA]">
                    <span className="px-1.5 py-0.5 rounded bg-[#171C29] text-[#F3F4F8] border border-[#252B38] font-mono text-[10px]">
                      {item.query_type}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 font-mono text-[#F3F4F8]">
                    {item.duration_ms} ms
                  </td>
                  <td className="px-4 py-2.5 font-mono text-[#9299AA]">
                    {item.rows_scanned?.toLocaleString()}
                  </td>
                  <td className="px-4 py-2.5 text-[#9299AA] truncate max-w-[120px]">
                    {item.user}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={`inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-mono ${
                      item.status === 'Success' 
                        ? 'bg-[#43B581]/15 text-[#43B581] border border-[#43B581]/25'
                        : item.status === 'Warning'
                        ? 'bg-[#E5AE55]/15 text-[#E5AE55] border border-[#E5AE55]/25'
                        : 'bg-[#E36F75]/15 text-[#E36F75] border border-[#E36F75]/25'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <button
                      onClick={() => onRunQueryInStudio(`SELECT * FROM ${item.dataset} LIMIT 10;`, item.dataset)}
                      className="p-1 rounded bg-[#171C29] hover:bg-[#7755E8] hover:text-white text-[#9299AA] border border-[#252B38] transition-colors cursor-pointer"
                      title="Run query in AI Studio"
                    >
                      <Play className="w-3 h-3 fill-current" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
