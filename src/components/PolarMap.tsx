import { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import { 
  Personnel, 
  Vehicle, 
  CargoItem, 
  Camp, 
  Emergency, 
  Expedition, 
  MarkerFilter 
} from '../types';
import { PRIMARY_EXPEDITION_ROUTE } from '../services/dataService';
import { Crosshair, ZoomIn, ZoomOut, RefreshCw, AlertTriangle, Globe, Compass } from 'lucide-react';
import { useTranslation } from '../i18n';

interface PolarMapProps {
  personnel: Personnel[];
  vehicles: Vehicle[];
  cargo: CargoItem[];
  camps: Camp[];
  emergencies: Emergency[];
  selectedExpedition?: Expedition | null;
  activeFilter: MarkerFilter;
  onFilterChange: (filter: MarkerFilter) => void;
  selectedEntity?: { type: 'vehicle' | 'personnel' | 'cargo' | 'camp' | 'emergency'; id: string } | null;
  onSelectEntity?: (type: 'vehicle' | 'personnel' | 'cargo' | 'camp' | 'emergency', id: string) => void;
  onOpenCargoDetails?: (id: string) => void;
  isFollowing?: boolean;
  onToggleFollow?: () => void;
  heightClass?: string;
  focusTarget?: [number, number] | null;
  activeEmergencyRoute?: [number, number][] | null;
  onMapClick?: (coords: [number, number]) => void;
}

// Polar Palette Colors
const COLORS = {
  personnel: '#4AA9D8', // Map Blue
  vehicle: '#39A96B',   // Arctic Green
  cargo: '#F29A3D',     // Primary Orange
  camp: '#8B5CF6',      // Expedition Camp Purple
  emergency: '#E84D4D'  // Emergency Red
};

// Geographic Continent & Country Labels for World View
interface GeographicLabelConfig {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: 'continent' | 'country' | 'region';
  minZoom: number;
  maxZoom: number;
}

const WORLD_GEOGRAPHIC_LABELS: GeographicLabelConfig[] = [
  { id: 'north-america', name: 'NORTH AMERICA', lat: 46.0, lng: -100.0, type: 'continent', minZoom: 1, maxZoom: 5 },
  { id: 'south-america', name: 'SOUTH AMERICA', lat: -15.0, lng: -60.0, type: 'continent', minZoom: 1, maxZoom: 5 },
  { id: 'europe', name: 'EUROPE', lat: 52.0, lng: 18.0, type: 'continent', minZoom: 1, maxZoom: 5 },
  { id: 'africa', name: 'AFRICA', lat: 5.0, lng: 20.0, type: 'continent', minZoom: 1, maxZoom: 5 },
  { id: 'asia', name: 'ASIA', lat: 45.0, lng: 90.0, type: 'continent', minZoom: 1, maxZoom: 5 },
  { id: 'india', name: 'INDIA', lat: 20.5937, lng: 78.9629, type: 'country', minZoom: 1, maxZoom: 7 },
  { id: 'australia', name: 'AUSTRALIA', lat: -25.0, lng: 134.0, type: 'continent', minZoom: 1, maxZoom: 6 },
  { id: 'oceania', name: 'OCEANIA', lat: -8.0, lng: 155.0, type: 'region', minZoom: 1, maxZoom: 5 },
  { id: 'antarctica', name: 'ANTARCTICA', lat: -78.0, lng: 0.0, type: 'continent', minZoom: 1, maxZoom: 5 }
];

const createGeographicLabelIcon = (
  text: string,
  type: 'continent' | 'country' | 'region',
  currentZoom: number
) => {
  let fontSize = 12;
  let letterSpacing = '3.5px';
  let color = '#42525E';
  let fontWeight = 700;

  if (type === 'country') {
    // INDIA: Clear, prominent, stays anchored over India across world & regional zooms
    if (currentZoom <= 2) {
      fontSize = 11;
      letterSpacing = '2.5px';
      color = '#2B3B46';
    } else if (currentZoom <= 4) {
      fontSize = 13;
      letterSpacing = '3px';
      color = '#20303A';
    } else {
      fontSize = 15;
      letterSpacing = '3.5px';
      color = '#18242C';
    }
  } else if (type === 'region') {
    // OCEANIA
    fontSize = currentZoom <= 2 ? 10 : 11;
    letterSpacing = '3px';
    color = '#546672';
    fontWeight = 600;
  } else {
    // Major Continents: NORTH AMERICA, SOUTH AMERICA, EUROPE, AFRICA, ASIA, AUSTRALIA, ANTARCTICA
    if (currentZoom <= 2) {
      fontSize = 12;
      letterSpacing = '3.5px';
      color = '#42525E';
    } else if (currentZoom === 3) {
      fontSize = 13;
      letterSpacing = '4px';
      color = '#384752';
    } else {
      fontSize = 12;
      letterSpacing = '3px';
      color = '#4E5F6B';
    }
  }

  const html = `
    <div style="
      font-family: 'Plus Jakarta Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: ${fontSize}px;
      font-weight: ${fontWeight};
      letter-spacing: ${letterSpacing};
      text-transform: uppercase;
      color: ${color};
      text-shadow: 
        -1.5px -1.5px 0 #FFFFFF,
         1.5px -1.5px 0 #FFFFFF,
        -1.5px  1.5px 0 #FFFFFF,
         1.5px  1.5px 0 #FFFFFF,
         0 0 6px rgba(255,255,255,0.95),
         0 0 10px rgba(255,255,255,0.85);
      white-space: nowrap;
      pointer-events: none;
      user-select: none;
      transform: translate(-50%, -50%);
      line-height: 1;
      text-align: center;
    ">
      ${text}
    </div>
  `;

  return L.divIcon({
    className: 'gis-geo-label-marker',
    html,
    iconSize: [0, 0],
    iconAnchor: [0, 0]
  });
};

export const PolarMap: React.FC<PolarMapProps> = ({
  personnel,
  vehicles,
  cargo,
  camps,
  emergencies,
  selectedExpedition,
  activeFilter,
  onFilterChange,
  selectedEntity,
  onSelectEntity,
  onOpenCargoDetails,
  isFollowing = false,
  onToggleFollow,
  heightClass = 'h-full min-h-[440px]',
  focusTarget,
  activeEmergencyRoute,
  onMapClick
}) => {
  const { t, translateStatus, locale } = useTranslation();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const routesLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const geoLabelsLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const labelOverlayLayerRef = useRef<L.TileLayer | null>(null);

  const [tileError, setTileError] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [currentView, setCurrentView] = useState<'expedition' | 'world' | 'custom'>('expedition');
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  // Render or refresh geographic labels based on the active map zoom level
  const renderGeographicLabels = useCallback((zoom: number) => {
    if (!geoLabelsLayerGroupRef.current) return;
    const group = geoLabelsLayerGroupRef.current;
    group.clearLayers();

    WORLD_GEOGRAPHIC_LABELS.forEach((label) => {
      if (zoom >= label.minZoom && zoom <= label.maxZoom) {
        const icon = createGeographicLabelIcon(label.name, label.type, zoom);
        const marker = L.marker([label.lat, label.lng], {
          icon,
          interactive: false,
          keyboard: false
        });
        group.addLayer(marker);
      }
    });
  }, []);

  // Initialize Map
  const initMap = useCallback(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }
    if (resizeObserverRef.current) {
      resizeObserverRef.current.disconnect();
      resizeObserverRef.current = null;
    }

    setTileError(false);

    // Svalbard Arctic coordinates (centered on Longyearbyen / central expedition region)
    const defaultCenter: [number, number] = [78.3500, 16.2000];

    // Restrict map panning to a single complete world without horizontal wrapping or duplicate continents
    const worldBounds = L.latLngBounds(
      L.latLng(-85.05112878, -180),
      L.latLng(85.05112878, 180)
    );

    const container = mapContainerRef.current;
    const initialWidth = container.clientWidth || window.innerWidth || 800;
    // Dynamic minimum zoom:
    // When width < 550 (mobile), minZoom 1 shows full world in viewport
    // On tablet / desktop (>= 550), minZoom 2 spans 1024px showing the complete single world without repetition
    const initialMinZoom = initialWidth < 550 ? 1 : 2;

    const map = L.map(container, {
      center: defaultCenter,
      zoom: 9,
      zoomControl: false,
      attributionControl: false,
      minZoom: initialMinZoom,
      maxZoom: 19,
      maxBounds: worldBounds,
      maxBoundsViscosity: 1.0,
      worldCopyJump: false,
      zoomAnimation: true,
      fadeAnimation: true,
      markerZoomAnimation: true
    });

    // Map Tile Provider Configuration:
    // Base Tile Layer: CARTO Voyager raster basemap without pre-rendered conflicting labels.
    // This provides clean topography, water bodies, elevation, borders, and roads,
    // while eliminating conflicting Chinese (亚洲), Arabic (أفريقيا), and Spanish (AMÉRICA DEL SUR) labels.
    const cartoApiKey = (import.meta.env.VITE_CARTO_API_KEY as string | undefined)?.trim();

    const baseTileUrl = cartoApiKey
      ? `https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png?key=${encodeURIComponent(cartoApiKey)}`
      : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png';

    const baseTileOptions: L.TileLayerOptions = {
      minZoom: initialMinZoom,
      maxZoom: 19,
      subdomains: 'abcd',
      noWrap: true, // STRICTLY PREVENTS REPEATING THE WORLD: tiles will only be loaded within longitudes -180 to 180
      bounds: [
        [-85.05112878, -180],
        [85.05112878, 180]
      ],
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attributions" target="_blank" rel="noreferrer">CARTO</a>'
    };

    const baseTileLayer = L.tileLayer(baseTileUrl, baseTileOptions);

    baseTileLayer.on('tileerror', () => {
      // If primary CARTO Voyager fails, fallback to CARTO Positron nolabels
      if (tileLayerRef.current && !tileError) {
        setTileError(true);
        tileLayerRef.current.setUrl('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png');
      }
    });

    baseTileLayer.addTo(map);
    tileLayerRef.current = baseTileLayer;

    // Detailed Label Overlay: CARTO Voyager English labels for deeper zoom levels (zoom >= 4)
    // Only active when zooming past the World View, preventing any conflicting low-zoom continent labels
    // while providing full English place names when exploring regions and Svalbard / Longyearbyen.
    const labelOverlayUrl = cartoApiKey
      ? `https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png?key=${encodeURIComponent(cartoApiKey)}`
      : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png';

    const labelOverlayOptions: L.TileLayerOptions = {
      minZoom: 4,
      maxZoom: 19,
      subdomains: 'abcd',
      noWrap: true,
      bounds: [
        [-85.05112878, -180],
        [85.05112878, 180]
      ]
    };

    const labelOverlayLayer = L.tileLayer(labelOverlayUrl, labelOverlayOptions);
    labelOverlayLayer.addTo(map);
    labelOverlayLayerRef.current = labelOverlayLayer;

    // Layer groups for markers, routes, and geographic labels
    routesLayerGroupRef.current = L.layerGroup().addTo(map);
    markersLayerGroupRef.current = L.layerGroup().addTo(map);
    geoLabelsLayerGroupRef.current = L.layerGroup().addTo(map);

    // Initial render of geographic labels at current map zoom
    renderGeographicLabels(map.getZoom());

    mapInstanceRef.current = map;
    setMapReady(true);

    // Responsive ResizeObserver to keep minZoom and viewport accurately adapted to container width
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        if (width > 0 && mapInstanceRef.current) {
          const appropriateMinZoom = width < 550 ? 1 : 2;
          if (mapInstanceRef.current.getMinZoom() !== appropriateMinZoom) {
            mapInstanceRef.current.setMinZoom(appropriateMinZoom);
            if (mapInstanceRef.current.getZoom() < appropriateMinZoom) {
              mapInstanceRef.current.setZoom(appropriateMinZoom);
            }
          }
          mapInstanceRef.current.invalidateSize();
        }
      }
    });
    ro.observe(container);
    resizeObserverRef.current = ro;

    // Track zoom / position changes to update active view mode and geographic labels
    map.on('zoomend', () => {
      renderGeographicLabels(map.getZoom());
    });

    map.on('zoomend moveend', () => {
      const z = map.getZoom();
      if (z <= 3) {
        setCurrentView('world');
      } else if (z >= 7 && z <= 12) {
        const c = map.getCenter();
        if (c.lat > 76 && c.lat < 81 && c.lng > 12 && c.lng < 20) {
          setCurrentView('expedition');
        } else {
          setCurrentView('custom');
        }
      } else {
        setCurrentView('custom');
      }
    });

    // Click handler for coordinates selection
    map.on('click', (e: L.LeafletMouseEvent) => {
      if (onMapClick) {
        onMapClick([Number(e.latlng.lat.toFixed(4)), Number(e.latlng.lng.toFixed(4))]);
      }
    });

    // Invalidate size once DOM paints
    setTimeout(() => {
      map.invalidateSize();
    }, 250);
  }, [onMapClick, tileError, renderGeographicLabels]);

  useEffect(() => {
    initMap();
    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
        resizeObserverRef.current = null;
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [initMap]);

  // 🌍 World View Handler - Fit the map to a viewport where one complete world is visible without duplicates
  const handleWorldView = useCallback(() => {
    if (!mapInstanceRef.current) return;
    setCurrentView('world');
    const map = mapInstanceRef.current;
    const containerWidth = mapContainerRef.current?.clientWidth || map.getSize().x || 800;
    // On mobile (< 550px), zoom 1 gives full world width. On tablet/desktop, zoom 2 spans 1024px single world.
    const targetZoom = containerWidth < 550 ? 1 : 2;

    // Balanced geographic center at [15, 10]:
    // Latitude 15°N frames Arctic/Europe/Asia/North America in upper portion,
    // Africa/South America in middle, Australia/Antarctica in lower portion.
    // Longitude 10°E centers Europe/Africa, with Americas on left and Asia/Australia on right.
    const worldCenter: [number, number] = [15, 10];

    if (map.flyTo) {
      map.flyTo(worldCenter, targetZoom, { duration: 1.2 });
    } else {
      map.setView(worldCenter, targetZoom);
    }
  }, []);

  // ◎ Expedition View Handler - Return to Longyearbyen, Svalbard (~78.22, 15.63)
  const handleExpeditionView = useCallback(() => {
    if (!mapInstanceRef.current) return;
    setCurrentView('expedition');
    const map = mapInstanceRef.current;
    const expeditionCenter: [number, number] = [78.3500, 16.2000];
    if (map.flyTo) {
      map.flyTo(expeditionCenter, 9, {
        duration: 1.2
      });
    } else {
      map.setView(expeditionCenter, 9, { animate: true });
    }
  }, []);

  // 🔍 Reset / Re-center Handler - Re-centers onto active expedition assets and markers
  const handleRecenter = useCallback(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    setCurrentView('expedition');

    const points: L.LatLngTuple[] = [];
    camps.forEach(c => points.push([c.lat, c.lng]));
    vehicles.forEach(v => points.push([v.lat, v.lng]));
    personnel.forEach(p => points.push([p.lat, p.lng]));
    cargo.forEach(cg => points.push([cg.lat, cg.lng]));
    emergencies.forEach(e => points.push([e.lat, e.lng]));

    if (points.length > 0) {
      const bounds = L.latLngBounds(points);
      if (map.flyToBounds) {
        map.flyToBounds(bounds, {
          padding: [30, 30],
          maxZoom: 10,
          duration: 1.2
        });
      } else {
        map.fitBounds(bounds, { padding: [30, 30], maxZoom: 10 });
      }
    } else {
      handleExpeditionView();
    }
  }, [camps, vehicles, personnel, cargo, emergencies, handleExpeditionView]);

  // Backward compatibility alias for centerMap
  const centerMap = handleExpeditionView;

  // Zoom In / Out Controls
  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  // Handle Focus Target
  useEffect(() => {
    if (focusTarget && mapInstanceRef.current) {
      mapInstanceRef.current.setView(focusTarget, 11, { animate: true });
    }
  }, [focusTarget]);

  // Follow selected entity if enabled
  useEffect(() => {
    if (!isFollowing || !selectedEntity || !mapInstanceRef.current) return;

    let targetCoords: [number, number] | null = null;
    if (selectedEntity.type === 'vehicle') {
      const v = vehicles.find(item => item.id === selectedEntity.id);
      if (v) targetCoords = [v.lat, v.lng];
    } else if (selectedEntity.type === 'personnel') {
      const p = personnel.find(item => item.id === selectedEntity.id);
      if (p) targetCoords = [p.lat, p.lng];
    } else if (selectedEntity.type === 'cargo') {
      const c = cargo.find(item => item.id === selectedEntity.id);
      if (c) targetCoords = [c.lat, c.lng];
    }

    if (targetCoords) {
      mapInstanceRef.current.panTo(targetCoords, { animate: true, duration: 1 });
    }
  }, [isFollowing, selectedEntity, vehicles, personnel, cargo]);

  // Render Routes and Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerGroupRef.current;
    const routesGroup = routesLayerGroupRef.current;
    if (!map || !markersGroup || !routesGroup || !mapReady) return;

    markersGroup.clearLayers();
    routesGroup.clearLayers();

    // 1. Draw Primary Expedition Route (Base Camp -> Checkpoint 1 -> Research Camp -> Checkpoint 2 -> Ice Camp)
    const mainRouteCoords = PRIMARY_EXPEDITION_ROUTE.map(c => [c[0], c[1]] as [number, number]);
    
    // Outer route halo
    L.polyline(mainRouteCoords, {
      color: '#FFFFFF',
      weight: 6,
      opacity: 0.8
    }).addTo(routesGroup);

    // Primary route line with warm orange and blue styling
    L.polyline(mainRouteCoords, {
      color: '#F29A3D',
      weight: 3.5,
      dashArray: '8, 6',
      opacity: 0.95
    }).addTo(routesGroup);

    // Route waypoint dots
    mainRouteCoords.forEach((pt) => {
      const dotIcon = L.divIcon({
        className: 'route-checkpoint-dot',
        html: `<div style="background-color: #F29A3D; width: 10px; height: 10px; border-radius: 50%; border: 2px solid #FFFFFF; box-shadow: 0 1px 4px rgba(36,49,58,0.3);"></div>`,
        iconSize: [10, 10],
        iconAnchor: [5, 5]
      });
      L.marker(pt, { icon: dotIcon, interactive: false }).addTo(routesGroup);
    });

    // Draw selected expedition route if different
    if (selectedExpedition && selectedExpedition.routeCoordinates.length > 1) {
      const expCoords = selectedExpedition.routeCoordinates.map(c => [c[0], c[1]] as [number, number]);
      L.polyline(expCoords, {
        color: '#4AA9D8',
        weight: 4,
        opacity: 0.85
      }).addTo(routesGroup);
    }

    // 2. Draw Emergency Response Routes (Pulsing Red route)
    emergencies
      .filter(e => e.status !== 'Resolved')
      .forEach(e => {
        if (e.responseRoute && e.responseRoute.length > 1) {
          const routeLatLngs = e.responseRoute.map(c => [c[0], c[1]] as [number, number]);
          
          // Emergency response route shadow
          L.polyline(routeLatLngs, {
            color: '#FFFFFF',
            weight: 7,
            opacity: 0.9
          }).addTo(routesGroup);

          // Glowing red emergency polyline
          L.polyline(routeLatLngs, {
            color: '#E84D4D',
            weight: 3.5,
            dashArray: '6, 6',
            opacity: 1
          }).addTo(routesGroup);
        }
      });

    if (activeEmergencyRoute && activeEmergencyRoute.length > 1) {
      L.polyline(activeEmergencyRoute, {
        color: '#E84D4D',
        weight: 4,
        dashArray: '5, 5',
        opacity: 0.95
      }).addTo(routesGroup);
    }

    // 2.5 Draw Selected Cargo Logistics Route (Origin -> Current Location -> Destination)
    const selectedCargoItem = (selectedEntity?.type === 'cargo') 
      ? cargo.find(c => c.id === selectedEntity.id) 
      : null;

    if (selectedCargoItem) {
      const originPt: [number, number] = selectedCargoItem.originCoords || [78.2232, 15.6267];
      const currentPt: [number, number] = [selectedCargoItem.lat, selectedCargoItem.lng];
      const destPt: [number, number] = selectedCargoItem.destinationCoords || [78.6500, 16.9000];

      const fullRouteCoords: [number, number][] = (selectedCargoItem.routeCoords && selectedCargoItem.routeCoords.length > 1)
        ? selectedCargoItem.routeCoords
        : [originPt, currentPt, destPt];

      // White halo/shadow behind entire cargo route
      L.polyline(fullRouteCoords, {
        color: '#FFFFFF',
        weight: 8,
        opacity: 0.95
      }).addTo(routesGroup);

      // Traversed segment: Origin -> Current Location (Solid Amber/Orange)
      L.polyline([originPt, currentPt], {
        color: '#F29A3D',
        weight: 4,
        opacity: 0.95
      }).addTo(routesGroup);

      // Pending segment: Current Location -> Destination (Dashed Amber/Orange)
      L.polyline([currentPt, destPt], {
        color: '#F29A3D',
        weight: 3.5,
        dashArray: '6, 6',
        opacity: 0.9
      }).addTo(routesGroup);

      // Origin Marker Pin
      const originIcon = L.divIcon({
        className: 'custom-cargo-origin-marker',
        html: `
          <div style="
            background: #24313A;
            color: #FFFFFF;
            border: 2px solid #FFFFFF;
            border-radius: 8px;
            padding: 3px 8px;
            font-size: 10px;
            font-weight: 800;
            display: flex;
            align-items: center;
            gap: 5px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.35);
            white-space: nowrap;
            font-family: 'Plus Jakarta Sans', sans-serif;
          ">
            <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #4AA9D8;"></span>
            <span>Origin: ${selectedCargoItem.origin || 'Base Camp'}</span>
          </div>
        `,
        iconAnchor: [50, 12]
      });
      L.marker(originPt, { icon: originIcon }).addTo(routesGroup);

      // Destination Marker Pin
      const destIcon = L.divIcon({
        className: 'custom-cargo-dest-marker',
        html: `
          <div style="
            background: #F29A3D;
            color: #24313A;
            border: 2px solid #FFFFFF;
            border-radius: 8px;
            padding: 3px 8px;
            font-size: 10px;
            font-weight: 800;
            display: flex;
            align-items: center;
            gap: 5px;
            box-shadow: 0 2px 8px rgba(242,154,61,0.5);
            white-space: nowrap;
            font-family: 'Plus Jakarta Sans', sans-serif;
          ">
            <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #24313A;"></span>
            <span>Dest: ${selectedCargoItem.destination}</span>
          </div>
        `,
        iconAnchor: [50, 12]
      });
      L.marker(destPt, { icon: destIcon }).addTo(routesGroup);
    }

    // 3. Render Camps and Checkpoints (Purple)
    camps.forEach(camp => {
      const isCheckpoint = camp.name.includes('Checkpoint');
      const campIcon = L.divIcon({
        className: 'custom-camp-icon',
        html: `
          <div style="
            background: #FFFFFF; 
            border: 2px solid ${COLORS.camp}; 
            border-radius: ${isCheckpoint ? '6px' : '50%'}; 
            width: ${isCheckpoint ? '24px' : '28px'}; 
            height: ${isCheckpoint ? '24px' : '28px'}; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            box-shadow: 0 3px 10px rgba(139, 92, 246, 0.25);
            cursor: pointer;
          ">
            <div style="
              width: ${isCheckpoint ? '8px' : '10px'}; 
              height: ${isCheckpoint ? '8px' : '10px'}; 
              background: ${COLORS.camp}; 
              border-radius: ${isCheckpoint ? '2px' : '2px'}; 
              transform: rotate(45deg);
            "></div>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const popupHtml = `
        <div style="padding: 12px 14px; min-width: 180px; font-family: 'Plus Jakarta Sans', sans-serif;">
          <div style="font-size: 10px; letter-spacing: 0.08em; color: ${COLORS.camp}; font-weight: 700; text-transform: uppercase;">${camp.code}</div>
          <div style="font-size: 14px; font-weight: 700; color: #24313A; margin-top: 2px;">${camp.name}</div>
          <div style="display: flex; gap: 12px; margin-top: 6px; font-size: 11px; color: #71808A;">
            <span>${t('map.elev')}: <strong style="color: #24313A;">${camp.elevationM}m</strong></span>
            <span>${t('map.capacity')}: <strong style="color: #24313A;">${camp.personnelCount}/${camp.capacity}</strong></span>
          </div>
          <div style="font-size: 10px; color: #71808A; margin-top: 6px; font-family: monospace;">${t('map.gps')}: ${camp.lat}, ${camp.lng}</div>
        </div>
      `;

      const m = L.marker([camp.lat, camp.lng], { icon: campIcon }).bindPopup(popupHtml);
      m.on('click', () => onSelectEntity?.('camp', camp.id));
      m.addTo(markersGroup);
    });

    // 4. Render Vehicles (Green)
    if (activeFilter === 'all' || activeFilter === 'vehicles') {
      vehicles.forEach(vehicle => {
        const isSelected = selectedEntity?.type === 'vehicle' && selectedEntity.id === vehicle.id;
        const vehicleIcon = L.divIcon({
          className: 'custom-vehicle-icon',
          html: `
            <div style="
              background: #FFFFFF; 
              border: 2px solid ${COLORS.vehicle}; 
              border-radius: 9px; 
              width: 28px; 
              height: 28px; 
              display: flex; 
              align-items: center; 
              justify-content: center;
              box-shadow: ${isSelected ? `0 0 0 3px #FFE5C7, 0 4px 12px rgba(57,169,107,0.4)` : '0 3px 8px rgba(36,49,58,0.2)'};
              transform: ${isSelected ? 'scale(1.2)' : 'scale(1)'};
              transition: all 0.25s ease;
              cursor: pointer;
            ">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="${COLORS.vehicle}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="7" width="20" height="10" rx="2" />
                <circle cx="7" cy="17" r="2" />
                <circle cx="17" cy="17" r="2" />
              </svg>
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });

        const popupHtml = `
          <div style="padding: 12px 14px; min-width: 180px; font-family: 'Plus Jakarta Sans', sans-serif;">
            <div style="font-size: 10px; letter-spacing: 0.08em; color: ${COLORS.vehicle}; font-weight: 700; text-transform: uppercase;">${t('map.vehiclePrefix')} ${vehicle.code}</div>
            <div style="font-size: 13px; font-weight: 700; color: #24313A; margin-top: 2px;">${vehicle.name}</div>
            <div style="font-size: 11px; color: #71808A; margin-top: 2px;">${vehicle.type}</div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px; font-size: 11px;">
              <span style="color: #71808A;">${t('map.fuel')}: <strong style="color: ${vehicle.fuelPercentage < 40 ? '#E84D4D' : '#24313A'};">${vehicle.fuelPercentage}%</strong></span>
              <span style="color: ${COLORS.vehicle}; font-weight: 600; background: #E8F7EE; padding: 1px 6px; border-radius: 4px;">● ${translateStatus(vehicle.status)}</span>
            </div>
            <div style="font-size: 10px; color: #71808A; margin-top: 6px; border-top: 1px solid #F0E9DF; pt-2;">
              ${t('map.speed')}: <strong>${vehicle.speedKmH} km/h</strong> • ${t('common.updated')}: ${vehicle.lastSeenSecAgo}${t('common.secAgo')}
            </div>
          </div>
        `;

        const m = L.marker([vehicle.lat, vehicle.lng], { icon: vehicleIcon }).bindPopup(popupHtml);
        m.on('click', () => onSelectEntity?.('vehicle', vehicle.id));
        m.addTo(markersGroup);
      });
    }

    // 5. Render Personnel (Blue)
    if (activeFilter === 'all' || activeFilter === 'people') {
      personnel.forEach(person => {
        const isSelected = selectedEntity?.type === 'personnel' && selectedEntity.id === person.id;
        const personIcon = L.divIcon({
          className: 'custom-person-icon',
          html: `
            <div style="
              background: #FFFFFF; 
              border: 2px solid ${COLORS.personnel}; 
              border-radius: 50%; 
              width: 24px; 
              height: 24px; 
              display: flex; 
              align-items: center; 
              justify-content: center;
              box-shadow: ${isSelected ? `0 0 0 3px #DFF3FA, 0 4px 10px rgba(74,169,216,0.4)` : '0 2px 6px rgba(36,49,58,0.18)'};
              transform: ${isSelected ? 'scale(1.2)' : 'scale(1)'};
              transition: all 0.25s ease;
              cursor: pointer;
            ">
              <div style="width: 8px; height: 8px; border-radius: 50%; background-color: ${COLORS.personnel};"></div>
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        const popupHtml = `
          <div style="padding: 12px 14px; min-width: 180px; font-family: 'Plus Jakarta Sans', sans-serif;">
            <div style="font-size: 10px; letter-spacing: 0.08em; color: ${COLORS.personnel}; font-weight: 700; text-transform: uppercase;">${person.callsign}</div>
            <div style="font-size: 13px; font-weight: 700; color: #24313A; margin-top: 2px;">${person.name}</div>
            <div style="font-size: 11px; color: #71808A; margin-top: 2px;">${person.role}</div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px; font-size: 11px;">
              <span style="color: #71808A;">${person.location}</span>
              <span style="color: ${COLORS.personnel}; font-weight: 600; background: #DFF3FA; padding: 1px 6px; border-radius: 4px;">● ${translateStatus(person.status)}</span>
            </div>
            <div style="font-size: 10px; color: #71808A; margin-top: 4px;">${t('map.lastCheckIn')}: ${person.lastCheckIn}</div>
          </div>
        `;

        const m = L.marker([person.lat, person.lng], { icon: personIcon }).bindPopup(popupHtml);
        m.on('click', () => onSelectEntity?.('personnel', person.id));
        m.addTo(markersGroup);
      });
    }

    // 6. Render Cargo (Orange)
    if (activeFilter === 'all' || activeFilter === 'cargo') {
      cargo.forEach(c => {
        const isSelected = selectedEntity?.type === 'cargo' && selectedEntity.id === c.id;
        const cargoIcon = L.divIcon({
          className: 'custom-cargo-icon',
          html: `
            <div style="
              background: ${isSelected ? '#F29A3D' : '#FFFFFF'}; 
              border: ${isSelected ? '2.5px solid #24313A' : `2px solid ${COLORS.cargo}`}; 
              border-radius: 7px; 
              width: ${isSelected ? '30px' : '25px'}; 
              height: ${isSelected ? '30px' : '25px'}; 
              display: flex; 
              align-items: center; 
              justify-content: center;
              box-shadow: ${isSelected ? `0 0 0 4px #FFE5C7, 0 6px 14px rgba(242,154,61,0.5)` : '0 2px 6px rgba(36,49,58,0.18)'};
              transform: ${isSelected ? 'scale(1.15)' : 'scale(1)'};
              transition: all 0.25s ease;
              cursor: pointer;
            ">
              <svg width="${isSelected ? '15' : '13'}" height="${isSelected ? '15' : '13'}" viewBox="0 0 24 24" fill="none" stroke="${isSelected ? '#FFFFFF' : COLORS.cargo}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              </svg>
            </div>
          `,
          iconSize: isSelected ? [30, 30] : [25, 25],
          iconAnchor: isSelected ? [15, 15] : [12, 12]
        });

        const popupHtml = `
          <div style="padding: 12px 14px; min-width: 220px; font-family: 'Plus Jakarta Sans', sans-serif;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 2px;">
              <span style="font-size: 10px; letter-spacing: 0.08em; color: ${COLORS.cargo}; font-weight: 800; font-family: monospace;">${c.code}</span>
              <span style="font-size: 10px; font-weight: 700; background: ${c.status === 'Delivered' ? '#E8F7EE' : c.status === 'Delayed' ? '#FDE8E8' : '#FFF4E5'}; color: ${c.status === 'Delivered' ? '#39A96B' : c.status === 'Delayed' ? '#E84D4D' : '#C96A20'}; padding: 1px 6px; border-radius: 4px;">● ${translateStatus(c.status)}</span>
            </div>
            <div style="font-size: 13px; font-weight: 800; color: #24313A; margin-top: 2px;">${c.title}</div>
            <div style="font-size: 11px; color: #71808A; margin-top: 4px;">
              <strong>${c.quantity || `${c.weightKg} kg`}</strong> • ${c.cargoType || 'Cargo'}
            </div>
            <div style="font-size: 11px; color: #71808A; margin-top: 2px;">
              Loc: <strong style="color: #24313A;">${c.currentLocationName || 'Field'}</strong>
            </div>
            <div style="font-size: 11px; color: #71808A; margin-top: 2px;">
              Route: <span style="color: #24313A;">${c.origin || 'Base'}</span> ➔ <strong style="color: #24313A;">${c.destination}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px; font-size: 11px; border-top: 1px solid #EAE3D5; padding-top: 6px;">
              <span style="color: #71808A;">Vehicle: <strong style="color: #24313A;">${c.vehicleName || 'Assigned'}</strong></span>
              <span style="color: ${COLORS.cargo}; font-weight: 700;">ETA: ${c.eta}</span>
            </div>
            <div style="margin-top: 10px;">
              <button 
                id="popup-open-cargo-${c.id}"
                onclick="window.__openCargoDetail && window.__openCargoDetail('${c.id}')"
                style="width: 100%; padding: 6px 10px; background: #F29A3D; color: #24313A; font-weight: 800; font-size: 11px; border: none; border-radius: 6px; cursor: pointer; text-align: center;"
              >
                Open Cargo Details & History →
              </button>
            </div>
          </div>
        `;

        const m = L.marker([c.lat, c.lng], { icon: cargoIcon }).bindPopup(popupHtml);
        m.on('click', () => {
          onSelectEntity?.('cargo', c.id);
          onOpenCargoDetails?.(c.id);
        });
        m.addTo(markersGroup);
      });
    }

    // Expose detail open handlers globally for popup buttons
    if (typeof window !== 'undefined') {
      (window as unknown as { __openEmergencyDetail?: (id: string) => void }).__openEmergencyDetail = (id: string) => {
        onSelectEntity?.('emergency', id);
      };
      (window as unknown as { __openCargoDetail?: (id: string) => void }).__openCargoDetail = (id: string) => {
        onSelectEntity?.('cargo', id);
        onOpenCargoDetails?.(id);
      };
    }

    // 7. Render Emergencies (Red with Pulsing Ring)
    if (activeFilter === 'all' || activeFilter === 'emergency') {
      emergencies
        .filter(e => e.status !== 'Resolved')
        .forEach(emg => {
          const emergencyIcon = L.divIcon({
            className: 'custom-emergency-marker',
            html: `
              <div class="emergency-marker-pulse" style="
                background: #E84D4D; 
                border: 2.5px solid #FFFFFF; 
                border-radius: 50%; 
                width: 32px; 
                height: 32px; 
                display: flex; 
                align-items: center; 
                justify-content: center;
                cursor: pointer;
                box-shadow: 0 4px 14px rgba(232,77,77,0.6);
              ">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </div>
            `,
            iconSize: [32, 32],
            iconAnchor: [16, 16]
          });

          const popupHtml = `
            <div style="padding: 14px; min-width: 260px; font-family: 'Plus Jakarta Sans', sans-serif; border-top: 4px solid #E84D4D;">
              <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px; font-size: 11px;">
                <span style="color: #E84D4D; font-weight: 800; text-transform: uppercase;">🚨 ${translateStatus(emg.type)} SOS</span>
                <span style="font-family: monospace; font-weight: 700; background: #FDE8E8; color: #E84D4D; padding: 2px 6px; border-radius: 4px; font-size: 10px;">${emg.id}</span>
              </div>
              <div style="font-size: 15px; font-weight: 800; color: #24313A; margin-top: 4px;">📍 ${emg.locationName}</div>
              <div style="font-size: 11px; color: #71808A; margin-top: 1px;">${emg.lat.toFixed(4)}°N, ${emg.lng.toFixed(4)}°E</div>
              
              <div style="margin-top: 8px; padding: 8px 10px; background: #F7F4EF; border-radius: 8px; border: 1px solid #EAE3D5; font-size: 11px; line-height: 1.45;">
                <div style="color: #24313A;"><strong>Affected:</strong> ${emg.affectedPerson}</div>
                <div style="color: #24313A; margin-top: 3px;"><strong>Nearest Team:</strong> ${emg.nearestTeamName}</div>
                <div style="display: flex; justify-content: space-between; margin-top: 4px; color: #C96A20; font-weight: 700;">
                  <span>Route: ${emg.distanceKm} km</span>
                  <span>ETA: ${emg.etaMinutes} min</span>
                </div>
              </div>

              <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 8px;">
                <span style="font-size: 10px; font-weight: 700; padding: 2px 8px; background: #FDE8E8; color: #E84D4D; border-radius: 6px;">
                  ● ${emg.status}
                </span>
                <span style="font-size: 10px; color: #71808A;">Updated: ${emg.lastUpdated}</span>
              </div>

              <button 
                onclick="window.__openEmergencyDetail && window.__openEmergencyDetail('${emg.id}')"
                style="width: 100%; margin-top: 10px; padding: 8px 12px; background: #E84D4D; color: #FFFFFF; font-weight: 800; font-size: 11px; border: none; border-radius: 8px; cursor: pointer; text-align: center; box-shadow: 0 2px 6px rgba(232,77,77,0.3);"
              >
                Open Emergency Details & Controls →
              </button>
            </div>
          `;

          const m = L.marker([emg.lat, emg.lng], { icon: emergencyIcon }).bindPopup(popupHtml);
          m.on('click', () => onSelectEntity?.('emergency', emg.id));
          m.addTo(markersGroup);
        });
    }

  }, [
    personnel, 
    vehicles, 
    cargo, 
    camps, 
    emergencies, 
    selectedExpedition, 
    activeFilter, 
    selectedEntity, 
    activeEmergencyRoute, 
    onSelectEntity,
    mapReady,
    locale,
    t,
    translateStatus
  ]);

  return (
    <div id="polar-map-container" className={`relative w-full ${heightClass} rounded-2xl overflow-hidden border border-[#E8DFC9] bg-[#CAD2D3] warm-card-shadow`}>
      {/* Real GIS Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Map Failure Recovery UI (Requirement 28) */}
      {tileError && (
        <div className="absolute inset-0 z-[500] bg-[#F7F4EF]/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
          <AlertTriangle className="w-10 h-10 text-[#F29A3D] mb-3" />
          <h4 className="text-base font-bold text-[#24313A]">{t('map.tilesUnavailable')}</h4>
          <p className="text-xs text-[#71808A] max-w-sm mt-1 mb-4">
            {t('map.tilesErrorDesc')}
          </p>
          <button
            id="map-retry-button"
            onClick={initMap}
            className="flex items-center gap-2 px-4 py-2 bg-[#F29A3D] hover:bg-[#FFB45A] text-[#24313A] font-semibold text-xs rounded-xl shadow transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            {t('map.retryConnection')}
          </button>
        </div>
      )}

      {/* Top Map Toolbar: Filter Controls & View Switcher (Responsive, Non-Overlapping) */}
      <div className="absolute top-3.5 left-3.5 right-3.5 z-[400] pointer-events-none flex flex-wrap items-start justify-between gap-2.5">
        {/* Filter Controls: All, People, Vehicles, Cargo, Emergency/SOS */}
        <div className="pointer-events-auto flex items-center gap-1.5 bg-[#FFFCF8]/95 backdrop-blur-md p-1.5 rounded-xl border border-[#EAE3D5] shadow-sm max-w-full overflow-x-auto no-scrollbar flex-shrink-0">
          <button
            id="map-filter-all"
            onClick={() => onFilterChange('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap flex-shrink-0 ${
              activeFilter === 'all'
                ? 'bg-[#F29A3D] text-[#24313A] shadow-sm'
                : 'text-[#71808A] hover:text-[#24313A] hover:bg-[#F7F4EF]'
            }`}
          >
            {t('common.filterAll')}
          </button>

          <button
            id="map-filter-people"
            onClick={() => onFilterChange('people')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap flex-shrink-0 ${
              activeFilter === 'people'
                ? 'bg-[#4AA9D8] text-white shadow-sm'
                : 'text-[#71808A] hover:text-[#4AA9D8] hover:bg-[#F7F4EF]'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#4AA9D8]" />
            {t('common.filterPeople')}
          </button>

          <button
            id="map-filter-vehicles"
            onClick={() => onFilterChange('vehicles')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap flex-shrink-0 ${
              activeFilter === 'vehicles'
                ? 'bg-[#39A96B] text-white shadow-sm'
                : 'text-[#71808A] hover:text-[#39A96B] hover:bg-[#F7F4EF]'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#39A96B]" />
            {t('common.filterVehicles')}
          </button>

          <button
            id="map-filter-cargo"
            onClick={() => onFilterChange('cargo')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap flex-shrink-0 ${
              activeFilter === 'cargo'
                ? 'bg-[#F29A3D] text-[#24313A] shadow-sm'
                : 'text-[#71808A] hover:text-[#F29A3D] hover:bg-[#F7F4EF]'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#F29A3D]" />
            {t('common.filterCargo')}
          </button>

          <button
            id="map-filter-emergency"
            onClick={() => onFilterChange('emergency')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap flex-shrink-0 ${
              activeFilter === 'emergency'
                ? 'bg-[#E84D4D] text-white shadow-sm'
                : 'text-[#71808A] hover:text-[#E84D4D] hover:bg-[#F7F4EF]'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#E84D4D]" />
            {t('common.filterEmergency')}
          </button>
        </div>

        {/* Right Controls: View Switcher (World View, Expedition View, Re-Center) & Zoom Controls */}
        <div className="pointer-events-auto flex flex-col items-end gap-1.5 flex-shrink-0 sm:ml-auto max-w-full">
          {/* World View & Expedition View Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-[#FFFCF8]/95 backdrop-blur-md border border-[#EAE3D5] shadow-sm gap-1 overflow-x-auto no-scrollbar max-w-full">
            <button
              id="map-world-view"
              onClick={handleWorldView}
              title={t('map.worldView')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex-shrink-0 ${
                currentView === 'world'
                  ? 'bg-[#24313A] text-white shadow-sm'
                  : 'text-[#5C6E7C] hover:text-[#24313A] hover:bg-[#F7F4EF]'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-[#4AA9D8]" />
              <span className="hidden sm:inline uppercase">{t('map.worldView')}</span>
              <span className="sm:hidden uppercase">{t('map.world')}</span>
            </button>

            <button
              id="map-expedition-view"
              onClick={handleExpeditionView}
              title={t('map.expeditionView')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex-shrink-0 ${
                currentView === 'expedition'
                  ? 'bg-[#F29A3D] text-[#24313A] shadow-sm'
                  : 'text-[#5C6E7C] hover:text-[#24313A] hover:bg-[#F7F4EF]'
              }`}
            >
              <Compass className={`w-3.5 h-3.5 ${currentView === 'expedition' ? 'text-[#24313A]' : 'text-[#F29A3D]'}`} />
              <span className="hidden sm:inline uppercase">{t('map.expeditionView')}</span>
              <span className="sm:hidden uppercase">{t('map.expedition')}</span>
            </button>

            <button
              id="map-recenter-view"
              onClick={handleRecenter}
              title={t('map.recenterView')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#5C6E7C] hover:text-[#24313A] hover:bg-[#F7F4EF] transition-all cursor-pointer whitespace-nowrap flex-shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#39A96B]" />
              <span className="hidden sm:inline uppercase">{t('map.recenterView')}</span>
              <span className="sm:hidden uppercase">{t('map.recenter')}</span>
            </button>
          </div>

          {/* Zoom In [ + ] & Zoom Out [ - ] & Follow Target */}
          <div className="flex items-center gap-1.5">
            <div className="flex flex-col rounded-xl overflow-hidden border border-[#EAE3D5] bg-[#FFFCF8]/95 backdrop-blur-md shadow-sm">
              <button
                id="map-zoom-in"
                onClick={handleZoomIn}
                title={t('map.zoomIn')}
                className="w-8 h-8 flex items-center justify-center text-[#24313A] hover:text-[#C96A20] hover:bg-[#FFF8EF] transition-all border-b border-[#EAE3D5]"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                id="map-zoom-out"
                onClick={handleZoomOut}
                title={t('map.zoomOut')}
                className="w-8 h-8 flex items-center justify-center text-[#24313A] hover:text-[#C96A20] hover:bg-[#FFF8EF] transition-all"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
            </div>

            {/* Follow Mode Toggle */}
            {onToggleFollow && (
              <button
                id="map-follow-toggle"
                onClick={onToggleFollow}
                title={isFollowing ? t('map.stopFollowing') : t('map.followTarget')}
                className={`w-8 h-16 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all shadow-sm ${
                  isFollowing
                    ? 'bg-[#F29A3D] text-[#24313A] border-[#F29A3D]'
                    : 'bg-[#FFFCF8]/95 text-[#71808A] border-[#EAE3D5] hover:text-[#24313A]'
                }`}
              >
                <Crosshair className="w-3.5 h-3.5" />
                <span className="text-[9px] font-bold">{t('map.fol')}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Map Legend (Bottom Left) */}
      <div className="hidden sm:flex absolute bottom-3.5 left-3.5 z-[400] items-center gap-3 px-3.5 py-1.5 rounded-xl bg-[#FFFCF8]/95 backdrop-blur-md border border-[#EAE3D5] text-[11px] text-[#71808A] shadow-sm">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#4AA9D8]" />
          <span>{t('map.legendPeople')}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#39A96B]" />
          <span>{t('map.legendVehicles')}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#F29A3D]" />
          <span>{t('map.legendCargo')}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#8B5CF6]" />
          <span>{t('map.legendCamps')}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#E84D4D] emergency-marker-pulse" />
          <span className="text-[#E84D4D] font-medium">{t('map.legendSos')}</span>
        </div>
      </div>

      {/* Route Badge (Bottom Right) */}
      <div className="absolute bottom-3.5 right-3.5 z-[400] text-[10px] font-semibold tracking-wider px-2.5 py-1 rounded-lg bg-[#FFFCF8]/90 backdrop-blur-md border border-[#EAE3D5] text-[#71808A] shadow-sm">
        MAIN ROUTE: BASE ➔ ICE CAMP
      </div>
    </div>
  );
};
