import React, { useRef } from 'react';
import { Upload, Eye, Cpu, RefreshCw, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { DamageType, BoundingBox } from '../../types';

export interface IndianSamplePreset {
  id: string;
  name: string;
  damageType: DamageType;
  imageUrl: string;
  roadName: string;
  city: string;
  district: string;
  state: string;
  lat: number;
  lng: number;
}

export const INDIAN_SAMPLE_PRESETS: IndianSamplePreset[] = [
  {
    id: 'in_1',
    name: 'Main Road, Kakinada (Pothole)',
    damageType: 'Pothole',
    imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=1000&q=80',
    roadName: 'Main Road, Kakinada',
    city: 'Kakinada',
    district: 'Kakinada District',
    state: 'Andhra Pradesh',
    lat: 16.9891,
    lng: 82.2475,
  },
  {
    id: 'in_2',
    name: 'College Road, Kakinada (Alligator Crack)',
    damageType: 'Alligator Crack',
    imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1000&q=80',
    roadName: 'College Road, Kakinada',
    city: 'Kakinada',
    district: 'Kakinada District',
    state: 'Andhra Pradesh',
    lat: 16.9935,
    lng: 82.2410,
  },
  {
    id: 'in_3',
    name: 'NH-216 Corridor (Damaged Road Edge)',
    damageType: 'Damaged Road Edge',
    imageUrl: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=1000&q=80',
    roadName: 'NH-216 Corridor',
    city: 'Kakinada',
    district: 'Kakinada District',
    state: 'Andhra Pradesh',
    lat: 16.9740,
    lng: 82.2280,
  },
  {
    id: 'in_4',
    name: 'Market Road, Kakinada (Longitudinal Crack)',
    damageType: 'Longitudinal Crack',
    imageUrl: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=1000&q=80',
    roadName: 'Market Road, Kakinada',
    city: 'Kakinada',
    district: 'Main Bazaar',
    state: 'Andhra Pradesh',
    lat: 16.9950,
    lng: 82.2380,
  },
  {
    id: 'in_5',
    name: 'Residential Road, Kakinada (Transverse Crack)',
    damageType: 'Transverse Crack',
    imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1000&q=80',
    roadName: 'Residential Road, Kakinada',
    city: 'Kakinada',
    district: 'Suryanarayana Puram',
    state: 'Andhra Pradesh',
    lat: 16.9820,
    lng: 82.2530,
  },
];

interface ImageUploaderProps {
  selectedImage: string;
  onSelectImage: (imageUrl: string, preset?: IndianSamplePreset) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  boundingBoxes: BoundingBox[];
  showBoundingBoxes: boolean;
  onToggleBoundingBoxes: () => void;
  hasAnalyzed: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  selectedImage,
  onSelectImage,
  onAnalyze,
  isAnalyzing,
  boundingBoxes,
  showBoundingBoxes,
  onToggleBoundingBoxes,
  hasAnalyzed,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileError, setFileError] = React.useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError('');
    const file = e.target.files?.[0];
    if (!file) return;

    // Allowed types: JPEG, PNG, WebP
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setFileError('Invalid file format. Please upload a JPEG, PNG, or WebP image.');
      return;
    }

    // Max 25 MB
    const maxSize = 25 * 1024 * 1024;
    if (file.size > maxSize) {
      setFileError('Image exceeds the maximum allowed size of 25 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        onSelectImage(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      {/* Sample Demo Presets (Clearly marked as DEMO DATA) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Select Demo Roadway Scenario
          </label>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
            DEMO DATA (Kakinada, AP)
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {INDIAN_SAMPLE_PRESETS.map((preset) => {
            const isSelected = selectedImage === preset.imageUrl;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => onSelectImage(preset.imageUrl, preset)}
                className={`text-left p-2.5 rounded-xl border text-xs transition-all flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-semibold shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-800'
                }`}
              >
                <span className="font-bold truncate text-[11px] text-slate-900">{preset.name}</span>
                <span className="text-[10px] text-slate-500 truncate mt-1">
                  {preset.city}, {preset.state}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Upload Drag & Drop Box */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
          <span>Or Upload Your Own Road Image</span>
          <span className="text-[10px] text-slate-500">Max: 25 MB</span>
        </label>

        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-white hover:bg-slate-50 group shadow-xs"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/jpeg, image/png, image/webp"
            className="hidden"
          />

          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mx-auto text-slate-500 group-hover:text-emerald-600 transition-colors mb-2">
            <Upload className="w-5 h-5" />
          </div>

          <p className="text-xs font-semibold text-slate-800">
            Click to upload road photo (JPEG, PNG, WebP)
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Maximum file size: 25 MB
          </p>
        </div>

        {fileError && (
          <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{fileError}</span>
          </div>
        )}
      </div>

      {/* Image Preview & Bounding Box Canvas Viewport */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs relative">
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-emerald-600" />
            <span className="font-bold text-slate-800">Road Image Preview</span>
            {hasAnalyzed && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-semibold">
                Inference Complete
              </span>
            )}
          </div>

          {hasAnalyzed && boundingBoxes.length > 0 && (
            <button
              type="button"
              onClick={onToggleBoundingBoxes}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium border border-slate-300 shadow-xs transition-colors cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-emerald-600" />
              <span>{showBoundingBoxes ? 'Hide Bounding Box' : 'Show Bounding Box'}</span>
            </button>
          )}
        </div>

        {/* Viewport with CSS Bounding Box Overlay */}
        <div className="relative aspect-video w-full bg-slate-100 flex items-center justify-center overflow-hidden">
          <img
            src={selectedImage}
            alt="Road pavement viewport"
            className="w-full h-full object-cover select-none"
          />

          {/* Clean Bounding Box Visualization */}
          {hasAnalyzed && showBoundingBoxes && (
            <div className="absolute inset-0 pointer-events-none">
              {boundingBoxes.map((box) => (
                <div
                  key={box.id}
                  style={{
                    left: `${box.x1}%`,
                    top: `${box.y1}%`,
                    width: `${box.x2 - box.x1}%`,
                    height: `${box.y2 - box.y1}%`,
                  }}
                  className="absolute border-2 border-rose-500 bg-rose-500/20 rounded shadow-[0_0_20px_rgba(244,63,94,0.45)] animate-in fade-in zoom-in-95 duration-200"
                >
                  <div className="absolute -top-6 left-0 flex items-center gap-1.5 bg-rose-600 text-white text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded shadow">
                    <span>{box.label}</span>
                    <span className="opacity-90">{box.confidence}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Loading Animation: "Analyzing road image..." */}
          {isAnalyzing && (
            <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center space-y-3 z-30 animate-in fade-in duration-150">
              <div className="relative">
                <div className="w-14 h-14 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin" />
                <Cpu className="w-6 h-6 text-emerald-400 absolute inset-0 m-auto animate-pulse" />
              </div>
              <div>
                <p className="text-sm font-bold text-white tracking-wide">
                  Analyzing road image...
                </p>
                <p className="text-[11px] text-slate-200 mt-1">
                  Scanning surface geometry, detecting cavity voids, and classifying pavement distress...
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Large Professional Action Button: [ Analyze Road ] */}
      <div>
        <button
          type="button"
          disabled={isAnalyzing}
          onClick={onAnalyze}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-sm uppercase tracking-wider shadow-xl shadow-emerald-500/25 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2.5"
        >
          {isAnalyzing ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Analyzing road image...</span>
            </>
          ) : (
            <>
              <Cpu className="w-5 h-5" />
              <span>ANALYZE ROAD</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
