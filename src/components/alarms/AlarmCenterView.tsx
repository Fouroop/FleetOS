import React, { useState } from 'react';
import { AlarmRecord, Vehicle } from '../../types';
import { gpsSimulator } from '../../services/gpsSimulator';
import { 
  AlertOctagon, 
  Search, 
  Volume2, 
  VolumeX, 
  CheckCircle2, 
  PhoneCall, 
  ShieldAlert, 
  Send, 
  Sparkles, 
  Flame, 
  Zap, 
  Clock,
  Filter
} from 'lucide-react';

interface AlarmCenterViewProps {
  alarms: AlarmRecord[];
  vehicles: Vehicle[];
  onConfirmAlarm: (alarmId: string, remark: string) => void;
  onDispatchedToEvent: (alarmId: string) => void;
}

export const AlarmCenterView: React.FC<AlarmCenterViewProps> = ({
  alarms,
  vehicles,
  onConfirmAlarm,
  onDispatchedToEvent,
}) => {
  const [severityFilter, setSeverityFilter] = useState('all');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [selectedAlarm, setSelectedAlarm] = useState<AlarmRecord | null>(null);
  const [confirmRemark, setConfirmRemark] = useState('已通过车载语音与驾驶员沟通，要求立即降速并保持安全车距。');

  const filteredAlarms = alarms.filter(a => {
    if (severityFilter === 'all') return true;
    return a.severity === severityFilter;
  });

  const handleSimulateAlarm = (type: any, title: string, desc: string) => {
    const targetVeh = vehicles[0] || { id: 'v-01' };
    gpsSimulator.triggerManualAlarm(targetVeh.id, type, title, desc);
  };

  const handleConfirmSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAlarm) return;
    onConfirmAlarm(selectedAlarm.id, confirmRemark);
    setSelectedAlarm(null);
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-[1920px] mx-auto text-slate-100">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 text-rose-500 animate-pulse" />
            <h1 className="font-bold text-lg text-white">实时安全预警与报警处置中心</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            支持超速、疲劳、越界、碰撞侧翻、水温过高、冷链失温、离线等 12 种异常场景秒级推送与闭环处置
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 font-medium transition ${
              soundEnabled
                ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-sky-400" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            <span>{soundEnabled ? '声光警报开启' : '警报静音'}</span>
          </button>

          {/* Test Trigger Buttons */}
          <button
            onClick={() => handleSimulateAlarm('overspeed', '严重超速预警 (102 km/h)', '在限速80km/h高速路段持续超速行驶')}
            className="px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 font-bold transition shadow"
          >
            ⚡ 模拟超速报警
          </button>
          <button
            onClick={() => handleSimulateAlarm('temp_abnormal', '冷链货厢失温告警 (-8.2℃)', '设定温度-18℃，已持续升温超过警戒阈值')}
            className="px-3 py-1.5 rounded-lg bg-amber-600/20 hover:bg-amber-600 text-amber-300 hover:text-white border border-amber-500/40 font-bold transition shadow"
          >
            ❄️ 模拟失温报警
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-md text-xs">
        <span className="text-slate-400 font-medium">严重程度:</span>
        {[
          { key: 'all', label: '全部报警' },
          { key: 'critical', label: '高危致命 (Critical)' },
          { key: 'severe', label: '严重报警 (Severe)' },
          { key: 'warning', label: '一般预警 (Warning)' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setSeverityFilter(tab.key)}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              severityFilter === tab.key
                ? 'bg-rose-600 text-white shadow font-bold'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Alarms Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/80 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">报警级别 / 时间</th>
                <th className="py-3 px-4">涉事车辆 / 驾驶员</th>
                <th className="py-3 px-4">预警类型 / 详情描述</th>
                <th className="py-3 px-4">发生位置与车速</th>
                <th className="py-3 px-4">处置状态</th>
                <th className="py-3 px-4 text-right">处置动作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {filteredAlarms.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    当前无未处理报警，车队运行平稳。
                  </td>
                </tr>
              ) : (
                filteredAlarms.map(a => (
                  <tr key={a.id} className="hover:bg-slate-800/50 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${
                          a.severity === 'critical' ? 'bg-rose-500 animate-ping' :
                          a.severity === 'severe' ? 'bg-rose-500' : 'bg-amber-500'
                        }`}></span>
                        <span className={`font-bold uppercase text-[10px] px-1.5 py-0.2 rounded ${
                          a.severity === 'critical' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                          a.severity === 'severe' ? 'bg-rose-500/20 text-rose-300' :
                          'bg-amber-500/20 text-amber-300'
                        }`}>
                          {a.severity === 'critical' ? '特级高危' : a.severity === 'severe' ? '严重预警' : '一般预警'}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-1">{a.timestamp}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-white text-sm">{a.plateNumber}</div>
                      <div className="text-[11px] text-slate-400">
                        {a.driverName} · <span className="font-mono">{a.driverPhone}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-rose-400">{a.title}</div>
                      <div className="text-[11px] text-slate-300 line-clamp-1 mt-0.5">{a.description}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="text-slate-300 font-medium">{a.locationName}</div>
                      <div className="text-[10px] text-sky-400 font-mono mt-0.5">瞬时时速: {a.speed} km/h</div>
                    </td>

                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        a.status === 'resolved' ? 'bg-emerald-500/20 text-emerald-300' :
                        a.status === 'confirmed' ? 'bg-sky-500/20 text-sky-300' :
                        'bg-rose-500/20 text-rose-400 animate-pulse'
                      }`}>
                        {a.status === 'resolved' ? '已归档' : a.status === 'confirmed' ? '已核实' : '待处置'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedAlarm(a)}
                          className="px-3 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow"
                        >
                          核实处置
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Triage & Confirm Alarm */}
      {selectedAlarm && (
        <div className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-xs">
            <h3 className="font-bold text-base text-white pb-3 border-b border-slate-800 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-500" />
              <span>处置报警: {selectedAlarm.plateNumber} ({selectedAlarm.title})</span>
            </h3>

            <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700 space-y-1">
              <div><span className="text-slate-400">涉事驾驶员: </span><span className="font-bold text-white">{selectedAlarm.driverName} ({selectedAlarm.driverPhone})</span></div>
              <div><span className="text-slate-400">发生地点: </span><span className="text-slate-200">{selectedAlarm.locationName}</span></div>
              <div><span className="text-slate-400">异常说明: </span><span className="text-rose-300">{selectedAlarm.description}</span></div>
            </div>

            <form onSubmit={handleConfirmSubmit} className="space-y-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">处置记录与调度员处理说明</label>
                <textarea
                  rows={3}
                  value={confirmRemark}
                  onChange={(e) => setConfirmRemark(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => onDispatchedToEvent(selectedAlarm.id)}
                  className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold flex items-center gap-1 shadow"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>升级为 AI 异常整改事件</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedAlarm(null)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                  >
                    确认处置完成
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
