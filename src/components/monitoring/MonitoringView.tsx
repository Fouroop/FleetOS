import React, { useState } from 'react';
import { Vehicle, Geofence } from '../../types';
import { GisMap } from '../common/GisMap';
import { 
  Search, 
  Filter, 
  Truck, 
  Navigation, 
  AlertTriangle, 
  Gauge, 
  Thermometer, 
  BatteryCharging, 
  Zap, 
  Activity,
  Layers,
  Phone,
  Eye,
  Route,
  Sparkles
} from 'lucide-react';

interface MonitoringViewProps {
  vehicles: Vehicle[];
  geofences?: Geofence[];
  onViewTrack?: (vehicle: Vehicle) => void;
  onViewDetail?: (vehicle: Vehicle) => void;
  onContactDriver?: (vehicle: Vehicle) => void;
  onSendTask?: (vehicle: Vehicle) => void;
}

export const MonitoringView: React.FC<MonitoringViewProps> = ({
  vehicles,
  geofences = [],
  onViewTrack = (_v: Vehicle) => {},
  onViewDetail = (_v: Vehicle) => {},
  onContactDriver = (v: Vehicle) => alert(`正在呼叫驾驶员 ${v.assignedDriverName || '主驾'}: ${v.driverPhone}`),
  onSendTask = (_v: Vehicle) => {},
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'running' | 'in_task' | 'alarm' | 'parking' | 'offline'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(vehicles[0]?.id || null);

  const filteredVehicles = vehicles.filter(v => {
    const matchesSearch = 
      v.plateNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.assignedDriverName && v.assignedDriverName.includes(searchQuery)) ||
      v.fleetName.includes(searchQuery) ||
      v.model.includes(searchQuery);

    const matchesStatus = statusFilter === 'all' ? true : v.status === statusFilter;
    const matchesType = typeFilter === 'all' ? true : v.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId) || vehicles[0];

  return (
    <div className="h-[calc(100vh-4rem)] p-4 sm:p-6 flex flex-col lg:flex-row gap-4 max-w-[1920px] mx-auto text-slate-100">
      {/* Left Column: Search & Vehicle List (340px) */}
      <div className="w-full lg:w-84 xl:w-96 bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col shadow-xl shrink-0 h-80 lg:h-full">
        {/* Title */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-sky-400" />
            <span className="font-bold text-sm text-white">全车队实时监控列表</span>
          </div>
          <span className="px-2 py-0.5 rounded text-xs bg-slate-800 text-slate-300 font-mono">
            {filteredVehicles.length} / {vehicles.length}
          </span>
        </div>

        {/* Search Input */}
        <div className="mt-3 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="搜索车牌、驾驶员、车队..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800/80 border border-slate-700/80 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="grid grid-cols-3 gap-1.5 mt-2.5 text-xs">
          {[
            { key: 'all', label: '全部' },
            { key: 'running', label: '行驶中' },
            { key: 'in_task', label: '任务中' },
            { key: 'alarm', label: '报警中' },
            { key: 'parking', label: '停车中' },
            { key: 'offline', label: '离线' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => {
                const newFilter = tab.key as any;
                setStatusFilter(newFilter);
                const nextList = vehicles.filter(v => {
                  const matchesSearch = 
                    v.plateNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (v.assignedDriverName && v.assignedDriverName.includes(searchQuery)) ||
                    v.fleetName.includes(searchQuery) ||
                    v.model.includes(searchQuery);
                  const matchesStatus = newFilter === 'all' ? true : v.status === newFilter;
                  const matchesType = typeFilter === 'all' ? true : v.type === typeFilter;
                  return matchesSearch && matchesStatus && matchesType;
                });
                if (nextList.length > 0 && (!selectedVehicleId || !nextList.some(v => v.id === selectedVehicleId))) {
                  setSelectedVehicleId(nextList[0].id);
                }
              }}
              className={`py-1.5 px-2 rounded-lg text-center transition font-medium text-[11px] ${
                statusFilter === tab.key
                  ? 'bg-sky-600 text-white shadow'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Vehicle List Items */}
        <div className="flex-1 overflow-y-auto mt-3 space-y-2 pr-1">
          {filteredVehicles.length === 0 ? (
            <div className="text-center py-10 text-xs text-slate-500">没有符合筛选条件的车辆</div>
          ) : (
            filteredVehicles.map(v => {
              const isSelected = v.id === selectedVehicleId;
              return (
                <div
                  key={v.id}
                  onClick={() => setSelectedVehicleId(v.id)}
                  className={`p-3 rounded-lg border cursor-pointer transition text-xs flex flex-col gap-1.5 ${
                    isSelected
                      ? 'bg-sky-950/40 border-sky-500 shadow-md ring-1 ring-sky-500/40'
                      : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-100 text-sm font-mono">{v.plateNumber}</span>
                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                        v.status === 'alarm' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                        v.status === 'in_task' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40' :
                        v.status === 'parking' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                        'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      }`}>
                        {v.status === 'alarm' ? '报警' :
                         v.status === 'in_task' ? '在途' :
                         v.status === 'parking' ? '静止' : '正常'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-sky-400 font-bold">{v.telemetry?.speed || 0} km/h</span>
                      {isSelected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping"></span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>司机: {v.assignedDriverName || '未分配'}</span>
                    <span>今日: {v.todayMileageKm} km</span>
                  </div>

                  <div className="text-[10px] text-slate-500 truncate flex items-center justify-between">
                    <span className="truncate">{v.address}</span>
                    <span className="text-[9px] text-sky-400/80 font-medium shrink-0 ml-1">定位 &gt;</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Column: GIS Map & Telemetry Dashboard */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        {/* Full GIS Map View */}
        <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-xl relative min-h-[380px]">
          <GisMap
            vehicles={filteredVehicles}
            selectedVehicleId={selectedVehicleId}
            onSelectVehicle={(v) => setSelectedVehicleId(v ? v.id : null)}
            onViewTrack={onViewTrack}
            onViewDetail={onViewDetail}
            onContactDriver={onContactDriver}
            onSendTask={onSendTask}
            geofences={geofences}
            className="w-full h-full"
          />
        </div>

        {/* Selected Vehicle Telemetry Sensor Gauges Bar */}
        {selectedVehicle && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl shrink-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-3 border-b border-slate-800 gap-2">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-sky-600/20 border border-sky-500/30 flex items-center justify-center">
                  <Truck className="w-5 h-5 text-sky-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-base text-white">{selectedVehicle.plateNumber}</span>
                    <span className="text-xs text-slate-400">({selectedVehicle.brand} {selectedVehicle.model})</span>
                  </div>
                  <p className="text-xs text-slate-400">所属车队: {selectedVehicle.fleetName} | 驾驶员: {selectedVehicle.assignedDriverName || '未指定'}</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-2 text-xs">
                <button
                  onClick={() => onViewDetail(selectedVehicle)}
                  className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-medium transition shadow flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>车辆档案</span>
                </button>
                <button
                  onClick={() => onViewTrack(selectedVehicle)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium transition flex items-center gap-1.5"
                >
                  <Route className="w-3.5 h-3.5" />
                  <span>历史轨迹</span>
                </button>
                <button
                  onClick={() => onContactDriver(selectedVehicle)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium transition flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>联系司机</span>
                </button>
              </div>
            </div>

            {/* Live OBD Telemetry Gauges Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-xs">
              <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/50">
                <span className="text-slate-400 block text-[11px] flex items-center gap-1">
                  <Gauge className="w-3.5 h-3.5 text-sky-400" />
                  车速 / 转速
                </span>
                <div className="mt-1 font-bold text-sm text-slate-100">
                  {selectedVehicle.telemetry.speed} <span className="text-xs text-slate-400 font-normal">km/h</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">RPM: {selectedVehicle.telemetry.rpm}</div>
              </div>

              <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/50">
                <span className="text-slate-400 block text-[11px] flex items-center gap-1">
                  <Thermometer className="w-3.5 h-3.5 text-amber-400" />
                  水温 / 油压
                </span>
                <div className="mt-1 font-bold text-sm text-slate-100">
                  {selectedVehicle.telemetry.waterTemp} <span className="text-xs text-slate-400 font-normal">°C</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">油压: {selectedVehicle.telemetry.oilPressure} kPa</div>
              </div>

              <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/50">
                <span className="text-slate-400 block text-[11px] flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-yellow-400" />
                  电瓶电压
                </span>
                <div className="mt-1 font-bold text-sm text-slate-100">
                  {selectedVehicle.telemetry.batteryVoltage} <span className="text-xs text-slate-400 font-normal">V</span>
                </div>
                <div className="text-[10px] text-emerald-400 mt-0.5">发电机充电正常</div>
              </div>

              <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/50">
                <span className="text-slate-400 block text-[11px] flex items-center gap-1">
                  <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
                  油位 / 载重
                </span>
                <div className="mt-1 font-bold text-sm text-slate-100">
                  {selectedVehicle.telemetry.fuelLevel}% <span className="text-xs text-slate-400 font-normal">剩余</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">载重: {selectedVehicle.telemetry.weightLoadTon || 0} 吨</div>
              </div>

              <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/50">
                <span className="text-slate-400 block text-[11px] flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5 text-purple-400" />
                  今日工况
                </span>
                <div className="mt-1 font-bold text-sm text-slate-100">
                  {selectedVehicle.todayMileageKm} <span className="text-xs text-slate-400 font-normal">km</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">行车: {selectedVehicle.todayDrivingMinutes} 分钟</div>
              </div>

              <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/50">
                <span className="text-slate-400 block text-[11px] flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  AI 健康评分
                </span>
                <div className="mt-1 font-bold text-sm text-emerald-400">
                  {selectedVehicle.healthScore} <span className="text-xs text-slate-400 font-normal">分</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">下次保养: {selectedVehicle.maintenanceDueKm}km</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
