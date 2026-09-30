import { SeverityLevel, PriorityBreakdown } from '../types';

export interface PriorityInput {
  severityLevel: SeverityLevel;
  severityScore: number;
  trafficLevel: 'Low' | 'Moderate' | 'High' | 'Heavy Arterial';
  reportCount: number;
  estimatedAreaSqM?: number;
  isSchoolOrHospitalZone?: boolean;
}

/**
 * RoadGuard Maintenance Priority Engine
 * Computes a weighted 0-100 score to rank municipal maintenance dispatch urgency.
 * Formula: (SeverityScore * 0.40) + (TrafficScore * 0.25) + (ProximityReportWeight * 0.20) + (DamageExtentWeight * 0.15)
 *
 * DISCLAIMER:
 * RoadGuard-generated priority indicator. Not an official statutory engineering standard.
 */
export function calculatePriorityScore(input: PriorityInput): PriorityBreakdown {
  const { severityScore, trafficLevel, reportCount, estimatedAreaSqM = 0.5, isSchoolOrHospitalZone = false } = input;

  // 1. Severity component (40% weight) -> max 40
  const severityComponent = (severityScore / 100) * 40;

  // 2. Traffic corridor importance (25% weight) -> max 25
  let trafficRaw = 30;
  if (trafficLevel === 'Heavy Arterial') trafficRaw = 100;
  else if (trafficLevel === 'High') trafficRaw = 80;
  else if (trafficLevel === 'Moderate') trafficRaw = 55;
  else trafficRaw = 30;

  if (isSchoolOrHospitalZone) {
    trafficRaw = Math.min(trafficRaw + 20, 100);
  }
  const trafficComponent = (trafficRaw / 100) * 25;

  // 3. Repeated Citizen Reports Escalation (20% weight) -> max 20
  // More citizens reporting the same pothole/crack raises administrative urgency
  const reportFactor = Math.min(reportCount, 10);
  const repetitionScoreRaw = Math.min(20 + (reportFactor - 1) * 12, 100);
  const repetitionComponent = (repetitionScoreRaw / 100) * 20;

  // 4. Physical Damage Extent (15% weight) -> max 15
  let extentRaw = 30;
  if (estimatedAreaSqM >= 2.0) extentRaw = 100;
  else if (estimatedAreaSqM >= 1.0) extentRaw = 80;
  else if (estimatedAreaSqM >= 0.5) extentRaw = 60;
  else extentRaw = 35;
  const extentComponent = (extentRaw / 100) * 15;

  const totalScore = Math.min(
    Math.max(
      Math.round(severityComponent + trafficComponent + repetitionComponent + extentComponent),
      5
    ),
    100
  );

  let priorityBand: 'Low' | 'Medium' | 'High' | 'Critical' = 'Low';
  if (totalScore >= 81) {
    priorityBand = 'Critical';
  } else if (totalScore >= 61) {
    priorityBand = 'High';
  } else if (totalScore >= 31) {
    priorityBand = 'Medium';
  } else {
    priorityBand = 'Low';
  }

  return {
    severityScore: Math.round(severityComponent),
    trafficScore: Math.round(trafficComponent),
    repetitionScore: Math.round(repetitionComponent),
    extentScore: Math.round(extentComponent),
    totalScore,
    priorityBand,
  };
}

export function getPriorityActionLabel(band: 'Low' | 'Medium' | 'High' | 'Critical'): string {
  switch (band) {
    case 'Critical':
      return 'Immediate Emergency Maintenance Required — Inspect within 24 hours';
    case 'High':
      return 'High maintenance priority — inspection and scheduling recommended';
    case 'Medium':
      return 'Moderate priority — schedule in standard weekly maintenance queue';
    case 'Low':
      return 'Low priority — monitor during routine cyclical corridor survey';
  }
}
