import React from 'react';
import {
  Camera,
  MapPin,
  CheckCircle2,
  Shield,
  Layers,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Flame,
  Search,
  Cpu,
  FileText,
  Wrench,
  Clock,
  UserCheck,
  Building,
  Sparkles,
} from 'lucide-react';
import { DamageType, RoadReport, UserRole } from '../types';
import { useAuth } from '../context/AuthContext';

interface LandingPageProps {
  onStartDetection: () => void;
  onExploreMap: () => void;
  onViewReports: () => void;
  onNavigateToMaintenance?: () => void;
  onFilterMap?: (filterType: string, filterValue: string) => void;
  reports: RoadReport[];
  roadHealthScore: number;
}

const DAMAGE_CLASSES: { name: DamageType; desc: string; severity: string; iconColor: string; icon: string }[] = [
  { name: 'Pothole', desc: 'Cavity voids penetrating asphalt wearing course into sub-base', severity: 'High - Critical', iconColor: 'text-rose-400', icon: '🕳️' },
  { name: 'Alligator Crack', desc: 'Interconnected polygon fatigue fractures indicating base weakness', severity: 'Critical', iconColor: 'text-amber-400', icon: '🕸️' },
  { name: 'Longitudinal Crack', desc: 'Linear parallel fissures running along construction joints', severity: 'Medium', iconColor: 'text-yellow-400', icon: '〰️' },
  { name: 'Transverse Crack', desc: 'Perpendicular thermal shrinkage cracks across the pavement slab', severity: 'Low - Medium', iconColor: 'text-blue-400', icon: '➖' },
  { name: 'Damaged Road Surface', desc: 'Raveling, rutting, and aggregate loss affecting tire grip', severity: 'Medium - High', iconColor: 'text-orange-400', icon: '⚠️' },
  { name: 'Damaged Road Edge', desc: 'Shoulder drop-off and asphalt edge unraveling on embankment', severity: 'High', iconColor: 'text-rose-400', icon: '📐' },
  { name: 'Faded Lane Marking', desc: 'Deteriorated thermoplast lane dividers causing lane drift risk', severity: 'Low', iconColor: 'text-teal-400', icon: '🛣️' },
];

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartDetection,
  onExploreMap,
  onViewReports,
  onNavigateToMaintenance,
  onFilterMap,
  reports,
  roadHealthScore,
}) => {
  const { currentUser } = useAuth();
  const userRole: UserRole = currentUser?.role || 'citizen';

  // Compute 6 required dashboard statistics
  const totalRoadDamages = reports.length;
  const criticalDamages = reports.filter((r) => r.severity === 'Critical').length;
  const highPriorityDamages = reports.filter((r) => r.priorityScore >= 61).length;
  const underReviewDamages = reports.filter((r) => r.status === 'Under Review').length;
  const inProgressDamages = reports.filter((r) => r.status === 'In Progress').length;
  const repairedDamages = reports.filter((r) => r.status === 'Repaired' || r.status === 'Resolved').length;

  const handleStatClick = (filterType: string, filterValue: string) => {
    if (onFilterMap) {
      onFilterMap(filterType, filterValue);
    } else {
      onExploreMap();
    }
  };

  return (
    <div className="space-y-12 py-4 pb-20 select-none">
      {/* Role-Specific Dashboard Welcome Header */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-white via-slate-50 to-slate-100/80 border border-slate-200 p-6 sm:p-10 lg:p-12 shadow-sm">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f080_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f080_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold tracking-wide uppercase font-mono">
            <Cpu className="w-3.5 h-3.5 text-emerald-600" />
            {userRole === 'citizen'
              ? 'Citizen Road Safety Portal • Kakinada, AP'
              : userRole === 'engineer'
              ? 'Field Engineering & Verification Dashboard'
              : 'Municipal Administration & Asset Intelligence'}
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 leading-tight">
            ROADGUARD <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600">AI</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 font-medium max-w-2xl mx-auto">
            {userRole === 'citizen'
              ? `Welcome, ${currentUser?.name || 'Citizen'}. Report potholes, track repair progress, and explore Kakinada's road damage map.`
              : userRole === 'engineer'
              ? `Welcome, ${currentUser?.name || 'Engineer'}. Review AI-detected pavement distresses, assign work crews, and certify repairs.`
              : `Welcome, ${currentUser?.name || 'Director'}. Full municipal oversight of road networks, maintenance turnaround, and critical alerts.`}
          </p>

          <p className="text-xs sm:text-sm text-emerald-700 font-mono tracking-widest uppercase font-bold">
            Detect • Analyze • Map • Prioritize
          </p>

          {/* Action CTAs tailored by role */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            <button
              onClick={onStartDetection}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all transform hover:-translate-y-0.5 cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              <span>Detect Road Damage</span>
            </button>

            <button
              onClick={onExploreMap}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold text-xs shadow-xs transition-all cursor-pointer"
            >
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>Explore Road Map</span>
            </button>

            {userRole === 'engineer' && onNavigateToMaintenance ? (
              <button
                onClick={onNavigateToMaintenance}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-300 font-semibold text-xs transition-all cursor-pointer"
              >
                <Wrench className="w-4 h-4 text-blue-600" />
                <span>Maintenance Operations</span>
              </button>
            ) : (
              <button
                onClick={onViewReports}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold text-xs shadow-xs transition-all cursor-pointer"
              >
                <FileText className="w-4 h-4 text-slate-500" />
                <span>View All Reports ({totalRoadDamages})</span>
              </button>
            )}
          </div>
        </div>

        {/* ROAD HEALTH SUMMARY BAR */}
        <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-3 mt-10 pt-6 border-t border-slate-200 max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl p-3.5 border border-slate-200 text-center shadow-xs">
            <div className="text-2xl font-black text-emerald-600 font-mono">{roadHealthScore}/100</div>
            <div className="text-[11px] text-slate-500 mt-0.5 font-medium">Road Health Index</div>
          </div>
          <div className="bg-white rounded-2xl p-3.5 border border-slate-200 text-center shadow-xs">
            <div className="text-2xl font-black text-rose-600 font-mono">{criticalDamages}</div>
            <div className="text-[11px] text-slate-500 mt-0.5 font-medium">Critical Road Hazards</div>
          </div>
          <div className="bg-white rounded-2xl p-3.5 border border-slate-200 text-center shadow-xs">
            <div className="text-2xl font-black text-teal-600 font-mono">{repairedDamages}</div>
            <div className="text-[11px] text-slate-500 mt-0.5 font-medium">Verified Repairs</div>
          </div>
          <div className="bg-white rounded-2xl p-3.5 border border-slate-200 text-center shadow-xs">
            <div className="text-2xl font-black text-indigo-600 font-mono">7 Classes</div>
            <div className="text-[11px] text-slate-500 mt-0.5 font-medium">Supported Categories</div>
          </div>
        </div>
      </section>

      {/* DASHBOARD STATISTICS SECTION (Requirement 8) */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              Live Road Damage Statistics (Kakinada Network)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Click any dashboard statistic to instantly filter and highlight corresponding road issues on the interactive map.
            </p>
          </div>
          <span className="text-[11px] font-mono text-slate-500">Live Local Storage Connected</span>
        </div>

        {/* 6 Connected Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* 1. Total Road Damages */}
          <div
            onClick={() => handleStatClick('all', 'all')}
            className="bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-2xl p-4 text-center cursor-pointer transition-all transform hover:-translate-y-0.5 shadow-xs group"
          >
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Total Road Damages
            </span>
            <div className="text-2xl font-black text-slate-900 font-mono mt-1 group-hover:text-emerald-600 transition-colors">
              {totalRoadDamages}
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">View all on map &rarr;</span>
          </div>

          {/* 2. Critical Damages */}
          <div
            onClick={() => handleStatClick('severity', 'Critical')}
            className="bg-rose-50/70 hover:bg-rose-50 border border-rose-200 hover:border-rose-300 rounded-2xl p-4 text-center cursor-pointer transition-all transform hover:-translate-y-0.5 shadow-xs group"
          >
            <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block">
              Critical Damages
            </span>
            <div className="text-2xl font-black text-rose-700 font-mono mt-1">
              {criticalDamages}
            </div>
            <span className="text-[10px] text-rose-600/80 mt-0.5 block">Filter Critical &rarr;</span>
          </div>

          {/* 3. High Priority Damages */}
          <div
            onClick={() => handleStatClick('priority', '61')}
            className="bg-orange-50/70 hover:bg-orange-50 border border-orange-200 hover:border-orange-300 rounded-2xl p-4 text-center cursor-pointer transition-all transform hover:-translate-y-0.5 shadow-xs group"
          >
            <span className="text-[10px] font-bold text-orange-700 uppercase tracking-wider block">
              High Priority
            </span>
            <div className="text-2xl font-black text-orange-700 font-mono mt-1">
              {highPriorityDamages}
            </div>
            <span className="text-[10px] text-orange-600/80 mt-0.5 block">Priority &gt; 60 &rarr;</span>
          </div>

          {/* 4. Under Review */}
          <div
            onClick={() => handleStatClick('status', 'Under Review')}
            className="bg-amber-50/70 hover:bg-amber-50 border border-amber-200 hover:border-amber-300 rounded-2xl p-4 text-center cursor-pointer transition-all transform hover:-translate-y-0.5 shadow-xs group"
          >
            <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
              Under Review
            </span>
            <div className="text-2xl font-black text-amber-800 font-mono mt-1">
              {underReviewDamages}
            </div>
            <span className="text-[10px] text-amber-700/80 mt-0.5 block">Filter Under Review &rarr;</span>
          </div>

          {/* 5. In Progress */}
          <div
            onClick={() => handleStatClick('status', 'In Progress')}
            className="bg-blue-50/70 hover:bg-blue-50 border border-blue-200 hover:border-blue-300 rounded-2xl p-4 text-center cursor-pointer transition-all transform hover:-translate-y-0.5 shadow-xs group"
          >
            <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block">
              In Progress
            </span>
            <div className="text-2xl font-black text-blue-800 font-mono mt-1">
              {inProgressDamages}
            </div>
            <span className="text-[10px] text-blue-700/80 mt-0.5 block">Active work orders &rarr;</span>
          </div>

          {/* 6. Repaired */}
          <div
            onClick={() => handleStatClick('status', 'Repaired')}
            className="bg-emerald-50/70 hover:bg-emerald-50 border border-emerald-200 hover:border-emerald-300 rounded-2xl p-4 text-center cursor-pointer transition-all transform hover:-translate-y-0.5 shadow-xs group"
          >
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
              Repaired
            </span>
            <div className="text-2xl font-black text-emerald-800 font-mono mt-1">
              {repairedDamages}
            </div>
            <span className="text-[10px] text-emerald-700/80 mt-0.5 block">Completed fixes &rarr;</span>
          </div>
        </div>
      </section>

      {/* Visual Pipeline Workflow */}
      <section className="space-y-5">
        <div className="text-center space-y-1">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            End-to-End Decision Support Workflow
          </h2>
          <p className="text-xs text-slate-500 max-w-xl mx-auto">
            From citizen camera upload to verified municipal asphalt restoration in Kakinada.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {[
            { step: '01', title: 'Image / Video', desc: 'Citizen photo or dashcam survey video', icon: Camera, color: 'text-blue-600' },
            { step: '02', title: 'AI Detection', desc: 'Classification & bounding box localization', icon: Cpu, color: 'text-emerald-600' },
            { step: '03', title: 'Severity Analysis', desc: 'Pavement depth & structural fatigue rating', icon: AlertTriangle, color: 'text-amber-600' },
            { step: '04', title: 'GPS Location', desc: 'Kakinada GIS coordinates & duplicate check', icon: MapPin, color: 'text-indigo-600' },
            { step: '05', title: 'Priority Score', desc: '0–100 RoadGuard dispatch index', icon: TrendingUp, color: 'text-orange-600' },
            { step: '06', title: 'Engineer Action', desc: 'Status update & Before/After verification', icon: CheckCircle2, color: 'text-teal-600' },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-300 shadow-xs transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold text-slate-400 group-hover:text-slate-600">
                      {item.step}
                    </span>
                    <Icon className={`w-4 h-4 ${item.color}`} />
                  </div>
                  <h3 className="text-xs font-semibold text-slate-900 mb-0.5">{item.title}</h3>
                  <p className="text-[11px] text-slate-500 leading-snug">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Supported Damage Classification Categories */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Supported Road Damage Taxonomy
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Extensible classification schema recognizing 7 distinct pavement distress categories.
            </p>
          </div>
          <button
            onClick={onStartDetection}
            className="self-start sm:self-auto text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1.5 cursor-pointer"
          >
            Launch Detection Studio <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {DAMAGE_CLASSES.map((dmg, idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-4 flex flex-col justify-between shadow-xs transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base">{dmg.icon}</span>
                    <h3 className="text-xs font-bold text-slate-900">{dmg.name}</h3>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 ${dmg.iconColor}`}>
                    {dmg.severity}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">{dmg.desc}</p>
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                <span>Class #{idx + 1}</span>
                <span className="text-emerald-600 font-medium">Decision-Support</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Decision-Support Project Disclaimer Banner */}
      <section className="rounded-2xl bg-gradient-to-r from-slate-50 via-white to-slate-50 border border-slate-200 p-6 flex flex-col md:flex-row items-center gap-5 shadow-xs">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0 text-emerald-600">
          <Shield className="w-6 h-6" />
        </div>
        <div className="space-y-1 text-center md:text-left flex-1">
          <h3 className="text-sm font-bold text-slate-900 flex items-center justify-center md:justify-start gap-2">
            <span>Student AI Decision-Support Platform</span>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
              Human In The Loop
            </span>
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            RoadGuard AI is developed as an intelligent road monitoring and maintenance prioritization platform for municipal decision-support. Pavement severity scores, priority ratings, and suggested actions are algorithmic indicators and do not replace certified physical audits by Roads &amp; Buildings / PWD engineers.
          </p>
        </div>
      </section>
    </div>
  );
};
