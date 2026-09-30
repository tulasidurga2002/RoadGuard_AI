import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { RoadReport, DamageType, SeverityLevel, MaintenanceStatus } from '../types';
import {
  MapPin,
  Search,
  Sliders,
  RotateCcw,
  ExternalLink,
  Eye,
  CheckCircle2,
  Clock,
  Sparkles,
  Wrench,
  UserCheck,
  Navigation,
  FileText,
  AlertTriangle,
  ArrowRight,
  Shield,
  Send,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getDamageTypeIcon, getSeverityIcon } from './detect/ReportCard';

interface InteractiveMapProps {
  reports: RoadReport[];
  onSelectReport?: (report: RoadReport) => void;
  onUpdateReport?: (id: string, updates: Partial<RoadReport>) => void;
  onOpenAiReport?: (report: RoadReport) => void;
  onNavigateToDetect?: () => void;
  onNavigateToReports?: () => void;
  targetReportId?: string | null;
  initialFilter?: { type: string; value: string } | null;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  reports,
  onSelectReport,
  onUpdateReport,
  onOpenAiReport,
  onNavigateToDetect,
  onNavigateToReports,
  targetReportId,
  initialFilter,
}) => {
  const { currentUser } = useAuth();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  // Selected Damage Record for Details Panel
  const [selectedReport, setSelectedReport] = useState<RoadReport | null>(reports[0] || null);

  // Filters State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDamageType, setSelectedDamageType] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [minPriority, setMinPriority] = useState<number>(0);

  // Quick Engineer/Admin Status Change in Details Panel
  const [statusToUpdate, setStatusToUpdate] = useState<MaintenanceStatus>('Under Review');
  const [engineerNotes, setEngineerNotes] = useState<string>('');
  const [assignedCrewInput, setAssignedCrewInput] = useState<string>('');
  const [statusUpdatedSuccess, setStatusUpdatedSuccess] = useState<string>('');

  // Synchronize statusToUpdate when selectedReport changes
  useEffect(() => {
    if (selectedReport) {
      setStatusToUpdate(selectedReport.status);
      setEngineerNotes(selectedReport.engineerRemarks || '');
      setAssignedCrewInput(selectedReport.maintenanceCrew || '');
      setStatusUpdatedSuccess('');
    }
  }, [selectedReport]);

  // Synchronize initialFilter from props (e.g. Dashboard stat cards)
  useEffect(() => {
    if (!initialFilter) return;
    if (initialFilter.type === 'severity') {
      setSelectedSeverity(initialFilter.value);
      setSelectedStatus('all');
      setSelectedDamageType('all');
      setMinPriority(0);
    } else if (initialFilter.type === 'status') {
      setSelectedStatus(initialFilter.value);
      setSelectedSeverity('all');
      setSelectedDamageType('all');
      setMinPriority(0);
    } else if (initialFilter.type === 'priority') {
      setMinPriority(parseInt(initialFilter.value, 10) || 0);
      setSelectedSeverity('all');
      setSelectedStatus('all');
      setSelectedDamageType('all');
    } else if (initialFilter.type === 'all') {
      handleClearFilters();
    }
  }, [initialFilter]);

  // Target report selection and camera centering
  useEffect(() => {
    if (!targetReportId) return;
    const target = reports.find((r) => r.id === targetReportId);
    if (target) {
      setSelectedReport(target);
      // Reset filters so the targeted report is guaranteed visible
      setSelectedSeverity('all');
      setSelectedStatus('all');
      setSelectedDamageType('all');
      setMinPriority(0);
      setSearchQuery('');

      if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo([target.latitude, target.longitude], 16, {
          duration: 1.2,
        });
      }
    }
  }, [targetReportId, reports]);

  // Combined Multi-Criteria Filter Logic
  const filteredReports = reports.filter((r) => {
    // 1. Search Query (road name, city, district)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchRoad = r.roadName?.toLowerCase().includes(q);
      const matchCity = r.city?.toLowerCase().includes(q);
      const matchDistrict = r.district?.toLowerCase().includes(q);
      const matchType = r.damageType?.toLowerCase().includes(q);
      if (!matchRoad && !matchCity && !matchDistrict && !matchType) {
        return false;
      }
    }

    // 2. Damage Type
    if (selectedDamageType !== 'all') {
      const normalizedType = selectedDamageType.toLowerCase();
      const reportType = r.damageType.toLowerCase();
      if (!reportType.includes(normalizedType.replace('damaged road edges', 'damaged road edge').replace('faded lane markings', 'faded lane marking'))) {
        return false;
      }
    }

    // 3. Severity
    if (selectedSeverity !== 'all' && r.severity !== selectedSeverity) {
      return false;
    }

    // 4. Status (treat Repaired and Resolved equivalently)
    if (selectedStatus !== 'all') {
      if (selectedStatus === 'Repaired' && (r.status === 'Repaired' || r.status === 'Resolved')) {
        // match
      } else if (r.status !== selectedStatus) {
        return false;
      }
    }

    // 5. Minimum Priority Slider
    if (r.priorityScore < minPriority) {
      return false;
    }

    return true;
  });

  // Clear all filters handler
  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedDamageType('all');
    setSelectedSeverity('all');
    setSelectedStatus('all');
    setMinPriority(0);
  };

  // Severity marker appearance
  const getMarkerHtml = (severity: SeverityLevel, priority: number) => {
    let colorHex = '#22c55e'; // Green (Low)
    let pulseClass = '';

    if (severity === 'Critical') {
      colorHex = '#ef4444'; // Red (Critical)
      pulseClass = 'animate-ping';
    } else if (severity === 'High') {
      colorHex = '#f97316'; // Orange (High)
    } else if (severity === 'Medium') {
      colorHex = '#eab308'; // Yellow (Medium)
    }

    return `
      <div style="position: relative; display: flex; align-items: center; justify-content: center; cursor: pointer;">
        ${
          severity === 'Critical'
            ? `<span style="position: absolute; width: 34px; height: 34px; border-radius: 9999px; background: rgba(239, 68, 68, 0.4);" class="${pulseClass}"></span>`
            : ''
        }
        <div style="
          width: 30px;
          height: 30px;
          border-radius: 9999px;
          background: ${colorHex};
          border: 2.5px solid #ffffff;
          box-shadow: 0 4px 14px rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-weight: 800;
          font-size: 11px;
        ">
          ${priority}
        </div>
      </div>
    `;
  };

  // Initialize Leaflet Map using standard OpenStreetMap tiles
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Center on Kakinada, Andhra Pradesh
      const map = L.map(mapContainerRef.current, {
        center: [16.9891, 82.2475],
        zoom: 13,
        zoomControl: true,
      });

      // Standard OpenStreetMap tiles without any third-party paid API keys
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = markersGroup;
      mapInstanceRef.current = map;

      // Force layout invalidation so tiles load immediately without grey cutoffs
      setTimeout(() => {
        map.invalidateSize();
      }, 150);
      setTimeout(() => {
        map.invalidateSize();
      }, 500);
    }

    const handleResize = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Markers when filteredReports change
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    filteredReports.forEach((report) => {
      const customIcon = L.divIcon({
        className: 'roadguard-leaflet-marker',
        html: getMarkerHtml(report.severity, report.priorityScore),
        iconSize: [30, 30],
        iconAnchor: [15, 15],
        popupAnchor: [0, -15],
      });

      const marker = L.marker([report.latitude, report.longitude], {
        icon: customIcon,
      });

      const formattedDate =
        report.reportedDate ||
        new Date(report.createdAt).toLocaleDateString('en-IN', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });

      const recAction = report.recommendedAction || report.suggestedAction || 'Schedule road inspection.';

      // Popup Content per Requirement 4
      const popupHtml = `
        <div style="min-width: 250px; max-width: 280px; font-family: system-ui, -apple-system, sans-serif; color: #0f172a; padding: 2px;">
          <div style="position: relative; height: 110px; border-radius: 8px; overflow: hidden; margin-bottom: 8px; background: #0f172a;">
            <img src="${report.imageUrl || report.image}" style="width: 100%; height: 100%; object-fit: cover;" alt="${report.damageType}"/>
            <span style="position: absolute; top: 6px; right: 6px; background: rgba(15,23,42,0.9); color: #fff; font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.2);">
              ${report.status}
            </span>
          </div>

          <div style="font-size: 14px; font-weight: 800; color: #0f172a; margin-bottom: 2px;">
            ${report.damageType}
          </div>
          <div style="font-size: 11px; color: #64748b; margin-bottom: 6px; font-weight: 500;">
            📍 ${report.roadName} (${report.city})
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 11px; background: #f8fafc; padding: 6px; border-radius: 6px; margin-bottom: 6px; border: 1px solid #e2e8f0;">
            <div><strong>Severity:</strong> <span style="color: ${
              report.severity === 'Critical'
                ? '#e11d48'
                : report.severity === 'High'
                ? '#ea580c'
                : '#059669'
            }; font-weight: 800;">${report.severity}</span></div>
            <div><strong>Priority:</strong> <span style="font-weight: 800; color: #0f172a;">${report.priorityScore}/100</span></div>
            <div><strong>Confidence:</strong> ${report.confidence}%</div>
            <div><strong>Date:</strong> ${formattedDate}</div>
          </div>

          <div style="font-size: 11px; color: #334155; margin-bottom: 6px; line-height: 1.35;">
            ${report.description || 'Pavement distress identified.'}
          </div>

          <div style="font-size: 10px; color: #059669; font-weight: 600; margin-bottom: 8px; background: #ecfdf5; padding: 4px 6px; border-radius: 4px; border: 1px solid #a7f3d0;">
            Action: ${recAction}
          </div>

          <button id="popup-btn-details-${report.id}" style="
            width: 100%;
            background: #059669;
            color: #ffffff;
            border: none;
            padding: 7px 12px;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 700;
            cursor: pointer;
            text-align: center;
          ">
            View Full Details &rarr;
          </button>
        </div>
      `;

      marker.bindPopup(popupHtml, { maxWidth: 300 });

      // When marker is clicked, update selectedReport for Details Panel
      marker.on('click', () => {
        setSelectedReport(report);
      });

      marker.on('popupopen', () => {
        setSelectedReport(report);
        const btn = document.getElementById(`popup-btn-details-${report.id}`);
        if (btn) {
          btn.onclick = () => {
            if (onOpenAiReport) {
              onOpenAiReport(report);
            }
          };
        }
      });

      markersLayerRef.current?.addLayer(marker);
    });

    // Auto fit bounds if markers exist
    if (filteredReports.length > 0 && mapInstanceRef.current) {
      const bounds = L.latLngBounds(
        filteredReports.map((r) => [r.latitude, r.longitude] as [number, number])
      );
      mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    }
  }, [filteredReports, onOpenAiReport]);

  // Center map on selected report
  const handleCenterOnReport = (rep: RoadReport) => {
    setSelectedReport(rep);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([rep.latitude, rep.longitude], 16, { animate: true });
    }
  };

  // Status update handler for Engineer/Admin
  const handleUpdateStatus = () => {
    if (!selectedReport || !onUpdateReport) return;

    onUpdateReport(selectedReport.id, {
      status: statusToUpdate,
      engineerRemarks: engineerNotes,
      maintenanceCrew: assignedCrewInput,
      assignedEngineer: currentUser?.name,
      resolvedDate: statusToUpdate === 'Repaired' ? new Date().toISOString() : undefined,
    });

    // Update local state copy
    setSelectedReport({
      ...selectedReport,
      status: statusToUpdate,
      engineerRemarks: engineerNotes,
      maintenanceCrew: assignedCrewInput,
    });

    setStatusUpdatedSuccess(`Status updated to "${statusToUpdate}" successfully.`);
    setTimeout(() => setStatusUpdatedSuccess(''), 4000);
  };

  const getStatusBadgeClass = (st: MaintenanceStatus) => {
    switch (st) {
      case 'Repaired':
      case 'Resolved':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Under Review':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Reported':
      default:
        return 'bg-rose-100 text-rose-800 border-rose-300';
    }
  };

  const isEngineerOrAdmin = currentUser?.role === 'engineer' || currentUser?.role === 'admin';

  return (
    <div className="space-y-6 pb-16">
      {/* Map Header & Controls */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-600" />
                Road Damage Monitoring Map
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
                OpenStreetMap GIS
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Interactive spatial monitoring across Kakinada &amp; Andhra Pradesh. Click markers to inspect damage severity, AI confidence, and maintenance status.
            </p>
          </div>

          {/* Severity Marker Legend */}
          <div className="flex items-center gap-2 text-xs flex-wrap">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 text-rose-800 border border-rose-200 font-medium">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              Critical
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-50 text-orange-800 border border-orange-200 font-medium">
              <span className="w-2 h-2 rounded-full bg-orange-500" />
              High
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-yellow-50 text-yellow-800 border border-yellow-200 font-medium">
              <span className="w-2 h-2 rounded-full bg-yellow-500" />
              Medium
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Low
            </span>
          </div>
        </div>

        {/* Complete Functional Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 pt-3 border-t border-slate-200">
          {/* 1. Search Road / City / District */}
          <div className="relative lg:col-span-2">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search road name, city, district..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-600"
            />
          </div>

          {/* 2. Damage Type */}
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

          {/* 3. Severity Level */}
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

          {/* 4. Status Filter */}
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

          {/* 5. Clear Filters Button */}
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

        {/* Priority Slider Bar */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <span className="shrink-0 font-medium text-slate-700">Minimum Priority Score:</span>
            <input
              type="range"
              min="0"
              max="95"
              step="5"
              value={minPriority}
              onChange={(e) => setMinPriority(parseInt(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <span className="font-mono font-bold text-emerald-700 w-12 text-right">
              {minPriority}+
            </span>
          </div>

          <div className="text-[11px] font-mono text-slate-600">
            Visible Damage Points: <strong className="text-emerald-700">{filteredReports.length}</strong> of{' '}
            <strong className="text-slate-700">{reports.length}</strong> total
          </div>
        </div>
      </div>

      {/* Map + Side Details Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Map Container (7 or 8 cols on desktop) */}
        <div className="lg:col-span-7 xl:col-span-8 bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs relative">
          <div className="h-[520px] w-full bg-slate-100 relative z-10" ref={mapContainerRef} />

          {/* Map Footer Bar */}
          <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-600">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>OpenStreetMap Leaflet Tiles Active &bull; No API Key Required</span>
            </div>
            <span>Click any marker to open details</span>
          </div>
        </div>

        {/* ROAD DAMAGE DETAILS PANEL (Requirements 5 & 7) */}
        <div className="lg:col-span-5 xl:col-span-4 bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-5">
          <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              Road Damage Details
            </h2>
            {selectedReport && (
              <span className="font-mono text-[10px] text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {selectedReport.id}
              </span>
            )}
          </div>

          {!selectedReport ? (
            <div className="p-10 text-center text-xs text-slate-500 space-y-2">
              <MapPin className="w-8 h-8 mx-auto text-slate-400" />
              <p className="font-semibold text-slate-700">Select a road damage marker to view details.</p>
              <p className="text-[11px]">
                Click on any colored marker on the map to load full pavement condition attributes.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Damage Image Thumbnail */}
              <div className="relative aspect-video rounded-2xl overflow-hidden border border-slate-200 bg-slate-100">
                <img
                  src={selectedReport.imageUrl || selectedReport.image}
                  alt={selectedReport.damageType}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2.5 right-2.5">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border shadow-sm ${getStatusBadgeClass(
                      selectedReport.status
                    )}`}
                  >
                    {selectedReport.status}
                  </span>
                </div>
              </div>

              {/* Title & Classification */}
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-1.5">
                    <span>{getDamageTypeIcon(selectedReport.damageType)}</span>
                    <span>{selectedReport.damageType}</span>
                  </h3>
                  <span className="text-xs font-mono font-bold text-emerald-700">
                    Confidence: {selectedReport.confidence}%
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  📍 {selectedReport.roadName}, {selectedReport.city}
                </p>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-[10px] font-semibold text-slate-500 uppercase block">Severity</span>
                  <span className="font-bold text-slate-800">
                    {getSeverityIcon(selectedReport.severity)} {selectedReport.severity}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-slate-500 uppercase block">Priority Score</span>
                  <span className="font-mono font-bold text-orange-600">
                    {selectedReport.priorityScore} / 100
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-slate-500 uppercase block">Reported Date</span>
                  <span className="text-slate-700 font-medium">
                    {selectedReport.reportedDate ||
                      new Date(selectedReport.createdAt).toLocaleDateString('en-IN')}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-slate-500 uppercase block">Reported By</span>
                  <span className="text-slate-700 truncate block font-medium">
                    {selectedReport.reportedBy || selectedReport.userName || 'Citizen'}
                  </span>
                </div>
              </div>

              {/* GPS Coordinates & Open Location */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase block">GPS Coordinates</span>
                  <span className="font-mono text-slate-700 text-[11px] font-semibold">
                    {selectedReport.latitude}, {selectedReport.longitude}
                  </span>
                </div>
                <a
                  href={`https://www.openstreetmap.org/?mlat=${selectedReport.latitude}&mlon=${selectedReport.longitude}#map=16/${selectedReport.latitude}/${selectedReport.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-50 text-emerald-700 text-[11px] font-semibold flex items-center gap-1 border border-slate-300 shadow-xs transition-colors"
                >
                  <span>Open Location</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Description & Recommended Action */}
              <div className="space-y-1.5 text-xs">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Description
                </span>
                <p className="text-slate-700 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  {selectedReport.description || 'Pavement void observed by citizen reporter.'}
                </p>
              </div>

              <div className="space-y-1.5 text-xs">
                <span className="text-[10px] font-semibold text-emerald-800 uppercase tracking-wider block">
                  Recommended Action
                </span>
                <p className="text-emerald-900 leading-relaxed bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                  {selectedReport.recommendedAction || selectedReport.suggestedAction || 'Schedule surface inspection.'}
                </p>
              </div>

              {/* Status Update & Engineer Controls */}
              {isEngineerOrAdmin ? (
                <div className="pt-2 border-t border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">
                      Engineer / Admin Workflow
                    </span>
                    <span className="text-[10px] font-mono font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Authorized</span>
                  </div>

                  {statusUpdatedSuccess && (
                    <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-medium flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{statusUpdatedSuccess}</span>
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-slate-600 uppercase">Update Status</label>
                    <select
                      value={statusToUpdate}
                      onChange={(e) => setStatusToUpdate(e.target.value as MaintenanceStatus)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-600"
                    >
                      <option value="Reported">Reported</option>
                      <option value="Under Review">Under Review</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Repaired">Repaired</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-slate-600 uppercase">Assign Maintenance Crew</label>
                    <input
                      type="text"
                      value={assignedCrewInput}
                      onChange={(e) => setAssignedCrewInput(e.target.value)}
                      placeholder="e.g. KMC Rapid Patch Unit #2"
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-slate-600 uppercase">Engineer Remarks</label>
                    <textarea
                      rows={2}
                      value={engineerNotes}
                      onChange={(e) => setEngineerNotes(e.target.value)}
                      placeholder="Add on-site inspection observations..."
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleUpdateStatus}
                    className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Save Maintenance Status &amp; Remarks</span>
                  </button>
                </div>
              ) : (
                /* Citizen Actions */
                <div className="pt-2 border-t border-slate-200 space-y-2">
                  <div className="text-[10px] font-semibold text-slate-500 uppercase">
                    Citizen Community Actions
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => onNavigateToDetect && onNavigateToDetect()}
                      className="py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold border border-emerald-200 transition-colors cursor-pointer"
                    >
                      Report Road Damage
                    </button>
                    <button
                      type="button"
                      onClick={() => onNavigateToReports && onNavigateToReports()}
                      className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold border border-slate-300 transition-colors cursor-pointer"
                    >
                      View All Reports
                    </button>
                  </div>
                </div>
              )}

              {/* View Full AI Report Trigger */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => onOpenAiReport && onOpenAiReport(selectedReport)}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-emerald-700 text-xs font-bold border border-emerald-300 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>View Full AI Engineering Report</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
