import React from 'react';
import { SeverityLevel } from '../../types';

interface SeverityBadgeProps {
  level: SeverityLevel;
  showExplanation?: boolean;
  explanation?: string;
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({
  level,
  showExplanation = true,
  explanation,
}) => {
  const getBadgeStyle = (sev: SeverityLevel) => {
    switch (sev) {
      case 'Critical':
        return {
          icon: '🔴',
          bg: 'bg-rose-50',
          border: 'border-rose-200',
          text: 'text-rose-800',
          dot: 'bg-rose-500',
          defaultDesc: 'Critical visible damage with severe structural failure risk. Inspection is strongly recommended based on RoadGuard risk analysis.',
        };
      case 'High':
        return {
          icon: '🟠',
          bg: 'bg-orange-50',
          border: 'border-orange-200',
          text: 'text-orange-800',
          dot: 'bg-orange-500',
          defaultDesc: 'Large visible damage detected. Inspection is recommended based on the RoadGuard risk analysis.',
        };
      case 'Medium':
        return {
          icon: '🟡',
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          text: 'text-yellow-800',
          dot: 'bg-yellow-500',
          defaultDesc: 'Moderate visible damage and surface cracking. Periodic inspection and scheduled preventative repair recommended.',
        };
      case 'Low':
        return {
          icon: '🟢',
          bg: 'bg-emerald-50',
          border: 'border-emerald-200',
          text: 'text-emerald-800',
          dot: 'bg-emerald-500',
          defaultDesc: 'Minor surface irregularity with low current safety impact. Monitor during routine road reviews.',
        };
    }
  };

  const style = getBadgeStyle(level);

  return (
    <div className="space-y-1.5">
      <div
        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border ${style.bg} ${style.border} ${style.text}`}
      >
        <span className="text-xs">{style.icon}</span>
        <span className="tracking-wide uppercase">{level}</span>
      </div>

      {showExplanation && (
        <p className="text-xs text-slate-600 leading-relaxed">
          {explanation || style.defaultDesc}
        </p>
      )}

      <p className="text-[10px] text-slate-500 italic">
        * RoadGuard-generated risk estimate. Not an official statutory engineering standard.
      </p>
    </div>
  );
};
