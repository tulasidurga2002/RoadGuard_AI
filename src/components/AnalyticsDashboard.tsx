import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  PieChart,
  Shield,
  Layers,
  Activity,
  RefreshCw,
  FileText,
} from 'lucide-react';
import { RoadReport, RoadHealthMetrics } from '../types';
import { GeminiService, DashboardInsights } from '../services/geminiService';

interface AnalyticsDashboardProps {
  reports: RoadReport[];
  metrics: RoadHealthMetrics;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  reports,
  metrics,
}) => {
  const [insights, setInsights] = useState<DashboardInsights | null>(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState<boolean>(false);

  // Computed metrics
  const totalReports = reports.length;
  const criticalCount = reports.filter((r) => r.severity === 'Critical' && r.status !== 'Resolved').length;
  const highPriorityCount = reports.filter((r) => r.priorityScore >= 61 && r.status !== 'Resolved').length;
  const resolvedCount = reports.filter((r) => r.status === 'Resolved').length;
  const pendingCount = reports.filter((r) => r.status !== 'Resolved').length;
  const totalDetections = reports.reduce((acc, r) => acc + (r.boundingBoxes?.length || 1), 0);

  // Damage type distribution
  const damageTypeCounts: Record<string, number> = {};
  reports.forEach((r) => {
    damageTypeCounts[r.damageType] = (damageTypeCounts[r.damageType] || 0) + 1;
  });

  // Severity distribution
  const severityCounts = {
    Critical: reports.filter((r) => r.severity === 'Critical').length,
    High: reports.filter((r) => r.severity === 'High').length,
    Medium: reports.filter((r) => r.severity === 'Medium').length,
    Low: reports.filter((r) => r.severity === 'Low').length,
  };

  // Status distribution
  const statusCounts = {
    Reported: reports.filter((r) => r.status === 'Reported').length,
    'Under Review': reports.filter((r) => r.status === 'Under Review').length,
    Approved: reports.filter((r) => r.status === 'Approved').length,
    Assigned: reports.filter((r) => r.status === 'Assigned').length,
    'In Progress': reports.filter((r) => r.status === 'In Progress').length,
    Resolved: reports.filter((r) => r.status === 'Resolved').length,
  };

  const topDamageType = Object.entries(damageTypeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Pothole';

  const handleFetchInsights = async () => {
    setIsLoadingInsights(true);
    try {
      const data = await GeminiService.getDashboardInsights({
        totalReports,
        criticalCount,
        resolvedCount,
        topDamageType,
        roadHealthScore: metrics.overallScore,
      });
      setInsights(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingInsights(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-600" />
            Municipal Road Network Analytics &amp; Health Index
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Aggregated intelligence across road asset inventory, defect distribution, maintenance velocity, and network health.
          </p>
        </div>

        <button
          disabled={isLoadingInsights}
          onClick={handleFetchInsights}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-emerald-800 border border-emerald-300 text-xs font-semibold shadow-xs transition-all cursor-pointer self-start sm:self-auto"
        >
          {isLoadingInsights ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
          ) : (
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          )}
          Generate Gemini AI Executive Insights
        </button>
      </div>

      {/* ROAD HEALTH SCORE HERO CARD */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-50 via-white to-slate-50 border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-4 flex items-center gap-6 border-b md:border-b-0 md:border-r border-slate-200 pb-6 md:pb-0 md:pr-6">
            <div className="relative flex items-center justify-center">
              <svg className="w-28 h-28 transform -rotate-90">
                <circle
                  cx="56"
                  cy="56"
                  r="46"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-slate-200"
                  fill="transparent"
                />
                <circle
                  cx="56"
                  cy="56"
                  r="46"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeDasharray={`${(metrics.overallScore / 100) * 289} 289`}
                  strokeLinecap="round"
                  className="text-emerald-600 transition-all duration-1000"
                  fill="transparent"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-slate-900 font-mono">{metrics.overallScore}</span>
                <span className="text-[10px] text-slate-500 font-semibold uppercase">Index</span>
              </div>
            </div>

            <div>
              <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                Municipal Road Health Score
              </div>
              <h2 className="text-lg font-extrabold text-slate-900 mt-0.5">District Network Rating</h2>
              <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                Potholes: <strong className="text-slate-800">{metrics.totalPotholes}</strong> &bull; Cracks: <strong className="text-slate-800">{metrics.totalCracks}</strong> &bull; Critical: <strong className="text-rose-700">{metrics.criticalIssues}</strong>
              </p>
            </div>
          </div>

          <div className="md:col-span-8 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              <span>Algorithmic Health Methodology &amp; Disclaimer</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              The Road Health Score is an automated algorithmic indicator generated by RoadGuard AI based on active defect frequency, severity weighting, traffic classification, and repair completion velocity. It serves as an operational decision-support metric and does not constitute a certified statutory engineering condition index.
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-4 text-center shadow-xs">
          <div className="text-[10px] font-semibold text-slate-500 uppercase">Total Reports</div>
          <div className="text-2xl font-black text-slate-900 font-mono mt-1">{totalReports}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Logged incidents</div>
        </div>

        <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-4 text-center shadow-xs">
          <div className="text-[10px] font-semibold text-rose-700 uppercase">Critical Issues</div>
          <div className="text-2xl font-black text-rose-700 font-mono mt-1">{criticalCount}</div>
          <div className="text-[10px] text-rose-600/80 mt-0.5">Immediate action</div>
        </div>

        <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 text-center shadow-xs">
          <div className="text-[10px] font-semibold text-amber-800 uppercase">High Priority</div>
          <div className="text-2xl font-black text-amber-800 font-mono mt-1">{highPriorityCount}</div>
          <div className="text-[10px] text-amber-700/80 mt-0.5">Priority &gt; 60</div>
        </div>

        <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 text-center shadow-xs">
          <div className="text-[10px] font-semibold text-emerald-800 uppercase">Resolved Tasks</div>
          <div className="text-2xl font-black text-emerald-800 font-mono mt-1">{resolvedCount}</div>
          <div className="text-[10px] text-emerald-700/80 mt-0.5">Repairs verified</div>
        </div>

        <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 text-center shadow-xs">
          <div className="text-[10px] font-semibold text-blue-800 uppercase">Pending Queue</div>
          <div className="text-2xl font-black text-blue-800 font-mono mt-1">{pendingCount}</div>
          <div className="text-[10px] text-blue-700/80 mt-0.5">Active lifecycle</div>
        </div>

        <div className="bg-teal-50/70 border border-teal-200 rounded-xl p-4 text-center shadow-xs">
          <div className="text-[10px] font-semibold text-teal-800 uppercase">CV Bounding Boxes</div>
          <div className="text-2xl font-black text-teal-800 font-mono mt-1">{totalDetections}</div>
          <div className="text-[10px] text-teal-700/80 mt-0.5">Localized defects</div>
        </div>
      </div>

      {/* Gemini AI Executive Briefing Panel (if generated) */}
      {insights && (
        <div className="bg-white border border-emerald-300 rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            Gemini AI Executive Road Network Synthesis
          </div>

          <p className="text-sm font-medium text-slate-800 leading-relaxed">{insights.summary}</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            {insights.keyObservations.map((obs, idx) => (
              <div key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-700">
                <span className="font-bold text-emerald-700 block mb-1">Observation #{idx + 1}</span>
                {obs}
              </div>
            ))}
          </div>

          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900">
            <strong>Strategic Priority Directive:</strong> {insights.strategicRecommendation}
          </div>
        </div>
      )}

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart 1: Damage Type Distribution (6 cols) */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Damage Type Frequency Breakdown
            </h3>
            <span className="text-[10px] font-mono text-slate-500">Classification</span>
          </div>

          <div className="space-y-3 pt-2">
            {Object.entries(damageTypeCounts).map(([type, count]) => {
              const pct = Math.round((count / totalReports) * 100);
              return (
                <div key={type} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-800 font-medium">{type}</span>
                    <span className="font-mono text-slate-600">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-600 to-teal-500 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 2: Severity Distribution (6 cols) */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Severity Level Distribution
            </h3>
            <span className="text-[10px] font-mono text-slate-500">Risk Profile</span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="bg-rose-50 p-4 rounded-xl border border-rose-200 text-center">
              <span className="text-xs font-bold text-rose-700 block">Critical</span>
              <span className="text-2xl font-black text-rose-700 font-mono mt-1 block">
                {severityCounts.Critical}
              </span>
              <span className="text-[10px] text-slate-500">
                {Math.round((severityCounts.Critical / totalReports) * 100)}% of network
              </span>
            </div>

            <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-center">
              <span className="text-xs font-bold text-amber-800 block">High</span>
              <span className="text-2xl font-black text-amber-800 font-mono mt-1 block">
                {severityCounts.High}
              </span>
              <span className="text-[10px] text-slate-500">
                {Math.round((severityCounts.High / totalReports) * 100)}% of network
              </span>
            </div>

            <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200 text-center">
              <span className="text-xs font-bold text-yellow-800 block">Medium</span>
              <span className="text-2xl font-black text-yellow-800 font-mono mt-1 block">
                {severityCounts.Medium}
              </span>
              <span className="text-[10px] text-slate-500">
                {Math.round((severityCounts.Medium / totalReports) * 100)}% of network
              </span>
            </div>

            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 text-center">
              <span className="text-xs font-bold text-emerald-800 block">Low</span>
              <span className="text-2xl font-black text-emerald-800 font-mono mt-1 block">
                {severityCounts.Low}
              </span>
              <span className="text-[10px] text-slate-500">
                {Math.round((severityCounts.Low / totalReports) * 100)}% of network
              </span>
            </div>
          </div>
        </div>

        {/* Chart 3: Maintenance Status Pipeline (12 cols) */}
        <div className="lg:col-span-12 bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Maintenance Lifecycle Operations Queue
            </h3>
            <span className="text-[10px] font-mono text-slate-500">Turnaround Velocity</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 pt-2">
            {Object.entries(statusCounts).map(([status, count]) => (
              <div key={status} className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                <span className="text-[11px] font-semibold text-slate-600 block truncate">{status}</span>
                <span className="text-xl font-bold text-slate-900 font-mono mt-0.5 block">{count}</span>
                <span className="text-[10px] text-slate-500">issues</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
