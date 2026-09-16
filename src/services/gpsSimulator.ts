import { telemetryGateway } from './telemetryGateway';
import { Vehicle } from '../types';
import { ROAD_CORRIDORS, densifyRoadCorridor } from './roadNetworkEngine';

interface InterpolationState {
  currentLat: number;
  currentLng: number;
  currentHeading: number;
  targetLat: number;
  targetLng: number;
  startLat: number;
  startLng: number;
  startHeading: number;
  targetHeading: number;
  progress: number; // 0 to 1
  duration: number; // duration in seconds for this segment
  lastUpdateTime: number;
}

class GpsSimulatorLerpEngine {
  private vehicleStates: Map<string, InterpolationState> = new Map();
  private subscribers: Set<(vehicles: Vehicle[]) => void> = new Set();
  private alarmSubscribers: Set<(alarm: any) => void> = new Set();
  private rawVehicles: Vehicle[] = [];
  private animationFrameId: any = null;
  private lastFrameTime: number = performance.now();

  constructor() {
    // Subscribe to raw updates from telemetryGateway
    telemetryGateway.subscribeVehicles((vehicles) => {
      this.updateRawVehicles(vehicles);
    });

    telemetryGateway.subscribeAlarms((alarm) => {
      this.alarmSubscribers.forEach(fn => fn(alarm));
    });

    this.startAnimationLoop();
  }

  private updateRawVehicles(vehicles: Vehicle[]) {
    this.rawVehicles = vehicles;
    const now = performance.now();

    vehicles.forEach(v => {
      let state = this.vehicleStates.get(v.id);
      const lat = v.telemetry.latitude;
      const lng = v.telemetry.longitude;
      const heading = v.telemetry.heading || 0;

      if (!state) {
        // Initialize state
        state = {
          currentLat: lat,
          currentLng: lng,
          currentHeading: heading,
          targetLat: lat,
          targetLng: lng,
          startLat: lat,
          startLng: lng,
          startHeading: heading,
          targetHeading: heading,
          progress: 1.0,
          duration: 2.0,
          lastUpdateTime: now,
        };
        this.vehicleStates.set(v.id, state);
      } else {
        // Calculate time elapsed since last target update to estimate actual update interval
        const intervalSec = Math.max(1.0, (now - state.lastUpdateTime) / 1000);

        // New target received from telemetry gateway -> start continuous LERP transition
        state.startLat = state.currentLat;
        state.startLng = state.currentLng;
        state.startHeading = state.currentHeading;
        state.targetLat = lat;
        state.targetLng = lng;
        state.targetHeading = heading;
        state.progress = 0.0; // Reset progress for smooth continuous interpolation
        state.duration = intervalSec > 0 ? intervalSec : 2.0;
        state.lastUpdateTime = now;
      }
    });
  }

  // Cache for densified OSM-style road network segments
  private densifiedSegments: { lat1: number; lng1: number; lat2: number; lng2: number }[] = [];

  private initOsmRoadNetwork() {
    if (this.densifiedSegments.length > 0) return;
    try {
      const corridors = Object.values(ROAD_CORRIDORS);
      for (const corridor of corridors) {
        // High density sampling (100 meters) to capture tight curves and freeway cloverleafs perfectly
        const { points } = densifyRoadCorridor(corridor, 0.1);
        for (let i = 0; i < points.length - 1; i++) {
          this.densifiedSegments.push({
            lat1: points[i].lat,
            lng1: points[i].lng,
            lat2: points[i + 1].lat,
            lng2: points[i + 1].lng
          });
        }
      }
    } catch (e) {
      console.error("Failed to initialize OSM road network snapping cache:", e);
    }
  }

  private snapToOsmRoadNetwork(lat: number, lng: number): { lat: number; lng: number } {
    this.initOsmRoadNetwork();

    if (this.densifiedSegments.length === 0) {
      return { lat, lng };
    }

    let minDistanceSq = Infinity;
    let snappedLat = lat;
    let snappedLng = lng;

    const px = lng;
    const py = lat;

    // Use a local approximation of cosine factor to scale longitude correctly relative to latitude
    const cosLat = Math.cos(lat * Math.PI / 180);

    for (let i = 0; i < this.densifiedSegments.length; i++) {
      const seg = this.densifiedSegments[i];
      const ax = seg.lng1;
      const ay = seg.lat1;
      const bx = seg.lng2;
      const by = seg.lat2;

      // Projection calculations
      const dx = (bx - ax) * cosLat;
      const dy = by - ay;
      const segmentLenSq = dx * dx + dy * dy;

      let u = 0;
      if (segmentLenSq > 0) {
        const dpx = (px - ax) * cosLat;
        const dpy = py - ay;
        u = (dpx * dx + dpy * dy) / segmentLenSq;
      }

      // Clamp projection to stay within segment AB
      u = Math.max(0, Math.min(1, u));

      // Coordinate of the snapped point
      const cx = ax + u * (bx - ax);
      const cy = ay + u * (by - ay);

      // Distance squared from P to snapped point
      const rx = (px - cx) * cosLat;
      const ry = py - cy;
      const distSq = rx * rx + ry * ry;

      if (distSq < minDistanceSq) {
        minDistanceSq = distSq;
        snappedLat = cy;
        snappedLng = cx;
      }
    }

    return { lat: snappedLat, lng: snappedLng };
  }

  private startAnimationLoop() {
    const animate = () => {
      const now = performance.now();
      const dt = (now - this.lastFrameTime) / 1000; // seconds
      this.lastFrameTime = now;

      // Update interpolation progress for each vehicle using continuous LERP and OSM road snap
      const interpolatedVehicles = this.rawVehicles.map(v => {
        const state = this.vehicleStates.get(v.id);
        if (!state) return v;

        // Advance progress smoothly over the exact segment duration matching telemetry interval
        if (state.progress < 1.0) {
          state.progress = Math.min(1.0, state.progress + dt / state.duration);
        }

        const t = state.progress;

        const rawLat = this.lerp(state.startLat, state.targetLat, t);
        const rawLng = this.lerp(state.startLng, state.targetLng, t);
        state.currentHeading = this.lerpAngle(state.startHeading, state.targetHeading, t);

        // Force lock / snap onto the nearest OSM road centerline to prevent drifts
        const snapped = this.snapToOsmRoadNetwork(rawLat, rawLng);
        state.currentLat = snapped.lat;
        state.currentLng = snapped.lng;

        return {
          ...v,
          telemetry: {
            ...v.telemetry,
            latitude: state.currentLat,
            longitude: state.currentLng,
            heading: state.currentHeading,
          }
        };
      });

      // Notify subscribers with smoothly interpolated vehicle positions at 60 FPS
      if (interpolatedVehicles.length > 0) {
        this.subscribers.forEach(fn => fn(interpolatedVehicles));
      }

      this.animationFrameId = requestAnimationFrame(animate);
    };

    this.animationFrameId = requestAnimationFrame(animate);
  }

  // --- Linear Interpolation (LERP) Math Functions ---
  private lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
  }

  private lerpAngle(a: number, b: number, t: number): number {
    let diff = (b - a) % 360;
    if (diff < -180) diff += 360;
    if (diff > 180) diff -= 360;
    return (a + diff * t + 360) % 360;
  }

  // --- Public API Methods (Backward Compatibility) ---
  public start() {
    telemetryGateway.start();
  }

  public stop() {
    telemetryGateway.stop();
  }

  public togglePlay(running?: boolean) {
    telemetryGateway.togglePlay(running);
  }

  public subscribe(fn: (vehicles: Vehicle[]) => void) {
    this.subscribers.add(fn);
    fn(this.rawVehicles);
    return () => {
      this.subscribers.delete(fn);
    };
  }

  public onAlarm(fn: (alarm: any) => void) {
    this.alarmSubscribers.add(fn);
    return () => {
      this.alarmSubscribers.delete(fn);
    };
  }

  public getVehicles(): Vehicle[] {
    return this.rawVehicles;
  }

  public setSimulationCount(count: number) {
    telemetryGateway.setVehicleCount(count);
  }

  public setSpeedMultiplier(mult: number) {
    telemetryGateway.setSpeedMultiplier(mult);
  }

  public triggerManualAlarm(id: string, type: any, title: string, desc: string) {
    telemetryGateway.triggerManualAlarm(id, type, title, desc);
  }
}

export const gpsSimulator = new GpsSimulatorLerpEngine();
