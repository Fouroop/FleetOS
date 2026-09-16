import React, { useState } from 'react';
import { FuelRecord, Vehicle } from '../../types';
import { 
  Fuel, 
  Plus, 
  Search, 
  TrendingDown, 
  TrendingUp, 
  AlertTriangle, 
  Sparkles, 
  DollarSign, 
  Calendar,
  CheckCircle2,
  Droplet
} from 'lucide-react';

interface FuelManagementViewProps {
  fuelRecords: FuelRecord[];
  vehicles: Vehicle[];
  onAddFuelRecord: (rec: Partial<FuelRecord>) => void;
}

export const FuelManagementView: React.FC<FuelManagementViewProps> = ({
  fuelRecords,
  vehicles,
  onAddFuelRecord,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState(vehicles[0]?.id || 'v-01');
  const [liters, setLiters] = useState(240);
  const [unitPrice, setUnitPrice] = useState(7.35);
  const [gasStation, setGasStation] = useState('中石化青浦华新加油站');

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = vehicles.find(item => item.id === selectedVehicleId) || vehicles[0];

    onAddFuelRecord({
      id: `fuel-${Date.now()}`,
      vehicleId: v.id,
      plateNumber: v.plateNumber,
      driverName: v.assignedDriverName || '张建国',
      fuelType: 'diesel',
      liters,
      unitPriceYuan: unitPrice,
      totalCostYuan: +(liters * unitPrice).toFixed(2),
      mileageAtRefuelKm: v.totalMileageKm,
      gasStation,
      date: '2026-08-20',
      avgConsumptionLPer100Km: 31.2,
      isAbnormalHigh: false,
    });

    setShowAddModal(false);
  };

  const totalFuelCost = fuelRecords.reduce((sum, r) => sum + r.totalCostYuan, 0);
  const totalFuelLiters = fuelRecords.reduce((sum, r) => sum + r.liters, 0);

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-[1920px] mx-auto text-slate-100">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <Fuel className="w-5 h-5 text-amber-400" />
            <h1 className="font-bold text-lg text-white">油耗与能耗精细化管理</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            实时监测百公里真实油耗、异常高油耗 AI 归因、怠速偷油预警、单车单公里燃油成本核算
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-lg shadow-amber-600/30 transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>录入加油单据</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow">
          <span className="text-slate-400 block text-[11px]">车队当月总燃油费用</span>
          <div className="text-2xl font-black text-amber-400 font-mono mt-1">¥{totalFuelCost.toLocaleString()}</div>
          <span className="text-[10px] text-slate-400 mt-1 block">累计加注: {totalFuelLiters} L</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow">
          <span className="text-slate-400 block text-[11px]">车队平均百公里油耗</span>
          <div className="text-2xl font-black text-white font-mono mt-1">30.8 <span className="text-xs text-slate-400 font-normal">L/100km</span></div>
          <span className="text-[10px] text-emerald-400 mt-1 block">优于去年同期 3.2%</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow">
          <span className="text-slate-400 block text-[11px]">单公里燃油成本</span>
          <div className="text-2xl font-black text-sky-400 font-mono mt-1">¥2.26 <span className="text-xs text-slate-400 font-normal">/ km</span></div>
          <span className="text-[10px] text-slate-400 mt-1 block">基于柴油均价 ¥7.35/L</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow">
          <span className="text-slate-400 block text-[11px]">高油耗异常车辆</span>
          <div className="text-2xl font-black text-rose-500 font-mono mt-1">
            {fuelRecords.filter(r => r.isAbnormalHigh).length} 辆
          </div>
          <span className="text-[10px] text-rose-400 mt-1 block">AI 发现长时间怠速开空调</span>
        </div>
      </div>

      {/* Fuel Records Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/80 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">加油车牌 / 司机</th>
                <th className="py-3 px-4">加油日期 / 加油站</th>
                <th className="py-3 px-4">加油量 / 单价</th>
                <th className="py-3 px-4">实付金额</th>
                <th className="py-3 px-4">折算百公里油耗</th>
                <th className="py-3 px-4">AI 异常判定</th>
                <th className="py-3 px-4 text-right">状态</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {fuelRecords.map(r => (
                <tr key={r.id} className="hover:bg-slate-800/50 transition">
                  <td className="py-3 px-4">
                    <div className="font-bold text-white text-sm">{r.plateNumber}</div>
                    <div className="text-[11px] text-slate-400">{r.driverName}</div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="text-slate-200">{r.date}</div>
                    <div className="text-[11px] text-slate-400">{r.gasStation}</div>
                  </td>

                  <td className="py-3 px-4 font-mono">
                    <div>{r.liters} L</div>
                    <div className="text-[10px] text-slate-400">¥{r.unitPriceYuan} / L</div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-bold text-amber-400 font-mono text-sm">¥{r.totalCostYuan.toLocaleString()}</div>
                  </td>

                  <td className="py-3 px-4">
                    <div className={`font-bold font-mono ${r.isAbnormalHigh ? 'text-rose-400' : 'text-slate-200'}`}>
                      {r.avgConsumptionLPer100Km} L/100km
                    </div>
                  </td>

                  <td className="py-3 px-4 max-w-xs">
                    {r.isAbnormalHigh ? (
                      <div className="p-1.5 bg-rose-950/40 rounded border border-rose-800/40 text-[10px] text-rose-300">
                        <span className="font-bold">⚠️ {r.abnormalReason || '百公里油耗偏高 18%'}</span>
                      </div>
                    ) : (
                      <span className="text-emerald-400 text-[11px]">正常消耗区间</span>
                    )}
                  </td>

                  <td className="py-3 px-4 text-right">
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 font-bold rounded-full text-[10px]">
                      已核销入账
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add Fuel Record */}
      {showAddModal && (
        <div className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-xs">
            <h3 className="font-bold text-base text-white pb-3 border-b border-slate-800">
              录入加油单据与能耗台账
            </h3>

            <form onSubmit={handleCreateSubmit} className="space-y-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">加油车辆</label>
                <select
                  value={selectedVehicleId}
                  onChange={(e) => setSelectedVehicleId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                >
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.plateNumber} ({v.brand}) - 司机: {v.assignedDriverName || '未分配'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">加油量 (升)</label>
                  <input
                    type="number"
                    value={liters}
                    onChange={(e) => setLiters(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">油品单价 (元/升)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">加油站名称</label>
                <input
                  type="text"
                  value={gasStation}
                  onChange={(e) => setGasStation(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="p-2.5 bg-slate-800/60 rounded-lg border border-slate-700 flex justify-between">
                <span className="text-slate-400">总计金额:</span>
                <span className="font-bold text-amber-400 text-sm">¥{(liters * unitPrice).toFixed(2)}</span>
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
                  className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold"
                >
                  确认保存加油单
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
