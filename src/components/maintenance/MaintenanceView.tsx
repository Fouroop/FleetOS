import React, { useState } from 'react';
import { MaintenanceRecord, Vehicle } from '../../types';
import { 
  Wrench, 
  Plus, 
  Sparkles, 
  Calendar, 
  DollarSign, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Truck,
  ShieldCheck
} from 'lucide-react';

interface MaintenanceViewProps {
  maintenanceList: MaintenanceRecord[];
  vehicles: Vehicle[];
  onAddMaintenance: (rec: Partial<MaintenanceRecord>) => void;
}

export const MaintenanceView: React.FC<MaintenanceViewProps> = ({
  maintenanceList,
  vehicles,
  onAddMaintenance,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState(vehicles[0]?.id || 'v-01');
  const [type, setType] = useState<MaintenanceRecord['type']>('regular');
  const [items, setItems] = useState('机油、机滤更换，刹车片厚度检测，胎压动平衡');
  const [workshop, setWorkshop] = useState('一汽解放直营售后服务站');
  const [cost, setCost] = useState(2600);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = vehicles.find(item => item.id === selectedVehicleId) || vehicles[0];

    onAddMaintenance({
      id: `mnt-${Date.now()}`,
      vehicleId: v.id,
      plateNumber: v.plateNumber,
      type,
      items,
      costYuan: cost,
      serviceProvider: workshop,
      mileageAtServiceKm: v.totalMileageKm,
      date: '2026-08-20',
      nextDueMileageKm: v.totalMileageKm + 10000,
      status: 'completed',
      aiPredictedNeed: true,
      aiAdvice: '符合 AI 预警保养周期，已完成全面检测。',
    });

    setShowAddModal(false);
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-[1920px] mx-auto text-slate-100">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-indigo-400" />
            <h1 className="font-bold text-lg text-white">车辆维保档案与 AI 预测性维护</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            从“坏了才修、按期死保”向“AI 状态感知、精准预测性进保”升级，降低全生命周期停驶损失
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>登记维保单据</span>
        </button>
      </div>

      {/* AI Predictive Health Watchlist Bar */}
      <div className="bg-gradient-to-r from-indigo-950/70 via-slate-900 to-purple-950/70 border border-indigo-800/50 rounded-xl p-4 shadow-lg space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-indigo-800/40">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="font-bold text-xs text-white">AI 核心部件磨损与预测性换件清单 (Top Watchlist)</span>
          </div>
          <span className="text-[11px] text-indigo-300 font-semibold">
            {vehicles.filter(v => v.maintenanceDueKm < 2000).length} 辆接近临界值
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          {vehicles.slice(0, 3).map(v => (
            <div key={v.id} className="p-3 bg-slate-800/70 rounded-xl border border-slate-700/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">{v.plateNumber}</span>
                <span className="font-mono text-amber-400 font-bold">余 {v.maintenanceDueKm} km</span>
              </div>
              <p className="text-[11px] text-slate-300">
                前制动摩擦片厚度接近 3.2mm 警戒值，建议在下次出车前进厂更换。
              </p>
              <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1 border-t border-slate-700/50">
                <span>AI 健康指数: {v.healthScore}分</span>
                <span className="text-sky-400 font-bold">智能预约 →</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Maintenance Records Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/80 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">维保车牌 / 日期</th>
                <th className="py-3 px-4">维保类别 / 项目明细</th>
                <th className="py-3 px-4">维保服务商 / 站点</th>
                <th className="py-3 px-4">当时里程 / 下次建议</th>
                <th className="py-3 px-4">维保费用</th>
                <th className="py-3 px-4 text-right">状态</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {maintenanceList.map(m => (
                <tr key={m.id} className="hover:bg-slate-800/50 transition">
                  <td className="py-3 px-4">
                    <div className="font-bold text-white text-sm">{m.plateNumber}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">{m.date}</div>
                  </td>

                  <td className="py-3 px-4 max-w-md">
                    <div className="font-bold text-slate-100 flex items-center gap-1.5">
                      <span className="px-1.5 py-0.2 rounded text-[10px] bg-indigo-500/20 text-indigo-300 font-bold">
                        {m.type === 'regular' ? '定期保养' : m.type === 'repair' ? '故障维修' : '年检审验'}
                      </span>
                      <span>{m.items}</span>
                    </div>
                    {m.aiAdvice && (
                      <p className="text-[11px] text-purple-300 mt-1 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        <span>{m.aiAdvice}</span>
                      </p>
                    )}
                  </td>

                  <td className="py-3 px-4">
                    <div className="text-slate-300 font-medium">{m.serviceProvider}</div>
                  </td>

                  <td className="py-3 px-4 font-mono">
                    <div>{m.mileageAtServiceKm.toLocaleString()} km</div>
                    <div className="text-[10px] text-slate-400">下次: {m.nextDueMileageKm.toLocaleString()} km</div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-bold text-amber-400 font-mono text-sm">¥{m.costYuan.toLocaleString()}</div>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 font-bold rounded-full text-[10px]">
                      已验收完成
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add Maintenance Record */}
      {showAddModal && (
        <div className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-xs">
            <h3 className="font-bold text-base text-white pb-3 border-b border-slate-800">
              登记维保单据
            </h3>

            <form onSubmit={handleCreateSubmit} className="space-y-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">选择维保车辆</label>
                <select
                  value={selectedVehicleId}
                  onChange={(e) => setSelectedVehicleId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                >
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.plateNumber} ({v.brand}) - 当前里程: {v.totalMileageKm}km
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">维保类别</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="regular">常规定期保养</option>
                    <option value="repair">故障报修</option>
                    <option value="inspection">强制年检与气瓶检测</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">维保费用 (元)</label>
                  <input
                    type="number"
                    value={cost}
                    onChange={(e) => setCost(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">维保项目与更换部件明细</label>
                <textarea
                  rows={2}
                  value={items}
                  onChange={(e) => setItems(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">服务商 / 汽修厂</label>
                <input
                  type="text"
                  value={workshop}
                  onChange={(e) => setWorkshop(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-1.5 rounded-lg bg-slate-800 text-slate-300"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                >
                  确认保存维保记录
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
