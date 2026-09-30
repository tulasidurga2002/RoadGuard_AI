import React from 'react';
import {
  X,
  AlertTriangle,
  Flame,
  ArrowRight,
  ShieldAlert,
  Bell,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { RoadReport } from '../types';

interface SmartAlertsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  reports: RoadReport[];
  onSelectReport: (report: RoadReport) => void;
}

export const SmartAlertsDrawer: React.FC<SmartAlertsDrawerProps> = ({
  isOpen,
  onClose,
  reports,
  onSelectReport,
}) => {
  if (!isOpen) return null;

  // Filter for critical or priority > 80
  const criticalAlerts = reports.filter(
    (r) => (r.severity === 'Critical' || r.priorityScore >= 80) && r.status !== 'Resolved'
  );

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-slate-200 shadow-2xl flex flex-col">
          {/* Drawer Header */}
          <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-800 border border-rose-300 flex items-center justify-center font-bold text-xs">
                <Bell className="w-4 h-4 text-rose-600 animate-bounce" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 tracking-wide uppercase">
                  Smart Maintenance Alerts
                </h2>
                <p className="text-[11px] text-slate-500">
                  {criticalAlerts.length} urgent hazard notifications active
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Alerts List */}
          <div className="p-4 overflow-y-auto space-y-3 flex-1 bg-slate-50/50">
            {criticalAlerts.length > 0 ? (
              criticalAlerts.map((report) => (
                <div
                  key={report.id}
                  onClick={() => {
                    onSelectReport(report);
                    onClose();
                  }}
                  className="bg-white border border-rose-200 hover:border-rose-400 rounded-2xl p-4 cursor-pointer transition-all space-y-2 group shadow-xs hover:shadow-md"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-rose-700 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                      CRITICAL ROAD HAZARD
                    </span>
                    <span className="font-mono font-bold text-slate-700 text-xs bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
                      Score: {report.priorityScore}/100
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-rose-700 transition-colors">
                      {report.damageType}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">{report.roadName}</p>
                  </div>

                  <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                    {report.aiExplanation || 'Requires immediate emergency field verification and cold-mix patch.'}
                  </p>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                    <span>Status: {report.status}</span>
                    <span className="text-emerald-700 font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      Review Ticket &rarr;
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-10 text-center space-y-2 text-slate-500 text-xs">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <p className="font-semibold text-slate-800">No Critical Safety Alerts</p>
                <p className="text-[11px] text-slate-500">
                  All logged roadway hazards are currently within managed operational thresholds.
                </p>
              </div>
            )}
          </div>

          {/* Architecture Footer Notice */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 text-[10px] text-slate-500 space-y-1">
            <div className="font-semibold text-slate-700">Dispatch Webhook Architecture:</div>
            <p>
              Designed for automated municipal dispatch triggers via Twilio SMS, Email, and CAD (Computer Aided Dispatch) APIs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
