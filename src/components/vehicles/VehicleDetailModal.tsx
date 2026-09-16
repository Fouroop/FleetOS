import React, { useState, useEffect } from 'react';
import { Vehicle } from '../../types';
import { getAiVehicleHealth, VehicleHealthReport } from '../../services/api';
import { 
  X, 
  Truck, 
  Activity, 
  Gauge, 
  Thermometer, 
  Zap, 
  Wrench, 
  Fuel, 
  DollarSign, 
  AlertTriangle, 
  FileCheck, 
  Sparkles, 
  UserCheck, 
  Route,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Cpu
} from 'lucide-react';

interface VehicleDetailModalProps {
  vehicle: Vehicle | null;
  onClose: () => void;
  onViewTrack: (vehicle: Vehicle) => void;
}

export const VehicleDetailModal: React.FC<VehicleDetailModalProps> = ({
  vehicle,
  onClose,
  onViewTrack,
}) => {
  if (!vehicle) return null;

  const [activeTab, setActiveTab] = useState<
    'basic' | 'telemetry' | 'health' | 'maintenance' | 'fuel' | 'costs' | 'accidents' | 'documents'
  >('basic');

  const [aiReport, setAiReport] = useState<VehicleHealthReport | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  useEffect(() => {
    if (activeTab === 'health' && !aiReport) {
      setLoadingAi(true);
      getAiVehicleHealth(vehicle)
        .then(res => setAiReport(res))
        .finally(() => setLoadingAi(false));
    }
  }, [activeTab, vehicle]);

  return (
    <div className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-sky-600/20 border border-sky-500/30 flex items-center justify-center">
              <Truck className="w-6 h-6 text-sky-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white tracking-wide">{vehicle.plateNumber}</h2>
                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                  vehicle.status === 'alarm' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                  vehicle.status === 'in_task' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40' :
                  vehicle.status === 'parking' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                  'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                }`}>
                  {vehicle.status === 'alarm' ? '⚠️ 报警异常' :
                   vehicle.status === 'in_task' ? '🚚 执行任务' :
                   vehicle.status === 'parking' ? '🅿️ 停车' : '🟢 正常在线'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{vehicle.brand} · {vehicle.type} · 所属车队: {vehicle.fleetName}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation Navigation */}
        <div className="flex items-center gap-1 px-4 sm:px-6 bg-slate-900 border-b border-slate-800 overflow-x-auto text-xs font-medium py-2">
          {[
            { key: 'basic', label: '基本档案', icon: Truck },
            { key: 'telemetry', label: '实时OBD遥测', icon: Activity },
            { key: 'health', label: 'AI健康预测', icon: Sparkles },
            { key: 'maintenance', label: '维保档案', icon: Wrench },
            { key: 'fuel', label: '能耗油耗', icon: Fuel },
            { key: 'costs', label: '费用TCO', icon: DollarSign },
            { key: 'documents', label: '证照保单', icon: FileCheck },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center gap-1.5 py-2 px-3 rounded-lg whitespace-nowrap transition ${
                  isActive
                    ? 'bg-sky-600 text-white font-bold shadow'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Body Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 text-xs">
          {/* 1. Basic Info Tab */}
          {activeTab === 'basic' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
                  <span className="text-slate-400 block text-[11px]">车牌号码</span>
                  <span className="font-bold text-white text-sm">{vehicle.plateNumber}</span>
                </div>
                <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
                  <span className="text-slate-400 block text-[11px]">车辆类型</span>
                  <span className="font-semibold text-slate-100">{vehicle.type}</span>
                </div>
                <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
                  <span className="text-slate-400 block text-[11px]">品牌型号</span>
                  <span className="font-semibold text-slate-100">{vehicle.brand} ({vehicle.model})</span>
                </div>
                <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
                  <span className="text-slate-400 block text-[11px]">VIN 车辆识别代码</span>
                  <span className="font-mono text-slate-200">{vehicle.vin}</span>
                </div>
                <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
                  <span className="text-slate-400 block text-[11px]">发动机号</span>
                  <span className="font-mono text-slate-200">{vehicle.engineNo}</span>
                </div>
                <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
                  <span className="text-slate-400 block text-[11px]">购车/入队日期</span>
                  <span className="font-semibold text-slate-200">{vehicle.purchaseDate}</span>
                </div>
                <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
                  <span className="text-slate-400 block text-[11px]">当前指派司机</span>
                  <span className="font-bold text-sky-400">{vehicle.assignedDriverName || '未指派'} ({vehicle.driverPhone})</span>
                </div>
                <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
                  <span className="text-slate-400 block text-[11px]">总行驶里程</span>
                  <span className="font-bold text-white text-sm">{vehicle.totalMileageKm.toLocaleString()} km</span>
                </div>
                <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
                  <span className="text-slate-400 block text-[11px]">标称百公里油耗</span>
                  <span className="font-bold text-amber-400">{vehicle.standardFuelConsumption} L/100km</span>
                </div>
              </div>

              {/* Current Position & Quick Track Button */}
              <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700 flex items-center justify-between">
                <div>
                  <div className="text-slate-400 text-xs">当前位置与状态</div>
                  <div className="font-semibold text-slate-200 text-sm mt-1">{vehicle.address}</div>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                    经纬度: [{vehicle.telemetry.longitude}, {vehicle.telemetry.latitude}] | 刷新时间: {vehicle.telemetry.lastUpdate}
                  </div>
                </div>

                <button
                  onClick={() => {
                    onClose();
                    onViewTrack(vehicle);
                  }}
                  className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-lg flex items-center gap-1.5"
                >
                  <Route className="w-4 h-4" />
                  <span>调取历史轨迹</span>
                </button>
              </div>
            </div>
          )}

          {/* 2. Real-time Telemetry & OBD Gauges Tab */}
          {activeTab === 'telemetry' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-800 p-3.5 rounded-xl border border-slate-700 text-center">
                  <Gauge className="w-5 h-5 text-sky-400 mx-auto mb-1" />
                  <div className="text-slate-400 text-[11px]">实时车速</div>
                  <div className="text-2xl font-black text-sky-400 font-mono mt-1">{vehicle.telemetry.speed}</div>
                  <div className="text-[10px] text-slate-400">km/h</div>
                </div>

                <div className="bg-slate-800 p-3.5 rounded-xl border border-slate-700 text-center">
                  <Activity className="w-5 h-5 text-purple-400 mx-auto mb-1" />
                  <div className="text-slate-400 text-[11px]">发动机转速</div>
                  <div className="text-2xl font-black text-purple-400 font-mono mt-1">{vehicle.telemetry.rpm}</div>
                  <div className="text-[10px] text-slate-400">RPM</div>
                </div>

                <div className="bg-slate-800 p-3.5 rounded-xl border border-slate-700 text-center">
                  <Thermometer className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                  <div className="text-slate-400 text-[11px]">冷却液水温</div>
                  <div className="text-2xl font-black text-amber-400 font-mono mt-1">{vehicle.telemetry.waterTemp}</div>
                  <div className="text-[10px] text-slate-400">°C (正常80-95°C)</div>
                </div>

                <div className="bg-slate-800 p-3.5 rounded-xl border border-slate-700 text-center">
                  <Zap className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
                  <div className="text-slate-400 text-[11px]">电瓶电压</div>
                  <div className="text-2xl font-black text-yellow-400 font-mono mt-1">{vehicle.telemetry.batteryVoltage}</div>
                  <div className="text-[10px] text-emerald-400">V (工作状态正常)</div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
                  <span className="text-slate-400 block text-[11px]">机油压力</span>
                  <span className="font-bold text-slate-100 text-sm">{vehicle.telemetry.oilPressure} kPa</span>
                </div>
                <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
                  <span className="text-slate-400 block text-[11px]">剩余油量 / 电量</span>
                  <span className="font-bold text-emerald-400 text-sm">{vehicle.telemetry.fuelLevel}%</span>
                </div>
                <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
                  <span className="text-slate-400 block text-[11px]">载重负荷</span>
                  <span className="font-bold text-slate-100 text-sm">{vehicle.telemetry.weightLoadTon || 0} 吨</span>
                </div>
              </div>
            </div>
          )}

          {/* 3. AI Predictive Health Tab */}
          {activeTab === 'health' && (
            <div className="space-y-4">
              {loadingAi ? (
                <div className="py-12 text-center text-slate-400 space-y-3">
                  <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p>AI 正在分析该车辆近 90 天遥测、故障码与维保数据...</p>
                </div>
              ) : aiReport ? (
                <div className="space-y-4">
                  {/* Health Score Overview */}
                  <div className="bg-gradient-to-r from-purple-950/60 to-slate-800 p-4 rounded-xl border border-purple-800/40 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-purple-400" />
                        <span className="font-bold text-sm text-white">AI 智能健康综合诊断</span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1">{aiReport.summary}</p>
                    </div>

                    <div className="text-right">
                      <div className="text-3xl font-black text-emerald-400 font-mono">{aiReport.healthIndex}</div>
                      <div className="text-[10px] text-slate-400">健康指数 (满分100)</div>
                    </div>
                  </div>

                  {/* Subsystems Health */}
                  <div className="grid grid-cols-4 gap-2 text-center text-xs">
                    <div className="bg-slate-800/70 p-2.5 rounded-lg border border-slate-700">
                      <div className="text-slate-400 text-[10px]">动力发动机</div>
                      <div className="font-bold text-emerald-400 text-base mt-0.5">{aiReport.systems.engine}%</div>
                    </div>
                    <div className="bg-slate-800/70 p-2.5 rounded-lg border border-slate-700">
                      <div className="text-slate-400 text-[10px]">制动系统</div>
                      <div className="font-bold text-amber-400 text-base mt-0.5">{aiReport.systems.braking}%</div>
                    </div>
                    <div className="bg-slate-800/70 p-2.5 rounded-lg border border-slate-700">
                      <div className="text-slate-400 text-[10px]">电气与传感器</div>
                      <div className="font-bold text-emerald-400 text-base mt-0.5">{aiReport.systems.electrical}%</div>
                    </div>
                    <div className="bg-slate-800/70 p-2.5 rounded-lg border border-slate-700">
                      <div className="text-slate-400 text-[10px]">轮胎与悬挂</div>
                      <div className="font-bold text-amber-400 text-base mt-0.5">{aiReport.systems.tires}%</div>
                    </div>
                  </div>

                  {/* Component Remaining Life Predictions */}
                  <div>
                    <h4 className="font-bold text-xs text-slate-200 mb-2 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-sky-400" />
                      <span>部件剩余寿命预测与进保建议</span>
                    </h4>

                    <div className="space-y-2">
                      {aiReport.predictions.map((p, idx) => (
                        <div key={idx} className="p-3 bg-slate-800/60 border border-slate-700/50 rounded-lg flex items-center justify-between text-xs">
                          <div>
                            <div className="font-bold text-slate-100 flex items-center gap-2">
                              <span>{p.component}</span>
                              <span className="text-[10px] text-slate-400 font-normal">({p.status})</span>
                            </div>
                            <p className="text-slate-400 text-[11px] mt-0.5">{p.advice}</p>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-amber-400 font-bold font-mono">余 {p.remainingKm} km</span>
                            <div className={`text-[10px] font-semibold ${p.urgency === 'high' ? 'text-rose-400' : 'text-slate-400'}`}>
                              {p.urgency === 'high' ? '建议尽快更换' : '正常监测'}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* 4. Maintenance Records Tab */}
          {activeTab === 'maintenance' && (
            <div className="space-y-3">
              <div className="p-3 bg-slate-800/60 border border-slate-700 rounded-lg flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-200">下一次常规维保节点</div>
                  <div className="text-xs text-slate-400 mt-0.5">剩余里程: <span className="font-bold text-amber-400">{vehicle.maintenanceDueKm} km</span></div>
                </div>
                <button className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs">
                  预约进厂维保
                </button>
              </div>

              <div className="space-y-2">
                <div className="p-3 bg-slate-800/40 border border-slate-700/50 rounded-lg flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-200">十万公里大保 (机油、机滤、制动片、变速箱油)</div>
                    <div className="text-slate-400 text-[11px]">2026-05-15 · 服务商: 解放一汽直营售后服务站</div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-100">¥3,480.00</span>
                    <span className="text-emerald-400 block text-[10px]">已完成核验</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-800/40 border border-slate-700/50 rounded-lg flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-200">前轴驱动轮定位与轮胎调位换位</div>
                    <div className="text-slate-400 text-[11px]">2026-02-10 · 服务商: 华东顺达驰途快修连锁</div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-100">¥620.00</span>
                    <span className="text-emerald-400 block text-[10px]">已完成核验</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 5. Fuel & Energy Tab */}
          {activeTab === 'fuel' && (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-800 p-3 rounded-lg border border-slate-700 text-center">
                  <div className="text-slate-400 text-[11px]">近30天实际平均油耗</div>
                  <div className="text-xl font-bold text-amber-400 mt-1">31.2 L/100km</div>
                  <div className="text-[10px] text-slate-500">标称 30.5 L/100km (+2.3%)</div>
                </div>
                <div className="bg-slate-800 p-3 rounded-lg border border-slate-700 text-center">
                  <div className="text-slate-400 text-[11px]">本月总燃油费用</div>
                  <div className="text-xl font-bold text-white mt-1">¥14,280</div>
                  <div className="text-[10px] text-slate-500">累计加油 1,950 升</div>
                </div>
                <div className="bg-slate-800 p-3 rounded-lg border border-slate-700 text-center">
                  <div className="text-slate-400 text-[11px]">单公里燃油成本</div>
                  <div className="text-xl font-bold text-sky-400 mt-1">¥2.28 / km</div>
                  <div className="text-[10px] text-emerald-400">优于车队均值 4.5%</div>
                </div>
              </div>
            </div>
          )}

          {/* 6. Costs & TCO Tab */}
          {activeTab === 'costs' && (
            <div className="space-y-3">
              <div className="bg-slate-800 p-3.5 rounded-lg border border-slate-700">
                <div className="text-slate-400 text-xs">全生命周期综合拥有成本 (TCO)</div>
                <div className="text-2xl font-bold text-white mt-1">¥428,600 <span className="text-xs text-slate-400 font-normal">/ 累计 148,000 km</span></div>
                <div className="text-xs text-slate-400 mt-1">综合单公里运营成本: <span className="font-bold text-sky-400">¥2.89 / km</span></div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="bg-slate-800/60 p-2 rounded border border-slate-700">
                  <span className="text-slate-400 block text-[10px]">燃油总支出</span>
                  <span className="font-bold text-slate-200">¥218,000 (50.8%)</span>
                </div>
                <div className="bg-slate-800/60 p-2 rounded border border-slate-700">
                  <span className="text-slate-400 block text-[10px]">路桥ETC费用</span>
                  <span className="font-bold text-slate-200">¥96,400 (22.5%)</span>
                </div>
                <div className="bg-slate-800/60 p-2 rounded border border-slate-700">
                  <span className="text-slate-400 block text-[10px]">维保保养</span>
                  <span className="font-bold text-slate-200">¥38,200 (8.9%)</span>
                </div>
                <div className="bg-slate-800/60 p-2 rounded border border-slate-700">
                  <span className="text-slate-400 block text-[10px]">保险审验</span>
                  <span className="font-bold text-slate-200">¥24,000 (5.6%)</span>
                </div>
              </div>
            </div>
          )}

          {/* 7. Documents & Insurance Tab */}
          {activeTab === 'documents' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-slate-800/70 border border-slate-700 rounded-lg flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-100">机动车交强险 & 商业三者险(1000万)</div>
                    <div className="text-slate-400 text-[11px] mt-0.5">中国人保财险 · 保单号: PICC202688921</div>
                    <div className="text-[11px] text-emerald-400 mt-1">有效期至: 2027-02-15 (余 178 天)</div>
                  </div>
                  <span className="px-2 py-1 bg-emerald-500/20 text-emerald-300 font-bold rounded text-[10px]">生效中</span>
                </div>

                <div className="p-3 bg-slate-800/70 border border-slate-700 rounded-lg flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-100">道路运输证 (营运证)</div>
                    <div className="text-slate-400 text-[11px] mt-0.5">交通运输行政审批局核发</div>
                    <div className="text-[11px] text-amber-400 mt-1">年审有效期至: 2026-11-30 (余 102 天)</div>
                  </div>
                  <span className="px-2 py-1 bg-emerald-500/20 text-emerald-300 font-bold rounded text-[10px]">有效</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-800/90 border-t border-slate-700 flex items-center justify-between text-xs">
          <span className="text-slate-400">FleetOS 车辆唯一识别码: {vehicle.id}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-medium transition"
          >
            关闭返回
          </button>
        </div>
      </div>
    </div>
  );
};
