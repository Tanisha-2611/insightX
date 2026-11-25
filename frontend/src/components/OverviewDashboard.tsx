import React, { useState } from 'react';
import { 
  Database, 
  Layers, 
  Terminal, 
  CheckCircle2, 
  AlertTriangle, 
  FileSpreadsheet,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ExternalLink,
  Sparkles,
  ShieldAlert,
  Clock,
  ArrowRight,
  Zap,
  Info,
  CheckCircle
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar 
} from 'recharts';
import { OverviewData, NavTab } from '../types';

interface OverviewDashboardProps {
  data: OverviewData;
  onNavigateTab: (tab: NavTab) => void;
  onRunQueryInStudio: (queryText: string, datasetId?: string) => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  data,
  onNavigateTab,
  onRunQueryInStudio
}) => {
  const [activityTimeFilter, setActivityTimeFilter] = useState<'7D' | '14D' | '30D'>('14D');

  const getKpiIcon = (iconName: string) => {
    switch (iconName) {
      case 'Database': return Database;
      case 'Layers': return Layers;
      case 'Terminal': return Terminal;
      case 'CheckCircle2': return CheckCircle2;
      case 'AlertTriangle': return AlertTriangle;
      case 'FileSpreadsheet': return FileSpreadsheet;
      default: return Database;
    }
  };

  // Custom Dark Recharts Tooltip
  const CustomAreaTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#121620] border border-[#252B38] px-3 py-2 rounded-md shadow-xl text-xs space-y-1">
          <div className="text-[#9299AA] font-mono text-[11px] pb-1 border-b border-[#252B38]">{label}</div>
          <div className="flex items-center justify-between gap-4 text-[#F3F4F8]">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#7755E8]" /> Queries:
            </span>
            <span className="font-mono font-medium">{payload[0].value.toLocaleString()}</span>
          </div>
          {payload[1] && (
            <div className="flex items-center justify-between gap-4 text-[#43B581]">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#43B581]" /> Success Rate:
              </span>
              <span className="font-mono font-medium">{((payload[1].value / payload[0].value) * 100).toFixed(1)}%</span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#121620] border border-[#252B38] px-3 py-2 rounded-md shadow-xl text-xs space-y-1">
          <div className="text-[#F3F4F8] font-medium pb-1 border-b border-[#252B38]">{label}</div>
          <div className="flex items-center justify-between gap-4 text-[#9A7AFF]">
            <span>Avg Latency:</span>
            <span className="font-mono font-medium">{payload[0].value} ms</span>
          </div>
          {payload[1] && (
            <div className="flex items-center justify-between gap-4 text-[#E5AE55]">
              <span>P95 Latency:</span>
              <span className="font-mono font-medium">{payload[1].value} ms</span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 space-y-5 max-w-[1720px] mx-auto">
      {/* SECTION 3: SIX COMPACT KPI CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {data.kpis.map((kpi) => {
          const Icon = getKpiIcon(kpi.icon);
          return (
            <div 
              key={kpi.id}
              className="bg-[#121620] border border-[#252B38] rounded-lg p-3 hover:border-[#7755E8]/40 transition-all flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-[#9299AA] tracking-wide truncate">{kpi.title}</span>
                <div className="w-6 h-6 rounded-md bg-[#171C29] border border-[#252B38] flex items-center justify-center text-[#9A7AFF]">
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="mt-2 flex items-baseline justify-between">
                <div>
                  <div className="text-xl font-bold font-mono text-[#F3F4F8] tracking-tight">
                    {kpi.display_value}
                  </div>
                  {kpi.sub_value && (
                    <div className="text-[10px] text-[#9299AA] font-mono mt-0.5">
                      {kpi.sub_value}
                    </div>
                  )}
                </div>

                {/* Mini Sparkline Bar Chart Indicator */}
                <div className="flex items-end gap-0.5 h-4 w-12 shrink-0">
                  {kpi.sparkline.map((val, idx) => (
                    <div 
                      key={idx} 
                      className="flex-1 bg-[#7755E8]/40 hover:bg-[#9A7AFF] rounded-t-xs transition-colors"
                      style={{ height: `${Math.max(20, Math.min(100, (val / Math.max(...kpi.sparkline)) * 100))}%` }}
                    />
                  ))}
                </div>
              </div>

              <div className="mt-2 pt-2 border-t border-[#252B38]/60 flex items-center justify-between text-[10px]">
                <span className={`inline-flex items-center gap-0.5 font-mono ${
                  kpi.is_positive ? 'text-[#43B581]' : 'text-[#E36F75]'
                }`}>
                  {kpi.is_positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {kpi.change}
                </span>
                <span className="text-[#9299AA]/70">vs prior</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* SECTION 4: FIRST ROW (Data Activity Over Time + Dataset Distribution) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Row 1A: Data Activity Over Time (7/12) */}
        <div className="lg:col-span-8 bg-[#121620] border border-[#252B38] rounded-lg p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-xs font-semibold text-[#F3F4F8] flex items-center gap-1.5">
                <span>Data Activity Over Time</span>
                <span className="text-[10px] text-[#9299AA] font-normal font-mono">• Query throughput & volume</span>
              </h2>
            </div>
            {/* Filter buttons */}
            <div className="flex items-center bg-[#171C29] border border-[#252B38] rounded-md p-0.5 text-[10px]">
              {(['7D', '14D', '30D'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setActivityTimeFilter(period)}
                  className={`px-2 py-0.5 rounded-sm transition-colors cursor-pointer ${
                    activityTimeFilter === period 
                      ? 'bg-[#7755E8] text-white font-medium' 
                      : 'text-[#9299AA] hover:text-[#F3F4F8]'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>

          <div className="h-[210px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.data_activity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7755E8" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#7755E8" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#43B581" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#43B581" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#252B38" vertical={false} />
                <XAxis 
                  dataKey="date" 
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
                  tickFormatter={(val) => `${val >= 1000 ? `${(val/1000).toFixed(1)}k` : val}`}
                />
                <Tooltip content={<CustomAreaTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="queries" 
                  stroke="#7755E8" 
                  strokeWidth={2} 
                  fillOpacity={1} 
                  fill="url(#purpleGradient)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="successful" 
                  stroke="#43B581" 
                  strokeWidth={1.5} 
                  strokeDasharray="2 2"
                  fillOpacity={1} 
                  fill="url(#greenGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#9299AA] pt-2 border-t border-[#252B38]/60 mt-2">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-0.5 bg-[#7755E8]" /> Total Queries
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-0.5 bg-[#43B581] border-b border-dashed" /> Successful Queries (99.1%)
              </span>
            </div>
            <span className="text-[10px] font-mono text-[#9299AA]">Dual-metric temporal feed</span>
          </div>
        </div>

        {/* Row 1B: Dataset Distribution (4/12) */}
        <div className="lg:col-span-4 bg-[#121620] border border-[#252B38] rounded-lg p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-semibold text-[#F3F4F8] flex items-center gap-1.5">
              <span>Dataset Distribution</span>
              <span className="text-[10px] text-[#9299AA] font-normal font-mono">• Records by source</span>
            </h2>
            <span className="text-[10px] font-mono text-[#9299AA] bg-[#171C29] px-1.5 py-0.5 rounded border border-[#252B38]">
              4 Sources
            </span>
          </div>

          <div className="h-[150px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.dataset_distribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={68}
                  paddingAngle={3}
                  dataKey="percentage"
                >
                  {data.dataset_distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#121620" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload;
                      return (
                        <div className="bg-[#121620] border border-[#252B38] px-2.5 py-1.5 rounded text-xs shadow-xl">
                          <div className="text-[#F3F4F8] font-medium">{item.name}</div>
                          <div className="text-[11px] font-mono text-[#9A7AFF] mt-0.5">
                            {item.records.toLocaleString()} rows ({item.percentage}%)
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Compact Legend */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#252B38]/60 mt-1">
            {data.dataset_distribution.map((item, idx) => (
              <div key={idx} className="flex items-center gap-1.5 text-[11px]">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-[#9299AA] truncate flex-1">{item.name}</span>
                <span className="font-mono text-[#F3F4F8] text-[10px] shrink-0">{item.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 4: SECOND ROW (Query Performance, Data Quality Overview, Recent AI Insights) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Row 2A: Query Performance */}
        <div className="bg-[#121620] border border-[#252B38] rounded-lg p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-semibold text-[#F3F4F8] flex items-center gap-1.5">
              <span>Query Performance</span>
              <span className="text-[10px] text-[#9299AA] font-normal font-mono">• Execution latency</span>
            </h2>
            <span className="text-[10px] font-mono text-[#43B581] bg-[#43B581]/10 px-1.5 py-0.5 rounded border border-[#43B581]/20">
              Avg 42ms
            </span>
          </div>

          <div className="h-[150px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.query_performance} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#252B38" vertical={false} />
                <XAxis 
                  dataKey="category" 
                  stroke="#9299AA" 
                  fontSize={9} 
                  tickLine={false} 
                  axisLine={{ stroke: '#252B38' }}
                />
                <YAxis 
                  stroke="#9299AA" 
                  fontSize={9} 
                  tickLine={false} 
                  axisLine={{ stroke: '#252B38' }}
                  unit="ms"
                />
                <Tooltip content={<CustomBarTooltip />} />
                <Bar dataKey="avg_duration_ms" fill="#7755E8" radius={[3, 3, 0, 0]} />
                <Bar dataKey="p95_ms" fill="#9A7AFF" opacity={0.6} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between text-[10px] text-[#9299AA] pt-2 border-t border-[#252B38]/60 mt-1">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-xs bg-[#7755E8]" /> Mean (ms)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-xs bg-[#9A7AFF]" /> P95 Latency
              </span>
            </div>
            <span className="font-mono text-[#9A7AFF]">Cache hit: 34.2%</span>
          </div>
        </div>

        {/* Row 2B: Data Quality Overview */}
        <div className="bg-[#121620] border border-[#252B38] rounded-lg p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-semibold text-[#F3F4F8] flex items-center gap-1.5">
              <span>Data Quality Overview</span>
              <span className="text-[10px] text-[#9299AA] font-normal font-mono">• Health audit</span>
            </h2>
            <span className="text-[10px] font-mono text-[#43B581] bg-[#43B581]/10 px-1.5 py-0.5 rounded border border-[#43B581]/20">
              {data.data_quality.overall_score}/100 Score
            </span>
          </div>

          <div className="space-y-3 py-1">
            {/* Valid Records */}
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-[#9299AA]">Valid Records</span>
                <span className="font-mono text-[#43B581] font-medium">{data.data_quality.valid_records_pct}%</span>
              </div>
              <div className="w-full bg-[#171C29] h-2 rounded-full overflow-hidden border border-[#252B38]">
                <div className="bg-[#43B581] h-full rounded-full" style={{ width: `${data.data_quality.valid_records_pct}%` }} />
              </div>
            </div>

            {/* Missing Values */}
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-[#9299AA]">Missing Values (Nulls)</span>
                <span className="font-mono text-[#E5AE55] font-medium">{data.data_quality.missing_values_pct}%</span>
              </div>
              <div className="w-full bg-[#171C29] h-2 rounded-full overflow-hidden border border-[#252B38]">
                <div className="bg-[#E5AE55] h-full rounded-full" style={{ width: `${Math.max(2, data.data_quality.missing_values_pct * 15)}%` }} />
              </div>
            </div>

            {/* Duplicate Records */}
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-[#9299AA]">Duplicate Records</span>
                <span className="font-mono text-[#9A7AFF] font-medium">{data.data_quality.duplicate_records_pct}%</span>
              </div>
              <div className="w-full bg-[#171C29] h-2 rounded-full overflow-hidden border border-[#252B38]">
                <div className="bg-[#9A7AFF] h-full rounded-full" style={{ width: `${Math.max(2, data.data_quality.duplicate_records_pct * 20)}%` }} />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] text-[#9299AA] pt-2 border-t border-[#252B38]/60 mt-1">
            <span className="flex items-center gap-1 text-[#43B581]">
              <CheckCircle className="w-3 h-3" /> {data.data_quality.checks_passed} checks passed
            </span>
            <span className="text-[#9299AA] font-mono">100% schema match</span>
          </div>
        </div>

        {/* Row 2C: Recent AI Insights */}
        <div className="bg-[#121620] border border-[#252B38] rounded-lg p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-semibold text-[#F3F4F8] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#9A7AFF]" />
              <span>Recent AI Insights</span>
            </h2>
            <button 
              onClick={() => onNavigateTab('studio')}
              className="text-[10px] text-[#9A7AFF] hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              Open Studio <ArrowRight className="w-2.5 h-2.5" />
            </button>
          </div>

          <div className="space-y-2 py-0.5 overflow-hidden">
            {data.recent_ai_insights.slice(0, 3).map((insight) => (
              <div 
                key={insight.id}
                onClick={() => onRunQueryInStudio(`Investigate ${insight.title} in ${insight.dataset}`)}
                className="bg-[#171C29] hover:bg-[#1f2638] border border-[#252B38] rounded-md p-2 transition-colors cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#7755E8]/20 text-[#9A7AFF] border border-[#7755E8]/30">
                    {insight.type}
                  </span>
                  <span className="text-[9px] text-[#9299AA]">{insight.timestamp}</span>
                </div>
                <div className="text-[11px] font-medium text-[#F3F4F8] mt-1 group-hover:text-[#9A7AFF] transition-colors truncate">
                  {insight.title}
                </div>
                <p className="text-[10px] text-[#9299AA] mt-0.5 line-clamp-1">
                  {insight.description}
                </p>
              </div>
            ))}
          </div>

          <div className="text-[10px] text-[#9299AA] pt-2 border-t border-[#252B38]/60 mt-1 flex items-center justify-between">
            <span>Powered by Schema-Grounded LLM</span>
            <span className="text-[#43B581] font-mono">Continuous Scan Active</span>
          </div>
        </div>
      </div>

      {/* SECTION 4: THIRD ROW (Recent Query Activity, Recently Connected Datasets, AI-Generated Recommendations) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4">
        {/* Row 3A: Recent Query Activity (5/12) */}
        <div className="lg:col-span-5 bg-[#121620] border border-[#252B38] rounded-lg p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-[#F3F4F8] flex items-center gap-1.5">
              <span>Recent Query Activity</span>
              <span className="text-[10px] text-[#9299AA] font-normal font-mono">• Telemetry log</span>
            </h2>
            <button 
              onClick={() => onNavigateTab('history')}
              className="text-[10px] text-[#9A7AFF] hover:underline cursor-pointer"
            >
              View All
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px]">
              <thead>
                <tr className="border-b border-[#252B38] text-[#9299AA] text-[10px] font-mono uppercase">
                  <th className="pb-1.5 font-medium">Query Description</th>
                  <th className="pb-1.5 font-medium">Dataset</th>
                  <th className="pb-1.5 font-medium">Time</th>
                  <th className="pb-1.5 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#252B38]/50">
                {data.recent_queries.slice(0, 5).map((q) => (
                  <tr 
                    key={q.id}
                    onClick={() => onRunQueryInStudio(q.description, q.dataset_id)}
                    className="hover:bg-[#171C29]/60 cursor-pointer transition-colors group"
                  >
                    <td className="py-2 pr-2 text-[#F3F4F8] group-hover:text-[#9A7AFF] font-medium max-w-[170px] truncate">
                      {q.description}
                    </td>
                    <td className="py-2 pr-2 text-[#9299AA] text-[10px] truncate max-w-[100px]">
                      {q.dataset}
                    </td>
                    <td className="py-2 pr-2 text-[#9299AA] font-mono text-[10px]">
                      {q.execution_time}
                    </td>
                    <td className="py-2 text-right">
                      <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-mono bg-[#43B581]/15 text-[#43B581] border border-[#43B581]/25">
                        {q.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="text-[10px] text-[#9299AA] pt-2 border-t border-[#252B38]/60 mt-2 flex items-center justify-between">
            <span>50 audit logs synchronized</span>
            <span className="font-mono text-[#9A7AFF]">Click row to rerun in Studio</span>
          </div>
        </div>

        {/* Row 3B: Recently Connected Datasets (4/12) */}
        <div className="lg:col-span-4 bg-[#121620] border border-[#252B38] rounded-lg p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-[#F3F4F8] flex items-center gap-1.5">
              <span>Recently Connected Datasets</span>
              <span className="text-[10px] text-[#9299AA] font-normal font-mono">• Warehouse links</span>
            </h2>
            <button 
              onClick={() => onNavigateTab('datasources')}
              className="text-[10px] text-[#9A7AFF] hover:underline cursor-pointer"
            >
              Manage
            </button>
          </div>

          <div className="space-y-2">
            {data.recent_datasets.slice(0, 4).map((ds) => (
              <div 
                key={ds.id}
                onClick={() => onNavigateTab('datasources')}
                className="bg-[#171C29] hover:bg-[#1f2638] border border-[#252B38] rounded-md p-2 flex items-center justify-between transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-6 h-6 rounded-md bg-[#7755E8]/15 border border-[#7755E8]/30 flex items-center justify-center text-[#9A7AFF] shrink-0">
                    <Database className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] font-medium text-[#F3F4F8] truncate">
                      {ds.name}
                    </div>
                    <div className="text-[10px] text-[#9299AA] truncate">
                      {ds.source}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-[11px] font-mono font-medium text-[#F3F4F8]">
                    {ds.records.toLocaleString()} rows
                  </div>
                  <span className="inline-flex items-center gap-1 text-[9px] text-[#43B581] font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#43B581]" /> Active
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-[10px] text-[#9299AA] pt-2 border-t border-[#252B38]/60 mt-2 flex items-center justify-between">
            <span>Storage: 42.8 GB allocated</span>
            <span className="text-[#43B581] font-mono">Replication: OK</span>
          </div>
        </div>

        {/* Row 3C: AI-Generated Insights & Recommendations (3/12) */}
        <div className="lg:col-span-3 bg-[#121620] border border-[#252B38] rounded-lg p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-[#F3F4F8] flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-[#E5AE55]" />
              <span>AI Recommendations</span>
            </h2>
            <span className="text-[10px] font-mono text-[#E5AE55] bg-[#E5AE55]/10 px-1.5 py-0.5 rounded border border-[#E5AE55]/20">
              3 Actions
            </span>
          </div>

          <div className="space-y-2">
            {data.ai_recommendations.map((rec) => (
              <div 
                key={rec.id}
                className="bg-[#171C29] border border-[#252B38] rounded-md p-2.5 flex flex-col justify-between"
              >
                <div className="text-[11px] font-medium text-[#F3F4F8] mb-1">
                  {rec.title}
                </div>
                <p className="text-[10px] text-[#9299AA] leading-relaxed mb-2 line-clamp-2">
                  {rec.description}
                </p>
                <button 
                  onClick={() => onRunQueryInStudio(`Execute performance recommendation: ${rec.title}`)}
                  className="w-full text-center bg-[#252B38] hover:bg-[#7755E8] hover:text-white text-[#F3F4F8] text-[10px] font-medium py-1 rounded transition-colors cursor-pointer"
                >
                  {rec.action}
                </button>
              </div>
            ))}
          </div>

          <div className="text-[10px] text-[#9299AA] pt-2 border-t border-[#252B38]/60 mt-2 flex items-center justify-between">
            <span>Optimization Engine</span>
            <span className="text-[#9A7AFF] font-mono">+18% Efficiency</span>
          </div>
        </div>
      </div>
    </div>
  );
};
