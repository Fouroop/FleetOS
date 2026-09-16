import React, { useState } from 'react';
import { gpsSimulator } from '../../services/gpsSimulator';
import { 
  Settings, 
  Sliders, 
  ShieldCheck, 
  Users, 
  RotateCcw, 
  Building, 
  Zap, 
  CheckCircle2,
  Lock,
  Cpu
} from 'lucide-react';

interface SystemSettingsViewProps {
  onResetData: () => void;
}

export const SystemSettingsView: React.FC<SystemSettingsViewProps> = ({
  onResetData,
}) => {
  const [vehicleCount, setVehicleCount] = useState(10);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [simRunning, setSimRunning] = useState(true);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const handleSimCountChange = (count: number) => {
    setVehicleCount(count);
    gpsSimulator.setSimulationCount(count);
    showToast(`已将实时在线仿真车队规模调整为 ${count} 辆`);
  };

  const handleSimSpeedChange = (spd: number) => {
    setSimulationSpeed(spd);
    gpsSimulator.setSpeedMultiplier(spd);
    showToast(`仿真运动刷新速率调整为 ${spd}x 倍速`);
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const roles = [
    { name: '超级系统管理员 (Super Admin)', users: '张总 (CEO), 王工 (CTO)', desc: '全局所有车队数据、权限分配与计费配置' },
    { name: '车队运营总监 (Fleet Manager)', users: '李经理, 陈队长', desc: '车辆调度、维保审核、费用报销批准与TCO管控' },
    { name: '主动安全风控专员 (Safety Officer)', users: '赵主管, 孙专员', desc: 'ADAS/DMS报警研判、事故复盘、高风险司机督导' },
    { name: '智能调度员 (Dispatcher)', users: '周调度, 钱调度', desc: '运单派发、实时轨迹跟踪、在途异常处置' },
    { name: '一线驾驶员 (Driver)', users: '全体 8 位在册驾驶员', desc: '移动端运单接单、出车点检、加油费用上报' },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-[1920px] mx-auto text-slate-100">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-slate-400" />
            <h1 className="font-bold text-lg text-white">系统管理与车联网遥测仿真引擎设置</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            配置北斗遥测流仿真参数、组织机构与多角色权限 (RBAC)、重置系统演示数据
          </p>
        </div>

        {toastMsg && (
          <div className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5 animate-bounce">
            <CheckCircle2 className="w-4 h-4" />
            <span>{toastMsg}</span>
          </div>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: GPS Simulation Engine Controls */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Cpu className="w-5 h-5 text-sky-400" />
            <h3 className="font-bold text-sm text-white">北斗 / GPS 车联网高并发遥测模拟引擎</h3>
          </div>

          {/* Vehicle Scale Slider */}
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="font-medium text-slate-300">在线仿真车辆规模:</span>
              <span className="font-mono text-sky-400 font-bold text-sm">{vehicleCount} 辆</span>
            </div>
            <input
              type="range"
              min="5"
              max="50"
              value={vehicleCount}
              onChange={(e) => handleSimCountChange(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>5辆 (轻量演示)</span>
              <span>25辆 (中型车队)</span>
              <span>50辆 (大型物流干线)</span>
            </div>
          </div>

          {/* Speed Multiplier */}
          <div className="space-y-2 text-xs pt-2">
            <span className="font-medium text-slate-300 block">遥测运动与仿真更新倍速:</span>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 5, 10].map(s => (
                <button
                  key={s}
                  onClick={() => handleSimSpeedChange(s)}
                  className={`py-2 rounded-lg font-bold transition text-xs ${
                    simulationSpeed === s
                      ? 'bg-sky-600 text-white shadow'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {s}x 倍速
                </button>
              ))}
            </div>
          </div>

          {/* Reset Factory Data */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-200 text-xs block">恢复系统演示初始数据</span>
              <span className="text-[10px] text-slate-400">重置所有车辆、运单、报警、维保与财务台账</span>
            </div>
            <button
              onClick={() => {
                onResetData();
                showToast('已重置系统演示数据至初始状态');
              }}
              className="px-3.5 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 text-xs font-bold transition"
            >
              一键重置数据
            </button>
          </div>
        </div>

        {/* Right: RBAC Roles */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Lock className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-sm text-white">多角色权限体系 (RBAC) 与组织机构</h3>
          </div>

          <div className="space-y-2.5 text-xs">
            {roles.map((r, idx) => (
              <div key={idx} className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-200">{r.name}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-semibold">
                    {r.users}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
