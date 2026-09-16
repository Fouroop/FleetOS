import React, { useState } from 'react';
import { Vehicle, Driver, TransportTask } from '../../types';
import { 
  Smartphone, 
  CheckCircle2, 
  MapPin, 
  Clock, 
  Truck, 
  ShieldCheck, 
  Camera, 
  FileCheck, 
  Send, 
  Fuel, 
  AlertTriangle,
  Play,
  RotateCcw
} from 'lucide-react';

interface DriverMobileSimulatorProps {
  vehicles: Vehicle[];
  drivers: Driver[];
  tasks: TransportTask[];
  onUpdateTaskStatus: (taskId: string, newStatus: TransportTask['status']) => void;
}

export const DriverMobileSimulator: React.FC<DriverMobileSimulatorProps> = ({
  vehicles,
  drivers,
  tasks,
  onUpdateTaskStatus,
}) => {
  const [selectedDriverId, setSelectedDriverId] = useState(drivers[0]?.id || 'd-01');
  const [activeTab, setActiveTab] = useState<'task' | 'inspection' | 'clockin'>('task');
  
  // Inspection checklist state
  const [inspectionItems, setInspectionItems] = useState([
    { id: 'tires', name: '轮胎花纹与胎压 (无鼓包破损)', checked: true },
    { id: 'brakes', name: '制动制动气压与刹车管路 (无漏气漏油)', checked: true },
    { id: 'lights', name: '全车转向灯、刹车灯、示廓灯正常', checked: true },
    { id: 'extinguisher', name: '车载干粉灭火器与反光背心在位有效', checked: true },
    { id: 'documents', name: '随车行驶证、道路运输证、保单齐全', checked: true },
  ]);
  const [inspectionSubmitted, setInspectionSubmitted] = useState(false);

  const currentDriver = drivers.find(d => d.id === selectedDriverId) || drivers[0];
  const driverTasks = tasks.filter(t => t.assignedDriverId === currentDriver?.id || t.assignedDriverName === currentDriver?.name);
  const currentVehicle = vehicles.find(v => v.id === currentDriver?.currentVehicleId || v.plateNumber === currentDriver?.currentVehiclePlate) || vehicles[0];

  const handleToggleInspection = (id: string) => {
    setInspectionItems(prev => prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  const handleCheckinSubmit = () => {
    setInspectionSubmitted(true);
    setTimeout(() => setInspectionSubmitted(false), 3000);
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-[1920px] mx-auto text-slate-100">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-sky-400" />
            <h1 className="font-bold text-lg text-white">驾驶员移动端 (Driver App) 交互模拟器</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            支持出车前拍照AI点检、运单接单执行、在途轨迹上报、驻车打卡与安全自检
          </p>
        </div>

        {/* Switch Driver */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">切换模拟驾驶员:</span>
          <select
            value={selectedDriverId}
            onChange={(e) => setSelectedDriverId(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-1.5 focus:outline-none focus:border-sky-500"
          >
            {drivers.map(d => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.currentVehiclePlate || '无车'}) - 安全分: {d.safetyScore}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Simulator Container */}
      <div className="flex justify-center py-4">
        {/* Mobile Phone Mockup Frame */}
        <div className="w-[380px] h-[720px] bg-slate-950 border-4 border-slate-700 rounded-[40px] shadow-2xl overflow-hidden flex flex-col relative">
          {/* Top Notch & Status Bar */}
          <div className="h-6 bg-slate-900 flex items-center justify-between px-6 text-[10px] text-slate-400">
            <span className="font-mono">09:41</span>
            <div className="w-16 h-3.5 bg-black rounded-full"></div>
            <span className="font-mono">5G 100%</span>
          </div>

          {/* App Header */}
          <div className="bg-slate-900 p-3.5 border-b border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-sky-600 flex items-center justify-center font-bold text-white text-xs">
                {currentDriver?.name.slice(0, 1)}
              </div>
              <div>
                <div className="font-bold text-white">{currentDriver?.name}</div>
                <div className="text-[10px] text-slate-400">{currentVehicle?.plateNumber} · {currentDriver?.fleetName}</div>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                安全分: {currentDriver?.safetyScore}
              </span>
            </div>
          </div>

          {/* App Body Content */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3 text-xs bg-slate-900/60">
            {/* Nav Tabs inside mobile */}
            <div className="grid grid-cols-3 gap-1 bg-slate-800 p-1 rounded-xl text-center text-[11px]">
              <button
                onClick={() => setActiveTab('task')}
                className={`py-1 rounded-lg font-bold transition ${
                  activeTab === 'task' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                我的运单
              </button>
              <button
                onClick={() => setActiveTab('inspection')}
                className={`py-1 rounded-lg font-bold transition ${
                  activeTab === 'inspection' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                出车点检
              </button>
              <button
                onClick={() => setActiveTab('clockin')}
                className={`py-1 rounded-lg font-bold transition ${
                  activeTab === 'clockin' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                在途监控
              </button>
            </div>

            {/* TAB 1: Tasks */}
            {activeTab === 'task' && (
              <div className="space-y-2.5">
                <span className="font-bold text-slate-300 text-[11px]">进行中的运输任务</span>
                {driverTasks.length === 0 ? (
                  <div className="text-center py-10 text-slate-500 text-xs">
                    当前暂无待执行任务，请等待调度员派单。
                  </div>
                ) : (
                  driverTasks.map(t => (
                    <div key={t.id} className="bg-slate-800 rounded-xl p-3 border border-slate-700 space-y-2 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-mono text-sky-400 font-bold">{t.taskNo}</span>
                        <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-400 rounded text-[10px] font-bold">
                          {t.status === 'in_progress' ? '在途中' : t.status === 'dispatched' ? '已接单' : '已完成'}
                        </span>
                      </div>

                      <div className="font-bold text-white">{t.title}</div>

                      <div className="text-[11px] text-slate-300 space-y-1">
                        <div>起: {t.origin}</div>
                        <div>终: {t.destination}</div>
                        <div>货物: {t.cargoType} ({t.cargoWeightTon} 吨)</div>
                      </div>

                      <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between">
                        <span className="text-amber-400 font-bold">运费 ¥{t.freightAmountYuan}</span>
                        {t.status === 'dispatched' && (
                          <button
                            onClick={() => onUpdateTaskStatus(t.id, 'in_progress')}
                            className="px-3 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded font-bold text-[11px]"
                          >
                            确认发车出发
                          </button>
                        )}
                        {t.status === 'in_progress' && (
                          <button
                            onClick={() => onUpdateTaskStatus(t.id, 'delivered')}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold text-[11px]"
                          >
                            货主签收确认
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB 2: Pre-Trip Inspection */}
            {activeTab === 'inspection' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-300 text-[11px]">出车前 5 步安全点检</span>
                  <span className="text-[10px] text-sky-400">AI 智能审核</span>
                </div>

                <div className="space-y-2 text-xs">
                  {inspectionItems.map(item => (
                    <div
                      key={item.id}
                      onClick={() => handleToggleInspection(item.id)}
                      className="p-2.5 bg-slate-800 rounded-xl border border-slate-700 flex items-center justify-between cursor-pointer"
                    >
                      <span className="text-slate-200 text-[11px]">{item.name}</span>
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={() => {}}
                        className="rounded accent-sky-500"
                      />
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleCheckinSubmit}
                  className="w-full py-2.5 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 text-white rounded-xl font-bold text-xs shadow-lg flex items-center justify-center gap-1.5"
                >
                  <Camera className="w-4 h-4" />
                  <span>拍照上传并签署安全承诺</span>
                </button>

                {inspectionSubmitted && (
                  <div className="p-2 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-center text-emerald-300 text-[11px] font-bold">
                    ✅ 出车点检已通过，数据已上报车队安全台账！
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: On-Route Telemetry HUD */}
            {activeTab === 'clockin' && (
              <div className="space-y-3">
                <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 text-center space-y-1">
                  <span className="text-slate-400 text-[10px]">当前车载北斗瞬时车速</span>
                  <div className="text-3xl font-black text-sky-400 font-mono">
                    {currentVehicle?.telemetry.speed || 0} <span className="text-xs font-normal text-slate-400">km/h</span>
                  </div>
                  <div className="text-[10px] text-slate-300">
                    油量: {currentVehicle?.telemetry.fuelLevel}% | 水温: {currentVehicle?.telemetry.engineCoolantTemp}°C
                  </div>
                </div>

                <div className="p-3 bg-rose-950/30 rounded-xl border border-rose-800/40 space-y-1 text-xs">
                  <div className="flex items-center gap-1 text-rose-400 font-bold">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>DMS 疲劳驾驶监控</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    连续驾驶已达 2.8 小时，建议在前方 15km 服务区停车休息 20 分钟。
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Home Indicator */}
          <div className="h-4 bg-slate-950 flex items-center justify-center">
            <div className="w-24 h-1 bg-slate-600 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
