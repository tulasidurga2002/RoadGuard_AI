import React, { useState, useRef } from 'react';
import { Video, Play, Pause, RefreshCw, Upload, Eye, AlertOctagon, CheckCircle2, MapPin } from 'lucide-react';
import { DamageType, SeverityLevel } from '../../types';

interface VideoUploaderProps {
  onAnalyzeComplete?: (summary: any) => void;
}

export const VideoUploader: React.FC<VideoUploaderProps> = ({ onAnalyzeComplete }) => {
  const [videoFileUrl, setVideoFileUrl] = useState<string>(
    'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=1000&q=80'
  );
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [analysisResult, setAnalysisResult] = useState<{
    framesAnalyzed: number;
    damageCount: number;
    damageTypes: DamageType[];
    highestSeverity: SeverityLevel;
    highestPriority: number;
    locations: string[];
    timeline: { time: string; damage: DamageType; conf: number; sev: SeverityLevel; loc: string }[];
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoFileUrl(url);
      setAnalysisResult(null);
    }
  };

  const handleAnalyzeVideo = async () => {
    setIsAnalyzing(true);
    setProgress(0);
    setAnalysisResult(null);

    // Simulate batch frame-by-frame inference loop (structured for future YOLO video backend)
    for (let p = 0; p <= 100; p += 20) {
      await new Promise((r) => setTimeout(r, 220));
      setProgress(p);
    }

    const result = {
      framesAnalyzed: 180,
      damageCount: 3,
      damageTypes: ['Pothole' as DamageType, 'Alligator Crack' as DamageType, 'Damaged Road Edge' as DamageType],
      highestSeverity: 'Critical' as SeverityLevel,
      highestPriority: 91,
      locations: ['NH-216 Corridor (Kakinada Bypass)', 'College Road Junction', 'Main Road Sector 3'],
      timeline: [
        { time: '00:02.1', damage: 'Pothole' as DamageType, conf: 94, sev: 'High' as SeverityLevel, loc: 'NH-216 KM 4' },
        { time: '00:05.6', damage: 'Alligator Crack' as DamageType, conf: 91, sev: 'Critical' as SeverityLevel, loc: 'College Road Junction' },
        { time: '00:08.9', damage: 'Damaged Road Edge' as DamageType, conf: 89, sev: 'Medium' as SeverityLevel, loc: 'Main Road Sector 3' },
      ],
    };

    setAnalysisResult(result);
    setIsAnalyzing(false);
    if (onAnalyzeComplete) {
      onAnalyzeComplete(result);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload & Instructions */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Video className="w-5 h-5 text-emerald-600" />
              Continuous Dashcam Video Survey
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Upload municipal fleet or citizen dashcam video (MP4, WebM, MOV up to 100 MB).
            </p>
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-300 shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
          >
            <Upload className="w-4 h-4 text-emerald-600" />
            <span>Upload Dashcam Video</span>
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="video/mp4, video/webm, video/quicktime"
            className="hidden"
          />
        </div>

        {/* Video Preview */}
        <div className="relative aspect-video rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center">
          <img
            src={videoFileUrl}
            alt="Dashcam survey frame preview"
            className="w-full h-full object-cover"
          />

          <div className="absolute inset-0 bg-slate-900/30 flex items-center justify-center pointer-events-none">
            <div className="w-14 h-14 rounded-full bg-emerald-600/90 text-white flex items-center justify-center shadow-lg">
              <Play className="w-6 h-6 ml-1" />
            </div>
          </div>

          {/* Overlaid Status Bar */}
          <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-slate-900/80 via-slate-900/60 to-transparent flex items-center justify-between text-xs text-slate-100">
            <span className="font-mono text-[11px] bg-slate-900/80 px-2 py-0.5 rounded border border-slate-700 text-slate-200">
              Demo Dashcam Feed: Kakinada Regional Survey
            </span>
            <span className="text-[11px] text-slate-300">MP4 / 30 FPS</span>
          </div>

          {isAnalyzing && (
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-xs flex flex-col items-center justify-center space-y-3 z-20">
              <div className="w-12 h-12 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin" />
              <p className="text-sm font-bold text-white">Analyzing video frames ({progress}%)...</p>
              <p className="text-xs text-slate-300">Running conceptual YOLO frame extraction...</p>
            </div>
          )}
        </div>

        {/* Action Button: [ Analyze Video ] */}
        <button
          type="button"
          disabled={isAnalyzing}
          onClick={handleAnalyzeVideo}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-emerald-600/20 transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          {isAnalyzing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Processing Video Frames...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              <span>ANALYZE VIDEO</span>
            </>
          )}
        </button>
      </div>

      {/* Frame Analysis Results Display */}
      {analysisResult && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-6 shadow-xs animate-in fade-in duration-300">
          <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Video Survey Analysis Result
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
              Mock Inference Adapter
            </span>
          </div>

          {/* Cards for required metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-semibold text-slate-500 block">Frames Analyzed</span>
              <span className="text-lg font-mono font-bold text-slate-900 mt-1 block">
                {analysisResult.framesAnalyzed}
              </span>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-semibold text-slate-500 block">Damage Count</span>
              <span className="text-lg font-mono font-bold text-amber-700 mt-1 block">
                {analysisResult.damageCount}
              </span>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-semibold text-slate-500 block">Damage Types</span>
              <span className="text-xs font-bold text-slate-800 mt-1 block truncate">
                {analysisResult.damageTypes.join(', ')}
              </span>
            </div>

            <div className="bg-rose-50 p-3 rounded-xl border border-rose-200">
              <span className="text-[10px] uppercase font-semibold text-rose-700 block">Highest Severity</span>
              <span className="text-lg font-bold text-rose-700 mt-1 block">
                {analysisResult.highestSeverity}
              </span>
            </div>

            <div className="bg-orange-50 p-3 rounded-xl border border-orange-200">
              <span className="text-[10px] uppercase font-semibold text-orange-700 block">Highest Priority</span>
              <span className="text-lg font-mono font-black text-orange-700 mt-1 block">
                {analysisResult.highestPriority}/100
              </span>
            </div>
          </div>

          {/* Locations Detected Timeline */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
              Survey Locations &amp; Frame Keypoints
            </span>
            <div className="space-y-1.5">
              {analysisResult.timeline.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-white border border-slate-300 text-slate-700 font-semibold">
                      {item.time}
                    </span>
                    <div>
                      <span className="font-bold text-slate-900 block">{item.damage} ({item.conf}%)</span>
                      <span className="text-[10px] text-slate-600 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-emerald-600" />
                        {item.loc}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                    {item.sev}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
