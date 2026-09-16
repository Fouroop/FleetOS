import React, { useState } from 'react';
import { Driver, Vehicle } from '../../types';
import { GisMap } from '../common/GisMap';
import { 
  Flame, 
  ShieldAlert, 
  AlertTriangle, 
  Eye, 
  TrendingDown, 
  Award, 
  Sparkles, 
  CheckCircle2, 
  PhoneCall,
  Activity,
  Layers
} from 'lucide-react';

interface SafetyManagementViewProps {
  drivers: Driver[];
  vehicles: Vehicle[];
  onSelectDriver: (driver: Driver) => void;
}

export const SafetyManagementView: React.FC<SafetyManagementViewProps> = ({
  drivers,
  vehicles,
  onSelectDriver,
}) => {
  const [showRiskHeatmap, setShowRiskHeatmap] = useState(true);

  // Group drivers by risk
  const highRiskDrivers = drivers.filter(d => d.riskLevel === 'high');
  const mediumRiskDrivers = drivers.filter(d => d.riskLevel === 'medium');
  const lowRiskDrivers = drivers.filter(d => d.riskLevel === 'low');

  // Aggregated behavior counters
  const totalHarshBrakes = drivers.reduce((sum, d) => sum + d.scoreBreakdown.harshBraking, 0);
  const totalHarshAccels = drivers.reduce((sum, d) => sum + d.scoreBreakdown.harshAcceleration, 0);
  const totalSpeedings = drivers.reduce((sum, d) => sum + d.scoreBreakdown.speedingCount, 0);
  const totalFatigues = drivers.reduce((sum, d) => sum + d.scoreBreakdown.fatigueCount, 0);

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-[1920px] mx-auto text-slate-100">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-rose-500" />
            <h1 className="font-bold text-lg text-white">主动安全防御与驾驶行为管控中心</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            融合 ADAS 前向主动安全 + DMS 驾驶员状态监测，构建人、车、路、企四位一体风控闭环
          </p>
        </div>

        <button
          onClick={() => setShowRiskHeatmap(!showRiskHeatmap)}
          className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition flex items-center gap-1.5 ${
            showRiskHeatmap
              ? 'bg-rose-600/20 text-rose-300 border-rose-500/50'
              : 'bg-slate-800 text-slate-400 border-slate-700'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>{showRiskHeatmap ? '隐藏高危路段热力' : '叠加高危路段热力'}</span>
        </button>
      </div>

      {/* Top 4 Safety Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow">
          <span className="text-slate-400 block text-[11px]">近30天急刹车频次</span>
          <div className="text-2xl font-black text-amber-400 mt-1">{totalHarshBrakes} <span className="text-xs font-normal text-slate-400">次</span></div>
          <span className="text-[10px] text-slate-400 mt-1 block">环比上月下降 12.5%</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow">
          <span className="text-slate-400 block text-[11px]">近30天急加速频次</span>
          <div className="text-2xl font-black text-sky-400 mt-1">{totalHarshAccels} <span className="text-xs font-normal text-slate-400">次</span></div>
          <span className="text-[10px] text-slate-400 mt-1 block">集中在早高峰出城段</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow">
          <span className="text-slate-400 block text-[11px]">超速预警触发</span>
          <div className="text-2xl font-black text-rose-500 mt-1">{totalSpeedings} <span className="text-xs font-normal text-slate-400">次</span></div>
          <span className="text-[10px] text-rose-400 mt-1 block">已自动下发语音提醒</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow">
          <span className="text-slate-400 block text-[11px]">DMS 疲劳/分神监测</span>
          <div className="text-2xl font-black text-purple-400 mt-1">{totalFatigues} <span className="text-xs font-normal text-slate-400">次</span></div>
          <span className="text-[10px] text-emerald-400 mt-1 block">强制进服务区 2 人次</span>
        </div>
      </div>

      {/* Main Grid: GIS Map Risk Heatmap + Risk Driver Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Map View with Risk Zones (8 Cols) */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-xl h-[560px] flex flex-col">
          <div className="flex-1 relative">
            <GisMap
              vehicles={vehicles}
              showRiskHeatmap={showRiskHeatmap}
              className="w-full h-full"
            />
          </div>
        </div>

        {/* Right Column: Driver Risk Ranking & Coaching (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg flex-1 flex flex-col">
            <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-800">
              <div className="flex items-center gap-1.5 font-bold text-xs text-white">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>驾驶员安全风险重点督导名单</span>
              </div>
            </div>

            <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[460px] pr-1 text-xs">
              {drivers.map(d => (
                <div
                  key={d.id}
                  onClick={() => onSelectDriver(d)}
                  className="bg-slate-800/70 hover:bg-slate-800 border border-slate-700/60 rounded-xl p-3 cursor-pointer transition space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-100">{d.name}</span>
                      <span className="text-[10px] text-slate-400">({d.currentVehiclePlate || '暂无'})</span>
                    </div>
                    <div className={`font-black font-mono text-sm ${
                      d.safetyScore >= 85 ? 'text-emerald-400' :
                      d.safetyScore >= 70 ? 'text-amber-400' : 'text-rose-500'
                    }`}>
                      {d.safetyScore} 分
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-1 text-[10px] text-center bg-slate-900/60 p-1.5 rounded-lg">
                    <div>
                      <span className="text-slate-500 block">急刹</span>
                      <span className="font-bold text-slate-300">{d.scoreBreakdown.harshBraking}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">急加速</span>
                      <span className="font-bold text-slate-300">{d.scoreBreakdown.harshAcceleration}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">超速</span>
                      <span className={`font-bold ${d.scoreBreakdown.speedingCount > 0 ? 'text-rose-400' : 'text-slate-300'}`}>
                        {d.scoreBreakdown.speedingCount}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">疲劳</span>
                      <span className={`font-bold ${d.scoreBreakdown.fatigueCount > 0 ? 'text-rose-400' : 'text-slate-300'}`}>
                        {d.scoreBreakdown.fatigueCount}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <span className="text-slate-400">{d.fleetName}</span>
                    <span className="text-sky-400 font-medium">查看画像与整改 →</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
