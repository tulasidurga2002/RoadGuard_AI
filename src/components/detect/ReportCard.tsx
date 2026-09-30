import React from 'react';
import { CheckCircle2, BookmarkCheck, FileCheck, ArrowRight } from 'lucide-react';
import { DamageType, SeverityLevel, MaintenanceStatus } from '../../types';
import { SeverityBadge } from './SeverityBadge';
import { PriorityScore } from './PriorityScore';

interface ReportCardProps {
  damageType: DamageType;
  confidence: number;
  severity: SeverityLevel;
  priorityScore: number;
  locationText: string;
  status: MaintenanceStatus;
  severityExplanation?: string;
  onSaveReport: () => void;
  onViewOnMap?: () => void;
  isSaved: boolean;
}

export function getDamageTypeIcon(type: DamageType): string {
  switch (type) {
    case 'Pothole':
      return '🕳️';
    case 'Longitudinal Crack':
      return '〰️';
    case 'Transverse Crack':
      return '➖';
    case 'Alligator Crack':
      return '🕸️';
    case 'Damaged Road Surface':
      return '⚠️';
    case 'Damaged Road Edge':
    case 'Damaged Road Edges':
      return '📐';
    case 'Faded Lane Marking':
    case 'Faded Lane Markings':
      return '🛣️';
    default:
      return '⚠️';
  }
}

export function getSeverityIcon(severity: SeverityLevel): string {
  switch (severity) {
    case 'Critical':
      return '🔴';
    case 'High':
      return '🟠';
    case 'Medium':
      return '🟡';
    case 'Low':
      return '🟢';
  }
}

export const ReportCard: React.FC<ReportCardProps> = ({
  damageType,
  confidence,
  severity,
  priorityScore,
  locationText,
  status,
  severityExplanation,
  onSaveReport,
  onViewOnMap,
  isSaved,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 space-y-6 shadow-xs relative overflow-hidden">
      {/* Title Header */}
      <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-emerald-700 uppercase font-bold">
            RoadGuard Automated Inspection
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            AI ANALYSIS RESULT
          </h2>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-mono">
          <span className="text-slate-600">📋 Status:</span>
          <span className="font-bold text-amber-800">{status}</span>
        </div>
      </div>

      {/* Grid of Key Metrics matching exact specification */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 1. Damage Type */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            {getDamageTypeIcon(damageType)} Damage Type
          </span>
          <div className="text-lg font-black text-slate-900 flex items-center gap-2">
            <span>{damageType}</span>
          </div>
          <span className="text-[10px] text-slate-500">Pavement Distress Category</span>
        </div>

        {/* 2. Confidence */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            🎯 Confidence
          </span>
          <div className="text-lg font-mono font-black text-emerald-700">
            {confidence}%
          </div>
          <span className="text-[10px] text-slate-500">Model Feature Match</span>
        </div>

        {/* 3. Severity */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            {getSeverityIcon(severity)} Severity
          </span>
          <div className="text-lg font-bold text-slate-900 flex items-center gap-1.5">
            <span>{severity}</span>
          </div>
          <span className="text-[10px] text-slate-500">Physical Cavity Risk</span>
        </div>

        {/* 4. Priority Score */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            📊 Priority Score
          </span>
          <div className="text-lg font-mono font-black text-orange-600">
            {priorityScore} <span className="text-xs text-slate-500 font-normal">/ 100</span>
          </div>
          <span className="text-[10px] text-slate-500">RoadGuard Dispatch Index</span>
        </div>

        {/* 5. Location */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-1 sm:col-span-2">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            📍 Location
          </span>
          <div className="text-sm font-bold text-slate-900 truncate">
            {locationText}
          </div>
          <span className="text-[10px] text-slate-500">Geo-tagged Landmark Coordinates</span>
        </div>
      </div>

      {/* Detailed Severity & Priority Explanations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
            Severity Rating Analysis
          </span>
          <SeverityBadge level={severity} explanation={severityExplanation} />
        </div>

        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
          <PriorityScore score={priorityScore} />
        </div>
      </div>

      {/* Save Report CTA Button & Success State */}
      <div className="pt-2 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-slate-600">
          Saving adds this incident directly to <strong className="text-slate-900">Road Map</strong>,{' '}
          <strong className="text-slate-900">Reports</strong>, and updates{' '}
          <strong className="text-slate-900">Dashboard statistics</strong>.
        </p>

        {isSaved ? (
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold animate-in zoom-in-95 duration-200 shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Report saved successfully and added to Road Map!</span>
            </div>
            {onViewOnMap && (
              <button
                type="button"
                onClick={onViewOnMap}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer whitespace-nowrap"
              >
                <span>View on Map</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={onSaveReport}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer transform hover:-translate-y-0.5"
          >
            <FileCheck className="w-4 h-4" />
            <span>Save Report</span>
          </button>
        )}
      </div>
    </div>
  );
};
