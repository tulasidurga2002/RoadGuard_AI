import React, { useState } from 'react';
import { MapPin, Navigation, Map as MapIcon, Check, X, Building, Compass } from 'lucide-react';
import { MapService } from '../../services/mapService';

export interface LocationData {
  roadName: string;
  city: string;
  district: string;
  state: string;
  latitude: number;
  longitude: number;
}

interface LocationPanelProps {
  location: LocationData;
  onChange: (updated: LocationData) => void;
}

const INDIAN_PRESET_LANDMARKS = [
  {
    name: 'Main Road, Kakinada',
    city: 'Kakinada',
    district: 'Kakinada District',
    state: 'Andhra Pradesh',
    lat: 16.9891,
    lng: 82.2475,
  },
  {
    name: 'College Road, Kakinada',
    city: 'Kakinada',
    district: 'Kakinada District',
    state: 'Andhra Pradesh',
    lat: 16.9935,
    lng: 82.2410,
  },
  {
    name: 'NH-216 Corridor (Kakinada Bypass)',
    city: 'Kakinada',
    district: 'Kakinada District',
    state: 'Andhra Pradesh',
    lat: 16.9740,
    lng: 82.2280,
  },
  {
    name: 'Market Road, Kakinada',
    city: 'Kakinada',
    district: 'Main Bazaar',
    state: 'Andhra Pradesh',
    lat: 16.9950,
    lng: 82.2380,
  },
  {
    name: 'Residential Road, Kakinada (Suryanarayana Puram)',
    city: 'Kakinada',
    district: 'Suryanarayana Puram',
    state: 'Andhra Pradesh',
    lat: 16.9820,
    lng: 82.2530,
  },
];

export const LocationPanel: React.FC<LocationPanelProps> = ({ location, onChange }) => {
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [geoMessage, setGeoMessage] = useState<string>('');
  const [showMapPicker, setShowMapPicker] = useState<boolean>(false);

  const handleUseCurrentLocation = async () => {
    setIsLocating(true);
    setGeoMessage('Requesting GPS permission from browser...');

    try {
      const coords = await MapService.getCurrentLocation();
      onChange({
        ...location,
        latitude: coords.latitude,
        longitude: coords.longitude,
      });
      setGeoMessage(`GPS location acquired: ${coords.latitude}, ${coords.longitude}`);
      setTimeout(() => setGeoMessage(''), 4000);
    } catch (err: any) {
      console.warn('Geolocation error:', err);
      setGeoMessage('Location permission denied or unavailable. Manual entry enabled.');
      setTimeout(() => setGeoMessage(''), 5000);
    } finally {
      setIsLocating(false);
    }
  };

  const handleSelectPreset = (preset: typeof INDIAN_PRESET_LANDMARKS[0]) => {
    onChange({
      roadName: preset.name,
      city: preset.city,
      district: preset.district,
      state: preset.state,
      latitude: preset.lat,
      longitude: preset.lng,
    });
    setShowMapPicker(false);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
          <Navigation className="w-3.5 h-3.5 text-emerald-600" />
          Location &amp; Roadway Context
        </h3>
        <span className="text-[10px] font-mono text-slate-500 font-medium">Indian Regional GIS</span>
      </div>

      {/* Buttons: [ 📍 Use Current Location ] and [ 🗺️ Select on Map ] */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <button
          type="button"
          disabled={isLocating}
          onClick={handleUseCurrentLocation}
          className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-300 shadow-xs transition-colors cursor-pointer"
        >
          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
          <span>{isLocating ? 'Acquiring GPS...' : '📍 Use Current Location'}</span>
        </button>

        <button
          type="button"
          onClick={() => setShowMapPicker(!showMapPicker)}
          className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-300 shadow-xs transition-colors cursor-pointer"
        >
          <MapIcon className="w-3.5 h-3.5 text-teal-600" />
          <span>🗺️ Select on Map</span>
        </button>
      </div>

      {geoMessage && (
        <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 font-medium">
          {geoMessage}
        </div>
      )}

      {/* Modal / Dropdown Preset Map Selector */}
      {showMapPicker && (
        <div className="bg-white border border-emerald-300 rounded-xl p-3 space-y-2 shadow-lg animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-800 border-b border-slate-100 pb-1.5">
            <span>Select Landmark Location (Kakinada / AP)</span>
            <button
              onClick={() => setShowMapPicker(false)}
              className="text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-1 gap-1.5 max-h-48 overflow-y-auto pr-1">
            {INDIAN_PRESET_LANDMARKS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectPreset(p)}
                className="text-left p-2 rounded-lg bg-slate-50 hover:bg-emerald-50/60 border border-slate-200 hover:border-emerald-300 text-xs transition-colors flex items-center justify-between group cursor-pointer"
              >
                <div>
                  <div className="font-semibold text-slate-800 group-hover:text-emerald-700">
                    {p.name}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    Lat: {p.lat} &bull; Lng: {p.lng}
                  </div>
                </div>
                <Compass className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Fields */}
      <div className="space-y-3">
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-slate-600">Street / Road Name</label>
          <input
            type="text"
            value={location.roadName}
            onChange={(e) => onChange({ ...location, roadName: e.target.value })}
            placeholder="e.g. Main Road, Kakinada"
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-600"
          />
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-600">City</label>
            <input
              type="text"
              value={location.city}
              onChange={(e) => onChange({ ...location, city: e.target.value })}
              placeholder="Kakinada"
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-600"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-600">District</label>
            <input
              type="text"
              value={location.district}
              onChange={(e) => onChange({ ...location, district: e.target.value })}
              placeholder="Kakinada District"
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-600"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-600">State</label>
            <input
              type="text"
              value={location.state}
              onChange={(e) => onChange({ ...location, state: e.target.value })}
              placeholder="Andhra Pradesh"
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-600"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-600">Latitude</label>
            <input
              type="number"
              step="0.0001"
              value={location.latitude}
              onChange={(e) => onChange({ ...location, latitude: parseFloat(e.target.value) || 0 })}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-600 font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-600">Longitude</label>
            <input
              type="number"
              step="0.0001"
              value={location.longitude}
              onChange={(e) => onChange({ ...location, longitude: parseFloat(e.target.value) || 0 })}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-600 font-mono"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
