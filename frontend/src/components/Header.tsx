import React from 'react';
import { 
  Calendar, 
  Database, 
  RotateCw, 
  Download, 
  ChevronDown,
  Menu
} from 'lucide-react';
import { DatasetMeta } from '../types';

interface HeaderProps {
  title: string;
  subtitle: string;
  datasets: DatasetMeta[];
  selectedDataset: string;
  onSelectDataset: (id: string) => void;
  dateRange: string;
  onSelectDateRange: (range: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  lastSynced: string;
  onExportReport: () => void;
  isMobileMenuOpen?: boolean;
  onToggleMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  datasets,
  selectedDataset,
  onSelectDataset,
  dateRange,
  onSelectDateRange,
  onRefresh,
  isRefreshing,
  lastSynced,
  onExportReport,
  onToggleMobileMenu
}) => {
  return (
    <header className="h-14 bg-[#090B10] border-b border-[#252B38] px-4 md:px-6 flex items-center justify-between shrink-0 sticky top-0 z-20">
      {/* Title & Subtitle */}
      <div className="flex items-center gap-2.5">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-1.5 rounded-md bg-[#121620] border border-[#252B38] text-[#9299AA] hover:text-[#F3F4F8] cursor-pointer"
            title="Toggle Navigation Menu"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}
        <div className="flex flex-col justify-center">
          <h1 className="text-sm font-semibold text-[#F3F4F8] tracking-tight flex items-center gap-2">
            {title}
          </h1>
          <p className="text-[11px] text-[#9299AA] hidden sm:block">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Control Actions */}
      <div className="flex items-center gap-2.5">
        {/* Dataset Selector */}
        <div className="relative">
          <div className="flex items-center gap-1.5 bg-[#121620] border border-[#252B38] rounded-md px-2.5 py-1 text-xs text-[#F3F4F8] hover:border-[#7755E8]/40 transition-colors">
            <Database className="w-3.5 h-3.5 text-[#9A7AFF]" />
            <select
              value={selectedDataset}
              onChange={(e) => onSelectDataset(e.target.value)}
              className="bg-transparent border-none text-xs text-[#F3F4F8] focus:outline-hidden cursor-pointer pr-4 appearance-none"
            >
              <option value="all" className="bg-[#121620] text-[#F3F4F8]">All Datasets (Unified)</option>
              {datasets.map((d) => (
                <option key={d.id} value={d.id} className="bg-[#121620] text-[#F3F4F8]">
                  {d.name} ({d.records.toLocaleString()} rows)
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-[#9299AA] absolute right-2 pointer-events-none" />
          </div>
        </div>

        {/* Date Range Selector */}
        <div className="relative">
          <div className="flex items-center gap-1.5 bg-[#121620] border border-[#252B38] rounded-md px-2.5 py-1 text-xs text-[#F3F4F8] hover:border-[#7755E8]/40 transition-colors">
            <Calendar className="w-3.5 h-3.5 text-[#9299AA]" />
            <select
              value={dateRange}
              onChange={(e) => onSelectDateRange(e.target.value)}
              className="bg-transparent border-none text-xs text-[#F3F4F8] focus:outline-hidden cursor-pointer pr-4 appearance-none"
            >
              <option value="7d" className="bg-[#121620] text-[#F3F4F8]">Last 7 Days</option>
              <option value="30d" className="bg-[#121620] text-[#F3F4F8]">Last 30 Days</option>
              <option value="qtd" className="bg-[#121620] text-[#F3F4F8]">Quarter to Date</option>
              <option value="ytd" className="bg-[#121620] text-[#F3F4F8]">Year to Date</option>
              <option value="all" className="bg-[#121620] text-[#F3F4F8]">All Time</option>
            </select>
            <ChevronDown className="w-3 h-3 text-[#9299AA] absolute right-2 pointer-events-none" />
          </div>
        </div>

        {/* Refresh Action */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          title={`Last synced: ${lastSynced}`}
          className="flex items-center gap-1.5 bg-[#121620] border border-[#252B38] hover:border-[#7755E8]/40 text-[#9299AA] hover:text-[#F3F4F8] px-2.5 py-1 rounded-md text-xs transition-colors cursor-pointer"
        >
          <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#9A7AFF]' : ''}`} />
          <span className="hidden sm:inline text-[11px]">{lastSynced}</span>
        </button>

        {/* Export Report Button */}
        <button
          onClick={onExportReport}
          className="flex items-center gap-1.5 bg-[#7755E8] hover:bg-[#6844db] text-white px-3 py-1 rounded-md text-xs font-medium shadow-xs transition-colors cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Report</span>
        </button>
      </div>
    </header>
  );
};
