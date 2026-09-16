import React, { useState } from 'react';
import { AccidentRecord, Vehicle } from '../../types';
import { 
  AlertCircle, 
  Plus, 
  Sparkles, 
  ShieldCheck, 
  FileText, 
  DollarSign, 
  Clock, 
  Calendar,
  X
} from 'lucide-react';

interface AccidentManagementViewProps {
  accidents: AccidentRecord[];
  vehicles: Vehicle[];
  onAddAccident: (acc: Partial<AccidentRecord>) => void;
}

export const AccidentManagementView: React.FC<AccidentManagementViewProps> = ({
  accidents,
  vehicles,
  onAddAccident,
}) => {
  const [selectedAccident, setSelectedAccident] = useState<AccidentRecord | null>(null);

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-[1920px] mx-auto text-slate-100">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-500" />
            <h1 className="font-bold text-lg text-white">事故全流程管理与 AI “人·车·路·管” 深度归因</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            出险报案 → 现场勘查 → 责任认定 → 保险理赔 → AI 4维复盘与防范整改闭环
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            <span>连续安全运营: 248 天无重大伤亡事故</span>
          </div>
        </div>
      </div>

      {/* Accidents Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/80 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">事故案号 / 发生时间</th>
                <th className="py-3 px-4">涉事车辆 / 驾驶员</th>
                <th className="py-3 px-4">事故等级 / 发生地点</th>
                <th className="py-3 px-4">责任认定</th>
                <th className="py-3 px-4">理赔与直接损失</th>
                <th className="py-3 px-4">处置进度</th>
                <th className="py-3 px-4 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {accidents.map(a => (
                <tr key={a.id} className="hover:bg-slate-800/50 transition">
                  <td className="py-3 px-4">
                    <div className="font-mono font-bold text-sky-400">{a.accidentNo}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{a.date}</div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-bold text-white text-sm">{a.plateNumber}</div>
                    <div className="text-[11px] text-slate-400">{a.driverName}</div>
                  </td>

                  <td className="py-3 px-4">
                    <span className="px-1.5 py-0.2 rounded text-[10px] bg-amber-500/20 text-amber-300 font-bold">
                      {a.severity === 'minor' ? '轻微刮擦' : a.severity === 'general' ? '一般事故' : '重大事故'}
                    </span>
                    <div className="text-[11px] text-slate-300 mt-1">{a.location}</div>
                  </td>

                  <td className="py-3 px-4">
                    <span className="font-medium text-slate-200">{a.responsibility}</span>
                  </td>

                  <td className="py-3 px-4 font-mono">
                    <div className="text-rose-400 font-bold">损失: ¥{a.directLossYuan.toLocaleString()}</div>
                    <div className="text-[10px] text-emerald-400">已赔: ¥{a.insuranceClaimYuan.toLocaleString()}</div>
                  </td>

                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      a.status === 'closed' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {a.status === 'closed' ? '已结案归档' : '理赔审核中'}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setSelectedAccident(a)}
                      className="px-3 py-1 bg-purple-600/30 hover:bg-purple-600 text-purple-300 hover:text-white rounded text-xs font-bold transition border border-purple-500/40"
                    >
                      AI 四维复盘
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: AI 4-Factor Root Cause Analysis */}
      {selectedAccident && (
        <div className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <h3 className="font-bold text-base text-white">事故 AI “人·车·路·管” 深度复盘报告</h3>
              </div>
              <button
                onClick={() => setSelectedAccident(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-800/70 p-3 rounded-xl border border-slate-700 space-y-1">
              <div className="flex justify-between">
                <span className="font-bold text-white text-sm">{selectedAccident.accidentNo} ({selectedAccident.plateNumber})</span>
                <span className="text-slate-400">{selectedAccident.date}</span>
              </div>
              <p className="text-slate-300 text-xs">{selectedAccident.description}</p>
            </div>

            {/* 4 Factor Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700">
                <span className="font-bold text-amber-400 block mb-1">👤 1. 人的因素 (Driver Behavior)</span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {selectedAccident.ai4FactorAnalysis.humanFactor}
                </p>
              </div>

              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700">
                <span className="font-bold text-sky-400 block mb-1">🚛 2. 车的因素 (Vehicle Mechanics)</span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {selectedAccident.ai4FactorAnalysis.vehicleFactor}
                </p>
              </div>

              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700">
                <span className="font-bold text-emerald-400 block mb-1">🛣️ 3. 路的因素 (Environment & Road)</span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {selectedAccident.ai4FactorAnalysis.roadFactor}
                </p>
              </div>

              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700">
                <span className="font-bold text-purple-400 block mb-1">📋 4. 管的因素 (Fleet Management)</span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {selectedAccident.ai4FactorAnalysis.managementFactor}
                </p>
              </div>
            </div>

            {/* Preventative Measures */}
            <div className="p-3 bg-purple-950/40 rounded-xl border border-purple-800/50 space-y-1.5">
              <span className="font-bold text-purple-300 block">AI 推荐长效防范整改措施</span>
              <p className="text-slate-200 text-[11px] leading-relaxed">
                {selectedAccident.preventiveMeasures}
              </p>
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-slate-800">
              <button
                onClick={() => setSelectedAccident(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-bold"
              >
                关闭报告
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
