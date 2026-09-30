import React, { useState } from 'react';
import {
  Wrench,
  CheckCircle2,
  Clock,
  UserCheck,
  Camera,
  Upload,
  AlertTriangle,
  FileText,
  Sliders,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Send,
} from 'lucide-react';
import { RoadReport, MaintenanceStatus, SeverityLevel } from '../types';
import { useAuth } from '../context/AuthContext';

interface MaintenanceWorkflowProps {
  reports: RoadReport[];
  onUpdateReport: (id: string, updates: Partial<RoadReport>) => void;
  onOpenAiReport: (report: RoadReport) => void;
}

export const MaintenanceWorkflow: React.FC<MaintenanceWorkflowProps> = ({
  reports,
  onUpdateReport,
  onOpenAiReport,
}) => {
  const { currentUser } = useAuth();
  const [selectedReportId, setSelectedReportId] = useState<string>(
    reports.find((r) => r.status !== 'Resolved')?.id || reports[0]?.id || ''
  );

  const [activeStatusTab, setActiveStatusTab] = useState<string>('all');
  const [engineerRemarks, setEngineerRemarks] = useState<string>('');
  const [assignedCrew, setAssignedCrew] = useState<string>('');
  const [afterRepairImageUrl, setAfterRepairImageUrl] = useState<string>('');
  const [sliderPosition, setSliderPosition] = useState<number>(50);

  const selectedReport = reports.find((r) => r.id === selectedReportId) || reports[0];

  // Filter reports by status tab
  const filteredReports = reports.filter((r) => {
    if (activeStatusTab === 'all') return true;
    return r.status === activeStatusTab;
  });

  const statuses: MaintenanceStatus[] = [
    'Reported',
    'Under Review',
    'Approved',
    'Assigned',
    'In Progress',
    'Resolved',
  ];

  const handleStatusChange = (newStatus: MaintenanceStatus) => {
    if (!selectedReport) return;

    const updates: Partial<RoadReport> = {
      status: newStatus,
    };

    if (newStatus === 'Assigned') {
      updates.assignedEngineer = currentUser?.name || 'K. S. Rao, Executive Engineer';
      updates.maintenanceCrew = assignedCrew || 'Asphalt Rapid Repair Squad #2';
    }

    if (newStatus === 'Resolved') {
      updates.resolvedDate = new Date().toISOString();
      if (afterRepairImageUrl) {
        updates.repairImageUrl = afterRepairImageUrl;
      }
    }

    if (engineerRemarks) {
      updates.engineerRemarks = engineerRemarks;
    }

    onUpdateReport(selectedReport.id, updates);
  };

  const handleSaveRemarks = () => {
    if (!selectedReport || !engineerRemarks) return;
    onUpdateReport(selectedReport.id, {
      engineerRemarks,
      assignedEngineer: selectedReport.assignedEngineer || currentUser?.name || 'K. S. Rao, Executive Engineer',
    });
  };

  const getStatusColor = (status: MaintenanceStatus) => {
    switch (status) {
      case 'Resolved':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'In Progress':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'Assigned':
        return 'bg-indigo-50 text-indigo-800 border-indigo-200';
      case 'Approved':
        return 'bg-teal-50 text-teal-800 border-teal-200';
      case 'Under Review':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Reported':
      default:
        return 'bg-rose-50 text-rose-800 border-rose-200';
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Wrench className="w-5 h-5 text-emerald-600" />
            Engineering Review &amp; Maintenance Operations
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Municipal workflow tracking: verify AI detections, assign maintenance contractors, inspect repair completions, and upload before/after photographic proof.
          </p>
        </div>

        {/* Status Pipeline Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto p-1 bg-slate-100 border border-slate-200 rounded-xl scrollbar-none">
          <button
            onClick={() => setActiveStatusTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeStatusTab === 'all'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-300'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({reports.length})
          </button>
          {statuses.map((st) => {
            const count = reports.filter((r) => r.status === st).length;
            return (
              <button
                key={st}
                onClick={() => setActiveStatusTab(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  activeStatusTab === st
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-300'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st} ({count})
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Tickets Queue List (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wider px-1">
            Active Maintenance Tickets ({filteredReports.length})
          </div>

          <div className="space-y-2 max-h-[700px] overflow-y-auto pr-1">
            {filteredReports.map((report) => {
              const isSelected = report.id === selectedReport?.id;
              return (
                <div
                  key={report.id}
                  onClick={() => {
                    setSelectedReportId(report.id);
                    setEngineerRemarks(report.engineerRemarks || '');
                    setAssignedCrew(report.maintenanceCrew || '');
                    setAfterRepairImageUrl(report.repairImageUrl || '');
                  }}
                  className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-emerald-50/60 border-emerald-600 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800 shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-[11px] font-bold text-slate-600">{report.id}</span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getStatusColor(
                        report.status
                      )}`}
                    >
                      {report.status}
                    </span>
                  </div>

                  <div className="font-bold text-sm text-slate-900 mb-0.5">{report.damageType}</div>
                  <div className="text-[11px] text-slate-600 truncate mb-2">{report.roadName}</div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[10px] text-slate-500 font-mono">
                    <span>Priority: <strong className="text-amber-700">{report.priorityScore}/100</strong></span>
                    <span>Reports: <strong className="text-slate-700">{report.reportCount}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Ticket Inspection & Before/After Repair Verification (8 cols) */}
        {selectedReport ? (
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-xs">
              {/* Ticket Header & Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">{selectedReport.id}</span>
                    <span
                      className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${getStatusColor(
                        selectedReport.status
                      )}`}
                    >
                      {selectedReport.status}
                    </span>
                  </div>
                  <h2 className="text-xl font-extrabold text-slate-900 mt-1">{selectedReport.damageType}</h2>
                  <p className="text-xs text-slate-600">
                    {selectedReport.roadName} &bull; GPS: {selectedReport.latitude}, {selectedReport.longitude}
                  </p>
                </div>

                <button
                  onClick={() => onOpenAiReport(selectedReport)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-emerald-800 border border-emerald-300 text-xs font-semibold shadow-xs transition-all cursor-pointer self-start sm:self-auto"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  Generate AI Engineering Report
                </button>
              </div>

              {/* Maintenance Lifecycle Progression Bar */}
              <div className="space-y-2">
                <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                  Maintenance Lifecycle Status
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-1.5">
                  {statuses.map((st, idx) => {
                    const currentIndex = statuses.indexOf(selectedReport.status);
                    const isPassedOrCurrent = idx <= currentIndex;
                    const isCurrent = st === selectedReport.status;

                    return (
                      <button
                        key={st}
                        onClick={() => handleStatusChange(st)}
                        className={`py-2 px-1 text-center rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                          isCurrent
                            ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                            : isPassedOrCurrent
                            ? 'bg-slate-100 border-slate-300 text-slate-800'
                            : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-slate-300'
                        }`}
                      >
                        {st}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* BEFORE & AFTER REPAIR VERIFICATION SECTION */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Before &amp; After Repair Verification
                  </h3>
                  <span className="text-[11px] font-mono text-slate-500">
                    {selectedReport.repairImageUrl ? 'Dual Visual Audit Active' : 'Awaiting Repair Photo'}
                  </span>
                </div>

                {selectedReport.repairImageUrl ? (
                  /* Interactive Split Comparison View */
                  <div className="space-y-2">
                    <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-100 select-none shadow-xs">
                      {/* After Image (Background) */}
                      <img
                        src={selectedReport.repairImageUrl}
                        alt="After repair completed"
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      <div className="absolute top-3 right-3 bg-emerald-600 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                        AFTER REPAIR
                      </div>

                      {/* Before Image (Clipped by slider) */}
                      <div
                        className="absolute inset-y-0 left-0 overflow-hidden"
                        style={{ width: `${sliderPosition}%` }}
                      >
                        <img
                          src={selectedReport.imageUrl}
                          alt="Before damage detection"
                          className="w-full h-full object-cover"
                          style={{
                            width: `${(100 / (sliderPosition || 1)) * 100}%`,
                            maxWidth: 'none',
                          }}
                        />
                        <div className="absolute top-3 left-3 bg-rose-600 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                          BEFORE DAMAGE
                        </div>
                      </div>

                      {/* Divider Line */}
                      <div
                        className="absolute inset-y-0 w-0.5 bg-white shadow-2xl pointer-events-none"
                        style={{ left: `${sliderPosition}%` }}
                      >
                        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-white text-slate-900 flex items-center justify-center text-[10px] font-bold shadow-md border border-slate-200">
                          &harr;
                        </div>
                      </div>

                      {/* Interactive Drag Slider */}
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={sliderPosition}
                        onChange={(e) => setSliderPosition(parseInt(e.target.value))}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
                      />
                    </div>
                    <p className="text-[11px] text-center text-slate-500">
                      Drag left / right to interactively verify the repaired asphalt surface against the initial defect.
                    </p>
                  </div>
                ) : (
                  /* Side-by-side or Upload After Image Box */
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Before Image */}
                    <div className="space-y-1.5">
                      <div className="text-[11px] font-semibold text-rose-700 flex items-center justify-between">
                        <span>BEFORE: Road Damage</span>
                        <span className="font-mono text-[10px] text-slate-500">Confidence: {selectedReport.confidence}%</span>
                      </div>
                      <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                        <img
                          src={selectedReport.imageUrl}
                          alt="Road damage before"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>

                    {/* After Image Uploader */}
                    <div className="space-y-1.5">
                      <div className="text-[11px] font-semibold text-emerald-700 flex items-center justify-between">
                        <span>AFTER: Upload Repair Image</span>
                        <span className="text-[10px] text-slate-500">Verification</span>
                      </div>
                      <div className="aspect-video rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-4 flex flex-col items-center justify-center text-center space-y-2">
                        <Camera className="w-6 h-6 text-slate-400" />
                        <div className="space-y-2">
                          <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs">
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload After-Repair Photo</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = (uploadEvent) => {
                                    const result = uploadEvent.target?.result as string;
                                    if (result) {
                                      setAfterRepairImageUrl(result);
                                      onUpdateReport(selectedReport.id, {
                                        repairImageUrl: result,
                                        status: 'Resolved',
                                        resolvedDate: new Date().toISOString(),
                                      });
                                    }
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </label>
                          <div className="text-[10px] text-slate-500">or use demo verification photo:</div>
                          <button
                            type="button"
                            onClick={() => {
                              const sampleRepair =
                                'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=1000&q=80';
                              setAfterRepairImageUrl(sampleRepair);
                              onUpdateReport(selectedReport.id, {
                                repairImageUrl: sampleRepair,
                                status: 'Resolved',
                                resolvedDate: new Date().toISOString(),
                              });
                            }}
                            className="px-2.5 py-1 rounded bg-white hover:bg-slate-50 text-slate-700 text-[11px] font-mono border border-slate-300 transition-colors shadow-xs cursor-pointer"
                          >
                            Load Demo Post-Repair Asphalt Photo
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Assignment & Engineer Remarks */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
                    Assigned Maintenance Crew
                  </label>
                  <input
                    type="text"
                    value={assignedCrew || selectedReport.maintenanceCrew || ''}
                    onChange={(e) => setAssignedCrew(e.target.value)}
                    placeholder="e.g. Rapid Asphalt Patching Squad Beta"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-600"
                  />
                  <div className="text-[10px] text-slate-500">
                    Lead Supervising Engineer: {selectedReport.assignedEngineer || currentUser?.name || 'K. S. Rao, Executive Engineer'}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
                    Field Verification Remarks
                  </label>
                  <textarea
                    rows={2}
                    value={engineerRemarks}
                    onChange={(e) => setEngineerRemarks(e.target.value)}
                    placeholder="Enter on-site notes, asphalt mix type, layer thickness..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-600"
                  />
                  <button
                    onClick={handleSaveRemarks}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium border border-slate-300 transition-colors shadow-xs cursor-pointer"
                  >
                    <Send className="w-3 h-3 text-emerald-600" />
                    Save Engineer Remarks
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 shadow-xs">
            Select a maintenance ticket from the left panel to review.
          </div>
        )}
      </div>
    </div>
  );
};
