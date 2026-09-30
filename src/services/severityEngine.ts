import { DamageType, SeverityLevel } from '../types';

export interface SeverityFactors {
  damageType: DamageType;
  estimatedAreaSqM?: number;
  estimatedDepthCm?: number;
  confidence: number;
  trafficLevel: 'Low' | 'Moderate' | 'High' | 'Heavy Arterial';
  repeatCount?: number;
}

/**
 * RoadGuard Severity Engine
 * Evaluates damage characteristics, roadway context, and recurring reports
 * Note: Generated algorithmic indicator for municipal decision-support; not an official legal standard.
 */
export function calculateSeverity(factors: SeverityFactors): {
  level: SeverityLevel;
  score: number; // 0 - 100
  rationale: string;
} {
  const { damageType, estimatedAreaSqM = 0.4, estimatedDepthCm = 4, confidence, trafficLevel, repeatCount = 1 } = factors;

  // Base structural weight of damage type (0 - 40)
  let typeWeight = 20;
  switch (damageType) {
    case 'Pothole':
      typeWeight = 38; // High structural hazard for vehicles
      break;
    case 'Alligator Crack':
      typeWeight = 34; // Deep sub-base fatigue failure indicator
      break;
    case 'Damaged Road Edges':
      typeWeight = 28; // Shoulder drop-off safety hazard
      break;
    case 'Damaged Road Surface':
      typeWeight = 25; // Raveling / rutting
      break;
    case 'Transverse Crack':
      typeWeight = 22; // Thermal contraction crack
      break;
    case 'Longitudinal Crack':
      typeWeight = 18; // Joint crack
      break;
    case 'Faded Lane Markings':
      typeWeight = 14; // Navigational hazard, but no immediate vehicle wheel damage
      break;
  }

  // Dimension / Depth factor (0 - 25)
  let dimensionFactor = 10;
  if (estimatedDepthCm >= 7 || estimatedAreaSqM >= 1.5) {
    dimensionFactor = 25;
  } else if (estimatedDepthCm >= 4 || estimatedAreaSqM >= 0.8) {
    dimensionFactor = 18;
  } else if (estimatedDepthCm >= 2 || estimatedAreaSqM >= 0.3) {
    dimensionFactor = 12;
  } else {
    dimensionFactor = 5;
  }

  // Traffic risk factor (0 - 20)
  let trafficFactor = 5;
  switch (trafficLevel) {
    case 'Heavy Arterial':
      trafficFactor = 20;
      break;
    case 'High':
      trafficFactor = 15;
      break;
    case 'Moderate':
      trafficFactor = 10;
      break;
    case 'Low':
      trafficFactor = 5;
      break;
  }

  // Confidence & repeat reports escalation (0 - 15)
  const confidenceFactor = (confidence / 100) * 8;
  const repeatFactor = Math.min((repeatCount - 1) * 3, 7);

  const totalRaw = typeWeight + dimensionFactor + trafficFactor + confidenceFactor + repeatFactor;
  const clampedScore = Math.min(Math.max(Math.round(totalRaw), 10), 100);

  let level: SeverityLevel = 'Low';
  let rationale = 'Minor surface irregularity with low immediate safety impact.';

  if (clampedScore >= 80) {
    level = 'Critical';
    rationale = 'Severe structural hazard with deep cavity or extensive sub-base fatigue posing immediate vehicle collision or tire blowout risks.';
  } else if (clampedScore >= 60) {
    level = 'High';
    rationale = 'Significant road degradation on an active corridor. Water infiltration likely to rapidly exacerbate base layer failure.';
  } else if (clampedScore >= 35) {
    level = 'Medium';
    rationale = 'Moderate deterioration requiring preventative patching before deeper structural detachment occurs.';
  }

  return {
    level,
    score: clampedScore,
    rationale,
  };
}
