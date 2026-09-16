import React, { useState, useEffect } from 'react';
import { Camera, Video, Eye, ShieldAlert, UserCheck, Activity, AlertTriangle, PhoneOff, Cigarette, CheckCircle2, RefreshCw } from 'lucide-react';
import { dataGateway, InCabinTelemetry } from '../../services/gateway';

export const InCabinMonitorPanel: React.FC = () => {
  const [inCabinList, setInCabinList] = useState<InCabinTelemetry[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [activeCamUrl, setActiveCamUrl] = useState<string>('');

  useEffect(() => {
    const unsubscribe = dataGateway.subscribeInCabin((map) => {
      const items = Array.from(map.values());
      setInCabinList(items);
      if (!selectedVehicleId && items.length > 0) {
        setSelectedVehicleId(items[0].vehicleId);
        setActiveCamUrl(items[0].cameraStreamUrl);
      } else if (selectedVehicleId) {
        const current = map.get(selectedVehicleId);
        if (current) setActiveCamUrl(current.cameraStreamUrl);
      }
    });
    return () => unsubscribe();
  }, [selectedVehicleId]);

  const selectedCabin = inCabinList.find(i => i.vehicleId === selectedVehicleId) || inCabinList[0];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
            <Video className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <span>车内AI智能监控与多维感知同步显示</span>
              <span className="text-[10px] bg-indigo-950 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-800/80 font-mono">
                Realtime In-Cabin & ADAS Feed
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              基于网关实时多路音视频与AI驾驶员状态监测 (DSM/ADAS) 同步流
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-800/60 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            AI流同步中 (60FPS)
          </span>
        </div>
      </div>

      {/* Main Grid: Left Vehicle Selector & Live Stream, Right Driver Intelligence Status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Camera Stream & Vehicle Selector (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          {/* Vehicle Selector Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            {inCabinList.map(item => {
              const isSelected = item.vehicleId === selectedVehicleId;
              const hasAlert = item.fatigueStatus !== 'NORMAL';

              return (
                <button
                  key={item.vehicleId}
                  onClick={() => {
                    setSelectedVehicleId(item.vehicleId);
                    setActiveCamUrl(item.cameraStreamUrl);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-2 border ${
                    isSelected
                      ? 'bg-sky-600 text-white border-sky-500 shadow-md shadow-sky-900/50'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                  }`}
                >
                  <span className="font-mono">{item.plateNumber}</span>
                  <span className={`w-2 h-2 rounded-full ${hasAlert ? 'bg-amber-400 animate-bounce' : 'bg-emerald-400'}`}></span>
                </button>
              );
            })}
          </div>

          {/* Simulated In-Cabin Live Camera Feed Box */}
          <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-700 bg-slate-950 shadow-inner group">
            <img
              src={activeCamUrl || "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop&q=80"}
              alt="In-cabin live camera"
              className="w-full h-full object-cover opacity-90 transition duration-500 group-hover:scale-105"
            />
            {/* Live Camera Overlays */}
            <div className="absolute top-3 left-3 flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700 text-xs font-mono text-white">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
              <span>CAM-01 主驾驶舱红外感知</span>
            </div>

            <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700 text-xs font-mono text-emerald-400">
              分辨率: 1080P / 30fps
            </div>

            {selectedCabin && (
              <div className="absolute bottom-3 left-3 right-3 bg-slate-900/85 backdrop-blur-md p-3 rounded-xl border border-slate-700/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="text-slate-300">
                    司机: <strong className="text-white">{selectedCabin.driverName}</strong>
                  </div>
                  <div className="text-slate-300">
                    车内温度: <strong className="text-cyan-400 font-mono">{selectedCabin.cabinTempC}°C</strong>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">HUD转速:</span>
                  <span className="font-mono text-amber-400 font-bold">{selectedCabin.hudRpm} RPM</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Real-time AI ADAS & DSM Driver State Panel (5 cols) */}
        <div className="lg:col-span-5 bg-slate-950 rounded-xl border border-slate-800 p-4 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h4 className="font-bold text-sm text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-sky-400" />
                <span>AI 驾驶员状态监测 (DSM)</span>
              </h4>
              <span className="text-[10px] font-mono text-slate-400">实时同步</span>
            </div>

            {selectedCabin ? (
              <div className="space-y-3 text-xs">
                {/* Fatigue Status Badge */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-400">疲劳驾驶状态</span>
                  <span className={`px-2.5 py-1 rounded-lg font-bold text-xs uppercase font-mono ${
                    selectedCabin.fatigueStatus === 'NORMAL'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/80'
                      : 'bg-rose-950 text-rose-400 border border-rose-800/80 animate-pulse'
                  }`}>
                    {selectedCabin.fatigueStatus === 'NORMAL' ? '状态正常 (Normal)' : selectedCabin.fatigueStatus === 'DROWSY' ? '⚠️ 瞌睡疲劳预警' : '⚠️ 分心驾驶预警'}
                  </span>
                </div>

                {/* Drowsiness Progress */}
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">困倦指数评分</span>
                    <span className="font-mono text-amber-400 font-bold">{selectedCabin.drowsinessScore} / 100</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        selectedCabin.drowsinessScore > 70 ? 'bg-rose-500' : selectedCabin.drowsinessScore > 40 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${selectedCabin.drowsinessScore}%` }}
                    ></div>
                  </div>
                </div>

                {/* Auxiliary Sensor Checks */}
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <div className={`p-2.5 rounded-xl border flex flex-col items-center text-center gap-1 ${
                    selectedCabin.seatbeltFastened ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300' : 'bg-rose-950/40 border-rose-800/60 text-rose-300'
                  }`}>
                    <UserCheck className="w-4 h-4" />
                    <span className="text-[10px]">安全带</span>
                    <span className="font-bold">{selectedCabin.seatbeltFastened ? '已系好' : '未系'}</span>
                  </div>

                  <div className={`p-2.5 rounded-xl border flex flex-col items-center text-center gap-1 ${
                    !selectedCabin.phoneCallDetected ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300' : 'bg-amber-950/40 border-amber-800/60 text-amber-300'
                  }`}>
                    <PhoneOff className="w-4 h-4" />
                    <span className="text-[10px]">接打电话</span>
                    <span className="font-bold">{selectedCabin.phoneCallDetected ? '存在接打' : '无'}</span>
                  </div>

                  <div className={`p-2.5 rounded-xl border flex flex-col items-center text-center gap-1 ${
                    !selectedCabin.smokingDetected ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300' : 'bg-rose-950/40 border-rose-800/60 text-rose-300'
                  }`}>
                    <Cigarette className="w-4 h-4" />
                    <span className="text-[10px]">抽烟检测</span>
                    <span className="font-bold">{selectedCabin.smokingDetected ? '抽烟违规' : '无'}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-slate-500 text-xs text-center py-10">暂无在线车辆监控数据</div>
            )}
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>最后网关同步: {selectedCabin?.lastSyncTime || '--:--:--'}</span>
            <span className="text-sky-400 flex items-center gap-1">
              <RefreshCw className="w-3 h-3 animate-spin" />
              流通道实时保活
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
