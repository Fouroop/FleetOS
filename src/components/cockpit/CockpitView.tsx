import React, { useState } from 'react';
import { 
  Vehicle, 
  Driver, 
  TransportTask, 
  AlarmRecord, 
  FleetEvent, 
  Geofence 
} from '../../types';
import { GisMap } from '../common/GisMap';
import { 
  Truck, 
  Activity, 
  AlertTriangle, 
  Fuel, 
  Navigation, 
  Send, 
  ShieldAlert, 
  TrendingUp, 
  CheckCircle2, 
  Wrench, 
  UserCheck, 
  Sparkles,
  ArrowRight,
  Flame,
  Radio,
  Clock,
  Zap,
  Bot
} from 'lucide-react';

interface CockpitViewProps {
  vehicles: Vehicle[];
  drivers: Driver[];
  tasks: TransportTask[];
  alarms: AlarmRecord[];
  events?: FleetEvent[];
  geofences?: Geofence[];
  onSelectVehicle?: (vehicle: Vehicle) => void;
  onViewTrack?: (vehicle: Vehicle) => void;
  onViewDetail?: (vehicle: Vehicle) => void;
  onContactDriver?: (vehicle: Vehicle) => void;
  onSendTask?: (vehicle: Vehicle) => void;
  onNavigateTab?: (tab: string) => void;
  onNavigateToTab?: (tab: string) => void;
  onAskAi?: (question: string) => void;
  onSelectVehicleForTrack?: (vehicle: Vehicle) => void;
}

export const CockpitView: React.FC<CockpitViewProps> = ({
  vehicles,
  drivers,
  tasks,
  alarms,
  events = [],
  geofences = [],
  onSelectVehicle,
  onViewTrack,
  onViewDetail,
  onContactDriver,
  onSendTask,
  onNavigateTab,
  onNavigateToTab,
  onAskAi,
  onSelectVehicleForTrack,
}) => {
  const navigate = onNavigateToTab || onNavigateTab || (() => {});
  const [selectedVehId, setSelectedVehId] = useState<string | null>(null);

  // Computed KPIs
  const totalVehicles = vehicles.length;
  const onlineVehicles = vehicles.filter(v => v.status !== 'offline').length;
  const runningVehicles = vehicles.filter(v => v.status === 'running' || v.status === 'in_task').length;
  const parkingVehicles = vehicles.filter(v => v.status === 'parking').length;
  const offlineVehicles = vehicles.filter(v => v.status === 'offline').length;

  const totalTodayKm = vehicles.reduce((sum, v) => sum + v.todayMileageKm, 0);
  const totalTodayFuel = vehicles.reduce((sum, v) => sum + v.todayFuelLiters, 0);
  const activeTasksCount = tasks.filter(t => t.status === 'in_progress' || t.status === 'dispatched').length;
  const activeAlarms = alarms.filter(a => a.status === 'active' || a.status === 'pending');

  // Sorted high risk drivers
  const sortedDrivers = [...drivers].sort((a, b) => a.safetyScore - b.safetyScore);
  const highestRiskDriver = sortedDrivers[0];

  const handleTrack = onViewTrack || onSelectVehicleForTrack || (() => {});

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1920px] mx-auto text-slate-100 antialiased">
      {/* Top Banner / Executive Insight */}
      <div className="bg-gradient-to-r from-blue-900/20 via-slate-900 to-indigo-950/40 border border-blue-500/20 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl relative overflow-hidden">
        <div className="flex items-center gap-3.5 z-10">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-blue-400 font-mono">
                TELEMETRY RADAR ENGINE
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold uppercase">
                Live · 2.5s Sync
              </span>
            </div>
            <p className="text-sm font-semibold text-white mt-0.5">
              全网 {totalVehicles} 辆智能车辆已接入北斗三号/GPS高精双模定位，当前在网运行 {runningVehicles} 辆，安全健康度 99.4%
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 z-10 w-full md:w-auto">
          <button
            onClick={() => navigate('monitoring')}
            className="flex-1 md:flex-none px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-tight rounded-lg shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-1.5"
          >
            <span>全屏遥测大屏</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => navigate('dispatch')}
            className="flex-1 md:flex-none px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5 text-blue-400" />
            <span>智能排班</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left GIS Radar Surface (8 Cols) + Right Tactical AI & Incident Panels (4 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Map Surface (8 Cols) */}
        <div className="lg:col-span-8 bg-[#0F172A] border border-slate-800 rounded-2xl relative overflow-hidden shadow-2xl flex flex-col h-[650px]">
          {/* Map Surface HUD Header */}
          <div className="p-3.5 sm:p-4 bg-slate-900/95 border-b border-slate-800 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 z-10">
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center">
                <span className="w-3 h-3 rounded-full bg-blue-500 animate-ping absolute"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 relative"></span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-blue-400 font-mono tracking-widest uppercase">
                    GIS RADAR FLEET SURFACE
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    北斗实时回传 2.5s
                  </span>
                </div>
                <span className="text-xs sm:text-sm font-bold text-white tracking-wide">
                  全网智能车辆分布与实时轨迹研判 ({totalVehicles} 辆在册)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <div className="bg-slate-800/90 border border-slate-700 px-2.5 py-1 rounded-lg text-[11px] font-mono text-emerald-400 flex items-center gap-1.5 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-breathe-emerald"></span>
                <span>在线 {onlineVehicles} 辆</span>
              </div>
              {activeAlarms.length > 0 && (
                <div className="bg-rose-500/10 border border-rose-500/30 px-2.5 py-1 rounded-lg text-[11px] font-mono text-rose-400 flex items-center gap-1.5 shadow-sm animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  <span>报警 {activeAlarms.length} 辆</span>
                </div>
              )}
            </div>
          </div>

          {/* Interactive GisMap Container */}
          <div className="flex-1 relative w-full h-full min-h-[360px]">
            <GisMap
              vehicles={vehicles}
              selectedVehicleId={selectedVehId}
              onSelectVehicle={(v) => {
                setSelectedVehId(v ? v.id : null);
                if (v && onSelectVehicle) onSelectVehicle(v);
              }}
              onViewTrack={handleTrack}
              onViewDetail={onViewDetail}
              onContactDriver={onContactDriver}
              onSendTask={onSendTask}
              geofences={geofences}
              className="w-full h-full"
            />
          </div>

          {/* Bottom Live Vehicle Quick Locate Ticker */}
          <div className="bg-slate-900/95 border-t border-slate-800 px-3 py-2.5 z-10">
            <div className="flex items-center justify-between mb-1.5 text-[11px]">
              <span className="text-slate-400 font-mono flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-sky-400" />
                <span>实时车辆定位跟踪 (点击快速聚焦)</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                共 {vehicles.length} 个实时定位节点
              </span>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-700">
              {vehicles.map((v) => {
                const isSelected = selectedVehId === v.id;
                const isAlarm = v.status === 'alarm';
                const isRunning = v.status === 'running' || v.status === 'in_task';
                return (
                  <button
                    key={v.id}
                    onClick={() => {
                      setSelectedVehId(v.id);
                      if (onSelectVehicle) onSelectVehicle(v);
                    }}
                    className={`shrink-0 px-2.5 py-1.5 rounded-lg border text-left transition flex items-center gap-2 ${
                      isSelected
                        ? 'bg-sky-600/30 border-sky-400 text-white ring-1 ring-sky-400/50 shadow-md'
                        : isAlarm
                        ? 'bg-rose-950/40 border-rose-600/50 text-rose-200 hover:bg-rose-900/40'
                        : 'bg-slate-800/80 border-slate-700/70 text-slate-300 hover:bg-slate-700/80 hover:text-white'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        isAlarm
                          ? 'bg-rose-500 animate-ping'
                          : isRunning
                          ? 'bg-emerald-500 animate-breathe-emerald'
                          : v.status === 'parking'
                          ? 'bg-amber-400'
                          : 'bg-slate-500'
                      }`}
                    />
                    <div>
                      <div className="flex items-center gap-1.5 leading-none">
                        <span className="font-bold text-[11px] font-mono">{v.plateNumber}</span>
                        <span className="text-[9px] text-slate-400">{v.assignedDriverName || '待指派'}</span>
                      </div>
                      <div className="text-[9px] font-mono text-slate-400 mt-0.5 flex items-center gap-1">
                        <span className={v.telemetry.speed > 80 ? 'text-amber-400 font-bold' : 'text-sky-300'}>
                          {v.telemetry.speed} km/h
                        </span>
                        <span>·</span>
                        <span>∠{v.telemetry.heading}°</span>
                        <span className="hidden sm:inline text-slate-500">({v.telemetry.latitude.toFixed(2)}, {v.telemetry.longitude.toFixed(2)})</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Tactical Sidebar (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* AI Operational Steward Widget */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between relative overflow-hidden">
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-mono">AUTONOMOUS DISPATCH</span>
                    <span className="text-xs font-bold text-white uppercase tracking-tight">AI 车队管家 · 智能决策</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  AGENT ACTIVE
                </span>
              </div>

              {/* AI Operational Prompt Box */}
              <div className="bg-blue-500/5 border border-blue-500/20 p-3.5 rounded-xl">
                <p className="text-xs text-slate-300 leading-relaxed">
                  <span className="text-blue-400 font-semibold font-mono">Agent #4:</span> 建议优化华东干线 <span className="font-semibold text-white">沪A·88391</span> 路径，规避苏嘉杭高速拥堵，预计节省 <span className="text-emerald-400 font-bold">38分钟</span> 与燃油 <span className="text-emerald-400 font-bold">14L</span>。
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={() => onAskAi ? onAskAi('请帮我优化当前在途所有货车的路线并计算省油潜力') : navigate('ai_steward')}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold uppercase rounded-lg shadow-md shadow-blue-500/20 transition text-center"
                  >
                    一键采纳 AI 优化方案
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Agent Consult Pill */}
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span className="truncate">已接入 7 位行业专业智能体</span>
              <button
                onClick={() => navigate('ai_steward')}
                className="text-blue-400 hover:text-blue-300 font-semibold shrink-0 ml-2"
              >
                进入工作台 →
              </button>
            </div>
          </div>

          {/* Real-time Incident & Risk Leaderboard */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-orange-400" />
                <span className="text-xs font-bold text-white uppercase tracking-tight">安全预警与风险监控</span>
              </div>
              <button
                onClick={() => navigate('alarms')}
                className="text-[11px] text-blue-400 hover:text-blue-300 font-medium"
              >
                查看全部 ({alarms.length})
              </button>
            </div>

            {/* Incident Records */}
            <div className="space-y-2.5 my-3 flex-1 overflow-y-auto max-h-56 pr-1">
              {activeAlarms.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500 font-mono">
                  ALL UNITS SAFE · NO ACTIVE ALARMS
                </div>
              ) : (
                activeAlarms.slice(0, 3).map(a => (
                  <div
                    key={a.id}
                    onClick={() => {
                      const veh = vehicles.find(v => v.id === a.vehicleId);
                      if (veh) setSelectedVehId(veh.id);
                    }}
                    className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 hover:border-slate-700 cursor-pointer transition text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${a.severity === 'critical' ? 'bg-red-500 animate-pulse' : 'bg-orange-400'}`}></span>
                        {a.plateNumber}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">{a.timestamp}</span>
                    </div>
                    <p className="text-orange-400 font-medium mt-1">{a.title}</p>
                    <p className="text-slate-400 text-[11px] mt-0.5 line-clamp-1">{a.description}</p>
                  </div>
                ))
              )}
            </div>

            {/* Driver Risk Index Micro Bar */}
            <div className="pt-3 border-t border-slate-800">
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                <span>最高风险驾驶员</span>
                <span className="font-bold text-orange-400">
                  {highestRiskDriver ? `${highestRiskDriver.name} (${highestRiskDriver.safetyScore}分)` : '暂无'}
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-orange-500 h-1.5 rounded-full" 
                  style={{ width: `${highestRiskDriver ? (100 - highestRiskDriver.safetyScore) : 20}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom 4-Card Tactical Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Today Active Fleet Mileage */}
        <div className="bg-slate-800/40 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">今日在途总里程</span>
            <Navigation className="w-4 h-4 text-blue-400" />
          </div>
          <div className="my-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-mono">
                {Math.round(totalTodayKm).toLocaleString()}
              </span>
              <span className="text-xs text-slate-400 font-mono">KM</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+12.4% 比昨日同期</span>
            </div>
          </div>
          <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-800/80 flex justify-between">
            <span>单车均程: {Math.round(totalTodayKm / (totalVehicles || 1))} km</span>
            <span className="text-blue-400 cursor-pointer" onClick={() => navigate('tracks')}>轨迹研判 →</span>
          </div>
        </div>

        {/* Card 2: Real-time Fuel & Energy */}
        <div className="bg-slate-800/40 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">燃油与能耗总览</span>
            <Fuel className="w-4 h-4 text-orange-400" />
          </div>
          <div className="my-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-mono">
                {Math.round(totalTodayFuel).toLocaleString()}
              </span>
              <span className="text-xs text-slate-400 font-mono">L</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-blue-400 font-medium mt-1">
              <span>百公里均耗: 30.8 L (¥1.42/km)</span>
            </div>
          </div>
          <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-800/80 flex justify-between">
            <span>异常偷漏油检测: 0 起</span>
            <span className="text-blue-400 cursor-pointer" onClick={() => navigate('fuel')}>能效管理 →</span>
          </div>
        </div>

        {/* Card 3: Active Dispatch Tasks */}
        <div className="bg-slate-800/40 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">在途调度任务</span>
            <Send className="w-4 h-4 text-blue-400" />
          </div>
          <div className="my-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-mono">
                {activeTasksCount}
              </span>
              <span className="text-xs text-slate-400 font-mono">/ {tasks.length} 单</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium mt-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>准时交付履约率 96.8%</span>
            </div>
          </div>
          <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-800/80 flex justify-between">
            <span>智能推荐可用运力: 4 辆</span>
            <span className="text-blue-400 cursor-pointer" onClick={() => navigate('dispatch')}>派发任务 →</span>
          </div>
        </div>

        {/* Card 4: Safety & Predictive Maintenance */}
        <div className="bg-slate-800/40 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">预测性维保与健康</span>
            <Wrench className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="my-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-mono">
                99.2
              </span>
              <span className="text-xs text-slate-400 font-mono">分</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-orange-400 font-medium mt-1">
              <span>2 辆车临界维保 (≤1,500km)</span>
            </div>
          </div>
          <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-800/80 flex justify-between">
            <span>机油/刹车片预警: 正常</span>
            <span className="text-blue-400 cursor-pointer" onClick={() => navigate('maintenance')}>维保档案 →</span>
          </div>
        </div>
      </div>
    </div>
  );
};
