import React, { useState } from 'react';
import { Driver } from '../../types';
import { getAiDriverDiagnosis, DriverDiagnosis } from '../../services/api';
import { 
  Users, 
  Search, 
  Plus, 
  Award, 
  Flame, 
  ShieldCheck, 
  Phone, 
  Truck, 
  Sparkles, 
  Calendar, 
  AlertCircle,
  Eye,
  TrendingUp,
  X,
  FileCheck
} from 'lucide-react';

interface DriverManagementViewProps {
  drivers: Driver[];
  onAddDriver: (driver: Partial<Driver>) => void;
}

export const DriverManagementView: React.FC<DriverManagementViewProps> = ({
  drivers,
  onAddDriver,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState('all');
  const [statusTab, setStatusTab] = useState<'all' | 'excellent' | 'warning' | 'expiring'>('all');
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [diagnosis, setDiagnosis] = useState<DriverDiagnosis | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // New Driver Form State
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newLicenseType, setNewLicenseType] = useState('A2 牵引车');
  const [newFleet, setNewFleet] = useState('华东干线一队');
  const [newYears, setNewYears] = useState(8);

  const filteredDrivers = drivers.filter(d => {
    const matchSearch =
      d.name.includes(searchQuery) ||
      d.phone.includes(searchQuery) ||
      d.fleetName.includes(searchQuery) ||
      (d.currentVehiclePlate && d.currentVehiclePlate.includes(searchQuery));
    const matchRisk = riskFilter === 'all' ? true : d.riskLevel === riskFilter;
    
    let matchTab = true;
    if (statusTab === 'excellent') matchTab = d.safetyScore >= 88;
    if (statusTab === 'warning') matchTab = d.safetyScore < 80 || d.riskLevel === 'high';
    if (statusTab === 'expiring') matchTab = true; // In mock data

    return matchSearch && matchRisk && matchTab;
  });

  const handleCreateDriverSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    onAddDriver({
      id: `d-${Date.now()}`,
      name: newName.trim(),
      phone: newPhone || '13800138888',
      idCard: `310115198${Math.floor(100000000 + Math.random() * 900000000)}`,
      licenseType: newLicenseType,
      drivingYears: newYears,
      fleetName: newFleet,
      currentVehiclePlate: '待分配',
      safetyScore: 95,
      riskLevel: 'low',
      totalSafeMileageKm: 150000,
      licenseExpiryDate: '2030-05-20',
      qualificationExpiryDate: '2028-06-15',
      preTripInspectionPassRate: 99,
      scoreBreakdown: {
        harshAcceleration: 0,
        harshBraking: 1,
        harshTurning: 0,
        speedingCount: 0,
        fatigueCount: 0,
        distractionCount: 0,
      },
      rewardsAndPenalties: [
        { id: `rp-${Date.now()}`, date: '2026-08-20', type: 'reward', description: '入职通过防御性驾驶全面实操考核', amount: 500 }
      ]
    });

    setNewName('');
    setNewPhone('');
    setShowAddModal(false);
  };

  const handleOpenDriverModal = (driver: Driver) => {
    setSelectedDriver(driver);
    setLoadingAi(true);
    getAiDriverDiagnosis(driver)
      .then(res => setDiagnosis(res))
      .finally(() => setLoadingAi(false));
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-[1920px] mx-auto text-slate-100">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-sky-400" />
            <h1 className="font-bold text-lg text-white">驾驶员全生命周期档案 (一人一档)</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            涵盖“准入审核 → 100分制安全驾驶行为画像 → 证照到期预警 → 培训整改 → 绩效考核”
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold flex items-center gap-1.5 text-xs">
            <ShieldCheck className="w-4 h-4" />
            <span>车队平均安全分: 84.6 分</span>
          </div>

          <button
            id="btn-add-driver"
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-lg shadow-sky-600/30 transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>录入驾驶员建档</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-md flex flex-wrap items-center justify-between gap-3">
        <div className="flex-1 min-w-[240px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="搜索驾驶员姓名、手机号、车牌、车队..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>

        {/* Quick Filter Tabs */}
        <div className="flex items-center gap-1.5 text-xs">
          {[
            { key: 'all', label: '全部在册' },
            { key: 'excellent', label: '优秀驾驶员 (≥88分)' },
            { key: 'warning', label: '重点督导 (<80分)' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setStatusTab(tab.key as any)}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                statusTab === tab.key
                  ? 'bg-sky-600 text-white shadow'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="driver-risk-filter" className="text-xs text-slate-400">风险等级:</label>
          <select
            id="driver-risk-filter"
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-2 focus:outline-none focus:border-sky-500"
          >
            <option value="all">全部风险</option>
            <option value="low">低风险 (优秀)</option>
            <option value="medium">中风险 (需关注)</option>
            <option value="high">高风险 (重点督导)</option>
          </select>
        </div>
      </div>

      {/* Driver Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredDrivers.map(d => (
          <div
            key={d.id}
            onClick={() => handleOpenDriverModal(d)}
            className="bg-slate-900 border border-slate-800 hover:border-sky-500/60 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div>
              {/* Top Row: Avatar & Safety Score Badge */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center font-bold text-base text-slate-200 shadow">
                    {d.name.slice(0, 1)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-base group-hover:text-sky-300 transition">{d.name}</span>
                      <span className="text-[10px] px-1.5 py-0.2 bg-slate-800 rounded border border-slate-700 text-slate-300">
                        {d.licenseType}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">{d.fleetName}</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className={`text-xl font-black ${
                    d.safetyScore >= 85 ? 'text-emerald-400' :
                    d.safetyScore >= 70 ? 'text-amber-400' : 'text-rose-500'
                  }`}>
                    {d.safetyScore}
                    <span className="text-xs text-slate-400 font-normal">分</span>
                  </div>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                    d.riskLevel === 'high' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                    d.riskLevel === 'medium' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                    'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}>
                    {d.riskLevel === 'high' ? '高风险' : d.riskLevel === 'medium' ? '中风险' : '低风险'}
                  </span>
                </div>
              </div>

              {/* Driving Experience & Bound Vehicle */}
              <div className="mt-3.5 space-y-1.5 text-xs text-slate-300">
                <div className="flex items-center justify-between py-1 border-t border-slate-800/80">
                  <span className="text-slate-400">当前绑定车辆</span>
                  <span className="font-bold text-sky-400">{d.currentVehiclePlate || '暂无指派'}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-t border-slate-800/80">
                  <span className="text-slate-400">总安全里程 / 驾龄</span>
                  <span className="font-medium text-slate-200">{d.totalSafeMileageKm.toLocaleString()} km / {d.drivingYears} 年</span>
                </div>
                <div className="flex items-center justify-between py-1 border-t border-slate-800/80">
                  <span className="text-slate-400">驾驶证年审到期</span>
                  <span className="text-slate-300 font-mono">{d.licenseExpiryDate}</span>
                </div>
              </div>

              {/* Behavior Breakdown Pills */}
              <div className="grid grid-cols-3 gap-1.5 mt-3 text-center text-[10px]">
                <div className="bg-slate-800/60 p-1.5 rounded border border-slate-700/40">
                  <span className="text-slate-400 block">急加速</span>
                  <span className="font-bold text-slate-200">{d.scoreBreakdown.harshAcceleration}次</span>
                </div>
                <div className="bg-slate-800/60 p-1.5 rounded border border-slate-700/40">
                  <span className="text-slate-400 block">急刹车</span>
                  <span className="font-bold text-slate-200">{d.scoreBreakdown.harshBraking}次</span>
                </div>
                <div className="bg-slate-800/60 p-1.5 rounded border border-slate-700/40">
                  <span className="text-slate-400 block">超速/分神</span>
                  <span className={`font-bold ${d.scoreBreakdown.speedingCount > 0 ? 'text-rose-400' : 'text-slate-200'}`}>
                    {d.scoreBreakdown.speedingCount + d.scoreBreakdown.distractionCount}次
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                {d.phone}
              </span>
              <span className="text-sky-400 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                <span>一人一档详情</span>
                <span>→</span>
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Driver One-Person-One-File Detail Modal */}
      {selectedDriver && (
        <div className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-200">
            {/* Header */}
            <div className="p-4 sm:p-5 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-sky-600/20 border border-sky-500/30 flex items-center justify-center font-bold text-lg text-sky-400">
                  {selectedDriver.name.slice(0, 1)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-black text-white">{selectedDriver.name}</h2>
                    <span className="px-2 py-0.5 text-xs bg-slate-800 border border-slate-700 rounded text-slate-300 font-mono">
                      准驾: {selectedDriver.licenseType}
                    </span>
                    <span className="text-xs text-emerald-400 font-semibold">
                      安全驾龄: {selectedDriver.drivingYears} 年
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{selectedDriver.fleetName} | 手机: {selectedDriver.phone}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedDriver(null)}
                className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4 text-xs">
              {/* Score & Risk Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 text-center">
                  <span className="text-slate-400 text-[11px]">综合安全得分</span>
                  <div className="text-3xl font-black text-sky-400 font-mono mt-1">{selectedDriver.safetyScore}</div>
                  <span className="text-[10px] text-slate-400">满分 100 分</span>
                </div>

                <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 text-center">
                  <span className="text-slate-400 text-[11px]">风险评级</span>
                  <div className={`text-xl font-bold mt-2 ${
                    selectedDriver.riskLevel === 'high' ? 'text-rose-500' :
                    selectedDriver.riskLevel === 'medium' ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {selectedDriver.riskLevel === 'high' ? '高风险关注' : selectedDriver.riskLevel === 'medium' ? '中风险关注' : '低风险优质'}
                  </div>
                  <span className="text-[10px] text-slate-400">基于近30天遥测</span>
                </div>

                <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 text-center">
                  <span className="text-slate-400 text-[11px]">总安全行驶里程</span>
                  <div className="text-xl font-bold text-white font-mono mt-2">{selectedDriver.totalSafeMileageKm.toLocaleString()}</div>
                  <span className="text-[10px] text-slate-400">km</span>
                </div>

                <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 text-center">
                  <span className="text-slate-400 text-[11px]">当前绑定车辆</span>
                  <div className="text-base font-bold text-sky-400 mt-2">{selectedDriver.currentVehiclePlate || '暂未绑定'}</div>
                  <span className="text-[10px] text-slate-400">可调度在网状态</span>
                </div>
              </div>

              {/* AI Driver Diagnosis Card */}
              <div className="bg-gradient-to-r from-purple-950/60 via-slate-800 to-indigo-950/60 p-4 rounded-xl border border-purple-800/50">
                <div className="flex items-center justify-between pb-2 border-b border-purple-800/40">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span className="font-bold text-xs text-white">AI 驾驶员多维画像与安全督导建议</span>
                  </div>
                  {loadingAi && <span className="text-[10px] text-purple-300 animate-pulse">Gemini 深度分析中...</span>}
                </div>

                {diagnosis && (
                  <div className="mt-3 space-y-2 text-xs text-slate-200">
                    <p className="text-slate-300 leading-relaxed">{diagnosis.summary}</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                      <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                        <span className="text-rose-400 font-bold block mb-1">⚠️ 潜在风险点:</span>
                        <ul className="list-disc list-inside space-y-0.5 text-slate-300 text-[11px]">
                          {diagnosis.keyRisks.map((r, i) => <li key={i}>{r}</li>)}
                        </ul>
                      </div>

                      <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                        <span className="text-emerald-400 font-bold block mb-1">🛡️ 良好驾驶习惯:</span>
                        <ul className="list-disc list-inside space-y-0.5 text-slate-300 text-[11px]">
                          {diagnosis.positiveTraits.map((t, i) => <li key={i}>{t}</li>)}
                        </ul>
                      </div>
                    </div>

                    <div className="p-2.5 bg-purple-900/30 rounded-lg border border-purple-700/40 text-purple-200 text-[11px]">
                      <span className="font-bold">车队管理行动计划: </span>
                      {diagnosis.actionPlan}
                    </div>
                  </div>
                )}
              </div>

              {/* Behavior Sub-scores Details */}
              <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60">
                <h4 className="font-bold text-xs text-slate-200 mb-3">近30天不良驾驶行为扣分明细</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                  <div className="p-2 bg-slate-900/60 rounded border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">急加速扣分</span>
                    <span className="font-bold text-slate-200">{selectedDriver.scoreBreakdown.harshAcceleration} 次</span>
                  </div>
                  <div className="p-2 bg-slate-900/60 rounded border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">急减速/急刹车</span>
                    <span className="font-bold text-slate-200">{selectedDriver.scoreBreakdown.harshBraking} 次</span>
                  </div>
                  <div className="p-2 bg-slate-900/60 rounded border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">急转弯</span>
                    <span className="font-bold text-slate-200">{selectedDriver.scoreBreakdown.harshTurning} 次</span>
                  </div>
                  <div className="p-2 bg-slate-900/60 rounded border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">超速行为</span>
                    <span className={`font-bold ${selectedDriver.scoreBreakdown.speedingCount > 0 ? 'text-rose-400' : 'text-slate-200'}`}>
                      {selectedDriver.scoreBreakdown.speedingCount} 次
                    </span>
                  </div>
                  <div className="p-2 bg-slate-900/60 rounded border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">疲劳驾驶预警</span>
                    <span className={`font-bold ${selectedDriver.scoreBreakdown.fatigueCount > 0 ? 'text-rose-400' : 'text-slate-200'}`}>
                      {selectedDriver.scoreBreakdown.fatigueCount} 次
                    </span>
                  </div>
                  <div className="p-2 bg-slate-900/60 rounded border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">分神/打电话</span>
                    <span className="font-bold text-slate-200">{selectedDriver.scoreBreakdown.distractionCount} 次</span>
                  </div>
                  <div className="p-2 bg-slate-900/60 rounded border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">出车前点检合格率</span>
                    <span className="font-bold text-emerald-400">{selectedDriver.preTripInspectionPassRate}%</span>
                  </div>
                  <div className="p-2 bg-slate-900/60 rounded border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">从业资格证到期</span>
                    <span className="font-bold text-slate-200">{selectedDriver.qualificationExpiryDate}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-800/90 border-t border-slate-700 flex items-center justify-between text-xs">
              <span className="text-slate-400">档案编号: {selectedDriver.id}</span>
              <button
                onClick={() => setSelectedDriver(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-medium"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add New Driver */}
      {showAddModal && (
        <div className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full p-6 shadow-2xl">
            <h3 className="font-bold text-base text-white pb-3 border-b border-slate-800 flex items-center gap-2">
              <Users className="w-5 h-5 text-sky-400" />
              <span>录入驾驶员一人一档台账</span>
            </h3>

            <form onSubmit={handleCreateDriverSubmit} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">驾驶员姓名</label>
                  <input
                    type="text"
                    required
                    placeholder="例如: 张志强"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">手机号码</label>
                  <input
                    type="tel"
                    required
                    placeholder="例如: 13800138888"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">准驾车型 (驾驶证)</label>
                  <select
                    value={newLicenseType}
                    onChange={(e) => setNewLicenseType(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="A2 牵引车">A2 (重型半挂牵引车)</option>
                    <option value="A1 大型客车">A1 (大型客车)</option>
                    <option value="B2 大型货车">B2 (大型重型货车)</option>
                    <option value="C1 小型汽车">C1 (小型汽车/轻型货车)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">实际驾龄 (年)</label>
                  <input
                    type="number"
                    min="1"
                    max="40"
                    value={newYears}
                    onChange={(e) => setNewYears(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">所属车队</label>
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

              <div className="p-3 bg-sky-500/10 border border-sky-500/30 rounded-lg text-slate-300 text-[11px] leading-relaxed">
                ℹ️ 系统将自动初始化驾驶员 100 分安全行为画像基线，并在后续行车过程中实时从车联网 OBD、ADAS 视觉终端采集急加速、超速、疲劳驾驶行为并动态修正画像。
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
                  保存并录入档案
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
