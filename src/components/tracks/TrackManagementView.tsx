import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Vehicle, GpsTrackPoint } from '../../types';
import { GisMap } from '../common/GisMap';
import { generateRealisticHistoricTrack, ROAD_CORRIDORS } from '../../services/roadNetworkEngine';
import { 
  Route, 
  Play, 
  Pause, 
  RotateCcw, 
  Gauge, 
  Clock, 
  AlertTriangle, 
  MapPin, 
  Calendar, 
  Truck, 
  Sparkles,
  Sliders,
  ChevronRight,
  ShieldCheck,
  Fuel,
  Compass,
  CheckCircle2,
  Layers,
  Database
} from 'lucide-react';

interface TrackManagementViewProps {
  vehicles: Vehicle[];
  initialVehicle?: Vehicle | null;
}

export const TrackManagementView: React.FC<TrackManagementViewProps> = ({
  vehicles,
  initialVehicle,
}) => {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(
    initialVehicle ? initialVehicle.id : vehicles[0]?.id || 'v-01'
  );
  const [dateRange, setDateRange] = useState('2026-08-20');
  const [selectedTrip, setSelectedTrip] = useState<'morning' | 'afternoon' | 'longhaul'>('morning');
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0); // 0 to 1 float for ultra-smooth 60fps movement
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(2);
  const [roadSnapping, setRoadSnapping] = useState<boolean>(true);

  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId) || vehicles[0];

  // Resolve appropriate road corridor based on vehicle plate
  const corridorKey = useMemo(() => {
    if (!selectedVehicle) return 'corridor-shenzhen';
    const p = selectedVehicle.plateNumber;
    if (p.startsWith('粤B')) return 'corridor-shenzhen';
    if (p.startsWith('沪A')) return 'corridor-shanghai-suzhou';
    if (p.startsWith('京C')) return 'corridor-beijing-tianjin';
    if (p.startsWith('苏E')) return 'corridor-suzhou-city';
    if (p.startsWith('浙A')) return 'corridor-hangzhou';
    if (p.startsWith('鲁B')) return 'corridor-qingdao';
    if (p.startsWith('川A')) return 'corridor-chengdu';
    if (p.startsWith('鄂A')) return 'corridor-wuhan';
    if (p.startsWith('陕A')) return 'corridor-xian';
    if (p.startsWith('闽D')) return 'corridor-xiamen';
    return 'corridor-shenzhen';
  }, [selectedVehicle]);

  // Generate dense, road-matched track data
  const fullTrack: GpsTrackPoint[] = useMemo(() => {
    const startTime = selectedTrip === 'morning' ? '08:15:00' : selectedTrip === 'afternoon' ? '14:00:00' : '05:30:00';
    return generateRealisticHistoricTrack(corridorKey, startTime, selectedVehicle?.plateNumber || '粤B·9821A');
  }, [corridorKey, selectedTrip, selectedVehicle]);

  const totalPoints = fullTrack.length;

  // Calculate current interpolated position & metrics along track
  const { currentPoint, currentLat, currentLng, currentHeading, currentSpeed } = useMemo(() => {
    if (totalPoints === 0) {
      return {
        currentPoint: { latitude: 22.5489, longitude: 114.0538, speed: 0, heading: 0, timestamp: '08:00:00', address: '深圳' },
        currentLat: 22.5489,
        currentLng: 114.0538,
        currentHeading: 0,
        currentSpeed: 0,
      };
    }

    const exactIndex = playbackProgress * (totalPoints - 1);
    const lowIndex = Math.floor(exactIndex);
    const highIndex = Math.min(totalPoints - 1, lowIndex + 1);
    const fraction = exactIndex - lowIndex;

    const p1 = fullTrack[lowIndex];
    const p2 = fullTrack[highIndex];

    const lat = p1.latitude + (p2.latitude - p1.latitude) * fraction;
    const lng = p1.longitude + (p2.longitude - p1.longitude) * fraction;
    const speed = Math.round(p1.speed + (p2.speed - p1.speed) * fraction);
    const heading = fraction < 0.5 ? p1.heading : p2.heading;

    return {
      currentPoint: p1,
      currentLat: +lat.toFixed(6),
      currentLng: +lng.toFixed(6),
      currentHeading: heading,
      currentSpeed: speed,
    };
  }, [playbackProgress, fullTrack, totalPoints]);

  // 60FPS Smooth animation loop
  useEffect(() => {
    if (!isPlaying) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      lastTimeRef.current = null;
      return;
    }

    const totalDurationSeconds = Math.max(15, totalPoints * 0.4); // total base animation time

    const animate = (time: number) => {
      if (lastTimeRef.current !== null) {
        const deltaSeconds = (time - lastTimeRef.current) / 1000;
        const progressIncrement = (deltaSeconds * playbackSpeed) / totalDurationSeconds;

        setPlaybackProgress((prev) => {
          const next = prev + progressIncrement;
          if (next >= 1) {
            setIsPlaying(false);
            return 1;
          }
          return next;
        });
      }
      lastTimeRef.current = time;
      if (isPlaying) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, playbackSpeed, totalPoints]);

  const handleReset = () => {
    setIsPlaying(false);
    setPlaybackProgress(0);
  };

  // Synthetic moving vehicle on the map
  const mockReplayVehicles: Vehicle[] = useMemo(() => [
    {
      ...selectedVehicle,
      telemetry: {
        ...selectedVehicle.telemetry,
        latitude: currentLat,
        longitude: currentLng,
        speed: currentSpeed,
        heading: currentHeading,
        lastUpdate: currentPoint.timestamp,
      }
    }
  ], [selectedVehicle, currentLat, currentLng, currentSpeed, currentHeading, currentPoint]);

  // Stats calculation
  const totalDistanceKm = (ROAD_CORRIDORS[corridorKey]?.totalLengthKm || 38.5);
  const maxSpeed = useMemo(() => Math.max(...fullTrack.map(p => p.speed)), [fullTrack]);
  const avgSpeed = useMemo(() => {
    const valid = fullTrack.filter(p => p.speed > 0);
    return valid.length ? Math.round(valid.reduce((a, b) => a + b.speed, 0) / valid.length) : 60;
  }, [fullTrack]);

  const keyEvents = useMemo(() => {
    return fullTrack.filter(p => p.isStopPoint || p.isAlarmPoint);
  }, [fullTrack]);

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-[1920px] mx-auto text-slate-100">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <Route className="w-5 h-5 text-sky-400" />
            <h1 className="font-bold text-lg text-white">高精度路网拟合轨迹回放与运行审计</h1>
            <span className="px-2 py-0.5 rounded-full text-[11px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 font-mono">
              <CheckCircle2 className="w-3 h-3" />
              已启用高精度路网纠偏
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            严密贴合全国高等级公路与城市高架路网拓扑，消除跳跃式坐标漂移，实现60FPS平滑行车仿真与事件追溯
          </p>
        </div>

        {/* Controls: Vehicle, Trip & Date Select */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            id="track-vehicle-select"
            value={selectedVehicleId}
            onChange={(e) => {
              setSelectedVehicleId(e.target.value);
              handleReset();
            }}
            className="bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-sky-500"
          >
            {vehicles.map(v => (
              <option key={v.id} value={v.id}>
                {v.plateNumber} · {v.brand} ({v.assignedDriverName || '未指定'})
              </option>
            ))}
          </select>

          <select
            value={selectedTrip}
            onChange={(e) => {
              setSelectedTrip(e.target.value as any);
              handleReset();
            }}
            className="bg-slate-800 border border-slate-700 text-sky-300 font-medium rounded-lg px-3 py-2 focus:outline-none focus:border-sky-500"
          >
            <option value="morning">早班趟次 (08:15 始发)</option>
            <option value="afternoon">午后趟次 (14:00 始发)</option>
            <option value="longhaul">夜间/跨城干线 (05:30 始发)</option>
          </select>

          <input
            type="date"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-sky-500 font-mono"
          />
        </div>
      </div>

      {/* Main Grid: GIS Map Track Replay + Metrics & Playback Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left GIS Track Map (8 Cols) */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-xl h-[590px] flex flex-col">
          <div className="flex-1 relative rounded-lg overflow-hidden border border-slate-800">
            <GisMap
              vehicles={mockReplayVehicles}
              selectedVehicleId={selectedVehicle.id}
              activeTrack={fullTrack}
              className="w-full h-full"
            />
          </div>

          {/* Replay Control Bar with 60fps Scrubber */}
          <div className="bg-slate-850 p-3 rounded-lg border border-slate-800 mt-3 flex flex-col sm:flex-row items-center gap-3 text-xs">
            {/* Play/Pause & Reset Buttons */}
            <div className="flex items-center gap-2">
              <button
                id="btn-play-pause-track"
                onClick={() => setIsPlaying(!isPlaying)}
                className={`p-2.5 rounded-lg font-bold transition shadow flex items-center gap-1.5 ${
                  isPlaying ? 'bg-amber-600 hover:bg-amber-500 text-white' : 'bg-sky-600 hover:bg-sky-500 text-white'
                }`}
                title={isPlaying ? '暂停回放' : '开始平滑回放'}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isPlaying ? '暂停' : '播放'}</span>
              </button>
              <button
                id="btn-reset-track"
                onClick={handleReset}
                className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                title="重置到起点"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Continuous Progress Scrubber */}
            <div className="flex-1 w-full flex items-center gap-2">
              <span className="text-[11px] text-sky-400 font-mono font-bold">{currentPoint.timestamp}</span>
              <input
                id="track-scrubber"
                type="range"
                min="0"
                max="1"
                step="0.001"
                value={playbackProgress}
                onChange={(e) => {
                  setPlaybackProgress(parseFloat(e.target.value));
                  if (isPlaying) setIsPlaying(false);
                }}
                className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500 hover:accent-sky-400"
              />
              <span className="text-[11px] text-slate-400 font-mono">{fullTrack[totalPoints - 1]?.timestamp}</span>
            </div>

            {/* Speed Multiplier & Road Snapping Toggle */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700">
                <span className="text-slate-400 text-[10px] pl-1 font-medium">倍速:</span>
                {[1, 2, 5, 10].map(s => (
                  <button
                    key={s}
                    onClick={() => setPlaybackSpeed(s)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition ${
                      playbackSpeed === s
                        ? 'bg-sky-600 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>

              <button
                onClick={() => setRoadSnapping(!roadSnapping)}
                className={`px-2.5 py-1.5 rounded-lg border text-[11px] flex items-center gap-1 transition ${
                  roadSnapping
                    ? 'bg-emerald-950/60 border-emerald-600/60 text-emerald-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
                title="开启后将原始GPS噪点卡尔曼纠偏至拓扑路网骨架"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>路网平滑</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Track Stats & Waypoint Events (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Trip Summary Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="font-bold text-xs text-white flex items-center gap-1.5">
                <Gauge className="w-4 h-4 text-sky-400" />
                <span>运行特征遥测审计 ({dateRange})</span>
              </h3>
              <span className="text-[11px] text-sky-400 font-mono">{selectedVehicle?.plateNumber}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/50">
                <span className="text-slate-400 block text-[10px]">路网全程里程</span>
                <span className="font-bold text-white text-base font-mono">{totalDistanceKm.toFixed(1)} km</span>
              </div>
              <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/50">
                <span className="text-slate-400 block text-[10px]">轨迹采集密级</span>
                <span className="font-bold text-emerald-400 text-base font-mono">{totalPoints} 节点</span>
              </div>
              <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/50">
                <span className="text-slate-400 block text-[10px]">平均运行车速</span>
                <span className="font-bold text-sky-400 text-base font-mono">{avgSpeed} km/h</span>
              </div>
              <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/50">
                <span className="text-slate-400 block text-[10px]">路段极值车速</span>
                <span className="font-bold text-amber-400 text-base font-mono">{maxSpeed} km/h</span>
              </div>
            </div>

            {/* Current Point Instant Stats & Real Road Address */}
            <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-[11px] flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-sky-400" />
                  当前时刻 / 航向:
                </span>
                <span className="font-bold text-sky-400 font-mono">{currentPoint.timestamp} · {currentHeading}°</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-[11px] flex items-center gap-1">
                  <Gauge className="w-3.5 h-3.5 text-emerald-400" />
                  瞬时时速:
                </span>
                <span className={`font-bold font-mono text-sm ${currentSpeed > 85 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {currentSpeed} km/h
                </span>
              </div>
              <div className="pt-1.5 border-t border-slate-800/80">
                <span className="text-slate-400 text-[10px] block">当前高精度路网匹配位置:</span>
                <div className="text-slate-200 text-[11px] font-medium mt-0.5 flex items-start gap-1">
                  <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                  <span>{currentPoint.address || '高等级货运通道'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Key Stops and Alarm Events on Track */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg flex-1 flex flex-col">
            <h3 className="font-bold text-xs text-white pb-2 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>沿途关键节点与风险事件 ({keyEvents.length})</span>
              </div>
              <span className="text-[10px] text-slate-500">点击直达点位</span>
            </h3>

            <div className="mt-3 space-y-2.5 flex-1 overflow-y-auto max-h-64 text-xs pr-1">
              {keyEvents.map((evt, idx) => {
                const isAlarm = evt.isAlarmPoint;
                const pointIdx = fullTrack.findIndex(p => p.timestamp === evt.timestamp);
                const progressTarget = pointIdx >= 0 ? pointIdx / (totalPoints - 1) : 0;

                return (
                  <div
                    key={idx}
                    onClick={() => {
                      setPlaybackProgress(progressTarget);
                      if (isPlaying) setIsPlaying(false);
                    }}
                    className={`p-2.5 rounded-lg border cursor-pointer transition hover:scale-[1.01] ${
                      isAlarm 
                        ? 'bg-rose-950/40 border-rose-800/60 hover:border-rose-500' 
                        : 'bg-slate-800/70 border-slate-700/60 hover:border-sky-500'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${isAlarm ? 'bg-rose-500 animate-ping' : 'bg-amber-400'}`}></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className={`font-bold truncate ${isAlarm ? 'text-rose-300' : 'text-slate-200'}`}>
                            {isAlarm ? evt.alarmText : `🅿️ 驻车停留 (${evt.stopDurationMinutes || 15}分钟)`}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono shrink-0">{evt.timestamp}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 truncate">{evt.address}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
