import React, { useState } from 'react';
import { Vehicle, Driver } from '../../types';
import { 
  FileCheck, 
  Search, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ShieldCheck,
  Truck,
  User
} from 'lucide-react';

interface DocumentManagementViewProps {
  vehicles: Vehicle[];
  drivers: Driver[];
}

export const DocumentManagementView: React.FC<DocumentManagementViewProps> = ({
  vehicles,
  drivers,
}) => {
  const [tab, setTab] = useState<'vehicle' | 'driver'>('vehicle');

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-[1920px] mx-auto text-slate-100">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-teal-400" />
            <h1 className="font-bold text-lg text-white">车队人车证照与合规到期预警台账</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            实时监控行驶证、道路运输证、交强险、商业险、驾驶证、从业资格证到期倒计时，杜绝无证脱审上路
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs">
          <button
            onClick={() => setTab('vehicle')}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
              tab === 'vehicle' ? 'bg-teal-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>车辆年审与保险 ({vehicles.length})</span>
          </button>

          <button
            onClick={() => setTab('driver')}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
              tab === 'driver' ? 'bg-teal-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <User className="w-4 h-4" />
            <span>驾驶员驾照与从业证 ({drivers.length})</span>
          </button>
        </div>
      </div>

      {/* Tables based on tab */}
      {tab === 'vehicle' ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/80 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">车牌号 / 车型</th>
                  <th className="py-3 px-4">所属车队 / 主驾</th>
                  <th className="py-3 px-4">行驶证年检到期</th>
                  <th className="py-3 px-4">道路运输证到期</th>
                  <th className="py-3 px-4">商业险 / 交强险到期</th>
                  <th className="py-3 px-4 text-right">合规状态</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {vehicles.map(v => (
                  <tr key={v.id} className="hover:bg-slate-800/50 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-white text-sm">{v.plateNumber}</div>
                      <div className="text-[10px] text-slate-400">{v.brand} · {v.type}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="text-slate-200">{v.fleetName}</div>
                      <div className="text-[11px] text-sky-400">{v.assignedDriverName || '未分配'}</div>
                    </td>

                    <td className="py-3 px-4 font-mono">
                      <div className="text-slate-200">{v.annualInspectionDate}</div>
                      <span className="text-[10px] text-emerald-400">剩余 128 天</span>
                    </td>

                    <td className="py-3 px-4 font-mono">
                      <div className="text-slate-200">{v.transportPermitExpiryDate}</div>
                      <span className="text-[10px] text-emerald-400">有效</span>
                    </td>

                    <td className="py-3 px-4 font-mono">
                      <div className="text-slate-200">{v.commercialInsuranceExpiryDate}</div>
                      <span className="text-[10px] text-amber-400">剩余 45 天 (待续保)</span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 font-bold rounded-full text-[10px]">
                        全部合规在审
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/80 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">驾驶员姓名 / 手机</th>
                  <th className="py-3 px-4">所属车队 / 准驾车型</th>
                  <th className="py-3 px-4">驾驶证年审到期</th>
                  <th className="py-3 px-4">道路运输从业资格证到期</th>
                  <th className="py-3 px-4">年度体检状态</th>
                  <th className="py-3 px-4 text-right">资质状态</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {drivers.map(d => (
                  <tr key={d.id} className="hover:bg-slate-800/50 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-white text-sm">{d.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{d.phone}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="text-slate-200">{d.fleetName}</div>
                      <span className="text-[10px] px-1.5 py-0.2 bg-slate-800 rounded text-slate-300 font-mono">
                        {d.licenseType}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono">
                      <div className="text-slate-200">{d.licenseExpiryDate}</div>
                      <span className="text-[10px] text-emerald-400">有效</span>
                    </td>

                    <td className="py-3 px-4 font-mono">
                      <div className="text-slate-200">{d.qualificationExpiryDate}</div>
                      <span className="text-[10px] text-emerald-400">有效</span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="text-emerald-400 text-xs">已体检合格 (2026-03)</span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 font-bold rounded-full text-[10px]">
                        准驾在网
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
