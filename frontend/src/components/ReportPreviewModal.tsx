import React from 'react';
import { 
  Printer, 
  X, 
  Download, 
  CheckCircle2, 
  Sparkles, 
  Calendar, 
  User, 
  Database,
  Layers,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';
import { ReportItem } from '../types';

interface ReportPreviewModalProps {
  report: ReportItem | null;
  onClose: () => void;
}

export const ReportPreviewModal: React.FC<ReportPreviewModalProps> = ({
  report,
  onClose
}) => {
  if (!report) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-[#121620] border border-[#252B38] rounded-xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header Bar */}
        <div className="h-12 px-5 bg-[#0D1018] border-b border-[#252B38] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-[#9A7AFF] bg-[#7755E8]/20 px-2 py-0.5 rounded border border-[#7755E8]/30">
              {report.id}
            </span>
            <span className="text-xs font-semibold text-[#F3F4F8] truncate max-w-md">
              {report.title}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-[#171C29] hover:bg-[#252B38] text-[#F3F4F8] px-2.5 py-1 rounded text-xs border border-[#252B38] transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-[#9A7AFF]" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded text-[#9299AA] hover:text-[#F3F4F8] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6 text-xs bg-[#090B10] text-[#F3F4F8]" id="printable-report">
          {/* Document Header */}
          <div className="border-b border-[#252B38] pb-5 flex items-start justify-between">
            <div>
              <div className="text-[10px] font-mono text-[#9A7AFF] uppercase tracking-wider mb-1">
                INSIGHTX • ENTERPRISE ANALYTICAL DOSSIER
              </div>
              <h1 className="text-lg font-bold text-[#F3F4F8] tracking-tight">
                {report.title}
              </h1>
              <div className="flex items-center gap-4 mt-2 text-[#9299AA] text-[11px]">
                <span className="flex items-center gap-1">
                  <Database className="w-3 h-3 text-[#7755E8]" /> Dataset: {report.dataset}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> {report.created_at}
                </span>
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3" /> Author: {report.author}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono bg-[#43B581]/15 text-[#43B581] border border-[#43B581]/25">
                <ShieldCheck className="w-3.5 h-3.5" /> Certified Audit
              </span>
            </div>
          </div>

          {/* Section: Executive Summary */}
          <div className="space-y-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#9299AA] font-mono">
              1. Executive Summary
            </h2>
            <p className="text-xs leading-relaxed text-[#F3F4F8] bg-[#121620] p-4 rounded-lg border border-[#252B38]">
              {report.summary}
            </p>
          </div>

          {/* Section: Key Analytical Metrics */}
          <div className="space-y-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#9299AA] font-mono">
              2. Core Performance Indicators
            </h2>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-[#121620] border border-[#252B38] p-3 rounded-lg">
                <div className="text-[10px] text-[#9299AA]">Sample Records Evaluated</div>
                <div className="text-base font-bold font-mono text-[#F3F4F8] mt-1">128,400 rows</div>
                <div className="text-[10px] text-[#43B581] mt-0.5 font-mono">100% Completeness</div>
              </div>
              <div className="bg-[#121620] border border-[#252B38] p-3 rounded-lg">
                <div className="text-[10px] text-[#9299AA]">Mean Latency Throughput</div>
                <div className="text-base font-bold font-mono text-[#9A7AFF] mt-1">38.4 ms</div>
                <div className="text-[10px] text-[#43B581] mt-0.5 font-mono">Sub-50ms SLA Met</div>
              </div>
              <div className="bg-[#121620] border border-[#252B38] p-3 rounded-lg">
                <div className="text-[10px] text-[#9299AA]">Data Quality Index</div>
                <div className="text-base font-bold font-mono text-[#43B581] mt-1">99.4%</div>
                <div className="text-[10px] text-[#9299AA] mt-0.5 font-mono">0.4% Null Tolerance</div>
              </div>
            </div>
          </div>

          {/* Section: Strategic Findings */}
          <div className="space-y-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#9299AA] font-mono">
              3. Strategic Findings & Governance
            </h2>
            <div className="bg-[#121620] border border-[#252B38] p-4 rounded-lg space-y-2">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#43B581] shrink-0 mt-0.5" />
                <span>Verified transactional consistency across primary PostgreSQL replica and Snowflake data warehouse.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#43B581] shrink-0 mt-0.5" />
                <span>Detected positive momentum in North American and European enterprise tiers (+18.4% period-over-period).</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#43B581] shrink-0 mt-0.5" />
                <span>No anomalous schema drifts or missing partition events were logged during the audit window.</span>
              </div>
            </div>
          </div>

          {/* Signature Footer */}
          <div className="pt-6 border-t border-[#252B38] flex items-center justify-between text-[10px] text-[#9299AA] font-mono">
            <span>Generated via INSIGHTX BI Autonomous Reporting Engine</span>
            <span>Document Hash: SHA-256: 7f8a3c...e91b</span>
          </div>
        </div>
      </div>
    </div>
  );
};
