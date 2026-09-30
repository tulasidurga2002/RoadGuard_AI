import { RoadReport } from '../types';

/**
 * Calculates Haversine distance between two GPS coordinates in meters
 */
export function calculateGpsDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  matchingReport?: RoadReport;
  distanceMeters?: number;
  reason?: string;
}

/**
 * Checks if a newly submitted report is a duplicate or close cluster of an existing road problem
 */
export function findPotentialDuplicateReport(
  newReport: { latitude: number; longitude: number; damageType: string; roadName?: string },
  existingReports: RoadReport[],
  proximityThresholdMeters: number = 85
): DuplicateCheckResult {
  for (const existing of existingReports) {
    if (existing.status === 'Resolved') continue;

    const distance = calculateGpsDistanceMeters(
      newReport.latitude,
      newReport.longitude,
      existing.latitude,
      existing.longitude
    );

    // If within ~85 meters and same defect category or same named road
    const sameCategory = existing.damageType === newReport.damageType;
    const sameStreet =
      newReport.roadName &&
      existing.roadName &&
      existing.roadName.toLowerCase().includes(newReport.roadName.toLowerCase());

    if (distance <= proximityThresholdMeters && (sameCategory || sameStreet)) {
      return {
        isDuplicate: true,
        matchingReport: existing,
        distanceMeters: Math.round(distance),
        reason: `Existing incident ${existing.id} reported ${Math.round(distance)}m away on ${existing.roadName}. Aggregating citizen complaints increases maintenance priority.`,
      };
    }
  }

  return { isDuplicate: false };
}
