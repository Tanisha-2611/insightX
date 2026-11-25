import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Filter, 
  Calendar, 
  Download, 
  RefreshCw, 
  Layers, 
  TrendingUp, 
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { DatasetMeta } from '../types';
import { apiService } from '../services/api';

interface AnalyticsViewProps {
  datasets: DatasetMeta[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ datasets }) => {
  const [selectedDataset, setSelectedDataset] = useState<string>('enterprise_sales');
  const [selectedMetric, setSelectedMetric] = useState<string>('revenue');
  const [selectedDimension, setSelectedDimension] = useState<string>('category');
  const [chartType, setChartType] = useState<'bar' | 'area' | 'line'>('bar');
  const [analyticsData, setAnalyticsData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const res = await apiService.getAnalytics(selectedDataset, selectedMetric, selectedDimension);
      setAnalyticsData(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [selectedDataset, selectedMetric, selectedDimension]);

  const activeMeta = datasets.find(d => d.id === selectedDataset);
  const availableDims = activeMeta ? activeMeta.columns.map(c => c.name) : ['category', 'region', 'segment'];
  const availableMetrics = activeMeta 
    ? activeMeta.columns.filter(c => !c.name.includes('_id') && !['name', 'date', 'customer_name', 'company_name', 'industry', 'category', 'region', 'segment', 'status', 'user'].includes(c.name)).map(c => c.name)
    : ['revenue', 'profit', 'units', 'cost'];

  const totalSum = analyticsData.reduce((acc, curr) => acc + (curr.total_metric || curr.count || 0), 0);
  const avgVal = analyticsData.length ? totalSum / analyticsData.length : 0;
  const maxVal = analyticsData.reduce((max, curr) => Math.max(max, curr.total_metric || curr.count || 0), 0);

  return (
    <div className="p-6 space-y-5 max-w-[1720px] mx-auto">
      {/* Top Filter Bar */}
      <div className="bg-[#121620] border border-[#252B38] rounded-lg p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-[#F3F4F8] flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#9A7AFF]" />
            <span>Multi-Dimensional Analytics Slicer</span>
          </h2>
          <p className="text-xs text-[#9299AA] mt-0.5">
            Interactively slice, aggregate, and visualize high-cardinality enterprise dimensions.
          </p>
        </div>

        {/* Slicer Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Dataset */}
          <div className="flex items-center gap-1.5 bg-[#171C29] border border-[#252B38] px-2.5 py-1 rounded-md text-xs">
            <span className="text-[#9299AA]">Dataset:</span>
            <select
              value={selectedDataset}
              onChange={(e) => setSelectedDataset(e.target.value)}
              className="bg-transparent text-[#F3F4F8] focus:outline-hidden cursor-pointer"
            >
              {datasets.map(d => (
                <option key={d.id} value={d.id} className="bg-[#121620] text-[#F3F4F8]">
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Metric */}
          <div className="flex items-center gap-1.5 bg-[#171C29] border border-[#252B38] px-2.5 py-1 rounded-md text-xs">
            <span className="text-[#9299AA]">Metric:</span>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="bg-transparent text-[#F3F4F8] focus:outline-hidden cursor-pointer font-mono"
            >
              {availableMetrics.map(met => (
                <option key={met} value={met} className="bg-[#121620] text-[#F3F4F8]">
                  {met.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>

          {/* Dimension */}
          <div className="flex items-center gap-1.5 bg-[#171C29] border border-[#252B38] px-2.5 py-1 rounded-md text-xs">
            <span className="text-[#9299AA]">Group By:</span>
            <select
              value={selectedDimension}
              onChange={(e) => setSelectedDimension(e.target.value)}
              className="bg-transparent text-[#F3F4F8] focus:outline-hidden cursor-pointer font-mono"
            >
              {availableDims.slice(0, 8).map(dim => (
                <option key={dim} value={dim} className="bg-[#121620] text-[#F3F4F8]">
                  {dim}
                </option>
              ))}
            </select>
          </div>

          {/* Chart Type */}
          <div className="flex items-center bg-[#171C29] border border-[#252B38] rounded-md p-0.5 text-xs">
            <button
              onClick={() => setChartType('bar')}
              className={`px-2 py-0.5 rounded text-[11px] transition-colors cursor-pointer ${
                chartType === 'bar' ? 'bg-[#7755E8] text-white' : 'text-[#9299AA] hover:text-[#F3F4F8]'
              }`}
            >
              Bar
            </button>
            <button
              onClick={() => setChartType('area')}
              className={`px-2 py-0.5 rounded text-[11px] transition-colors cursor-pointer ${
                chartType === 'area' ? 'bg-[#7755E8] text-white' : 'text-[#9299AA] hover:text-[#F3F4F8]'
              }`}
            >
              Area
            </button>
            <button
              onClick={() => setChartType('line')}
              className={`px-2 py-0.5 rounded text-[11px] transition-colors cursor-pointer ${
                chartType === 'line' ? 'bg-[#7755E8] text-white' : 'text-[#9299AA] hover:text-[#F3F4F8]'
              }`}
            >
              Line
            </button>
          </div>

          <button
            onClick={fetchAnalytics}
            className="p-1.5 rounded-md bg-[#171C29] border border-[#252B38] text-[#9299AA] hover:text-[#F3F4F8] cursor-pointer"
            title="Refresh Analysis"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#9A7AFF]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Aggregate Stat Badges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-[#121620] border border-[#252B38] rounded-lg p-3">
          <div className="text-[11px] text-[#9299AA]">Aggregate Total</div>
          <div className="text-lg font-bold font-mono text-[#F3F4F8] mt-1">
            ${totalSum.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
        </div>
        <div className="bg-[#121620] border border-[#252B38] rounded-lg p-3">
          <div className="text-[11px] text-[#9299AA]">Cohort Mean</div>
          <div className="text-lg font-bold font-mono text-[#43B581] mt-1">
            ${avgVal.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
        </div>
        <div className="bg-[#121620] border border-[#252B38] rounded-lg p-3">
          <div className="text-[11px] text-[#9299AA]">Peak Cardinality Value</div>
          <div className="text-lg font-bold font-mono text-[#9A7AFF] mt-1">
            ${maxVal.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
        </div>
        <div className="bg-[#121620] border border-[#252B38] rounded-lg p-3">
          <div className="text-[11px] text-[#9299AA]">Unique Partitions</div>
          <div className="text-lg font-bold font-mono text-[#E5AE55] mt-1">
            {analyticsData.length} groups
          </div>
        </div>
      </div>

      {/* Main Chart Canvas */}
      <div className="bg-[#121620] border border-[#252B38] rounded-lg p-4 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#252B38]">
          <h3 className="text-xs font-semibold text-[#F3F4F8]">
            Metric Breakdown across `{selectedDimension}`
          </h3>
          <span className="text-[10px] font-mono text-[#9299AA]">
            Live SQL Aggregation
          </span>
        </div>

        <div className="h-[340px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'bar' ? (
              <BarChart data={analyticsData} margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#252B38" vertical={false} />
                <XAxis 
                  dataKey="dimension_value" 
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
                <Tooltip contentStyle={{ backgroundColor: '#121620', borderColor: '#252B38', fontSize: '12px' }} />
                <Bar dataKey="total_metric" fill="#7755E8" radius={[3, 3, 0, 0]} />
                {analyticsData[0]?.secondary_metric !== undefined && (
                  <Bar dataKey="secondary_metric" fill="#9A7AFF" radius={[3, 3, 0, 0]} />
                )}
              </BarChart>
            ) : chartType === 'area' ? (
              <AreaChart data={analyticsData} margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
                <defs>
                  <linearGradient id="anGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7755E8" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#7755E8" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#252B38" vertical={false} />
                <XAxis dataKey="dimension_value" stroke="#9299AA" fontSize={10} tickLine={false} axisLine={{ stroke: '#252B38' }} />
                <YAxis stroke="#9299AA" fontSize={10} tickLine={false} axisLine={{ stroke: '#252B38' }} tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
                <Tooltip contentStyle={{ backgroundColor: '#121620', borderColor: '#252B38', fontSize: '12px' }} />
                <Area type="monotone" dataKey="total_metric" stroke="#7755E8" strokeWidth={2} fill="url(#anGrad)" />
              </AreaChart>
            ) : (
              <LineChart data={analyticsData} margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#252B38" vertical={false} />
                <XAxis dataKey="dimension_value" stroke="#9299AA" fontSize={10} tickLine={false} axisLine={{ stroke: '#252B38' }} />
                <YAxis stroke="#9299AA" fontSize={10} tickLine={false} axisLine={{ stroke: '#252B38' }} tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
                <Tooltip contentStyle={{ backgroundColor: '#121620', borderColor: '#252B38', fontSize: '12px' }} />
                <Line type="monotone" dataKey="total_metric" stroke="#7755E8" strokeWidth={2} dot={{ fill: '#7755E8', r: 4 }} />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
