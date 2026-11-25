import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Plus, 
  Download, 
  Eye, 
  Printer, 
  CheckCircle2, 
  Calendar, 
  User, 
  Sparkles, 
  FileText,
  X
} from 'lucide-react';
import { ReportItem, DatasetMeta } from '../types';
import { apiService } from '../services/api';

interface ReportsViewProps {
  reports: ReportItem[];
  datasets: DatasetMeta[];
  onRefreshReports: () => void;
  onPreviewReport: (report: ReportItem) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  reports,
  datasets,
  onRefreshReports,
  onPreviewReport
}) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [selectedDataset, setSelectedDataset] = useState(datasets[0]?.id || 'enterprise_sales');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      await apiService.generateReport(title, selectedDataset, description);
      setIsCreateOpen(false);
      setTitle('');
      setDescription('');
      onRefreshReports();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportCSV = (rep: ReportItem) => {
    const csvContent = `Report ID,Title,Dataset,Created At,Author,Summary\n"${rep.id}","${rep.title}","${rep.dataset}","${rep.created_at}","${rep.author}","${rep.summary}"`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${rep.id}_${rep.title.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 space-y-5 max-w-[1720px] mx-auto">
      {/* Top Banner */}
      <div className="bg-[#121620] border border-[#252B38] rounded-lg p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-[#F3F4F8] flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-[#9A7AFF]" />
            <span>Executive Business Intelligence Reports</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#7755E8]/20 text-[#9A7AFF] border border-[#7755E8]/30">
              {reports.length} Reports
            </span>
          </h2>
          <p className="text-xs text-[#9299AA] mt-1">
            Publish, preview, and export high-fidelity analytical dossiers in PDF, Excel, and CSV formats.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-1.5 bg-[#7755E8] hover:bg-[#6844db] text-white px-3.5 py-1.5 rounded-md text-xs font-medium shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Generate New Report</span>
        </button>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reports.map((rep) => (
          <div 
            key={rep.id}
            className="bg-[#121620] border border-[#252B38] hover:border-[#7755E8]/40 rounded-lg p-4 flex flex-col justify-between transition-all"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#171C29] text-[#9A7AFF] border border-[#252B38]">
                  {rep.id}
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] text-[#43B581] font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#43B581]" />
                  {rep.status}
                </span>
              </div>

              <h3 className="text-sm font-semibold text-[#F3F4F8] leading-tight mb-1.5">
                {rep.title}
              </h3>

              <p className="text-xs text-[#9299AA] leading-relaxed mb-3">
                {rep.summary}
              </p>
            </div>

            <div className="pt-3 border-t border-[#252B38] space-y-2.5">
              <div className="flex items-center justify-between text-[11px] text-[#9299AA]">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> {rep.created_at}
                </span>
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3" /> {rep.author}
                </span>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] font-mono text-[#9299AA] bg-[#171C29] px-2 py-0.5 rounded border border-[#252B38]">
                  {rep.format}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleExportCSV(rep)}
                    className="flex items-center gap-1 bg-[#171C29] hover:bg-[#252B38] text-[#F3F4F8] px-2.5 py-1 rounded text-xs border border-[#252B38] transition-colors cursor-pointer"
                  >
                    <Download className="w-3 h-3" />
                    <span>CSV</span>
                  </button>
                  <button
                    onClick={() => onPreviewReport(rep)}
                    className="flex items-center gap-1 bg-[#7755E8] hover:bg-[#6844db] text-white px-3 py-1 rounded text-xs font-medium transition-colors cursor-pointer"
                  >
                    <Eye className="w-3 h-3" />
                    <span>Preview & Print</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE REPORT MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-[#121620] border border-[#252B38] rounded-xl w-full max-w-md p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#252B38] pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#9A7AFF]" />
                <h3 className="text-sm font-semibold text-[#F3F4F8]">Generate AI Intelligence Report</h3>
              </div>
              <button 
                onClick={() => setIsCreateOpen(false)}
                className="text-[#9299AA] hover:text-[#F3F4F8] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateReport} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[#9299AA] mb-1 font-medium">Report Title</label>
                <input
                  type="text"
                  placeholder="e.g. Q4 Executive Variance & Revenue Analysis"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#171C29] border border-[#252B38] rounded-md px-3 py-1.5 text-xs text-[#F3F4F8] focus:border-[#7755E8] focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-[#9299AA] mb-1 font-medium">Underlying Dataset</label>
                <select
                  value={selectedDataset}
                  onChange={(e) => setSelectedDataset(e.target.value)}
                  className="w-full bg-[#171C29] border border-[#252B38] rounded-md px-3 py-1.5 text-xs text-[#F3F4F8] focus:border-[#7755E8] focus:outline-hidden cursor-pointer"
                >
                  {datasets.map(d => (
                    <option key={d.id} value={d.id} className="bg-[#121620] text-[#F3F4F8]">
                      {d.name} ({d.records.toLocaleString()} rows)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#9299AA] mb-1 font-medium">Analytical Scope / Instructions (Optional)</label>
                <textarea
                  rows={3}
                  placeholder="Highlight key gross margins, regional variance, and operational efficiency..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#171C29] border border-[#252B38] rounded-md px-3 py-1.5 text-xs text-[#F3F4F8] focus:border-[#7755E8] focus:outline-hidden resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#252B38]">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-3 py-1.5 rounded-md text-xs text-[#9299AA] hover:text-[#F3F4F8] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !title.trim()}
                  className="bg-[#7755E8] hover:bg-[#6844db] disabled:opacity-50 text-white px-4 py-1.5 rounded-md text-xs font-medium cursor-pointer"
                >
                  {isSubmitting ? "Synthesizing Report..." : "Generate Report"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
