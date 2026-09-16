import React, { useState } from 'react';
import { Vehicle } from '../../types';
import { 
  Truck, 
  Search, 
  Plus, 
  Eye, 
  Wrench, 
  FileText, 
  AlertTriangle, 
  Activity, 
  Fuel, 
  CheckCircle2, 
  Route,
  Sparkles,
  SlidersHorizontal
} from 'lucide-react';

interface VehicleManagementViewProps {
  vehicles: Vehicle[];
  onViewDetail: (vehicle: Vehicle) => void;
  onViewTrack: (vehicle: Vehicle) => void;
  onSendTask: (vehicle: Vehicle) => void;
  onAddVehicle: (newVeh: Partial<Vehicle>) => void;
}

export const VehicleManagementView: React.FC<VehicleManagementViewProps> = ({
  vehicles,
  onViewDetail,
  onViewTrack,
  onSendTask,
  onAddVehicle,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPlate, setNewPlate] = useState('');
  const [newBrand, setNewBrand] = useState('一汽解放 J7');
  const [newType, setNewType] = useState('重型半挂牵引车');
  const [newFleet, setNewFleet] = useState('华东干线一队');

  const filteredVehicles = vehicles.filter(v => {
    const matchSearch =
      v.plateNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.vin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.fleetName.includes(searchQuery) ||
      (v.assignedDriverName && v.assignedDriverName.includes(searchQuery));
    const matchType = typeFilter === 'all' ? true : v.type === typeFilter;
    const matchStatus = statusFilter === 'all' ? true : v.status === statusFilter;
    return matchSearch && matchType && matchStatus;
  });

  const handleCreateVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlate.trim()) return;

    onAddVehicle({
      id: `v-${Date.now()}`,
      plateNumber: newPlate.trim(),
      brand: newBrand,
      model: '480马力 6x4 国六',
      type: newType,
      fleetName: newFleet,
      vin: `LSV${Math.floor(10000000 + Math.random() * 90000000)}`,
      engineNo: `WP13.${Math.floor(100000 + Math.random() * 900000)}`,
      purchaseDate: '2026-03-01',
      totalMileageKm: 1200,
      todayMileageKm: 0,
      todayFuelLiters: 0,
      status: 'parking',
      healthScore: 98,
      address: '上海市嘉定区物流园总站',
      assignedDriverName: '待指派',
      assignedDriverId: '',
      driverPhone: '13800000000',
      fuelType: 'diesel',
      standardFuelConsumption: 30.5,
      maintenanceDueKm: 10000,
      telemetry: {
        latitude: 31.2304,
        longitude: 121.4737,
        speed: 0,
        heading: 0,
        waterTemp: 78,
        fuelLevel: 90,
        rpm: 0,
        oilPressure: 320,
        batteryVoltage: 24.2,
        weightLoadTon: 0,
        lastUpdate: '刚刚',
      }
    });

    setNewPlate('');
    setShowAddModal(false);
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-[1920px] mx-auto text-slate-100">
      {/* Top Banner & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-sky-400" />
            <h1 className="font-bold text-lg text-white">车辆全生命周期管理</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            涵盖“选型建档 → 实时工况 → 预测性维保 → 运营成本 → 报废置换”全流程台账
          </p>
        </div>

        <button
          id="btn-add-vehicle"
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-lg shadow-sky-600/30 transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>录入新车档案</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-md flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[240px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="搜索车牌号、VIN码、车队、驾驶员..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="vehicle-type-filter" className="text-xs text-slate-400">车型:</label>
          <select
            id="vehicle-type-filter"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-2 focus:outline-none focus:border-sky-500"
          >
            <option value="all">全部车型</option>
            <option value="重型半挂牵引车">重型半挂牵引车</option>
            <option value="冷链保温车">冷链保温车</option>
            <option value="轻型厢式货车">轻型厢式货车</option>
            <option value="危险品危化罐车">危险品危化罐车</option>
            <option value="重型自卸工程车">重型自卸工程车</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="vehicle-status-filter" className="text-xs text-slate-400">状态:</label>
          <select
            id="vehicle-status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-2 focus:outline-none focus:border-sky-500"
          >
            <option value="all">全部状态</option>
            <option value="running">行驶中</option>
            <option value="in_task">任务在途中</option>
            <option value="parking">停车/空闲</option>
            <option value="alarm">预警报警</option>
            <option value="offline">离线</option>
          </select>
        </div>
      </div>

      {/* Vehicle Data Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/80 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">车牌号 / 车型</th>
                <th className="py-3 px-4">所属车队 / 驾驶员</th>
                <th className="py-3 px-4">运行状态</th>
                <th className="py-3 px-4">实时车速 / 油量</th>
                <th className="py-3 px-4">总里程 / 今日</th>
                <th className="py-3 px-4">AI 健康评分</th>
                <th className="py-3 px-4">下次保养</th>
                <th className="py-3 px-4 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {filteredVehicles.map(v => (
                <tr key={v.id} className="hover:bg-slate-800/50 transition">
                  <td className="py-3 px-4">
                    <div className="font-bold text-white text-sm">{v.plateNumber}</div>
                    <div className="text-[11px] text-slate-400">{v.brand} · {v.type}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-medium text-slate-200">{v.fleetName}</div>
                    <div className="text-[11px] text-slate-400">司机: {v.assignedDriverName || '未分配'}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      v.status === 'alarm' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                      v.status === 'in_task' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40' :
                      v.status === 'parking' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                      'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    }`}>
                      {v.status === 'alarm' ? '⚠️ 报警异常' :
                       v.status === 'in_task' ? '🚚 执行任务' :
                       v.status === 'parking' ? '🅿️ 停车' : '🟢 正常运行'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-mono text-sky-400 font-bold">{v.telemetry.speed} km/h</div>
                    <div className="text-[11px] text-slate-400">油位: {v.telemetry.fuelLevel}%</div>
                  </td>
                  <td className="py-3 px-4">
                    <div>{v.totalMileageKm.toLocaleString()} km</div>
                    <div className="text-[11px] text-slate-400">今日: {v.todayMileageKm} km</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`font-bold ${v.healthScore > 85 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {v.healthScore} 分
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`text-[11px] ${v.maintenanceDueKm < 1500 ? 'text-rose-400 font-bold' : 'text-slate-300'}`}>
                      {v.maintenanceDueKm} km
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onViewDetail(v)}
                        className="px-2.5 py-1 rounded bg-sky-600/20 hover:bg-sky-600 text-sky-300 hover:text-white transition font-medium text-xs"
                      >
                        档案详情
                      </button>
                      <button
                        onClick={() => onViewTrack(v)}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition text-xs"
                      >
                        轨迹
                      </button>
                      <button
                        onClick={() => onSendTask(v)}
                        className="px-2 py-1 rounded bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white transition text-xs"
                      >
                        派单
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add New Vehicle */}
      {showAddModal && (
        <div className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full p-6 shadow-2xl">
            <h3 className="font-bold text-base text-white pb-3 border-b border-slate-800">
              录入新车全生命周期档案
            </h3>

            <form onSubmit={handleCreateVehicle} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">车牌号码</label>
                <input
                  type="text"
                  required
                  placeholder="例如: 粤B·98888"
                  value={newPlate}
                  onChange={(e) => setNewPlate(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">品牌型号</label>
                  <input
                    type="text"
                    value={newBrand}
                    onChange={(e) => setNewBrand(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">车辆类型</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="重型半挂牵引车">重型半挂牵引车</option>
                    <option value="冷链保温车">冷链保温车</option>
                    <option value="轻型厢式货车">轻型厢式货车</option>
                    <option value="危险品危化罐车">危险品危化罐车</option>
                    <option value="重型自卸工程车">重型自卸工程车</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">所属车队分部</label>
                <select
                  value={newFleet}
                  onChange={(e) => setNewFleet(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                >
                  <option value="华东干线一队">华东干线一队</option>
                  <option value="华南冷链配送二队">华南冷链配送二队</option>
                  <option value="特种危险品专线队">特种危险品专线队</option>
                  <option value="城市末端快运队">城市末端快运队</option>
                </select>
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
                  确认保存建档
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
