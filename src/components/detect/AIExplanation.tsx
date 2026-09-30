import React, { useState } from 'react';
import { Sparkles, FileText, CheckCircle2, RefreshCw } from 'lucide-react';
import { DamageType, SeverityLevel } from '../../types';
import { GeminiService } from '../../services/geminiService';

interface AIExplanationProps {
  damageType: DamageType;
  confidence: number;
  severity: SeverityLevel;
  priorityScore: number;
  roadName: string;
  explanationText: string;
  onOpenDetailedReport?: () => void;
}

export const AIExplanation: React.FC<AIExplanationProps> = ({
  damageType,
  confidence,
  severity,
  priorityScore,
  roadName,
  explanationText,
  onOpenDetailedReport,
}) => {
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false);
  const [currentText, setCurrentText] = useState<string>(explanationText);

  // Fallback default message if explanationText is empty
  const displayText =
    currentText ||
    `RoadGuard detected a ${damageType.toLowerCase()} with ${confidence}% confidence on ${roadName}. Based on the configured RoadGuard scoring factors, the issue is classified as ${severity.toLowerCase()} severity (${priorityScore}/100 priority) and should be inspected.`;

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      const res = await GeminiService.explainDamage({
        damageType,
        confidence,
        severity,
        priorityScore,
        roadName,
      });
      if (res?.explanation) {
        setCurrentText(res.explanation);
      }
    } catch (err) {
      console.warn('Regeneration error:', err);
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            AI EXPLANATION
          </h3>
        </div>

        <button
          type="button"
          disabled={isRegenerating}
          onClick={handleRegenerate}
          className="text-[11px] text-slate-500 hover:text-emerald-700 flex items-center gap-1 transition-colors cursor-pointer"
          title="Regenerate explanation using Gemini AI"
        >
          <RefreshCw className={`w-3 h-3 ${isRegenerating ? 'animate-spin' : ''}`} />
          <span>Refresh Analysis</span>
        </button>
      </div>

      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans bg-slate-50 p-4 rounded-xl border border-slate-200">
        &ldquo;{displayText}&rdquo;
      </p>

      {onOpenDetailedReport && (
        <div className="pt-1 flex items-center justify-end">
          <button
            type="button"
            onClick={onOpenDetailedReport}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-emerald-800 border border-emerald-300 text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-600" />
            <span>Generate Detailed Report</span>
          </button>
        </div>
      )}
    </div>
  );
};
