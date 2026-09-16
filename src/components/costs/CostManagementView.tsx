import React, { useState } from 'react';
import { ExpenseRecord, Vehicle } from '../../types';
import { 
  DollarSign, 
  Plus, 
  TrendingDown, 
  TrendingUp, 
  PieChart, 
  Receipt, 
  Calendar, 
  CheckCircle2, 
  Search,
  Truck
} from 'lucide-react';

interface CostManagementViewProps {
  expenses: ExpenseRecord[];
  vehicles: Vehicle[];
  onAddExpense: (exp: Partial<ExpenseRecord>) => void;
}

export const CostManagementView: React.FC<CostManagementViewProps> = ({
  expenses,
  vehicles,
  onAddExpense,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState(vehicles[0]?.id || 'v-01');
  const [category, setCategory] = useState<ExpenseRecord['category']>('etc_toll');
  const [amount, setAmount] = useState(650);
  const [desc, setDesc] = useState('G15沈海高速及跨海大桥通行费ETC扣款');

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = vehicles.find(item => item.id === selectedVehicleId) || vehicles[0];

    onAddExpense({
      id: `exp-${Date.now()}`,
      vehicleId: v.id,
      plateNumber: v.plateNumber,
      category,
      amountYuan: amount,
      date: '2026-08-20',
      description: desc,
      invoiceNo: `FP${Math.floor(10000000 + Math.random() * 90000000)}`,
      operator: '李伟 (财务主管)',
      status: 'approved',
    });

    setShowAddModal(false);
  };

  const totalCost = expenses.reduce((sum, e) => sum + e.amountYuan, 0);

  const categoryTotals: Record<string, number> = {
    fuel: 0,
    etc_toll: 0,
    maintenance: 0,
    insurance: 0,
    other: 0,
  };

  expenses.forEach(e => {
    if (categoryTotals[e.category] !== undefined) {
      categoryTotals[e.category] += e.amountYuan;
    } else {
      categoryTotals.other += e.amountYuan;
    }
  });

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-[1920px] mx-auto text-slate-100">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <h1 className="font-bold text-lg text-white">车队全生命周期财务成本 (TCO) 与费用管控</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            打通燃油、路桥ETC、维保、保险、规费、折旧与单车单公里经营效益全景核算
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>报销登记费用单</span>
        </button>
      </div>

      {/* Cost Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow">
          <span className="text-slate-400 block text-[11px]">燃油能耗总支出</span>
          <div className="text-xl font-bold text-amber-400 font-mono mt-1">¥{categoryTotals.fuel.toLocaleString()}</div>
          <span className="text-[10px] text-slate-400">占比 52.4%</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow">
          <span className="text-slate-400 block text-[11px]">路桥ETC通行费</span>
          <div className="text-xl font-bold text-sky-400 font-mono mt-1">¥{categoryTotals.etc_toll.toLocaleString()}</div>
          <span className="text-[10px] text-slate-400">占比 23.8%</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow">
          <span className="text-slate-400 block text-[11px]">维保保养支出</span>
          <div className="text-xl font-bold text-indigo-400 font-mono mt-1">¥{categoryTotals.maintenance.toLocaleString()}</div>
          <span className="text-[10px] text-slate-400">占比 12.2%</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow">
          <span className="text-slate-400 block text-[11px]">保险年审规费</span>
          <div className="text-xl font-bold text-teal-400 font-mono mt-1">¥{categoryTotals.insurance.toLocaleString()}</div>
          <span className="text-[10px] text-slate-400">占比 7.6%</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow">
          <span className="text-slate-400 block text-[11px]">车队综合单公里成本</span>
          <div className="text-xl font-bold text-emerald-400 font-mono mt-1">¥2.84 <span className="text-xs text-slate-400 font-normal">/km</span></div>
          <span className="text-[10px] text-emerald-400">优于同行行业基线 6.5%</span>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/80 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">费用车牌 / 日期</th>
                <th className="py-3 px-4">费用科目 / 摘要</th>
                <th className="py-3 px-4">金额</th>
                <th className="py-3 px-4">发票税号 / 单据</th>
                <th className="py-3 px-4">经办财务</th>
                <th className="py-3 px-4 text-right">核销状态</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {expenses.map(e => (
                <tr key={e.id} className="hover:bg-slate-800/50 transition">
                  <td className="py-3 px-4">
                    <div className="font-bold text-white text-sm">{e.plateNumber}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">{e.date}</div>
                  </td>

                  <td className="py-3 px-4 max-w-md">
                    <div className="font-bold text-slate-100 flex items-center gap-1.5">
                      <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-800 text-slate-300 font-semibold">
                        {e.category === 'fuel' ? '燃油费' :
                         e.category === 'etc_toll' ? 'ETC过路费' :
                         e.category === 'maintenance' ? '维保维修' :
                         e.category === 'insurance' ? '保险费' : '其他支出'}
                      </span>
                      <span>{e.description}</span>
                    </div>
                  </td>

                  <td className="py-3 px-4 font-mono">
                    <div className="font-bold text-emerald-400 text-sm">¥{e.amountYuan.toLocaleString()}</div>
                  </td>

                  <td className="py-3 px-4 font-mono text-slate-400">
                    <div>{e.invoiceNo}</div>
                  </td>

                  <td className="py-3 px-4 text-slate-300">
                    <div>{e.operator}</div>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 font-bold rounded-full text-[10px]">
                      已审核入账
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add Expense */}
      {showAddModal && (
        <div className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-xs">
            <h3 className="font-bold text-base text-white pb-3 border-b border-slate-800">
              登记费用报销凭证
            </h3>

            <form onSubmit={handleCreateSubmit} className="space-y-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">分摊车辆</label>
                <select
                  value={selectedVehicleId}
                  onChange={(e) => setSelectedVehicleId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                >
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.plateNumber} ({v.fleetName})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">费用科目</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="etc_toll">ETC高速路桥费</option>
                    <option value="fuel">燃油加注费</option>
                    <option value="maintenance">维保修理费</option>
                    <option value="insurance">保险审验费</option>
                    <option value="parking">停车/装卸杂费</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">报销金额 (元)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">费用说明与摘要</label>
                <textarea
                  rows={2}
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-sky-500"
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
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  确认入账
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
