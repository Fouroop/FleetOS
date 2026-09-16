import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Vehicle, Geofence, GpsTrackPoint } from '../../types';
import { createCachedTileLayer } from '../../services/leafletCachedLayer';
import { mapTileCache } from '../../services/mapTileCache';
import { 
  Layers, 
  Compass, 
  ZoomIn, 
  ZoomOut, 
  Navigation, 
  AlertTriangle, 
  ShieldCheck, 
  Maximize2, 
  MapPin, 
  Truck,
  Database,
  HardDrive,
  RefreshCw,
  Trash2,
  DownloadCloud,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

interface GisMapProps {
  vehicles: Vehicle[];
  selectedVehicleId?: string | null;
  onSelectVehicle?: (vehicle: Vehicle) => void;
  onViewTrack?: (vehicle: Vehicle) => void;
  onViewDetail?: (vehicle: Vehicle) => void;
  onContactDriver?: (vehicle: Vehicle) => void;
  onSendTask?: (vehicle: Vehicle) => void;
  geofences?: Geofence[];
  activeTrack?: GpsTrackPoint[];
  showRiskHeatmap?: boolean;
  showFloatingHud?: boolean;
  className?: string;
  theme?: 'dark' | 'light';
}

const TILE_PROVIDERS = {
  amap: {
    name: '高德路网 (中文)',
    url: 'https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}',
    subdomains: '1234',
    attribution: '&copy; 高德地图 AutoNavi'
  },
  dark: {
    name: '深色驾驶舱',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
    subdomains: 'abcd',
    attribution: '&copy; OpenStreetMap &copy; CARTO'
  },
  light: {
    name: '标准路网',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
    subdomains: 'abcd',
    attribution: '&copy; OpenStreetMap &copy; CARTO'
  },
  satellite: {
    name: '卫星影像',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    subdomains: '',
    attribution: 'Tiles &copy; Esri'
  }
};

const FALLBACK_ERROR_TILE = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"><rect width="256" height="256" fill="%230b1120"/><path d="M0 0h256v256H0z" fill="none" stroke="%231e293b" stroke-width="0.8"/></svg>';

export const GisMap: React.FC<GisMapProps> = ({
  vehicles = [],
  selectedVehicleId,
  onSelectVehicle,
  onViewTrack,
  onViewDetail,
  onContactDriver,
  onSendTask,
  geofences = [],
  activeTrack,
  showRiskHeatmap = false,
  showFloatingHud = false,
  className = 'w-full h-full min-h-[420px]',
  theme = 'dark'
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const vehicleLayerRef = useRef<L.LayerGroup | null>(null);
  const geofenceLayersRef = useRef<L.LayerGroup | null>(null);
  const trackLayerRef = useRef<L.LayerGroup | null>(null);
  const heatmapLayerRef = useRef<L.LayerGroup | null>(null);

  const [currentBaseMap, setCurrentBaseMap] = useState<'amap' | 'dark' | 'light' | 'satellite'>(theme === 'dark' ? 'dark' : 'amap');
  const [showLayerMenu, setShowLayerMenu] = useState(false);
  const [showCachePanel, setShowCachePanel] = useState(false);
  const [autoFollow, setAutoFollow] = useState(true);
  const [mapZoom, setMapZoom] = useState<number>(11);
  const [mapReady, setMapReady] = useState(false);
  const isInitialFitDone = useRef(false);

  // Cache stats & preloading state
  const [cacheStats, setCacheStats] = useState<{ count: number; estimatedSizeBytes: number }>({ count: 0, estimatedSizeBytes: 0 });
  const [isPreloading, setIsPreloading] = useState(false);
  const [preloadProgress, setPreloadProgress] = useState<{ loaded: number; total: number }>({ loaded: 0, total: 0 });
  const [cacheEnabled, setCacheEnabled] = useState(true);

  // Refresh cache statistics
  const refreshCacheStats = useCallback(async () => {
    try {
      const stats = await mapTileCache.getStats();
      setCacheStats(stats);
    } catch {}
  }, []);

  useEffect(() => {
    refreshCacheStats();
    const interval = setInterval(refreshCacheStats, 10000);
    return () => clearInterval(interval);
  }, [refreshCacheStats]);

  // Pre-cache tiles in current map bounds
  const handlePreloadCurrentView = async () => {
    const map = mapInstanceRef.current;
    if (!map || isPreloading) return;

    setIsPreloading(true);
    setPreloadProgress({ loaded: 0, total: 1 });

    try {
      const b = map.getBounds();
      const currentZ = map.getZoom();
      const targetZooms = [Math.max(4, currentZ - 1), currentZ, Math.min(16, currentZ + 1)];
      const tileConfig = TILE_PROVIDERS[currentBaseMap];

      await mapTileCache.preloadAreaTiles(
        {
          north: b.getNorth(),
          south: b.getSouth(),
          east: b.getEast(),
          west: b.getWest(),
        },
        targetZooms,
        tileConfig.url,
        tileConfig.subdomains || '1234',
        (loaded, total) => {
          setPreloadProgress({ loaded, total });
        }
      );

      await refreshCacheStats();
    } catch (err) {
      console.warn('Preload failed:', err);
    } finally {
      setIsPreloading(false);
    }
  };

  // Clear cache
  const handleClearCache = async () => {
    await mapTileCache.clearCache();
    await refreshCacheStats();
  };

  // Helper to create HTML icon for vehicles with smooth heading rotator
  const createVehicleIcon = useCallback((vehicle: Vehicle, isSelected: boolean, zoom: number) => {
    let statusBg = '#10B981'; // emerald
    let isAlarm = false;

    if (vehicle.status === 'alarm') {
      statusBg = '#EF4444'; // red
      isAlarm = true;
    } else if (vehicle.status === 'in_task') {
      statusBg = '#2563EB'; // blue
    } else if (vehicle.status === 'parking') {
      statusBg = '#F59E0B'; // amber
    } else if (vehicle.status === 'offline') {
      statusBg = '#64748B'; // slate
    }

    const heading = vehicle.telemetry?.heading || 0;
    const speed = vehicle.telemetry?.speed || 0;
    const showDetails = zoom >= 8 || isSelected || isAlarm;

    const html = showDetails ? `
      <div class="custom-vehicle-marker-container" style="
        position: relative; 
        width: 130px; 
        display: flex; 
        flex-direction: column; 
        align-items: center; 
        user-select: none; 
        cursor: pointer; 
        transform: ${isSelected ? 'scale(1.22)' : 'scale(1)'}; 
        transition: transform 0.3s cubic-bezier(0.2, 1, 0.3, 1); 
        z-index: ${isSelected ? 50 : 10};
      ">
        <!-- Top Plate & Speed Label Banner -->
        <div style="
          background: #0f172a;
          color: #f8fafc;
          border: 1.5px solid ${isSelected ? '#38bdf8' : isAlarm ? '#ef4444' : '#334155'};
          padding: 2px 6px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 700;
          white-space: nowrap;
          box-shadow: 0 4px 12px rgba(0,0,0,0.7);
          display: flex;
          align-items: center;
          gap: 4px;
          margin-bottom: 2px;
        ">
          <span style="width: 6px; height: 6px; border-radius: 50%; background: ${statusBg}; display: inline-block;"></span>
          <span style="font-family: monospace; letter-spacing: 0.5px;">${vehicle.plateNumber}</span>
          <span style="font-size: 10px; color: ${isAlarm ? '#f87171' : '#38bdf8'}; font-family: monospace; font-weight: bold;">${speed}km/h</span>
        </div>

        <!-- Vehicle Body & Heading Direction Rotator -->
        <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;">
          <!-- Outer Halo Ring -->
          <div style="
            position: absolute;
            inset: -3px;
            border-radius: 50%;
            background: ${statusBg};
            opacity: ${isAlarm ? '0.6' : '0.25'};
            filter: blur(1px);
          "></div>

          <!-- Rotating Vehicle Circle Body -->
          <div style="
            position: relative;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: ${statusBg};
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 10px rgba(0,0,0,0.5);
            border: 2px solid #ffffff;
            transform: rotate(${heading}deg);
            transform-origin: center center;
            transition: transform 0.4s ease-out;
          ">
            <!-- Forward Arrow Pointer at top 0 deg -->
            <div style="
              position: absolute;
              top: -5px;
              left: 50%;
              transform: translateX(-50%);
              width: 0;
              height: 0;
              border-left: 4px solid transparent;
              border-right: 4px solid transparent;
              border-bottom: 6px solid ${isAlarm ? '#fef08a' : '#ffffff'};
            "></div>

            <!-- Vehicle Icon SVG Glyph -->
            <svg style="width: 16px; height: 16px; color: #ffffff; fill: currentColor;" viewBox="0 0 24 24">
              <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
            </svg>
          </div>
        </div>

        <!-- Ground Pinpoint Anchor Indicator -->
        <div style="display: flex; flex-direction: column; align-items: center; margin-top: -2px;">
          <div style="
            width: 0;
            height: 0;
            border-left: 4px solid transparent;
            border-right: 4px solid transparent;
            border-top: 6px solid ${statusBg};
          "></div>
          <div style="
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: #ffffff;
            border: 2px solid ${statusBg};
            box-shadow: 0 2px 4px rgba(0,0,0,0.5);
          "></div>
        </div>

        <!-- Alarm High Priority Alert Float Badge -->
        ${isAlarm ? `
          <div style="
            position: absolute;
            top: -4px;
            right: 8px;
            width: 16px;
            height: 16px;
            background: #dc2626;
            color: #ffffff;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            font-weight: 900;
            border: 1.5px solid #ffffff;
            box-shadow: 0 2px 6px rgba(0,0,0,0.4);
          ">!</div>
        ` : ''}
      </div>
    ` : `
      <div style="position: relative; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; transform: rotate(${heading}deg); z-index: 10;">
        <div style="position: absolute; inset: -2px; border-radius: 50%; background: ${statusBg}; opacity: 0.4;"></div>
        <div style="width: 26px; height: 26px; border-radius: 50%; background: ${statusBg}; display: flex; align-items: center; justify-content: center; border: 2px solid #ffffff; box-shadow: 0 2px 6px rgba(0,0,0,0.4);">
          <svg style="width: 12px; height: 12px; color: #ffffff; fill: currentColor;" viewBox="0 0 24 24">
            <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
          </svg>
        </div>
      </div>
    `;

    return L.divIcon({
      html,
      className: 'custom-vehicle-marker-wrapper',
      iconSize: showDetails ? [130, 72] : [28, 28],
      iconAnchor: showDetails ? [65, 68] : [14, 14],
    });
  }, []);

  // Sync markers function with smooth positional updates
  const syncMarkers = useCallback((map: L.Map, layer: L.LayerGroup, vehicleList: Vehicle[]) => {
    const activeIds = new Set<string>();
    const currentZoom = map.getZoom();

    vehicleList.forEach((vehicle) => {
      const lat = vehicle.telemetry?.latitude;
      const lng = vehicle.telemetry?.longitude;
      if (!lat || !lng) return;

      activeIds.add(vehicle.id);
      const isSelected = selectedVehicleId === vehicle.id;
      const icon = createVehicleIcon(vehicle, isSelected, currentZoom);

      const tooltipContent = `
        <div style="font-size: 12px; line-height: 1.4; min-width: 160px;">
          <div style="font-weight: bold; color: #38bdf8; font-size: 13px;">${vehicle.plateNumber}</div>
          <div style="color: #94a3b8; font-size: 11px;">${vehicle.brand} ${vehicle.model} · ${vehicle.fleetName}</div>
          <div style="margin-top: 4px; display: flex; align-items: center; gap: 6px;">
            <span style="font-size: 11px;">状态: <b>${
              vehicle.status === 'alarm' ? '🚨 紧急报警' :
              vehicle.status === 'in_task' ? '🔵 任务在途' :
              vehicle.status === 'parking' ? '🟡 停泊怠速' : '🟢 正常行驶'
            }</b></span>
          </div>
          <div style="font-size: 11px;">驾驶员: <b>${vehicle.assignedDriverName || '未指定'}</b> | 时速: <b style="color: #38bdf8;">${vehicle.telemetry?.speed || 0} km/h</b></div>
          <div style="font-size: 10px; color: #64748b; margin-top: 2px;">${vehicle.address || ''}</div>
        </div>
      `;

      let marker = markersRef.current.get(vehicle.id);
      if (!marker || !layer.hasLayer(marker)) {
        marker = L.marker([lat, lng], {
          icon,
          zIndexOffset: isSelected ? 1500 : 200,
        });

        marker.bindTooltip(tooltipContent, {
          direction: 'top',
          offset: [0, -32],
          opacity: 0.95,
        });

        marker.on('click', () => {
          if (onSelectVehicle) {
            onSelectVehicle(vehicle);
          }
        });

        marker.addTo(layer);
        markersRef.current.set(vehicle.id, marker);
      } else {
        marker.setLatLng([lat, lng]);
        marker.setIcon(icon);
        marker.setZIndexOffset(isSelected ? 1500 : 200);
        marker.setTooltipContent(tooltipContent);
      }

      if (isSelected) {
        marker.openTooltip();
      }
    });

    // Clean up markers no longer present
    markersRef.current.forEach((marker, id) => {
      if (!activeIds.has(id)) {
        if (layer.hasLayer(marker)) {
          layer.removeLayer(marker);
        }
        markersRef.current.delete(id);
      }
    });
  }, [selectedVehicleId, createVehicleIcon, onSelectVehicle, mapZoom]);

  // Initial Map Mount with CachedTileLayer
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const initialCenter: [number, number] = [31.5, 114.0];
    const initialZoom = 11;

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: initialZoom,
      zoomControl: false,
      attributionControl: false,
    });

    map.on('zoomend', () => {
      setMapZoom(map.getZoom());
    });

    const tileConfig = TILE_PROVIDERS[currentBaseMap];
    const tileLayer = createCachedTileLayer(tileConfig.url, {
      maxZoom: 18,
      subdomains: tileConfig.subdomains || 'abc',
      errorTileUrl: FALLBACK_ERROR_TILE,
    }).addTo(map);

    tileLayerRef.current = tileLayer;

    // Create persistent layer groups
    geofenceLayersRef.current = L.layerGroup().addTo(map);
    trackLayerRef.current = L.layerGroup().addTo(map);
    heatmapLayerRef.current = L.layerGroup().addTo(map);
    const vehicleLayer = L.layerGroup().addTo(map);
    vehicleLayerRef.current = vehicleLayer;

    mapInstanceRef.current = map;
    setMapReady(true);

    // Initial markers population
    markersRef.current.clear();
    syncMarkers(map, vehicleLayer, vehicles);

    // Auto fit vehicle bounds
    if (vehicles.length > 0) {
      const validPoints = vehicles
        .filter((v) => v.telemetry?.latitude && v.telemetry?.longitude)
        .map((v) => [v.telemetry.latitude, v.telemetry.longitude] as [number, number]);
      if (validPoints.length > 0) {
        map.fitBounds(L.latLngBounds(validPoints), { padding: [50, 50], maxZoom: 11 });
        isInitialFitDone.current = true;
      }
    }

    // Invalidate size on initial mount intervals
    const timers = [
      setTimeout(() => map.invalidateSize(), 50),
      setTimeout(() => map.invalidateSize(), 200),
      setTimeout(() => map.invalidateSize(), 600),
      setTimeout(() => map.invalidateSize(), 1200),
    ];

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && mapContainerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      });
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      timers.forEach(clearTimeout);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      markersRef.current.clear();
      map.remove();
      mapInstanceRef.current = null;
      setMapReady(false);
      isInitialFitDone.current = false;
    };
  }, []);

  // Update Base Map Tile with Cached Tile Layer
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }
    const tileConfig = TILE_PROVIDERS[currentBaseMap];
    tileLayerRef.current = createCachedTileLayer(tileConfig.url, {
      maxZoom: 18,
      subdomains: tileConfig.subdomains || 'abc',
      errorTileUrl: FALLBACK_ERROR_TILE,
    }).addTo(map);
  }, [currentBaseMap]);

  // Reactive Sync of Vehicle Markers on vehicles change or selection change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layer = vehicleLayerRef.current;
    if (!map || !layer || !mapReady) return;

    syncMarkers(map, layer, vehicles);

    // Initial fit once when vehicles become available
    if (!isInitialFitDone.current && vehicles.length > 0) {
      const validPoints = vehicles
        .filter((v) => v.telemetry?.latitude && v.telemetry?.longitude)
        .map((v) => [v.telemetry.latitude, v.telemetry.longitude] as [number, number]);
      if (validPoints.length > 0) {
        map.fitBounds(L.latLngBounds(validPoints), { padding: [50, 50], maxZoom: 11 });
        isInitialFitDone.current = true;
      }
    }
  }, [vehicles, selectedVehicleId, mapReady, syncMarkers]);

  // Smooth LERP camera tracking with requestAnimationFrame for selected vehicle
  const animFrameRef = useRef<number | null>(null);
  const targetPosRef = useRef<{ lat: number; lng: number } | null>(null);

  // Initial jump on selection change, then track via LERP
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedVehicleId || !autoFollow) {
      targetPosRef.current = null;
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      return;
    }

    const targetVehicle = vehicles.find((v) => v.id === selectedVehicleId);
    if (targetVehicle && targetVehicle.telemetry?.latitude && targetVehicle.telemetry?.longitude) {
      const lat = targetVehicle.telemetry.latitude;
      const lng = targetVehicle.telemetry.longitude;
      
      targetPosRef.current = { lat, lng };

      // Initial jump when selecting a new vehicle
      const currentZoom = Math.max(map.getZoom(), 12);
      map.setView([lat, lng], currentZoom, { animate: false });

      const marker = markersRef.current.get(selectedVehicleId);
      if (marker && !marker.isTooltipOpen()) {
        marker.openTooltip();
      }
    }
  }, [selectedVehicleId, autoFollow]);

  // Update target coordinates when vehicle telemetry updates
  useEffect(() => {
    if (!selectedVehicleId || !autoFollow) return;
    const targetVehicle = vehicles.find((v) => v.id === selectedVehicleId);
    if (targetVehicle && targetVehicle.telemetry?.latitude && targetVehicle.telemetry?.longitude) {
      targetPosRef.current = {
        lat: targetVehicle.telemetry.latitude,
        lng: targetVehicle.telemetry.longitude,
      };
    }
  }, [vehicles, selectedVehicleId, autoFollow]);

  // LERP camera tracking loop using requestAnimationFrame (60 FPS buttery smooth camera glide)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedVehicleId || !autoFollow) return;

    let isRunning = true;
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const followLoop = () => {
      if (!isRunning) return;
      const target = targetPosRef.current;
      const activeMap = mapInstanceRef.current;
      
      if (target && activeMap) {
        const center = activeMap.getCenter();
        const curLat = center.lat;
        const curLng = center.lng;

        // Smooth damping factor (0.12 ensures fluid interpolation without lag or jitter)
        const newLat = lerp(curLat, target.lat, 0.12);
        const newLng = lerp(curLng, target.lng, 0.12);

        if (Math.abs(newLat - curLat) > 0.0000005 || Math.abs(newLng - curLng) > 0.0000005) {
          activeMap.panTo([newLat, newLng], { animate: false });
        }
      }
      animFrameRef.current = requestAnimationFrame(followLoop);
    };

    animFrameRef.current = requestAnimationFrame(followLoop);

    return () => {
      isRunning = false;
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
    };
  }, [selectedVehicleId, autoFollow]);

  // Fit all vehicles
  const handleFitAllVehicles = () => {
    const map = mapInstanceRef.current;
    if (!map || vehicles.length === 0) return;
    const validPoints = vehicles
      .filter((v) => v.telemetry?.latitude && v.telemetry?.longitude)
      .map((v) => [v.telemetry.latitude, v.telemetry.longitude] as [number, number]);
    if (validPoints.length > 0) {
      map.fitBounds(L.latLngBounds(validPoints), { padding: [50, 50], maxZoom: 12 });
    }
  };

  const handleJumpToRegion = (center: [number, number], zoom: number) => {
    const map = mapInstanceRef.current;
    if (!map) return;
    map.flyTo(center, zoom, { duration: 1.0 });
  };

  // Render Geofences
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = geofenceLayersRef.current;
    if (!map || !group || !mapReady) return;

    group.clearLayers();

    geofences.forEach((fence) => {
      if (fence.status !== 'active') return;

      if (fence.type === 'circle' && fence.centerCoord && fence.radiusMeter) {
        const circle = L.circle([fence.centerCoord[1], fence.centerCoord[0]], {
          radius: fence.radiusMeter,
          color: fence.color,
          fillColor: fence.color,
          fillOpacity: 0.15,
          weight: 2,
          dashArray: fence.category === '禁行限行区' ? '6, 6' : undefined,
        });
        circle.bindTooltip(`<b>${fence.name}</b> (${fence.category})`, { sticky: true });
        circle.addTo(group);
      } else if (fence.coordinates && fence.coordinates.length > 2) {
        const latLngs = fence.coordinates.map((c) => [c[1], c[0]] as [number, number]);
        const polygon = L.polygon(latLngs, {
          color: fence.color,
          fillColor: fence.color,
          fillOpacity: 0.18,
          weight: 2,
          dashArray: fence.category === '禁行限行区' ? '6, 6' : undefined,
        });
        polygon.bindTooltip(`<b>${fence.name}</b> (${fence.category})`, { sticky: true });
        polygon.addTo(group);
      }
    });
  }, [geofences, mapReady]);

  // Render Active Track Playback Line strictly along road curves
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = trackLayerRef.current;
    if (!map || !group || !mapReady) return;

    group.clearLayers();

    if (activeTrack && activeTrack.length > 0) {
      const latLngs = activeTrack.map((p) => [p.latitude, p.longitude] as [number, number]);

      // Outer glow polyline
      L.polyline(latLngs, {
        color: '#0284c7',
        weight: 6,
        opacity: 0.35,
      }).addTo(group);

      // Inner road trajectory line
      L.polyline(latLngs, {
        color: '#38bdf8',
        weight: 3.5,
        opacity: 0.95,
        dashArray: '8, 4',
      }).addTo(group);

      const start = activeTrack[0];
      const end = activeTrack[activeTrack.length - 1];

      const startIcon = L.divIcon({
        html: `<div style="width: 26px; height: 26px; border-radius: 50%; background: #10b981; color: white; font-weight: bold; font-size: 11px; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.5);">起</div>`,
        className: 'start-marker',
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      });
      L.marker([start.latitude, start.longitude], { icon: startIcon })
        .bindTooltip(`<b>起点:</b> ${start.address || '始发货运场站'}`, { direction: 'top' })
        .addTo(group);

      const endIcon = L.divIcon({
        html: `<div style="width: 26px; height: 26px; border-radius: 50%; background: #ef4444; color: white; font-weight: bold; font-size: 11px; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.5);">终</div>`,
        className: 'end-marker',
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      });
      L.marker([end.latitude, end.longitude], { icon: endIcon })
        .bindTooltip(`<b>终点:</b> ${end.address || '目的物流园区'}`, { direction: 'top' })
        .addTo(group);

      // Map fit bounds to show full road track smoothly
      map.fitBounds(L.latLngBounds(latLngs), { padding: [50, 50] });
    }
  }, [activeTrack, mapReady]);

  // Render Risk Heatmap Zones
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = heatmapLayerRef.current;
    if (!map || !group || !mapReady) return;

    group.clearLayers();

    if (showRiskHeatmap) {
      const riskZones = [
        { center: [22.56, 114.08] as [number, number], radius: 4500, label: 'G15沈海高速急刹频发路段', level: '高风险' },
        { center: [31.24, 121.49] as [number, number], radius: 3800, label: '延安高架早晚高峰易超速段', level: '中风险' },
        { center: [39.92, 116.42] as [number, number], radius: 5200, label: '京沪高速进京检查站拥堵减速区', level: '预警区' },
      ];

      riskZones.forEach((z) => {
        const circle = L.circle(z.center, {
          radius: z.radius,
          color: z.level === '高风险' ? '#EF4444' : '#F59E0B',
          fillColor: z.level === '高风险' ? '#EF4444' : '#F59E0B',
          fillOpacity: 0.25,
          weight: 1.5,
        });
        circle.bindTooltip(`⚠️ ${z.label} (${z.level})`, { sticky: true });
        circle.addTo(group);
      });
    }
  }, [showRiskHeatmap, mapReady]);

  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId);
  const cacheSizeMb = (cacheStats.estimatedSizeBytes / (1024 * 1024)).toFixed(1);

  return (
    <div className={`relative ${className} overflow-hidden rounded-xl bg-[#090d16] isolate z-0`}>
      {/* Map DOM Canvas Element */}
      <div ref={mapContainerRef} className="w-full h-full min-h-[380px]" style={{ zIndex: 1 }} />

      {/* Top Left Fleet Quick Telemetry Badge */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
        <div className="bg-slate-900/95 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-700/80 shadow-2xl flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-sky-400 font-bold uppercase tracking-wider">
                BEIDOU FLEET RADAR
              </span>
              <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                路网实时追踪
              </span>
            </div>
            <p className="text-xs font-bold text-white flex items-center gap-2 mt-0.5">
              <span>在图车辆: <b className="text-sky-400 font-mono">{vehicles.length}</b> 辆</span>
              <span className="text-slate-600">|</span>
              <span>在线: <b className="text-emerald-400 font-mono">{vehicles.filter(v => v.status !== 'offline').length}</b></span>
            </p>
          </div>
        </div>
      </div>

      {/* Top Center Regional Quick Jump Chips */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 hidden md:flex items-center gap-1 bg-slate-900/90 backdrop-blur-md px-2 py-1 rounded-full border border-slate-700/80 shadow-xl text-xs">
        <button
          onClick={handleFitAllVehicles}
          className="px-2.5 py-1 rounded-full bg-sky-600/40 text-sky-300 hover:bg-sky-600 hover:text-white transition font-medium text-[11px] flex items-center gap-1"
        >
          <Compass className="w-3 h-3" />
          <span>全网全景</span>
        </button>
        <button
          onClick={() => handleJumpToRegion([22.65, 114.15], 11)}
          className="px-2 py-0.5 rounded-full text-slate-300 hover:bg-slate-800 hover:text-white transition text-[11px]"
        >
          粤港澳干线
        </button>
        <button
          onClick={() => handleJumpToRegion([31.25, 121.3], 10)}
          className="px-2 py-0.5 rounded-full text-slate-300 hover:bg-slate-800 hover:text-white transition text-[11px]"
        >
          沪苏大动脉
        </button>
        <button
          onClick={() => handleJumpToRegion([39.75, 116.6], 10)}
          className="px-2 py-0.5 rounded-full text-slate-300 hover:bg-slate-800 hover:text-white transition text-[11px]"
        >
          京津冀专线
        </button>
        <button
          onClick={() => handleJumpToRegion([30.55, 104.1], 11)}
          className="px-2 py-0.5 rounded-full text-slate-300 hover:bg-slate-800 hover:text-white transition text-[11px]"
        >
          成渝干线
        </button>
      </div>

      {/* Top Right Controls: Cache Manager, Layers & Follow */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        {/* Local Map Tile Cache Popover Toggle */}
        <div className="relative">
          <button
            id="btn-toggle-map-cache"
            onClick={() => setShowCachePanel(!showCachePanel)}
            title="地图本地离线瓦片缓存管理"
            className={`px-2.5 py-1.5 rounded-xl border backdrop-blur-md shadow-lg transition text-xs flex items-center gap-1.5 ${
              showCachePanel
                ? 'bg-emerald-600 text-white border-emerald-500'
                : 'bg-slate-900/90 border-slate-700/80 text-emerald-300 hover:bg-slate-800'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline font-mono font-medium">缓存: {cacheStats.count} 瓦片</span>
          </button>

          {/* Cache Control Modal / Card */}
          {showCachePanel && (
            <div className="absolute right-0 top-12 w-72 bg-slate-900/95 border border-emerald-500/40 rounded-2xl shadow-2xl p-3.5 z-30 space-y-3 backdrop-blur-md text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-1.5 font-bold text-white">
                  <Database className="w-4 h-4 text-emerald-400" />
                  <span>本地地图瓦片缓存引擎</span>
                </div>
                <button
                  onClick={() => setShowCachePanel(false)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              {/* Cache status metrics */}
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-slate-800/70 p-2 rounded-lg border border-slate-700/60">
                  <span className="text-[10px] text-slate-400 block">已存离线瓦片</span>
                  <span className="font-bold text-emerald-400 font-mono text-sm">{cacheStats.count} 张</span>
                </div>
                <div className="bg-slate-800/70 p-2 rounded-lg border border-slate-700/60">
                  <span className="text-[10px] text-slate-400 block">占用本地空间</span>
                  <span className="font-bold text-sky-400 font-mono text-sm">{cacheSizeMb} MB</span>
                </div>
              </div>

              {/* Preload Progress Indicator */}
              {isPreloading && (
                <div className="bg-slate-800/80 p-2 rounded-lg border border-sky-500/40 space-y-1.5">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-sky-300 flex items-center gap-1">
                      <RefreshCw className="w-3 h-3 animate-spin text-sky-400" />
                      正在预下载当前可视区切片...
                    </span>
                    <span className="font-mono text-sky-300 font-bold">
                      {preloadProgress.loaded}/{preloadProgress.total}
                    </span>
                  </div>
                  <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-sky-500 h-full transition-all duration-200"
                      style={{
                        width: `${preloadProgress.total ? (preloadProgress.loaded / preloadProgress.total) * 100 : 0}%`,
                      }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-1.5 pt-1">
                <button
                  disabled={isPreloading}
                  onClick={handlePreloadCurrentView}
                  className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium flex items-center justify-center gap-1.5 transition shadow"
                >
                  <DownloadCloud className="w-3.5 h-3.5" />
                  <span>预缓存当前区域 (支持离线浏览)</span>
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const next = !cacheEnabled;
                      setCacheEnabled(next);
                      mapTileCache.setEnabled(next);
                    }}
                    className={`flex-1 py-1.5 rounded-lg border text-[11px] font-medium transition ${
                      cacheEnabled
                        ? 'bg-slate-800 border-slate-700 text-slate-300'
                        : 'bg-amber-950/60 border-amber-800 text-amber-300'
                    }`}
                  >
                    {cacheEnabled ? '加速状态: 已开启' : '已暂停缓存'}
                  </button>

                  <button
                    onClick={handleClearCache}
                    className="py-1.5 px-3 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 text-rose-300 transition flex items-center gap-1 text-[11px]"
                    title="清理全部本地IndexedDB瓦片"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>清空</span>
                  </button>
                </div>
              </div>

              <div className="text-[10px] text-slate-400 bg-slate-950/50 p-2 rounded-lg border border-slate-800 flex items-start gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                <span>所有地图切片均由浏览器 IndexedDB 高性能持久化存储，弱网/断网时毫秒级秒开。</span>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={handleFitAllVehicles}
          title="自适应全部车辆视野"
          className="bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 p-2 rounded-xl backdrop-blur-md shadow-lg transition"
        >
          <Maximize2 className="w-4 h-4 text-sky-400" />
        </button>

        <button
          onClick={() => setAutoFollow(!autoFollow)}
          title={autoFollow ? '已开启选中车辆自动聚焦' : '自动聚焦已暂停'}
          className={`px-2.5 py-1.5 rounded-xl border backdrop-blur-md shadow-lg transition text-xs flex items-center gap-1.5 ${
            autoFollow
              ? 'bg-sky-600/30 border-sky-500/60 text-sky-300'
              : 'bg-slate-900/90 border-slate-700/80 text-slate-400'
          }`}
        >
          <Navigation className={`w-3.5 h-3.5 ${autoFollow ? 'text-sky-400 animate-pulse' : ''}`} />
          <span className="hidden sm:inline">{autoFollow ? '锁定跟随' : '自由漫游'}</span>
        </button>

        {/* Map Layers Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowLayerMenu(!showLayerMenu)}
            className="bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 p-2 rounded-xl backdrop-blur-md shadow-lg transition flex items-center gap-1.5 text-xs"
          >
            <Layers className="w-4 h-4 text-sky-400" />
            <span className="hidden sm:inline">{TILE_PROVIDERS[currentBaseMap].name}</span>
          </button>

          {showLayerMenu && (
            <div className="absolute right-0 top-12 w-44 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-30 space-y-1">
              <div className="text-[10px] text-slate-400 px-2 py-1 uppercase font-mono tracking-wider">
                选择底图图层
              </div>
              {(Object.keys(TILE_PROVIDERS) as (keyof typeof TILE_PROVIDERS)[]).map((key) => (
                <button
                  key={key}
                  onClick={() => {
                    setCurrentBaseMap(key);
                    setShowLayerMenu(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition flex items-center justify-between ${
                    currentBaseMap === key
                      ? 'bg-sky-600 text-white font-bold'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span>{TILE_PROVIDERS[key].name}</span>
                  {currentBaseMap === key && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Zoom Controls */}
        <div className="flex flex-col bg-slate-900/90 border border-slate-700/80 rounded-xl shadow-lg overflow-hidden">
          <button
            onClick={() => mapInstanceRef.current?.zoomIn()}
            className="p-1.5 hover:bg-slate-800 text-slate-200 border-b border-slate-700/80 transition"
            title="放大"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => mapInstanceRef.current?.zoomOut()}
            className="p-1.5 hover:bg-slate-800 text-slate-200 transition"
            title="缩小"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Optional Bottom Floating Card: Selected Vehicle Focus HUD */}
      {showFloatingHud && selectedVehicle && (
        <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-md z-20 bg-slate-900/95 border border-sky-500/50 rounded-2xl p-3.5 shadow-2xl backdrop-blur-md">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center text-white ${
                  selectedVehicle.status === 'alarm'
                    ? 'bg-rose-600 animate-pulse'
                    : selectedVehicle.status === 'in_task'
                    ? 'bg-blue-600'
                    : selectedVehicle.status === 'parking'
                    ? 'bg-amber-600'
                    : 'bg-emerald-600'
                }`}
              >
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-white text-sm font-mono">{selectedVehicle.plateNumber}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                      selectedVehicle.status === 'alarm'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : selectedVehicle.status === 'in_task'
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                        : selectedVehicle.status === 'parking'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    }`}
                  >
                    {selectedVehicle.status === 'alarm'
                      ? '🚨 报警中'
                      : selectedVehicle.status === 'in_task'
                      ? '🔵 任务在途'
                      : selectedVehicle.status === 'parking'
                      ? '🟡 停泊中'
                      : '🟢 正常运行'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                  <span>司机: {selectedVehicle.assignedDriverName || '未指定'}</span>
                  <span>·</span>
                  <span className="font-mono text-sky-300 font-bold">{selectedVehicle.telemetry?.speed || 0} km/h</span>
                  <span>·</span>
                  <span className="font-mono text-slate-400">∠{selectedVehicle.telemetry?.heading || 0}°</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onSelectVehicle && onSelectVehicle(selectedVehicle)}
              className="text-slate-400 hover:text-white text-xs p-1"
            >
              ✕
            </button>
          </div>

          <div className="text-[11px] text-slate-300 bg-slate-800/80 px-2.5 py-1.5 rounded-lg mt-2.5 flex items-center gap-1.5 border border-slate-700/50">
            <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span className="truncate">{selectedVehicle.address || '正在检索道路坐标...'}</span>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
            {onViewDetail && (
              <button
                onClick={() => onViewDetail(selectedVehicle)}
                className="py-1.5 px-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-medium transition text-center"
              >
                车辆详情
              </button>
            )}
            {onViewTrack && (
              <button
                onClick={() => onViewTrack(selectedVehicle)}
                className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 font-medium transition text-center"
              >
                历史轨迹
              </button>
            )}
            {onContactDriver && (
              <button
                onClick={() => onContactDriver(selectedVehicle)}
                className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 font-medium transition text-center"
              >
                呼叫司机
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
