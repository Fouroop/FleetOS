import React, { useState } from 'react';
import { Geofence, Vehicle } from '../../types';
import { GisMap } from '../common/GisMap';
import { 
  ShieldCheck, 
  Plus, 
  MapPin, 
  AlertTriangle, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  CircleDot, 
  Clock, 
  Sliders
} from 'lucide-react';

interface GeofenceViewProps {
  geofences: Geofence[];
  vehicles: Vehicle[];
  onAddGeofence: (fence: Partial<Geofence>) => void;
  onToggleStatus: (id: string) => void;
}

export const GeofenceView: React.FC<GeofenceViewProps> = ({
  geofences,
  vehicles,
  onAddGeofence,
  onToggleStatus,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [fenceName, setFenceName] = useState('');
  const [category, setCategory] = useState<Geofence['category']>('作业装卸区');
  const [triggerType, setTriggerType] = useState<Geofence['triggerType']>('both');
  const [maxSpeed, setMaxSpeed] = useState<number>(40);
  const [radiusMeter, setRadiusMeter] = useState<number>(1500);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fenceName.trim()) return;

    onAddGeofence({
      id: `gf-${Date.now()}`,
      name: fenceName.trim(),
      type: 'circle',
      category,
      triggerType,
      maxSpeedLimitKm: maxSpeed,
      color: category === '禁行限行区' ? '#ef4444' : category === '限速管控区' ? '#f59e0b' : '#10b981',
      status: 'active',
      boundVehicleCount: vehicles.length,
      todayAlarmCount: 0,
      centerCoord: [121.35 + (Math.random() - 0.5) * 0.2, 31.25 + (Math.random() - 0.5) * 0.2],
      radiusMeter,
      description: `针对 ${category} 的全自动出入界检测与限速监管规则。`,
    });

    setFenceName('');
    setShowAddModal(false);
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-[1920px] mx-auto text-slate-100">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-sky-400" />
            <h1 className="font-bold text-lg text-white">电子围栏与智能区域管控</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            支持作业装卸区、限速管控区、禁行限行区多边形/圆形围栏，进出界毫秒级告警
          </p>
        </div>

        <button
          id="btn-create-geofence"
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-lg shadow-sky-600/30 transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>新建电子围栏规则</span>
        </button>
      </div>

      {/* Main Grid: GIS Map + Geofence Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Map Display with Geofences (8 Cols) */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-xl h-[560px] flex flex-col">
          <div className="flex-1 relative">
            <GisMap
              vehicles={vehicles}
              geofences={geofences}
              className="w-full h-full"
            />
          </div>
        </div>

        {/* Right Column: Geofence List & Logs (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg flex-1 flex flex-col">
            <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-800">
              <span className="font-bold text-xs text-white">已配置电子围栏 ({geofences.length})</span>
              <span className="text-[11px] text-emerald-400 font-semibold">
                {geofences.filter(g => g.status === 'active').length} 生效中
              </span>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto max-h-[460px] pr-1 text-xs">
              {geofences.map(g => (
                <div
                  key={g.id}
                  className="bg-slate-800/70 border border-slate-700/60 rounded-xl p-3 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: g.color }}></span>
                      <span className="font-bold text-slate-100">{g.name}</span>
                    </div>
                    <button
                      onClick={() => onToggleStatus(g.id)}
                      className={`text-[10px] px-2 py-0.5 rounded font-bold transition ${
                        g.status === 'active'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-slate-700 text-slate-400'
                      }`}
                    >
                      {g.status === 'active' ? '启用中' : '已停用'}
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-400">{g.description}</p>

                  <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                    <div>
                      <span className="text-slate-500 block text-[10px]">管控类别</span>
                      <span className="font-medium text-slate-200">{g.category}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">限速阈值</span>
                      <span className="font-bold text-amber-400">{g.maxSpeedLimitKm ? `${g.maxSpeedLimitKm} km/h` : '无限制'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">触发动作</span>
                      <span className="text-slate-300">
                        {g.triggerType === 'both' ? '进出双向告警' : g.triggerType === 'enter' ? '仅进入告警' : '仅驶离告警'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">今日越界/报警</span>
                      <span className={`font-bold ${g.todayAlarmCount > 0 ? 'text-rose-400' : 'text-slate-300'}`}>
                        {g.todayAlarmCount} 次
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Create Geofence */}
      {showAddModal && (
        <div className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <h3 className="font-bold text-base text-white pb-3 border-b border-slate-800">
              新建电子围栏与管控策略
            </h3>

            <form onSubmit={handleCreateSubmit} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">围栏名称</label>
                <input
                  type="text"
                  required
                  placeholder="例如: 杭州余杭菜鸟园区限速区"
                  value={fenceName}
                  onChange={(e) => setFenceName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">围栏类别</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="作业装卸区">作业装卸区</option>
                    <option value="限速管控区">限速管控区</option>
                    <option value="禁行限行区">禁行限行区</option>
                    <option value="服务区驻车点">服务区驻车点</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">触发告警规则</label>
                  <select
                    value={triggerType}
                    onChange={(e) => setTriggerType(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="both">进出界双向告警</option>
                    <option value="enter">仅进入围栏告警</option>
                    <option value="exit">仅驶离围栏告警</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">限速阈值 (km/h)</label>
                  <input
                    type="number"
                    value={maxSpeed}
                    onChange={(e) => setMaxSpeed(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">管控半径 (米)</label>
                  <input
                    type="number"
                    value={radiusMeter}
                    onChange={(e) => setRadiusMeter(parseInt(e.target.value) || 1000)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold"
                >
                  确认生效
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
