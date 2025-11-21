import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Leak, LeakStatus } from '../types';
import { MAP_CENTER, MAP_ZOOM } from '../constants';
import { Droplet, AlertTriangle, CheckCircle2, Wrench, MapPin } from 'lucide-react';
import ReactDOMServer from 'react-dom/server';

interface LeakMapProps {
  leaks: Leak[];
  selectedLeakId: string | null;
  onLeakSelect: (leak: Leak) => void;
  is3DMode: boolean;
  showHeatmap: boolean;
  isReporting: boolean;
  onMapClick: (lat: number, lng: number) => void;
  tempReportLocation: { lat: number; lng: number } | null;
}

// Helper to create custom SVG icons
const createIcon = (status: LeakStatus) => {
  let color = '';
  let IconComponent = Droplet;

  switch (status) {
    case LeakStatus.ACTIVE:
      color = 'text-red-500 fill-red-100';
      IconComponent = AlertTriangle;
      break;
    case LeakStatus.REPAIRING:
      color = 'text-yellow-500 fill-yellow-100';
      IconComponent = Wrench;
      break;
    case LeakStatus.REPAIRED:
      color = 'text-green-500 fill-green-100';
      IconComponent = CheckCircle2;
      break;
  }

  const html = ReactDOMServer.renderToString(
    <div className={`relative flex items-center justify-center w-10 h-10 bg-white rounded-full shadow-lg border-2 border-white ${status === LeakStatus.ACTIVE ? 'animate-pulse' : ''}`}>
       <IconComponent className={`w-6 h-6 ${color}`} />
       {/* Little pointer arrow at bottom */}
       <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rotate-45"></div>
    </div>
  );

  return L.divIcon({
    html: html,
    className: 'custom-marker-icon',
    iconSize: [40, 40],
    iconAnchor: [20, 42], // Tip of the pointer
    popupAnchor: [0, -45],
  });
};

const createNewReportIcon = () => {
  const html = ReactDOMServer.renderToString(
    <div className="relative flex items-center justify-center w-12 h-12">
       <div className="animate-bounce">
          <MapPin className="w-10 h-10 text-indigo-600 fill-indigo-100 drop-shadow-xl" />
       </div>
    </div>
  );

  return L.divIcon({
    html: html,
    className: 'custom-marker-icon',
    iconSize: [48, 48],
    iconAnchor: [24, 48],
  });
};

// Component to handle map view changes and clicks
const MapController = ({ 
  center, 
  zoom, 
  isReporting, 
  onMapClick 
}: { 
  center: [number, number], 
  zoom?: number,
  isReporting: boolean,
  onMapClick: (lat: number, lng: number) => void
}) => {
  const map = useMap();
  
  useEffect(() => {
    map.flyTo(center, zoom || map.getZoom());
  }, [center, zoom, map]);

  useMapEvents({
    click(e) {
      if (isReporting) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });

  // Change cursor based on mode
  useEffect(() => {
    if (isReporting) {
      L.DomUtil.addClass(map.getContainer(), 'cursor-crosshair');
    } else {
      L.DomUtil.removeClass(map.getContainer(), 'cursor-crosshair');
    }
  }, [isReporting, map]);

  return null;
};

// Heatmap Layer Component
const HeatmapLayer = ({ points }: { points: [number, number, number][] }) => {
  const map = useMap();

  useEffect(() => {
    // @ts-ignore - leaflet.heat is loaded via script tag in index.html
    if (!L.heatLayer) return;

    // @ts-ignore
    const heat = L.heatLayer(points, {
      radius: 25,
      blur: 15,
      maxZoom: 10,
      max: 1.0,
      gradient: {
        0.4: 'blue',
        0.6: 'cyan',
        0.7: 'lime',
        0.8: 'yellow',
        1.0: 'red'
      }
    }).addTo(map);

    return () => {
      map.removeLayer(heat);
    };
  }, [map, points]);

  return null;
};

const LeakMap: React.FC<LeakMapProps> = ({ 
  leaks, 
  selectedLeakId, 
  onLeakSelect, 
  is3DMode, 
  showHeatmap,
  isReporting,
  onMapClick,
  tempReportLocation
}) => {
  const [activeCenter, setActiveCenter] = useState<[number, number]>(MAP_CENTER);
  const [activeZoom, setActiveZoom] = useState(MAP_ZOOM);

  useEffect(() => {
    if (selectedLeakId) {
      const leak = leaks.find(l => l.id === selectedLeakId);
      if (leak) {
        setActiveCenter([leak.lat, leak.lng]);
        setActiveZoom(15);
      }
    }
  }, [selectedLeakId, leaks]);

  // Convert leaks to heatmap points [lat, lng, intensity]
  const heatmapPoints = leaks.map(l => [
    l.lat, 
    l.lng, 
    l.status === LeakStatus.ACTIVE ? 1.0 : 0.5 // Higher intensity for active leaks
  ]) as [number, number, number][];

  return (
    <MapContainer 
      center={MAP_CENTER} 
      zoom={MAP_ZOOM} 
      className={`h-full w-full z-0 transition-all duration-700 ${is3DMode ? 'map-3d-perspective' : ''}`}
      zoomControl={false}
    >
      {/* Minimalistic Gray Tiles */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />
      
      <MapController 
        center={activeCenter} 
        zoom={activeZoom} 
        isReporting={isReporting}
        onMapClick={onMapClick}
      />

      {showHeatmap && <HeatmapLayer points={heatmapPoints} />}

      {!showHeatmap && leaks.map((leak) => (
        <Marker 
          key={leak.id} 
          position={[leak.lat, leak.lng]} 
          icon={createIcon(leak.status)}
          eventHandlers={{
            click: () => onLeakSelect(leak),
          }}
        >
          <Popup>
            <div className="flex flex-col gap-2 cursor-pointer" onClick={() => onLeakSelect(leak)}>
              <div className="relative h-24 w-full overflow-hidden rounded-t-md bg-slate-200">
                 <img src={leak.imageUrl} alt="Leak" className="object-cover w-full h-full" />
                 <div className={`absolute top-2 right-2 px-2 py-1 text-xs font-bold text-white rounded-full shadow-sm
                    ${leak.status === LeakStatus.ACTIVE ? 'bg-red-500' : 
                      leak.status === LeakStatus.REPAIRING ? 'bg-yellow-500' : 'bg-green-500'}`}>
                    {leak.status}
                 </div>
              </div>
              <div className="px-3 pb-2">
                <h3 className="font-semibold text-slate-800 text-sm">{leak.zone}</h3>
                <div className="flex items-center gap-1 text-slate-500 text-xs mt-1">
                   <MapPin className="w-3 h-3" />
                   <span className="truncate">{leak.address}</span>
                </div>
                <p className="text-xs text-blue-600 mt-2 font-medium">Click for details &rarr;</p>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Temporary Marker for Report Mode */}
      {tempReportLocation && (
        <Marker 
          position={[tempReportLocation.lat, tempReportLocation.lng]}
          icon={createNewReportIcon()}
        />
      )}
    </MapContainer>
  );
};

export default LeakMap;