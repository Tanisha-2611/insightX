import React from 'react';
import { 
  LayoutDashboard, 
  Database, 
  Sparkles, 
  BarChart3, 
  FileSpreadsheet, 
  Clock, 
  Settings, 
  Activity, 
  ShieldCheck,
  ChevronRight,
  Zap
} from 'lucide-react';
import { NavTab } from '../types';

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  datasetsCount: number;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  onTabChange, 
  datasetsCount,
  isMobileOpen,
  onCloseMobile
}) => {
  const workspaceNav = [
    { id: 'overview' as NavTab, label: 'Overview', icon: LayoutDashboard },
    { id: 'datasources' as NavTab, label: 'Data Sources', icon: Database, badge: datasetsCount },
    { id: 'studio' as NavTab, label: 'AI Query Studio', icon: Sparkles, highlight: true },
    { id: 'analytics' as NavTab, label: 'Analytics', icon: BarChart3 },
    { id: 'reports' as NavTab, label: 'Reports', icon: FileSpreadsheet },
  ];

  const managementNav = [
    { id: 'history' as NavTab, label: 'Query History', icon: Clock },
    { id: 'settings' as NavTab, label: 'Settings', icon: Settings },
  ];

  const handleNavClick = (tab: NavTab) => {
    onTabChange(tab);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-xs cursor-pointer" 
        />
      )}
      <aside className={`fixed md:static inset-y-0 left-0 z-50 w-[236px] bg-[#0D1018] border-r border-[#252B38] flex flex-col h-screen select-none shrink-0 transition-transform duration-200 ${
        isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
      }`}>
      {/* Brand Header */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-[#252B38]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-[#7755E8]/20 border border-[#7755E8]/40 flex items-center justify-center text-[#9A7AFF]">
            <Activity className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-bold tracking-wider text-sm text-[#F3F4F8] font-mono">INSIGHT<span className="text-[#9A7AFF]">X</span></span>
              <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-[#7755E8]/20 text-[#9A7AFF] border border-[#7755E8]/30">BI</span>
            </div>
          </div>
        </div>
        <span className="text-[10px] text-[#9299AA] font-mono bg-[#171C29] px-1.5 py-0.5 rounded border border-[#252B38]">v2.4</span>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-5">
        {/* Workspace */}
        <div>
          <div className="px-2.5 mb-1.5 text-[11px] font-semibold text-[#9299AA]/80 uppercase tracking-wider font-mono">
            Workspace
          </div>
          <nav className="space-y-0.5">
            {workspaceNav.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors font-medium ${
                    isActive
                      ? 'bg-[#7755E8]/15 text-[#F3F4F8] border border-[#7755E8]/30 shadow-xs'
                      : 'text-[#9299AA] hover:text-[#F3F4F8] hover:bg-[#171C29]/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#9A7AFF]' : 'text-[#9299AA]'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-[#171C29] text-[#9299AA] border border-[#252B38]">
                      {item.badge}
                    </span>
                  )}
                  {item.highlight && !isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#7755E8] animate-pulse" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Management */}
        <div>
          <div className="px-2.5 mb-1.5 text-[11px] font-semibold text-[#9299AA]/80 uppercase tracking-wider font-mono">
            Management
          </div>
          <nav className="space-y-0.5">
            {managementNav.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors font-medium ${
                    isActive
                      ? 'bg-[#7755E8]/15 text-[#F3F4F8] border border-[#7755E8]/30'
                      : 'text-[#9299AA] hover:text-[#F3F4F8] hover:bg-[#171C29]/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#9A7AFF]' : 'text-[#9299AA]'}`} />
                    <span>{item.label}</span>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="p-2.5 border-t border-[#252B38] space-y-2 bg-[#090B10]/40">
        {/* Database Connection Status */}
        <div className="px-2 py-1.5 rounded-md bg-[#121620] border border-[#252B38] flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#43B581] shadow-[0_0_8px_#43B581]" />
            <span className="text-[11px] font-medium text-[#F3F4F8]">PostgreSQL</span>
          </div>
          <span className="text-[10px] font-mono text-[#43B581] bg-[#43B581]/10 px-1 py-0.2 rounded border border-[#43B581]/20">
            12ms
          </span>
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-2 px-1 py-1 rounded-md hover:bg-[#171C29]/50 transition-colors cursor-pointer">
          <div className="w-7 h-7 rounded-full bg-[#7755E8] flex items-center justify-center text-xs font-semibold text-white shadow-xs">
            AR
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#F3F4F8] truncate">Alex Rivera</span>
              <ShieldCheck className="w-3 h-3 text-[#9A7AFF] shrink-0" />
            </div>
            <span className="text-[10px] text-[#9299AA] truncate">Principal Architect</span>
          </div>
        </div>
      </div>
    </aside>
  </>
  );
};
