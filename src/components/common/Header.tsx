import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Sparkles, 
  Clock, 
  Activity, 
  ShieldAlert, 
  Smartphone, 
  PlusCircle, 
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';
import { Vehicle, AlarmRecord } from '../../types';

interface HeaderProps {
  vehicles: Vehicle[];
  alarms: AlarmRecord[];
  onSelectTab?: (tab: string) => void;
  onOpenAiSteward?: () => void;
  onOpenQuickDispatch?: () => void;
  onOpenMobileSim?: () => void;
  onSelectAlarm?: (alarm: AlarmRecord) => void;
  currentRole?: string;
  onRoleChange?: (role: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  vehicles,
  alarms,
  onSelectTab,
  onOpenAiSteward,
  onOpenQuickDispatch,
  onOpenMobileSim,
  onSelectAlarm,
  currentRole = 'super_admin',
  onRoleChange,
}) => {
  const [timeStr, setTimeStr] = useState('');
  const [showAlarmDrawer, setShowAlarmDrawer] = useState(false);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('zh-CN', { hour12: false }));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const onlineCount = vehicles.filter(v => v.status !== 'offline').length;
  const activeAlarmCount = alarms.filter(a => a.status === 'active' || a.status === 'pending').length;

  return (
    <header className="h-16 bg-[#0F172A] border-b border-slate-800 px-4 sm:px-8 flex items-center justify-between z-30 sticky top-0 shadow-md select-none">
      {/* Left: Tactical Metrics Block with Crisp Dividers */}
      <div className="flex items-center gap-6 sm:gap-8">
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider">Fleet Health</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-base sm:text-lg font-bold text-emerald-400 uppercase tracking-tight">Optimal</span>
          </div>
        </div>

        <div className="h-8 w-[1px] bg-slate-800 hidden sm:block"></div>

        {/* Dynamic Metric Columns */}
        <div className="hidden sm:flex items-center gap-6">
          <div className="text-center">
            <span className="block text-[10px] text-slate-500 uppercase tracking-wider font-medium">Total Units</span>
            <span className="font-bold text-white text-sm sm:text-base font-mono">{vehicles.length}</span>
          </div>

          <div className="text-center">
            <span className="block text-[10px] text-blue-400 uppercase tracking-wider font-medium">Online</span>
            <span className="font-bold text-white text-sm sm:text-base font-mono">{onlineCount}</span>
          </div>

          <div className="text-center">
            <span className="block text-[10px] text-orange-400 uppercase tracking-wider font-medium">Alerts</span>
            <span className="font-bold text-white text-sm sm:text-base font-mono">{activeAlarmCount}</span>
          </div>
        </div>
      </div>

      {/* Right: Tactical Time Pill, Action Buttons, and Role Switcher */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Tactical City & Monospace Clock */}
        <div className="hidden md:flex bg-slate-800/80 border border-slate-700/60 rounded-full px-3.5 py-1 items-center gap-2.5">
          <span className="text-xs text-slate-300 font-medium">Shanghai, PRC</span>
          <span className="w-1 h-1 rounded-full bg-blue-500"></span>
          <span className="text-xs text-blue-400 font-mono tracking-wider font-semibold">{timeStr}</span>
        </div>

        {/* Quick Dispatch Action Button */}
        <button
          id="header-quick-dispatch-btn"
          onClick={() => onOpenQuickDispatch ? onOpenQuickDispatch() : onSelectTab ? onSelectTab('dispatch') : null}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-tight rounded-lg shadow-lg shadow-blue-500/20 transition-colors"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>新建派车</span>
        </button>

        {/* AI Operational Steward Button */}
        <button
          id="header-ai-steward-btn"
          onClick={() => onOpenAiSteward ? onOpenAiSteward() : onSelectTab ? onSelectTab('ai_steward') : null}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-semibold uppercase tracking-tight rounded-lg transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span className="hidden sm:inline">AI 车队管家</span>
        </button>

        {/* Driver Mobile Simulator */}
        <button
          id="header-mobile-sim-btn"
          onClick={() => onOpenMobileSim ? onOpenMobileSim() : onSelectTab ? onSelectTab('mobile_driver') : null}
          className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-medium transition"
          title="打开驾驶员手机端"
        >
          <Smartphone className="w-4 h-4 text-emerald-400 sm:mr-1 sm:inline" />
          <span className="hidden sm:inline">手机端模拟</span>
        </button>

        {/* Alarms Notification Dropdown */}
        <div className="relative">
          <button
            id="header-alarm-bell-btn"
            onClick={() => setShowAlarmDrawer(!showAlarmDrawer)}
            className="relative p-2 rounded-lg bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700 transition"
            aria-label="查看系统警报"
          >
            <Bell className="w-4 h-4" />
            {activeAlarmCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-red-500 text-white font-mono font-bold text-[10px] flex items-center justify-center shadow-lg shadow-red-500/30 animate-pulse">
                {activeAlarmCount}
              </span>
            )}
          </button>

          {/* Alarm Quick Dropdown */}
          {showAlarmDrawer && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden z-50">
              <div className="px-4 py-3 bg-[#1E293B] border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-orange-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-white">Live Incident Log</span>
                </div>
                <span className="text-[10px] bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded font-mono font-bold">
                  {activeAlarmCount} ACTIVE
                </span>
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/70 p-2 space-y-1">
                {alarms.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500 font-mono">ALL SYSTEMS NOMINAL. NO ALERTS.</div>
                ) : (
                  alarms.slice(0, 6).map(a => (
                    <div 
                      key={a.id} 
                      onClick={() => {
                        if (onSelectAlarm) onSelectAlarm(a);
                        if (onSelectTab) onSelectTab('alarms');
                        setShowAlarmDrawer(false);
                      }}
                      className="p-2.5 rounded-lg hover:bg-slate-800/80 cursor-pointer transition flex items-start gap-3"
                    >
                      <div className={`w-1 h-8 rounded-full shrink-0 ${
                        a.severity === 'critical' ? 'bg-red-500' :
                        a.severity === 'severe' ? 'bg-orange-500' : 'bg-blue-500'
                      }`} />
                      <div className="flex-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-white">{a.title}</span>
                          <span className="text-[10px] text-slate-500 font-mono">{a.timestamp}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">{a.plateNumber} · {a.description}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Role Selector */}
        {onRoleChange && (
          <select
            id="header-role-selector"
            value={currentRole}
            onChange={(e) => onRoleChange(e.target.value)}
            aria-label="切换管理角色"
            className="text-xs bg-slate-800 text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500 cursor-pointer hidden lg:block"
          >
            <option value="super_admin">超级管理员 (Admin)</option>
            <option value="fleet_manager">车队运营总监</option>
            <option value="dispatcher">智能调度员</option>
            <option value="safety_officer">安全督导专员</option>
          </select>
        )}
      </div>
    </header>
  );
};
