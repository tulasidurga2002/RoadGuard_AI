import React, { useState } from 'react';
import { Camera, Video, Sparkles, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { DamageType, SeverityLevel, RoadReport, BoundingBox } from '../types';
import { DetectionService, DetectionServiceResult } from '../services/detectionService';
import { GeminiService } from '../services/geminiService';
import { ImageUploader, INDIAN_SAMPLE_PRESETS, IndianSamplePreset } from './detect/ImageUploader';
import { VideoUploader } from './detect/VideoUploader';
import { LocationPanel, LocationData } from './detect/LocationPanel';
import { ReportCard } from './detect/ReportCard';
import { AIExplanation } from './detect/AIExplanation';
import { useAuth } from '../context/AuthContext';

interface DetectionStudioProps {
  onReportSaved: (newReport: RoadReport) => void;
  existingReports: RoadReport[];
  onOpenDetailedReportModal?: (report: RoadReport) => void;
  onViewOnMap?: (report: RoadReport) => void;
}

export const DetectionStudio: React.FC<DetectionStudioProps> = ({
  onReportSaved,
  existingReports,
  onOpenDetailedReportModal,
  onViewOnMap,
}) => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'image' | 'video'>('image');

  // Selected Image & Presets
  const defaultPreset = INDIAN_SAMPLE_PRESETS[0];
  const [selectedImage, setSelectedImage] = useState<string>(defaultPreset.imageUrl);
  const [selectedPreset, setSelectedPreset] = useState<IndianSamplePreset | undefined>(defaultPreset);

  // Location & Context state
  const [location, setLocation] = useState<LocationData>({
    roadName: defaultPreset.roadName,
    city: defaultPreset.city,
    district: defaultPreset.district,
    state: defaultPreset.state,
    latitude: defaultPreset.lat,
    longitude: defaultPreset.lng,
  });

  // Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [detectionResult, setDetectionResult] = useState<DetectionServiceResult | null>(null);
  const [showBoundingBoxes, setShowBoundingBoxes] = useState<boolean>(true);
  const [aiExplanationText, setAiExplanationText] = useState<string>('');
  const [isReportSaved, setIsReportSaved] = useState<boolean>(false);
  const [lastSavedReport, setLastSavedReport] = useState<RoadReport | null>(null);

  // Image selection handler
  const handleSelectImage = (imageUrl: string, preset?: IndianSamplePreset) => {
    setSelectedImage(imageUrl);
    setSelectedPreset(preset);
    setDetectionResult(null);
    setIsReportSaved(false);

    if (preset) {
      setLocation({
        roadName: preset.roadName,
        city: preset.city,
        district: preset.district,
        state: preset.state,
        latitude: preset.lat,
        longitude: preset.lng,
      });
    }
  };

  // Run AI Road Damage Analysis
  const handleAnalyzeRoad = async () => {
    setIsAnalyzing(true);
    setIsReportSaved(false);

    try {
      // 1. Run DetectionService
      const result = await DetectionService.analyzeImage(selectedImage, {
        presetHint: selectedPreset?.damageType,
        trafficLevel: 'Heavy Arterial',
      });

      setDetectionResult(result);

      // 2. Synthesize natural language explanation via Gemini server endpoint
      const geminiRes = await GeminiService.explainDamage({
        damageType: result.damageType,
        confidence: result.confidence,
        severity: result.severity,
        priorityScore: result.priorityScore,
        roadName: `${location.roadName}, ${location.city}`,
        context: `${location.city}, ${location.state} road network`,
      });

      setAiExplanationText(
        geminiRes?.explanation ||
          `RoadGuard detected a ${result.damageType.toLowerCase()} with ${result.confidence}% confidence. Based on the configured RoadGuard scoring factors, the issue is classified as ${result.severity.toLowerCase()} severity (${result.priorityScore}/100 priority) and should be inspected.`
      );
    } catch (err) {
      console.error('Error during road analysis:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Save Road Damage Report Handler
  const handleSaveReport = () => {
    if (!detectionResult) return;

    const newReport: RoadReport = {
      id: `RG-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      userId: currentUser?.id || 'usr_citizen',
      userName: currentUser?.name || 'Citizen Reporter',
      userRole: currentUser?.role || 'citizen',
      imageUrl: selectedImage,
      latitude: location.latitude,
      longitude: location.longitude,
      roadName: location.roadName || 'Main Road, Kakinada',
      city: location.city || 'Kakinada',
      district: location.district || 'Kakinada District',
      state: location.state || 'Andhra Pradesh',
      trafficLevel: 'Heavy Arterial',
      damageType: detectionResult.damageType,
      confidence: detectionResult.confidence,
      severity: detectionResult.severity,
      priorityScore: detectionResult.priorityScore,
      boundingBoxes: detectionResult.boundingBoxes,
      status: 'Under Review', // Initial status per requirement
      reportCount: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      aiExplanation: aiExplanationText,
      suggestedAction: 'Schedule field inspection and preventative patching.',
      urgency: detectionResult.severity === 'Critical' ? 'Immediate' : 'Elevated',
    };

    onReportSaved(newReport);
    setLastSavedReport(newReport);
    setIsReportSaved(true);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Studio Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Detect Road Damage
            </h1>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
              RoadGuard AI
            </span>
          </div>

          {/* Exact description requested by user */}
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
            Upload a road photo or video. RoadGuard AI detects road damage, estimates severity, calculates a maintenance priority score, and generates a clear report.
          </p>

          <p className="text-[11px] text-slate-500 mt-1">
            * Student AI road-damage monitoring project &bull; RoadGuard-generated decision-support scores &bull; Certified human review enforced
          </p>
        </div>

        {/* Tab Controls: [ Image Analysis ] and [ Video Dashcam Survey ] */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 border border-slate-200 rounded-xl self-start md:self-auto shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('image')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'image'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-300'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Camera className="w-3.5 h-3.5 text-emerald-600" />
            <span>Image Analysis</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('video')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'video'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-300'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Video className="w-3.5 h-3.5 text-teal-600" />
            <span>Video Dashcam Survey</span>
          </button>
        </div>
      </div>

      {activeTab === 'image' ? (
        <div className="space-y-8">
          {/* Main 2-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Image Uploader & Preview (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              <ImageUploader
                selectedImage={selectedImage}
                onSelectImage={handleSelectImage}
                onAnalyze={handleAnalyzeRoad}
                isAnalyzing={isAnalyzing}
                boundingBoxes={detectionResult?.boundingBoxes || []}
                showBoundingBoxes={showBoundingBoxes}
                onToggleBoundingBoxes={() => setShowBoundingBoxes(!showBoundingBoxes)}
                hasAnalyzed={!!detectionResult}
              />
            </div>

            {/* Right Column: Location Panel & Context (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <LocationPanel
                location={location}
                onChange={setLocation}
              />

              <div className="bg-white border border-slate-200 rounded-2xl p-4 text-xs text-slate-600 space-y-2 shadow-xs">
                <span className="font-bold text-slate-900 block uppercase tracking-wider text-[11px]">
                  Supported Pavement Distresses
                </span>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  The prototype architecture recognizes 7 key categories: 🕳️ Potholes, 〰️ Longitudinal Cracks, ➖ Transverse Cracks, 🕸️ Alligator Cracks, ⚠️ Damaged Surface, 📐 Damaged Edges, and 🛣️ Faded Markings.
                </p>
              </div>
            </div>
          </div>

          {/* RESULT SECTION (appears after analysis) */}
          {detectionResult && (
            <div className="space-y-6 pt-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
              {/* 1. Large Result Card */}
              <ReportCard
                damageType={detectionResult.damageType}
                confidence={detectionResult.confidence}
                severity={detectionResult.severity}
                priorityScore={detectionResult.priorityScore}
                locationText={`${location.roadName}, ${location.city}, ${location.state}`}
                status={detectionResult.status}
                severityExplanation={detectionResult.severityExplanation}
                onSaveReport={handleSaveReport}
                onViewOnMap={
                  lastSavedReport && onViewOnMap
                    ? () => onViewOnMap(lastSavedReport)
                    : undefined
                }
                isSaved={isReportSaved}
              />

              {/* 2. AI Explanation Card */}
              <AIExplanation
                damageType={detectionResult.damageType}
                confidence={detectionResult.confidence}
                severity={detectionResult.severity}
                priorityScore={detectionResult.priorityScore}
                roadName={`${location.roadName}, ${location.city}`}
                explanationText={aiExplanationText}
                onOpenDetailedReport={
                  lastSavedReport && onOpenDetailedReportModal
                    ? () => onOpenDetailedReportModal(lastSavedReport)
                    : undefined
                }
              />
            </div>
          )}
        </div>
      ) : (
        /* Video Dashcam Survey Tab */
        <VideoUploader />
      )}
    </div>
  );
};
