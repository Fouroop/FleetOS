import React, { useState } from 'react';
import { FleetEvent } from '../../types';
import { 
  ShieldAlert, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  FileText, 
  AlertTriangle, 
  Search, 
  Sliders, 
  X,
  UserCheck
} from 'lucide-react';

interface EventCenterViewProps {
  events: FleetEvent[];
  onUpdateEventStatus: (eventId: string, status: FleetEvent['status'], rectificationNotes?: string) => void;
}

export const EventCenterView: React.FC<EventCenterViewProps> = ({
  events,
  onUpdateEventStatus,
}) => {
  const [selectedEvent, setSelectedEvent] = useState<FleetEvent | null>(null);
  const [rectificationText, setRectificationText] = useState('已组织当事驾驶员进行 2 小时安全防御驾驶专项再培训并签署安全承诺书。');

  const handleCloseEvent = (eventId: string) => {
    onUpdateEventStatus(eventId, 'closed', rectificationText);
    setSelectedEvent(null);
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-[1920px] mx-auto text-slate-100">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-purple-400" />
            <h1 className="font-bold text-lg text-white">AI 异常事件处置与闭环中心</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            将车辆、驾驶员、冷链、维保等散点报警自动聚合为“有因有果、责任到人、闭环归档”的结构化事件案卷
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-300 font-bold flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>AI 自动归因准确率: 98.2%</span>
          </div>
        </div>
      </div>

      {/* Pipeline Stages Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow">
          <span className="text-slate-400 block text-[11px]">1. AI 自动识别分类</span>
          <div className="text-xl font-bold text-white mt-1">100% 规则+AI 引擎</div>
          <span className="text-[10px] text-emerald-400 mt-1 block">自动匹配责任人与等级</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow">
          <span className="text-slate-400 block text-[11px]">2. 待处置 / 整改中</span>
          <div className="text-xl font-bold text-amber-400 mt-1">
            {events.filter(e => e.status === 'rectifying' || e.status === 'dispatched').length} 起
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">超时未整改将升级预警</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow">
          <span className="text-slate-400 block text-[11px]">3. 结果复核核销</span>
          <div className="text-xl font-bold text-sky-400 mt-1">
            {events.filter(e => e.status === 'reviewing').length} 起
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">主管签字与驾驶员复查</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow">
          <span className="text-slate-400 block text-[11px]">4. 已闭环归档</span>
          <div className="text-xl font-bold text-emerald-400 mt-1">
            {events.filter(e => e.status === 'closed').length} 起
          </div>
          <span className="text-[10px] text-emerald-400 mt-1 block">计入当月绩效扣分</span>
        </div>
      </div>

      {/* Events Stream Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/80 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">事件案卷号 / 时间</th>
                <th className="py-3 px-4">涉及人车 / 分类</th>
                <th className="py-3 px-4">AI 智能定性与事件摘要</th>
                <th className="py-3 px-4">责任主管 / 整改期限</th>
                <th className="py-3 px-4">当前流转状态</th>
                <th className="py-3 px-4 text-right">处置</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {events.map(ev => (
                <tr key={ev.id} className="hover:bg-slate-800/50 transition">
                  <td className="py-3 px-4">
                    <div className="font-mono font-bold text-sky-400">{ev.eventNo}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{ev.createdAt}</div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-bold text-white text-sm">{ev.plateNumber}</div>
                    <div className="text-[11px] text-slate-400">{ev.driverName} · <span className="text-indigo-400 font-semibold">{ev.category}</span></div>
                  </td>

                  <td className="py-3 px-4 max-w-md">
                    <div className="font-bold text-slate-100 flex items-center gap-1.5">
                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                        ev.severityLevel === '一级' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                        ev.severityLevel === '二级' ? 'bg-amber-500/20 text-amber-300' :
                        'bg-blue-500/20 text-blue-300'
                      }`}>
                        {ev.severityLevel}
                      </span>
                      <span>{ev.title}</span>
                    </div>
                    <p className="text-slate-400 text-[11px] line-clamp-1 mt-1">{ev.description}</p>
                  </td>

                  <td className="py-3 px-4">
                    <div className="text-slate-200 font-medium">{ev.assignedTo}</div>
                    <div className="text-[10px] text-rose-400 mt-0.5">截止: {ev.deadline}</div>
                  </td>

                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      ev.status === 'closed' ? 'bg-emerald-500/20 text-emerald-300' :
                      ev.status === 'rectifying' ? 'bg-amber-500/20 text-amber-300 animate-pulse' :
                      'bg-purple-500/20 text-purple-300'
                    }`}>
                      {ev.status === 'closed' ? '✅ 已归档闭环' :
                       ev.status === 'rectifying' ? '⏳ 督导整改中' : '📋 待派发'}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setSelectedEvent(ev)}
                      className="px-3 py-1 bg-purple-600/30 hover:bg-purple-600 text-purple-300 hover:text-white rounded text-xs font-bold transition border border-purple-500/40 shadow"
                    >
                      案卷详情
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Event Dossier Details & Action Plan */}
      {selectedEvent && (
        <div className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-purple-400" />
                <h3 className="font-bold text-base text-white">AI 异常事件案卷: {selectedEvent.eventNo}</h3>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-800/70 p-3.5 rounded-xl border border-slate-700 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">{selectedEvent.title}</span>
                <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 rounded font-bold">{selectedEvent.severityLevel}</span>
              </div>
              <p className="text-slate-300 leading-relaxed">{selectedEvent.description}</p>
              <div className="grid grid-cols-2 gap-2 text-slate-400 pt-2 border-t border-slate-700/60">
                <div>涉及车辆: <span className="font-bold text-slate-200">{selectedEvent.plateNumber}</span></div>
                <div>责任驾驶员: <span className="font-bold text-slate-200">{selectedEvent.driverName}</span></div>
                <div>负责督导员: <span className="text-slate-200">{selectedEvent.assignedTo}</span></div>
                <div>整改截止时间: <span className="text-rose-400 font-mono">{selectedEvent.deadline}</span></div>
              </div>
            </div>

            {/* AI Root Cause Analysis */}
            <div className="p-3.5 bg-gradient-to-r from-purple-950/70 via-slate-800 to-indigo-950/70 rounded-xl border border-purple-800/40 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-purple-300">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>AI 智能根因分析 (Root Cause Investigation)</span>
              </div>
              <p className="text-slate-200 leading-relaxed bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                💡 {selectedEvent.aiRootCauseAnalysis || '经车联网大数据分析，该事件属于长途连续夜行导致的认知疲劳，车载前向传感器与车道保持系统在当时无硬件故障。'}
              </p>
            </div>

            {/* AI Action Plan */}
            <div className="p-3.5 bg-slate-800/60 rounded-xl border border-slate-700 space-y-2">
              <span className="font-bold text-slate-200 block">AI 推荐整改行动计划</span>
              <p className="text-slate-300 leading-relaxed">
                {selectedEvent.aiActionPlan || '1. 下发防御性驾驶安全警示；2. 强制该班次中途进入就近服务区停驶休息不少于 20 分钟；3. 扣减当月安全积分 5 分。'}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <span className="text-slate-500 text-[11px]">事件状态: {selectedEvent.status}</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedEvent(null)}
                  className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  关闭
                </button>
                {selectedEvent.status !== 'closed' && (
                  <button
                    type="button"
                    onClick={() => handleCloseEvent(selectedEvent.id)}
                    className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                  >
                    确认整改完成并归档
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
