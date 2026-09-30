import { DamageType, SeverityLevel, BoundingBox } from '../types';

export interface DetectionServiceResult {
  damageType: DamageType;
  confidence: number;
  severity: SeverityLevel;
  priorityScore: number;
  boundingBoxes: BoundingBox[];
  severityExplanation: string;
  priorityExplanation: string;
  isDemoData: boolean;
  status: 'Under Review';
}

export interface AnalyzeImageOptions {
  trafficLevel?: 'Low' | 'Moderate' | 'High' | 'Heavy Arterial';
  presetHint?: DamageType;
  reportCount?: number;
}

/**
 * RoadGuard AI Detection Service
 *
 * PROTOTYPE ARCHITECTURE NOTICE:
 * This service provides a clean AI-service abstraction for road damage detection.
 * Currently, it uses realistic mock/demo detection data so the prototype can be demonstrated.
 * It is structured so that a real YOLO inference API (e.g. YOLOv8/YOLOv11 model server)
 * can be plugged in directly later without changing frontend consumers.
 *
 * (Do not claim this demo result is produced by a trained model in this prototype state).
 */
export class DetectionService {
  public static readonly IS_MOCK = true;
  public static readonly MODEL_NAME = 'RoadGuard YOLO Detection API (Prototype Demo Service)';

  /**
   * Conceptual interface:
   * analyzeImage(image) -> damageType, confidence, severity, priorityScore, boundingBoxes
   */
  public static async analyzeImage(
    imageUrlOrBase64: string,
    options?: AnalyzeImageOptions
  ): Promise<DetectionServiceResult> {
    // Simulate network inference latency
    await new Promise((resolve) => setTimeout(resolve, 950));

    const damageType: DamageType = options?.presetHint || this.detectDamageTypeFromImage(imageUrlOrBase64);

    let confidence = 94;
    let severity: SeverityLevel = 'High';
    let priorityScore = 87;
    let boundingBoxes: BoundingBox[] = [];

    switch (damageType) {
      case 'Pothole':
        confidence = 94;
        severity = 'High';
        priorityScore = 87;
        boundingBoxes = [
          {
            id: 'box_pothole_1',
            label: 'Pothole',
            confidence: 94,
            x1: 28,
            y1: 46,
            x2: 74,
            y2: 84,
            estimatedAreaSqM: 0.85,
            estimatedDepthCm: 7.0,
          },
        ];
        break;

      case 'Alligator Crack':
        confidence = 91;
        severity = 'Critical';
        priorityScore = 92;
        boundingBoxes = [
          {
            id: 'box_alligator_1',
            label: 'Alligator Crack',
            confidence: 91,
            x1: 18,
            y1: 34,
            x2: 82,
            y2: 88,
            estimatedAreaSqM: 2.3,
            estimatedDepthCm: 3.8,
          },
        ];
        break;

      case 'Longitudinal Crack':
        confidence = 88;
        severity = 'Medium';
        priorityScore = 52;
        boundingBoxes = [
          {
            id: 'box_long_1',
            label: 'Longitudinal Crack',
            confidence: 88,
            x1: 42,
            y1: 24,
            x2: 58,
            y2: 86,
            estimatedAreaSqM: 0.45,
            estimatedDepthCm: 2.0,
          },
        ];
        break;

      case 'Transverse Crack':
        confidence = 89;
        severity = 'Low';
        priorityScore = 32;
        boundingBoxes = [
          {
            id: 'box_trans_1',
            label: 'Transverse Crack',
            confidence: 89,
            x1: 16,
            y1: 52,
            x2: 86,
            y2: 66,
            estimatedAreaSqM: 0.5,
            estimatedDepthCm: 1.8,
          },
        ];
        break;

      case 'Damaged Road Surface':
        confidence = 87;
        severity = 'Medium';
        priorityScore = 58;
        boundingBoxes = [
          {
            id: 'box_surface_1',
            label: 'Damaged Road Surface',
            confidence: 87,
            x1: 22,
            y1: 42,
            x2: 78,
            y2: 78,
            estimatedAreaSqM: 1.7,
            estimatedDepthCm: 2.5,
          },
        ];
        break;

      case 'Damaged Road Edge':
      case 'Damaged Road Edges':
        confidence = 92;
        severity = 'High';
        priorityScore = 79;
        boundingBoxes = [
          {
            id: 'box_edge_1',
            label: 'Damaged Road Edge',
            confidence: 92,
            x1: 68,
            y1: 30,
            x2: 96,
            y2: 92,
            estimatedAreaSqM: 1.4,
            estimatedDepthCm: 8.0,
          },
        ];
        break;

      case 'Faded Lane Marking':
      case 'Faded Lane Markings':
        confidence = 86;
        severity = 'Low';
        priorityScore = 26;
        boundingBoxes = [
          {
            id: 'box_lane_1',
            label: 'Faded Lane Marking',
            confidence: 86,
            x1: 44,
            y1: 32,
            x2: 56,
            y2: 86,
            estimatedAreaSqM: 0.7,
            estimatedDepthCm: 0.1,
          },
        ];
        break;
    }

    const severityExplanation = this.getSeverityExplanation(severity);
    const priorityExplanation =
      'Priority is influenced by estimated damage severity, damage characteristics, location/context, and repeated reports. This is a RoadGuard-generated decision-support score.';

    return {
      damageType,
      confidence,
      severity,
      priorityScore,
      boundingBoxes,
      severityExplanation,
      priorityExplanation,
      isDemoData: true,
      status: 'Under Review',
    };
  }

  private static getSeverityExplanation(severity: SeverityLevel): string {
    switch (severity) {
      case 'Critical':
        return 'Severe visible damage detected with critical structural risk. Immediate inspection is recommended based on the RoadGuard risk analysis.';
      case 'High':
        return 'Large visible damage detected. Inspection is recommended based on the RoadGuard risk analysis.';
      case 'Medium':
        return 'Moderate visible wear and cracking detected. Periodic monitoring and preventative patching recommended.';
      case 'Low':
        return 'Minor surface distress detected. Low immediate impact on vehicle safety, monitor in routine maintenance.';
    }
  }

  private static detectDamageTypeFromImage(url: string): DamageType {
    const lower = url.toLowerCase();
    if (lower.includes('alligator') || lower.includes('fatigue')) return 'Alligator Crack';
    if (lower.includes('edge') || lower.includes('shoulder')) return 'Damaged Road Edge';
    if (lower.includes('surface') || lower.includes('raveling')) return 'Damaged Road Surface';
    if (lower.includes('lane') || lower.includes('marking')) return 'Faded Lane Marking';
    if (lower.includes('longitudinal')) return 'Longitudinal Crack';
    if (lower.includes('transverse')) return 'Transverse Crack';
    return 'Pothole';
  }
}
