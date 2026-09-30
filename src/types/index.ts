export type DamageType =
  | 'Pothole'
  | 'Longitudinal Crack'
  | 'Transverse Crack'
  | 'Alligator Crack'
  | 'Damaged Road Surface'
  | 'Damaged Road Edge'
  | 'Damaged Road Edges'
  | 'Faded Lane Marking'
  | 'Faded Lane Markings';

export type SeverityLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export type MaintenanceStatus =
  | 'Reported'
  | 'Under Review'
  | 'In Progress'
  | 'Repaired'
  | 'Approved'
  | 'Assigned'
  | 'Resolved';

export type UserRole = 'citizen' | 'engineer' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  badgeNumber?: string;
}

export interface BoundingBox {
  id: string;
  label: DamageType;
  confidence: number;
  x1: number; // percentage 0-100
  y1: number;
  x2: number;
  y2: number;
  estimatedAreaSqM?: number;
  estimatedDepthCm?: number;
}

export interface RoadReport {
  id: string;
  userId: string;
  userName: string;
  reportedBy?: string;
  userRole: UserRole;
  imageUrl: string;
  image?: string; // alias for imageUrl
  videoUrl?: string;
  latitude: number;
  longitude: number;
  roadName: string;
  district: string;
  city: string;
  state?: string;
  description?: string;
  trafficLevel: 'Low' | 'Moderate' | 'High' | 'Heavy Arterial';
  
  // Detection results
  damageType: DamageType;
  confidence: number;
  severity: SeverityLevel;
  priorityScore: number; // 0 - 100
  boundingBoxes: BoundingBox[];
  
  // Status and maintenance
  status: MaintenanceStatus;
  reportCount: number; // Duplicate aggregation
  duplicateReportIds?: string[];
  createdAt: string;
  reportedDate?: string; // formatted or ISO date alias
  updatedAt: string;
  
  // AI Engineering Analysis
  aiExplanation?: string;
  suggestedAction?: string;
  recommendedAction?: string; // alias for suggestedAction
  urgency?: 'Immediate' | 'Elevated' | 'Standard' | 'Monitored';
  
  // Engineer verification & repair
  assignedEngineer?: string;
  maintenanceCrew?: string;
  engineerRemarks?: string;
  repairImageUrl?: string;
  inspectionDate?: string;
  resolvedDate?: string;
}

export interface VideoDetectionPoint {
  timestampSeconds: number;
  timestampFormatted: string;
  frameIndex: number;
  damageType: DamageType;
  confidence: number;
  severity: SeverityLevel;
  previewUrl: string;
  boundingBoxes: BoundingBox[];
}

export interface PriorityBreakdown {
  severityScore: number;
  trafficScore: number;
  repetitionScore: number;
  extentScore: number;
  totalScore: number;
  priorityBand: 'Low' | 'Medium' | 'High' | 'Critical';
}

export interface RoadHealthMetrics {
  overallScore: number;
  totalPotholes: number;
  totalCracks: number;
  totalSurfaceDefects: number;
  criticalIssues: number;
  resolvedLast30Days: number;
  averageResolutionHours: number;
}
