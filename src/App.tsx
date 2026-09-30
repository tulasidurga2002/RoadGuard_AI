/**
 * RoadGuard AI – Intelligent Road Damage Detection & Maintenance Prioritization Platform
 * Tagline: "Detect. Analyze. Map. Prioritize."
 */
import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { DetectionStudio } from './components/DetectionStudio';
import { InteractiveMap } from './components/InteractiveMap';
import { ReportsTable } from './components/ReportsTable';
import { MaintenanceWorkflow } from './components/MaintenanceWorkflow';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { AIReportModal } from './components/AIReportModal';
import { SmartAlertsDrawer } from './components/SmartAlertsDrawer';
import { LoginModal } from './components/LoginModal';
import { LoginPage } from './components/auth/LoginPage';
import { SignupPage } from './components/auth/SignupPage';
import { StorageService } from './services/storageService';
import { RoadReport, RoadHealthMetrics } from './types';
import { Shield, Sparkles, AlertOctagon } from 'lucide-react';

function AppContent() {
  const { currentUser } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [reports, setReports] = useState<RoadReport[]>(() => StorageService.getReports());
  const [selectedReportForAi, setSelectedReportForAi] = useState<RoadReport | null>(null);
  const [isAlertsOpen, setIsAlertsOpen] = useState<boolean>(false);
  const [isLoginOpen, setIsLoginOpen] = useState<boolean>(false);
  const [mapFilter, setMapFilter] = useState<{ type: string; value: string } | null>(null);
  const [mapTargetReportId, setMapTargetReportId] = useState<string | null>(null);

  // If user is not authenticated, protect all application views and show Login or Signup
  if (!currentUser) {
    if (authMode === 'signup') {
      return <SignupPage onBackToLogin={() => setAuthMode('login')} />;
    }
    return <LoginPage onSwitchToSignup={() => setAuthMode('signup')} />;
  }

  // Compute live metrics
  const roadHealthMetrics: RoadHealthMetrics = StorageService.calculateRoadHealthMetrics(reports);
  const criticalCount = reports.filter(
    (r) => (r.severity === 'Critical' || r.priorityScore >= 80) && r.status !== 'Resolved'
  ).length;

  const handleReportSaved = (newReport: RoadReport) => {
    const updated = StorageService.addReport(newReport);
    setReports(updated);
    setMapTargetReportId(newReport.id);
    setMapFilter(null);
  };

  const handleViewOnMap = (report: RoadReport) => {
    setMapTargetReportId(report.id);
    setMapFilter(null);
    setActiveTab('map');
  };

  const handleFilterMap = (filterType: string, filterValue: string) => {
    setMapFilter({ type: filterType, value: filterValue });
    setMapTargetReportId(null);
    setActiveTab('map');
  };

  const handleUpdateReport = (id: string, updates: Partial<RoadReport>) => {
    const updated = StorageService.updateReport(id, updates);
    setReports(updated);
  };

  const handleSelectReport = (report: RoadReport) => {
    setSelectedReportForAi(report);
  };

  const handleNavigateToMaintenance = (report: RoadReport) => {
    setActiveTab('maintenance');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        criticalCount={criticalCount}
        onOpenAlerts={() => setIsAlertsOpen(true)}
        onOpenLogin={() => setIsLoginOpen(true)}
      />

      {/* Main App Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Urgent Critical Safety Alert Banner (if critical count > 0) */}
        {criticalCount > 0 && activeTab === 'dashboard' && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-between gap-4 animate-in fade-in duration-300 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="flex h-3 w-3 rounded-full bg-rose-500 animate-ping shrink-0" />
              <div>
                <span className="font-bold text-rose-800 text-xs uppercase tracking-wide">
                  Critical Safety Alert ({criticalCount} Urgent Road Hazard{criticalCount > 1 ? 's' : ''})
                </span>
                <p className="text-xs text-rose-700 mt-0.5">
                  Structural base failures or deep tire-damaging potholes detected. Municipal inspection required within 24 hours.
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsAlertsOpen(true)}
              className="shrink-0 px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow transition-colors cursor-pointer"
            >
              View Urgent Alerts &rarr;
            </button>
          </div>
        )}

        {/* Tab Content Views */}
        {activeTab === 'dashboard' && (
          <LandingPage
            onStartDetection={() => setActiveTab('detect')}
            onExploreMap={() => {
              setMapFilter(null);
              setMapTargetReportId(null);
              setActiveTab('map');
            }}
            onViewReports={() => setActiveTab('reports')}
            onNavigateToMaintenance={() => setActiveTab('maintenance')}
            onFilterMap={handleFilterMap}
            reports={reports}
            roadHealthScore={roadHealthMetrics.overallScore}
          />
        )}

        {activeTab === 'detect' && (
          <DetectionStudio
            onReportSaved={handleReportSaved}
            existingReports={reports}
            onOpenDetailedReportModal={(report) => setSelectedReportForAi(report)}
            onViewOnMap={handleViewOnMap}
          />
        )}

        {activeTab === 'map' && (
          <InteractiveMap
            reports={reports}
            onSelectReport={(report) => {
              setSelectedReportForAi(report);
            }}
            onUpdateReport={handleUpdateReport}
            onOpenAiReport={(report) => setSelectedReportForAi(report)}
            onNavigateToDetect={() => setActiveTab('detect')}
            onNavigateToReports={() => setActiveTab('reports')}
            targetReportId={mapTargetReportId}
            initialFilter={mapFilter}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsTable
            reports={reports}
            onSelectReport={(report) => setSelectedReportForAi(report)}
            onOpenAiReport={(report) => setSelectedReportForAi(report)}
            onNavigateToMaintenance={handleNavigateToMaintenance}
            onViewOnMap={handleViewOnMap}
          />
        )}

        {activeTab === 'maintenance' && (
          <MaintenanceWorkflow
            reports={reports}
            onUpdateReport={handleUpdateReport}
            onOpenAiReport={(report) => setSelectedReportForAi(report)}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsDashboard
            reports={reports}
            metrics={roadHealthMetrics}
          />
        )}
      </main>

      {/* Global AI Official Report Modal */}
      <AIReportModal
        report={selectedReportForAi}
        onClose={() => setSelectedReportForAi(null)}
      />

      {/* Smart Alerts Drawer */}
      <SmartAlertsDrawer
        isOpen={isAlertsOpen}
        onClose={() => setIsAlertsOpen(false)}
        reports={reports}
        onSelectReport={(report) => {
          setSelectedReportForAi(report);
        }}
      />

      {/* Login & Demo Profile Switcher */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
      />

      {/* Global Municipal Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">ROADGUARD AI</span>
            <span className="text-slate-300">&bull;</span>
            <span className="text-slate-600">Detect. Analyze. Map. Prioritize.</span>
          </div>

          <div className="text-[11px] text-slate-500">
            Intelligent Road Damage Detection &amp; Maintenance Prioritization Platform
          </div>

          <div className="text-[10px] text-slate-400">
            Decision-Support Architecture &bull; Certified Engineer Review Enforced
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
