import { SeverityLevel } from '../types';

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  roadName: string;
  city: string;
  district: string;
  state: string;
}

export const KAKINADA_DEFAULT_COORDS: LocationCoordinates = {
  latitude: 16.9891,
  longitude: 82.2475,
  roadName: 'Main Road, Kakinada',
  city: 'Kakinada',
  district: 'Kakinada District',
  state: 'Andhra Pradesh',
};

export class MapService {
  /**
   * Marker color scheme:
   * Low = Green
   * Medium = Yellow
   * High = Orange
   * Critical = Red
   */
  public static getMarkerColor(severity: SeverityLevel): {
    hex: string;
    label: string;
    bgClass: string;
    borderClass: string;
    textClass: string;
  } {
    switch (severity) {
      case 'Critical':
        return {
          hex: '#ef4444',
          label: 'Critical',
          bgClass: 'bg-rose-500',
          borderClass: 'border-rose-400',
          textClass: 'text-rose-400',
        };
      case 'High':
        return {
          hex: '#f97316',
          label: 'High',
          bgClass: 'bg-orange-500',
          borderClass: 'border-orange-400',
          textClass: 'text-orange-400',
        };
      case 'Medium':
        return {
          hex: '#eab308',
          label: 'Medium',
          bgClass: 'bg-yellow-400',
          borderClass: 'border-yellow-300',
          textClass: 'text-yellow-400',
        };
      case 'Low':
        return {
          hex: '#22c55e',
          label: 'Low',
          bgClass: 'bg-emerald-500',
          borderClass: 'border-emerald-400',
          textClass: 'text-emerald-400',
        };
    }
  }

  /**
   * Browser Geolocation Helper with user permission handling
   */
  public static async getCurrentLocation(): Promise<{ latitude: number; longitude: number }> {
    if (!navigator.geolocation) {
      throw new Error('Geolocation is not supported by your browser.');
    }

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: Number(position.coords.latitude.toFixed(5)),
            longitude: Number(position.coords.longitude.toFixed(5)),
          });
        },
        (error) => {
          reject(error);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    });
  }
}
