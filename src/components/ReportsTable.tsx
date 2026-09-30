import React, { useState } from 'react';
import {
  Search,
  Filter,
  Eye,
  FileText,
  AlertTriangle,
  Layers,
  Sparkles,
  ArrowUpDown,
  Wrench,
  CheckCircle2,
  ExternalLink,
  RotateCcw,
  Printer,
  MapPin,
} from 'lucide-react';
import { RoadReport, DamageType, SeverityLevel, MaintenanceStatus } from '../types';
import { getDamageTypeIcon, getSeverityIcon } from './detect/ReportCard';

interface ReportsTableProps {
  reports: RoadReport[];
  onSelectReport: (report: RoadReport) => void;
  onOpenAiReport: (report: RoadReport) => void;
  onNavigateToMaintenance?: (report: RoadReport) => void;
  onViewOnMap?: (report: RoadReport) => void;
}

export const ReportsTable: React.FC<ReportsTableProps> = ({
  reports,
  onSelectReport,
  onOpenAiReport,
  onNavigateToMaintenance,
  onViewOnMap,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDamageType, setSelectedDamageType] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'priority' | 'date' | 'reports'>('priority');

  const filtered = reports
    .filter((r) => {
      // 1. Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchId = r.id.toLowerCase().includes(q);
        const matchRoad = r.roadName?.toLowerCase().includes(q);
        const matchCity = r.city?.toLowerCase().includes(q);
        const matchDistrict = r.district?.toLowerCase().includes(q);
        const matchType = r.damageType?.toLowerCase().includes(q);
        if (!matchId && !matchRoad && !matchCity && !matchDistrict && !matchType) {
          return false;
        }
      }

      // 2. Damage Type filter
      if (selectedDamageType !== 'all') {
        const normalized = selectedDamageType.toLowerCase();
        const repType = r.damageType.toLowerCase();
        if (!repType.includes(normalized.replace('damaged road edges', 'damaged road edge').replace('faded lane markings', 'faded lane marking'))) {
          return false;
        }
      }

      // 3. Severity filter
      if (selectedSeverity !== 'all' && r.severity !== selectedSeverity) {
        return false;
      }

      // 4. Status filter
      if (selectedStatus !== 'all') {
        if (selectedStatus === 'Repaired' && (r.status === 'Repaired' || r.status === 'Resolved')) {
          // match
        } else if (r.status !== selectedStatus) {
          return false;
        }
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'priority') return b.priorityScore - a.priorityScore;
      if (sortBy === 'reports') return b.reportCount - a.reportCount;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedDamageType('all');
    setSelectedSeverity('all');
    setSelectedStatus('all');
    setSortBy('priority');
  };

  const getSeverityBadgeClass = (level: SeverityLevel) => {
    switch (level) {
      case 'Critical':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      case 'High':
        return 'bg-orange-50 text-orange-800 border-orange-200';
      case 'Medium':
        return 'bg-yellow-50 text-yellow-800 border-yellow-200';
      case 'Low':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    }
  };

  const getStatusBadgeClass = (status: MaintenanceStatus) => {
    switch (status) {
      case 'Repaired':
      case 'Resolved':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'In Progress':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'Under Review':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Reported':
      default:
        return 'bg-rose-50 text-rose-800 border-rose-200';
    }
  };

  return (
    <div className="space-y-6 pb-16 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600" />
            Road Damage Reports Registry
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Verified repository of road damage incidents reported across Kakinada, Andhra Pradesh.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export / Print</span>
          </button>

          <div className="text-xs font-mono text-slate-600 bg-white border border-slate-200 rounded-xl px-3 py-1.5 flex items-center gap-2 shadow-xs">
            <span>Matching:</span>
            <strong className="text-emerald-700">{filtered.length}</strong>
            <span className="text-slate-400">/</span>
            <span>{reports.length} total</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar (Damage Type, Severity, Status) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 shadow-xs">
        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search ID, road name, district..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-600"
          />
        </div>

        {/* Damage Type Filter */}
        <div>
          <select
            value={selectedDamageType}
            onChange={(e) => setSelectedDamageType(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-600"
          >
            <option value="all">All Damage Types</option>
            <option value="Pothole">🕳️ Pothole</option>
            <option value="Longitudinal Crack">〰️ Longitudinal Crack</option>
            <option value="Transverse Crack">➖ Transverse Crack</option>
            <option value="Alligator Crack">🕸️ Alligator Crack</option>
            <option value="Damaged Road Edge">📐 Damaged Road Edge</option>
            <option value="Faded Lane Marking">🛣️ Faded Lane Marking</option>
            <option value="Damaged Road Surface">⚠️ Damaged Road Surface</option>
          </select>
        </div>

        {/* Severity Filter */}
        <div>
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-600"
          >
            <option value="all">All Severity Levels</option>
            <option value="Critical">🔴 Critical</option>
            <option value="High">🟠 High</option>
            <option value="Medium">🟡 Medium</option>
            <option value="Low">🟢 Low</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-600"
          >
            <option value="all">All Statuses</option>
            <option value="Reported">Reported</option>
            <option value="Under Review">Under Review</option>
            <option value="In Progress">In Progress</option>
            <option value="Repaired">Repaired</option>
          </select>
        </div>

        {/* Clear Filters */}
        <div>
          <button
            type="button"
            onClick={handleClearFilters}
            className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-slate-300 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear Filters</span>
          </button>
        </div>
      </div>

      {/* Reports Table View (Columns: Report ID, Damage Type, Road, Location, Severity, Priority, Status, Date, Action) */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                <th className="py-3.5 px-4">Report ID</th>
                <th className="py-3.5 px-4">Damage Type</th>
                <th className="py-3.5 px-4">Road Name</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4">Severity</th>
                <th className="py-3.5 px-4">Priority Score</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((report) => {
                const dateStr =
                  report.reportedDate ||
                  new Date(report.createdAt).toLocaleDateString('en-IN', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  });

                return (
                  <tr key={report.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* 1. Report ID & Photo */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={report.imageUrl || report.image}
                          alt={report.damageType}
                          className="w-10 h-9 rounded-lg object-cover bg-slate-100 border border-slate-200 shrink-0"
                        />
                        <span className="font-mono font-bold text-slate-900 block">{report.id}</span>
                      </div>
                    </td>

                    {/* 2. Damage Type */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                        <span>{getDamageTypeIcon(report.damageType)}</span>
                        <span>{report.damageType}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        Conf: {report.confidence}%
                      </span>
                    </td>

                    {/* 3. Road */}
                    <td className="py-3 px-4">
                      <div className="text-slate-800 font-medium truncate max-w-[170px]">
                        {report.roadName}
                      </div>
                    </td>

                    {/* 4. Location */}
                    <td className="py-3 px-4">
                      <div className="text-slate-600 truncate max-w-[160px]">
                        {report.city}, {report.district}
                      </div>
                    </td>

                    {/* 5. Severity */}
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getSeverityBadgeClass(
                          report.severity
                        )}`}
                      >
                        <span>{getSeverityIcon(report.severity)}</span>
                        <span>{report.severity}</span>
                      </span>
                    </td>

                    {/* 6. Priority */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 font-mono">
                        <span className="font-black text-sm text-orange-600">
                          {report.priorityScore}
                        </span>
                        <span className="text-[10px] text-slate-500">/100</span>
                      </div>
                    </td>

                    {/* 7. Status */}
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadgeClass(
                          report.status
                        )}`}
                      >
                        {report.status}
                      </span>
                    </td>

                    {/* 8. Date */}
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap text-[11px] font-mono">
                      {dateStr}
                    </td>

                    {/* 9. Action: "View on Map" & "View Details" */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {onViewOnMap && (
                          <button
                            type="button"
                            onClick={() => onViewOnMap(report)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-emerald-800 border border-emerald-300 font-semibold text-[11px] transition-colors shadow-xs cursor-pointer whitespace-nowrap"
                            title="Center and view damage marker on Road Map"
                          >
                            <MapPin className="w-3 h-3 text-emerald-600" />
                            <span>View on Map</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => onOpenAiReport(report)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition-colors shadow-xs cursor-pointer whitespace-nowrap"
                        >
                          <Eye className="w-3 h-3" />
                          <span>View Details</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="p-12 text-center text-slate-500 text-xs space-y-2">
              <p className="font-semibold text-slate-700">No matching road damage reports found.</p>
              <button
                onClick={handleClearFilters}
                className="text-xs text-emerald-600 hover:underline cursor-pointer font-medium"
              >
                Clear active filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
