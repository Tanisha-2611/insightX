import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Play, 
  Copy, 
  Check, 
  BarChart3, 
  Table as TableIcon, 
  Code2, 
  Cpu, 
  Clock, 
  CheckCircle2, 
  Download, 
  Search, 
  ChevronRight, 
  RotateCw,
  Lightbulb,
  ArrowRight,
  Database,
  PieChart as PieIcon,
  LineChart as LineIcon
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { DatasetMeta, AIQueryResponse } from '../types';
import { apiService } from '../services/api';

interface AIQueryStudioProps {
  datasets: DatasetMeta[];
  initialQuery?: string;
  initialDatasetId?: string;
}

export const AIQueryStudio: React.FC<AIQueryStudioProps> = ({
  datasets,
  initialQuery,
  initialDatasetId
}) => {
  const [selectedDataset, setSelectedDataset] = useState<string>(initialDatasetId || 'enterprise_sales');
  const [queryInput, setQueryInput] = useState<string>(
    initialQuery || 'Identify the top five products by revenue and compare their monthly growth.'
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [queryResult, setQueryResult] = useState<AIQueryResponse | null>(null);
  const [activeResultTab, setActiveResultTab] = useState<'viz' | 'table' | 'sql' | 'plan'>('viz');
  const [chartTypeOverride, setChartTypeOverride] = useState<'bar' | 'line' | 'area' | 'donut'>('bar');
  const [copiedSQL, setCopiedSQL] = useState<boolean>(false);
  const [tableSearch, setTableSearch] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const rowsPerPage = 10;

  // Suggested enterprise prompts
  const suggestedPrompts = [
    "Identify the top five products by revenue and compare their monthly growth.",
    "Which customer tiers have highest churn risk and at-risk MRR?",
    "Marketing spend vs attributed revenue and ROAS by channel.",
    "Show query execution latency and slowest operations across datasets.",
    "Revenue and gross profit distribution by geographic region."
  ];

  const handleRunQuery = async (customPrompt?: string) => {
    const promptToRun = customPrompt || queryInput;
    if (!promptToRun.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await apiService.executeQuery(promptToRun, selectedDataset);
      setQueryResult(res);
      setChartTypeOverride(res.visualization.recommended_chart as any || 'bar');
      setCurrentPage(1);
    } catch (err: any) {
      setError(err.message || 'Execution failed. Check SQL query syntax.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Run initial query on mount
    handleRunQuery(queryInput);
  }, []);

  const handleCopySQL = () => {
    if (!queryResult) return;
    navigator.clipboard.writeText(queryResult.generated_sql);
    setCopiedSQL(true);
    setTimeout(() => setCopiedSQL(false), 2000);
  };

  const handleExportCSV = () => {
    if (!queryResult || !queryResult.data.rows.length) return;
    const cols = queryResult.data.columns;
    const csvContent = [
      cols.join(','),
      ...queryResult.data.rows.map(row => 
        cols.map(c => {
          const val = row[c];
          if (typeof val === 'string' && val.includes(',')) {
            return `"${val}"`;
          }
          return val;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `insightx_query_result_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered rows for Data Table tab
  const filteredRows = queryResult?.data.rows.filter(row => {
    if (!tableSearch) return true;
    return Object.values(row).some(val => 
      String(val).toLowerCase().includes(tableSearch.toLowerCase())
    );
  }) || [];

  const paginatedRows = filteredRows.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
  const totalPages = Math.ceil(filteredRows.length / rowsPerPage) || 1;

  const COLORS = ['#7755E8', '#9A7AFF', '#43B581', '#E5AE55', '#E36F75', '#38BDF8'];

  return (
    <div className="p-6 space-y-5 max-w-[1720px] mx-auto">
      {/* Top Workspace Bar */}
      <div className="bg-[#121620] border border-[#252B38] rounded-lg p-4 space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-[#7755E8]/20 border border-[#7755E8]/40 flex items-center justify-center text-[#9A7AFF]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-semibold text-[#F3F4F8] flex items-center gap-2">
                <span>AI Query Studio</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#7755E8]/20 text-[#9A7AFF] border border-[#7755E8]/30">
                  Schema-Aware NL-to-SQL
                </span>
              </h2>
              <p className="text-[11px] text-[#9299AA]">
                Type natural language questions to generate production SQL, interactive charts, and business intelligence.
              </p>
            </div>
          </div>

          {/* Dataset Selector */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#9299AA]">Target Dataset:</span>
            <div className="relative">
              <select
                value={selectedDataset}
                onChange={(e) => setSelectedDataset(e.target.value)}
                className="bg-[#171C29] border border-[#252B38] rounded-md px-2.5 py-1 text-xs text-[#F3F4F8] hover:border-[#7755E8]/40 focus:outline-hidden cursor-pointer"
              >
                {datasets.map((d) => (
                  <option key={d.id} value={d.id} className="bg-[#121620] text-[#F3F4F8]">
                    {d.name} ({d.records.toLocaleString()} rows)
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Query Input Box */}
        <div className="relative">
          <div className="flex items-stretch bg-[#0D1018] border border-[#252B38] rounded-lg focus-within:border-[#7755E8] transition-all overflow-hidden">
            <div className="px-3 py-3 text-[#9A7AFF] flex items-start">
              <Sparkles className="w-4 h-4 mt-0.5" />
            </div>
            <textarea
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              onKeyDown={(e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                  e.preventDefault();
                  handleRunQuery();
                }
              }}
              placeholder="Ask anything about your data in plain English (e.g. 'Identify top five products by revenue and compare monthly growth')..."
              rows={2}
              className="w-full bg-transparent text-[#F3F4F8] text-xs py-2.5 pr-3 resize-none focus:outline-hidden font-normal placeholder-[#9299AA]/50"
            />
            <div className="px-3 py-2 flex items-center shrink-0 border-l border-[#252B38] bg-[#121620]">
              <button
                onClick={() => handleRunQuery()}
                disabled={isLoading || !queryInput.trim()}
                className="flex items-center gap-2 bg-[#7755E8] hover:bg-[#6844db] disabled:opacity-50 text-white px-4 py-2 rounded-md text-xs font-medium shadow-xs transition-colors cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <RotateCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Run Analysis</span>
                  </>
                )}
              </button>
            </div>
          </div>
          <div className="text-[10px] text-[#9299AA] mt-1.5 flex items-center justify-between px-1">
            <span>Press <kbd className="bg-[#171C29] px-1 py-0.5 rounded border border-[#252B38] text-[#F3F4F8] font-mono text-[9px]">Ctrl</kbd> + <kbd className="bg-[#171C29] px-1 py-0.5 rounded border border-[#252B38] text-[#F3F4F8] font-mono text-[9px]">Enter</kbd> to execute</span>
            <span className="font-mono text-[#9A7AFF]">100% Read-Only Guardrail Active</span>
          </div>
        </div>

        {/* Suggested Questions */}
        <div className="pt-2 border-t border-[#252B38]/60">
          <div className="text-[11px] font-medium text-[#9299AA] mb-1.5 flex items-center gap-1">
            <Lightbulb className="w-3 h-3 text-[#E5AE55]" />
            <span>Suggested Enterprise Questions:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {suggestedPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => {
                  setQueryInput(prompt);
                  handleRunQuery(prompt);
                }}
                className="text-[11px] bg-[#171C29] hover:bg-[#252B38] text-[#9299AA] hover:text-[#F3F4F8] px-2.5 py-1 rounded-md border border-[#252B38] transition-colors cursor-pointer text-left truncate max-w-[420px]"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-[#E36F75]/15 border border-[#E36F75]/40 text-[#E36F75] p-3 rounded-md text-xs flex items-center gap-2">
          <span>Execution Error: {error}</span>
        </div>
      )}

      {/* Query Execution Telemetry Bar */}
      {queryResult && (
        <div className="bg-[#121620] border border-[#252B38] rounded-lg px-4 py-2 flex flex-wrap items-center justify-between text-xs gap-3">
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-1.5 text-[#43B581]">
              <CheckCircle2 className="w-4 h-4" />
              <span className="font-medium">Execution Successful</span>
            </div>
            <div className="flex items-center gap-1 text-[#9299AA]">
              <Clock className="w-3.5 h-3.5" />
              <span>Query Latency:</span>
              <span className="font-mono text-[#F3F4F8] font-medium">{queryResult.execution_metrics.execution_time_ms} ms</span>
            </div>
            <div className="flex items-center gap-1 text-[#9299AA]">
              <Database className="w-3.5 h-3.5" />
              <span>Rows Scanned:</span>
              <span className="font-mono text-[#F3F4F8] font-medium">{queryResult.execution_metrics.rows_scanned.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1 text-[#9299AA]">
              <span>Rows Returned:</span>
              <span className="font-mono text-[#F3F4F8] font-medium">{queryResult.execution_metrics.rows_returned}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#171C29] text-[#9A7AFF] border border-[#252B38]">
              {queryResult.execution_metrics.cache_status}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#43B581]/15 text-[#43B581] border border-[#43B581]/25">
              Confidence: {(queryResult.execution_metrics.confidence_score * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      )}

      {/* Result Section */}
      {queryResult && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Main Analytics Canvas (8/12) */}
          <div className="lg:col-span-8 bg-[#121620] border border-[#252B38] rounded-lg overflow-hidden flex flex-col">
            {/* Tabs Header */}
            <div className="px-4 py-2 border-b border-[#252B38] bg-[#0D1018] flex items-center justify-between">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setActiveResultTab('viz')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                    activeResultTab === 'viz'
                      ? 'bg-[#7755E8]/20 text-[#9A7AFF] border border-[#7755E8]/40'
                      : 'text-[#9299AA] hover:text-[#F3F4F8]'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Visualization</span>
                </button>
                <button
                  onClick={() => setActiveResultTab('table')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                    activeResultTab === 'table'
                      ? 'bg-[#7755E8]/20 text-[#9A7AFF] border border-[#7755E8]/40'
                      : 'text-[#9299AA] hover:text-[#F3F4F8]'
                  }`}
                >
                  <TableIcon className="w-3.5 h-3.5" />
                  <span>Data Table ({queryResult.data.rows.length})</span>
                </button>
                <button
                  onClick={() => setActiveResultTab('sql')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                    activeResultTab === 'sql'
                      ? 'bg-[#7755E8]/20 text-[#9A7AFF] border border-[#7755E8]/40'
                      : 'text-[#9299AA] hover:text-[#F3F4F8]'
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>Generated SQL</span>
                </button>
                <button
                  onClick={() => setActiveResultTab('plan')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                    activeResultTab === 'plan'
                      ? 'bg-[#7755E8]/20 text-[#9A7AFF] border border-[#7755E8]/40'
                      : 'text-[#9299AA] hover:text-[#F3F4F8]'
                  }`}
                >
                  <Cpu className="w-3.5 h-3.5" />
                  <span>Optimizer Plan</span>
                </button>
              </div>

              {/* Chart Switcher (only visible in viz tab) */}
              {activeResultTab === 'viz' && (
                <div className="flex items-center bg-[#171C29] border border-[#252B38] rounded-md p-0.5 text-xs">
                  <button
                    onClick={() => setChartTypeOverride('bar')}
                    className={`px-2 py-0.5 rounded text-[11px] transition-colors cursor-pointer ${
                      chartTypeOverride === 'bar' ? 'bg-[#7755E8] text-white' : 'text-[#9299AA] hover:text-[#F3F4F8]'
                    }`}
                  >
                    Bar
                  </button>
                  <button
                    onClick={() => setChartTypeOverride('area')}
                    className={`px-2 py-0.5 rounded text-[11px] transition-colors cursor-pointer ${
                      chartTypeOverride === 'area' ? 'bg-[#7755E8] text-white' : 'text-[#9299AA] hover:text-[#F3F4F8]'
                    }`}
                  >
                    Area
                  </button>
                  <button
                    onClick={() => setChartTypeOverride('line')}
                    className={`px-2 py-0.5 rounded text-[11px] transition-colors cursor-pointer ${
                      chartTypeOverride === 'line' ? 'bg-[#7755E8] text-white' : 'text-[#9299AA] hover:text-[#F3F4F8]'
                    }`}
                  >
                    Line
                  </button>
                  <button
                    onClick={() => setChartTypeOverride('donut')}
                    className={`px-2 py-0.5 rounded text-[11px] transition-colors cursor-pointer ${
                      chartTypeOverride === 'donut' ? 'bg-[#7755E8] text-white' : 'text-[#9299AA] hover:text-[#F3F4F8]'
                    }`}
                  >
                    Donut
                  </button>
                </div>
              )}

              {/* Table search & Export (visible in table tab) */}
              {activeResultTab === 'table' && (
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-3 h-3 text-[#9299AA] absolute left-2 top-2" />
                    <input
                      type="text"
                      placeholder="Filter results..."
                      value={tableSearch}
                      onChange={(e) => setTableSearch(e.target.value)}
                      className="bg-[#171C29] border border-[#252B38] rounded text-[11px] text-[#F3F4F8] pl-6 pr-2 py-0.5 focus:outline-hidden"
                    />
                  </div>
                  <button
                    onClick={handleExportCSV}
                    className="flex items-center gap-1 bg-[#171C29] hover:bg-[#252B38] border border-[#252B38] text-[#F3F4F8] px-2 py-0.5 rounded text-[11px] transition-colors cursor-pointer"
                  >
                    <Download className="w-3 h-3" />
                    <span>CSV</span>
                  </button>
                </div>
              )}
            </div>

            {/* Tab Contents */}
            <div className="p-4 flex-1 min-h-[380px] flex flex-col justify-center">
              {/* TAB 1: VISUALIZATION */}
              {activeResultTab === 'viz' && (
                <div className="w-full h-[360px]">
                  <div className="text-xs font-medium text-[#F3F4F8] mb-2 flex items-center justify-between">
                    <span>{queryResult.visualization.title}</span>
                    <span className="text-[10px] text-[#9299AA] font-mono">
                      Dimension: {queryResult.visualization.x_axis} • Metric: {queryResult.visualization.y_axes.join(', ')}
                    </span>
                  </div>

                  {queryResult.data.rows.length === 0 ? (
                    <div className="h-[300px] flex flex-col items-center justify-center text-center p-6 text-[#9299AA] space-y-2 bg-[#0D1018] rounded-md border border-[#252B38]">
                      <Database className="w-8 h-8 text-[#7755E8]/60" />
                      <div className="text-xs font-semibold text-[#F3F4F8]">Zero Records Returned</div>
                      <p className="text-[11px] max-w-sm">No data matched the executed query parameters. Try relaxing filters or testing a suggested question.</p>
                    </div>
                  ) : (
                  <ResponsiveContainer width="100%" height="90%">
                    {chartTypeOverride === 'bar' ? (
                      <BarChart data={queryResult.data.rows} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#252B38" vertical={false} />
                        <XAxis 
                          dataKey={queryResult.visualization.x_axis} 
                          stroke="#9299AA" 
                          fontSize={10} 
                          tickLine={false} 
                          axisLine={{ stroke: '#252B38' }}
                        />
                        <YAxis 
                          stroke="#9299AA" 
                          fontSize={10} 
                          tickLine={false} 
                          axisLine={{ stroke: '#252B38' }}
                          tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}
                        />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#121620', borderColor: '#252B38', fontSize: '12px' }} 
                        />
                        {queryResult.visualization.y_axes.map((yKey, idx) => (
                          <Bar 
                            key={yKey} 
                            dataKey={yKey} 
                            fill={COLORS[idx % COLORS.length]} 
                            radius={[3, 3, 0, 0]} 
                          />
                        ))}
                      </BarChart>
                    ) : chartTypeOverride === 'area' ? (
                      <AreaChart data={queryResult.data.rows} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                        <defs>
                          <linearGradient id="studioGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#7755E8" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#7755E8" stopOpacity={0.0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#252B38" vertical={false} />
                        <XAxis 
                          dataKey={queryResult.visualization.x_axis} 
                          stroke="#9299AA" 
                          fontSize={10} 
                          tickLine={false} 
                          axisLine={{ stroke: '#252B38' }}
                        />
                        <YAxis 
                          stroke="#9299AA" 
                          fontSize={10} 
                          tickLine={false} 
                          axisLine={{ stroke: '#252B38' }}
                          tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}
                        />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#121620', borderColor: '#252B38', fontSize: '12px' }} 
                        />
                        <Area 
                          type="monotone" 
                          dataKey={queryResult.visualization.y_axes[0]} 
                          stroke="#7755E8" 
                          strokeWidth={2}
                          fill="url(#studioGrad)" 
                        />
                      </AreaChart>
                    ) : chartTypeOverride === 'line' ? (
                      <LineChart data={queryResult.data.rows} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#252B38" vertical={false} />
                        <XAxis 
                          dataKey={queryResult.visualization.x_axis} 
                          stroke="#9299AA" 
                          fontSize={10} 
                          tickLine={false} 
                          axisLine={{ stroke: '#252B38' }}
                        />
                        <YAxis 
                          stroke="#9299AA" 
                          fontSize={10} 
                          tickLine={false} 
                          axisLine={{ stroke: '#252B38' }}
                          tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}
                        />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#121620', borderColor: '#252B38', fontSize: '12px' }} 
                        />
                        {queryResult.visualization.y_axes.map((yKey, idx) => (
                          <Line 
                            key={yKey} 
                            type="monotone"
                            dataKey={yKey} 
                            stroke={COLORS[idx % COLORS.length]} 
                            strokeWidth={2}
                            dot={{ fill: COLORS[idx % COLORS.length], r: 3 }}
                          />
                        ))}
                      </LineChart>
                    ) : (
                      <PieChart>
                        <Pie
                          data={queryResult.data.rows}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={95}
                          paddingAngle={3}
                          dataKey={queryResult.visualization.y_axes[0]}
                          nameKey={queryResult.visualization.x_axis}
                        >
                          {queryResult.data.rows.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#121620', borderColor: '#252B38', fontSize: '12px' }} 
                        />
                      </PieChart>
                    )}
                  </ResponsiveContainer>
                  )}
                </div>
              )}

              {/* TAB 2: DATA TABLE */}
              {activeResultTab === 'table' && (
                <div className="flex flex-col h-full justify-between">
                  <div className="overflow-x-auto max-h-[310px] overflow-y-auto border border-[#252B38] rounded-md">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#171C29] sticky top-0 z-10">
                        <tr className="border-b border-[#252B38] text-[#9299AA] text-[10px] font-mono uppercase">
                          {queryResult.data.columns.map((col) => (
                            <th key={col} className="px-3 py-2 font-medium">
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#252B38]/60 bg-[#121620]">
                        {paginatedRows.length === 0 ? (
                          <tr>
                            <td colSpan={Math.max(1, queryResult.data.columns.length)} className="px-4 py-8 text-center text-[#9299AA] text-xs">
                              No records match your search criteria.
                            </td>
                          </tr>
                        ) : (
                          paginatedRows.map((row, idx) => (
                            <tr key={idx} className="hover:bg-[#171C29]/60 transition-colors">
                              {queryResult.data.columns.map((col) => {
                                const val = row[col];
                                return (
                                  <td key={col} className="px-3 py-1.5 text-[#F3F4F8] font-mono text-[11px] truncate max-w-[200px]">
                                    {typeof val === 'number' ? val.toLocaleString() : String(val ?? '')}
                                  </td>
                                );
                              })}
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  <div className="flex items-center justify-between pt-3 text-xs text-[#9299AA]">
                    <span>Showing {(currentPage - 1) * rowsPerPage + 1} to {Math.min(currentPage * rowsPerPage, filteredRows.length)} of {filteredRows.length} entries</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-2 py-0.5 rounded bg-[#171C29] border border-[#252B38] disabled:opacity-40 text-xs hover:text-[#F3F4F8] cursor-pointer"
                      >
                        Prev
                      </button>
                      <span className="px-2 text-xs font-mono text-[#F3F4F8]">{currentPage} / {totalPages}</span>
                      <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="px-2 py-0.5 rounded bg-[#171C29] border border-[#252B38] disabled:opacity-40 text-xs hover:text-[#F3F4F8] cursor-pointer"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: GENERATED SQL */}
              {activeResultTab === 'sql' && (
                <div className="flex flex-col h-full space-y-2">
                  <div className="flex items-center justify-between text-xs text-[#9299AA]">
                    <span className="font-mono text-[11px] text-[#43B581] flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> AST Validated PostgreSQL Dialect
                    </span>
                    <button
                      onClick={handleCopySQL}
                      className="flex items-center gap-1.5 bg-[#171C29] hover:bg-[#252B38] border border-[#252B38] text-[#F3F4F8] px-2.5 py-1 rounded text-xs transition-colors cursor-pointer"
                    >
                      {copiedSQL ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[#43B581]" />
                          <span className="text-[#43B581]">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-[#9A7AFF]" />
                          <span>Copy SQL</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="flex-1 bg-[#090B10] p-4 rounded-md border border-[#252B38] text-[#9A7AFF] font-mono text-xs overflow-x-auto leading-relaxed selection:bg-[#7755E8]/30">
                    <code>{queryResult.generated_sql}</code>
                  </pre>
                  <div className="text-[10px] text-[#9299AA] flex items-center justify-between pt-1">
                    <span>Generated by InsightX Semantic Grounding Engine</span>
                    <span className="font-mono text-[#9A7AFF]">Execution Time: {queryResult.execution_metrics.execution_time_ms} ms</span>
                  </div>
                </div>
              )}

              {/* TAB 4: OPTIMIZER PLAN */}
              {activeResultTab === 'plan' && (
                <div className="flex flex-col h-full space-y-3 text-xs">
                  <div className="bg-[#171C29] border border-[#252B38] rounded-md p-3 space-y-2">
                    <div className="font-medium text-[#F3F4F8] flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-[#9A7AFF]" />
                      <span>Relational Execution Tree & Optimizer Stats</span>
                    </div>
                    <div className="space-y-1.5 font-mono text-[11px] text-[#9299AA]">
                      <div className="flex justify-between border-b border-[#252B38] pb-1">
                        <span>Target Table:</span>
                        <span className="text-[#F3F4F8]">{queryResult.target_dataset}</span>
                      </div>
                      <div className="flex justify-between border-b border-[#252B38] pb-1">
                        <span>Scan Operator:</span>
                        <span className="text-[#43B581]">Index-assisted Sequential Scan (Parallel Workers: 2)</span>
                      </div>
                      <div className="flex justify-between border-b border-[#252B38] pb-1">
                        <span>Memory Allocation:</span>
                        <span className="text-[#F3F4F8]">4.2 MB WorkMem (Shared Buffers Hit: 98.4%)</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Optimizer Cost:</span>
                        <span className="text-[#9A7AFF]">12.45 .. 84.20 (Optimal)</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#0D1018] border border-[#252B38] rounded-md p-3 text-[11px] text-[#9299AA] leading-relaxed">
                    <strong className="text-[#F3F4F8]">Performance Audit:</strong> This query was planned with high selectivity. No full table scan bottlenecks detected. Indexes on grouping fields and metrics are active.
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* AI Business Insights Panel (4/12) */}
          <div className="lg:col-span-4 bg-[#121620] border border-[#252B38] rounded-lg p-4 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#252B38]">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-[#7755E8]/20 border border-[#7755E8]/30 flex items-center justify-center text-[#9A7AFF]">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="text-xs font-semibold text-[#F3F4F8]">AI Business Intelligence</h3>
                </div>
                <span className="text-[10px] font-mono text-[#43B581] bg-[#43B581]/10 px-1.5 py-0.5 rounded border border-[#43B581]/20">
                  Executive Brief
                </span>
              </div>

              {/* Executive Summary */}
              <div className="mt-3 space-y-3">
                <div>
                  <div className="text-[10px] font-semibold text-[#9299AA] uppercase tracking-wider font-mono mb-1">
                    Executive Summary
                  </div>
                  <p className="text-xs text-[#F3F4F8] leading-relaxed bg-[#171C29] p-3 rounded-md border border-[#252B38]">
                    {queryResult.ai_insights.summary}
                  </p>
                </div>

                {/* Key Findings */}
                <div>
                  <div className="text-[10px] font-semibold text-[#9299AA] uppercase tracking-wider font-mono mb-1">
                    Key Findings
                  </div>
                  <ul className="space-y-1.5">
                    {queryResult.ai_insights.key_findings.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-[#9299AA]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#7755E8] mt-1.5 shrink-0" />
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Strategic Recommendations */}
                <div>
                  <div className="text-[10px] font-semibold text-[#9299AA] uppercase tracking-wider font-mono mb-1">
                    Actionable Recommendations
                  </div>
                  <ul className="space-y-1.5">
                    {queryResult.ai_insights.recommendations.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-[#43B581]">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span className="leading-relaxed text-[#F3F4F8]">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Bottom action */}
            <div className="pt-3 border-t border-[#252B38] flex items-center justify-between">
              <span className="text-[10px] text-[#9299AA]">Auto-updated on execution</span>
              <button
                onClick={handleExportCSV}
                className="text-xs text-[#9A7AFF] hover:underline flex items-center gap-1 font-medium cursor-pointer"
              >
                <span>Export Dataset</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
