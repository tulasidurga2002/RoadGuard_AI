import React, { useState, useEffect } from 'react';
import {
  X,
  Printer,
  Sparkles,
  ShieldCheck,
  FileText,
  MapPin,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  HardHat,
  Share2,
} from 'lucide-react';
import { RoadReport } from '../types';
import { GeminiService, MaintenanceReportDetails } from '../services/geminiService';

interface AIReportModalProps {
  report: RoadReport | null;
  onClose: () => void;
}

export const AIReportModal: React.FC<AIReportModalProps> = ({ report, onClose }) => {
  const [reportDetails, setReportDetails] = useState<MaintenanceReportDetails | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!report) return;

    let isMounted = true;
    setIsLoading(true);

    GeminiService.generateMaintenanceReport(report)
      .then((data) => {
        if (isMounted) {
          setReportDetails(data);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error(err);
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [report]);

  if (!report) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center justify-center font-bold text-xs">
              RG
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 tracking-wide uppercase">
                Official Road Damage Assessment
              </span>
              <span className="text-[10px] text-slate-500 block font-mono">
                Report Reference #{report.id}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium border border-slate-300 transition-colors shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Export / Print</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-slate-700 text-xs print:text-black print:bg-white print:p-0">
          {/* Header Title Section */}
          <div className="border-b border-slate-200 pb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono text-[10px] uppercase font-semibold mb-2">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                Gemini AI Municipal Engineering Synthesis
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">ROAD DAMAGE REPORT</h1>
              <p className="text-xs text-slate-500 mt-1">
                Department of Public Works &bull; Roadway Condition Monitoring Service
              </p>
            </div>

            <div className="text-right font-mono text-[11px] text-slate-500 space-y-0.5">
              <div>Date Generated: {new Date().toLocaleDateString()}</div>
              <div>Authority: RoadGuard Automated Decision Support</div>
            </div>
          </div>

          {/* Key Identification Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Report ID</span>
              <span className="font-mono font-bold text-slate-900 text-sm">{report.id}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Damage Type</span>
              <span className="font-bold text-emerald-700 text-sm">{report.damageType}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">AI Confidence</span>
              <span className="font-mono font-bold text-slate-900 text-sm">{report.confidence}%</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Severity Level</span>
              <span className="font-bold text-amber-700 text-sm">{report.severity}</span>
            </div>
            <div className="pt-2 border-t border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Priority Index</span>
              <span className="font-mono font-black text-rose-650 text-base">{report.priorityScore}/100</span>
            </div>
            <div className="pt-2 border-t border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Report Count</span>
              <span className="font-bold text-slate-800 text-sm">{report.reportCount} Verified</span>
            </div>
            <div className="pt-2 border-t border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Corridor Traffic</span>
              <span className="font-bold text-slate-700 text-sm">{report.trafficLevel}</span>
            </div>
            <div className="pt-2 border-t border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Lifecycle Status</span>
              <span className="font-bold text-emerald-700 text-sm">{report.status}</span>
            </div>
          </div>

          {/* Location Details */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Road Location</span>
            <div className="font-bold text-slate-900 text-sm">{report.roadName}</div>
            <div className="text-[11px] text-slate-500">
              District: {report.district}, {report.city} &bull; GPS: {report.latitude}, {report.longitude}
            </div>
          </div>

          {/* Defect Photographic Evidence */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Incident Defect Photo</span>
              <div className="aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                <img src={report.imageUrl} alt="Damage" className="w-full h-full object-cover" />
              </div>
            </div>

            {report.repairImageUrl ? (
              <div className="space-y-1">
                <span className="text-[10px] text-emerald-700 uppercase font-semibold">Post-Repair Audit Verification</span>
                <div className="aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                  <img src={report.repairImageUrl} alt="Repair" className="w-full h-full object-cover" />
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Field Observations</span>
                <div className="aspect-video rounded-xl border border-slate-200 bg-slate-50 p-4 flex flex-col justify-between text-xs text-slate-700">
                  <p>{report.description || 'No additional citizen remarks provided.'}</p>
                  <div className="text-[11px] text-slate-500 font-mono">
                    Urgency Rating: {report.urgency || 'Immediate'}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Loading or Loaded AI Analysis */}
          {isLoading ? (
            <div className="p-8 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-3">
              <RefreshCw className="w-6 h-6 text-emerald-600 animate-spin mx-auto" />
              <p className="text-xs text-slate-500">Generating engineering maintenance specifications...</p>
            </div>
          ) : reportDetails ? (
            <div className="space-y-4">
              {/* Executive Summary */}
              <div className="space-y-1.5">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-emerald-600" />
                  Engineering Executive Summary
                </h3>
                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  {reportDetails.executiveSummary}
                </p>
              </div>

              {/* Sub-Base Risk */}
              <div className="space-y-1.5">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  Sub-Base Structural Risk Assessment
                </h3>
                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  {reportDetails.subBaseRisk}
                </p>
              </div>

              {/* Recommended Materials & Tools */}
              <div className="space-y-1.5">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <HardHat className="w-3.5 h-3.5 text-blue-600" />
                  Recommended Materials &amp; Methodologies
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {reportDetails.recommendedMaterials.map((mat, idx) => (
                    <div key={idx} className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-[11px] text-slate-700">
                      &bull; {mat}
                    </div>
                  ))}
                </div>
              </div>

              {/* Traffic Mitigation & Hours */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">Traffic Management Protocol</span>
                  <span className="text-xs text-slate-700 mt-1 block">{reportDetails.trafficMitigation}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">Estimated Crew Work Hours</span>
                  <span className="text-xs font-bold text-emerald-700 mt-1 block font-mono">
                    {reportDetails.estimatedWorkHours}
                  </span>
                </div>
              </div>

              {/* Legal / Engineering Disclaimer */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[10px] text-slate-500 italic">
                {reportDetails.disclaimer}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
