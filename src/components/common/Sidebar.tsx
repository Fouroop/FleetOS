import React from 'react';
import {
  LayoutDashboard,
  MapPin,
  Truck,
  Users,
  Send,
  Route,
  ShieldCheck,
  AlertOctagon,
  Wrench,
  Fuel,
  DollarSign,
  FileWarning,
  FileCheck,
  BarChart3,
  Bot,
  Settings,
  Flame,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Smartphone,
  Radio,
  Video
} from 'lucide-react';

export type NavMenuKey =
  | 'cockpit'
  | 'monitoring'
  | 'gateway'
  | 'camera_streams'
  | 'vehicles'
  | 'drivers'
  | 'dispatch'
  | 'tracks'
  | 'geofences'
  | 'safety'
  | 'alarms'
  | 'events'
  | 'maintenance'
  | 'fuel'
  | 'costs'
  | 'accidents'
  | 'documents'
  | 'stats'
  | 'ai_steward'
  | 'mobile_driver'
  | 'settings'
  | string;

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: any) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  pendingAlarmsCount?: number;
  alarmCount?: number;
  eventCount?: number;
}

interface MenuItem {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | string;
  badgeColor?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  collapsed,
  onToggleCollapse,
  pendingAlarmsCount = 0,
  alarmCount,
  eventCount = 0,
}) => {
  const alarmsDisplay = alarmCount !== undefined ? alarmCount : pendingAlarmsCount;

  const menuGroups: { groupName: string; items: MenuItem[] }[] = [
    {
      groupName: '实时运力监控',
      items: [
        { key: 'cockpit', label: '综合驾驶舱', icon: LayoutDashboard },
        { key: 'monitoring', label: '实时遥测监控', icon: MapPin },
        { key: 'gateway', label: '车联数据网关', icon: Radio, badge: 'GW', badgeColor: 'bg-emerald-500 text-slate-950 font-bold' },
        { key: 'camera_streams', label: '多路视频监控', icon: Video, badge: 'CAM', badgeColor: 'bg-indigo-500 text-white font-bold' },
        { key: 'dispatch', label: '智能任务调度', icon: Send },
        { key: 'tracks', label: '轨迹研判回放', icon: Route },
        { key: 'geofences', label: '电子围栏管控', icon: ShieldCheck },
      ]
    },
    {
      groupName: '人车全周期管理',
      items: [
        { key: 'vehicles', label: '车辆档案管理', icon: Truck },
        { key: 'drivers', label: '驾驶员一人一档', icon: Users },
        { key: 'maintenance', label: '预测维保中心', icon: Wrench },
        { key: 'fuel', label: '油耗能效管理', icon: Fuel },
        { key: 'costs', label: 'TCO成本台账', icon: DollarSign },
        { key: 'documents', label: '证照合规年审', icon: FileCheck },
      ]
    },
    {
      groupName: '主动安全与风控',
      items: [
        { key: 'safety', label: '主动安全驾驶', icon: Flame },
        { key: 'alarms', label: '实时告警中心', icon: AlertOctagon, badge: alarmsDisplay > 0 ? alarmsDisplay : undefined, badgeColor: 'bg-red-500 text-white' },
        { key: 'events', label: 'AI异常事件案卷', icon: ShieldAlert, badge: eventCount > 0 ? eventCount : undefined, badgeColor: 'bg-amber-500 text-slate-950' },
        { key: 'accidents', label: '事故定损复盘', icon: FileWarning },
      ]
    },
    {
      groupName: '智能决策与端侧',
      items: [
        { key: 'ai_steward', label: 'AI 车队管家', icon: Bot, badge: 'AI', badgeColor: 'bg-blue-500 text-white shadow-sm shadow-blue-500/40' },
        { key: 'stats', label: '多维统计分析', icon: BarChart3 },
        { key: 'mobile_driver', label: '移动端App模拟', icon: Smartphone },
        { key: 'settings', label: '系统设置与仿真', icon: Settings },
      ]
    }
  ];

  return (
    <aside
      className={`bg-[#1E293B] border-r border-slate-800 transition-all duration-300 flex flex-col z-20 select-none shadow-xl ${
        collapsed ? 'w-18' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-800 bg-[#1E293B]">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/30 ring-1 ring-white/10 shrink-0">
            F
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-white uppercase flex items-center gap-1.5">
                FleetOS <span className="text-blue-400 font-extrabold">AI</span>
              </span>
              <span className="text-[9px] text-slate-400 uppercase tracking-wider font-mono">
                ENTERPRISE FLEET
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-4 scrollbar-thin scrollbar-thumb-slate-800">
        {menuGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            {!collapsed && (
              <div className="pt-2 pb-1 px-3 text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
                {group.groupName}
              </div>
            )}
            {group.items.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.key;

              return (
                <button
                  key={item.key}
                  id={`sidebar-menu-${item.key}`}
                  onClick={() => onTabChange(item.key)}
                  title={collapsed ? item.label : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-sm shadow-blue-500/10'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-blue-400' : 'text-slate-400 opacity-80'}`} />
                  {!collapsed && (
                    <div className="flex-1 flex items-center justify-between truncate">
                      <span className={`truncate ${isActive ? 'font-semibold text-white' : ''}`}>{item.label}</span>
                      {item.badge !== undefined && (
                        <span
                          className={`ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            item.badgeColor || 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User Profile & Collapse Toggle Footer */}
      <div className="p-3 border-t border-slate-800 bg-[#1E293B] space-y-2">
        {!collapsed ? (
          <div className="bg-slate-800/50 p-2.5 rounded-lg flex items-center justify-between border border-slate-800">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 bg-blue-500/20 border border-blue-500/40 rounded-full flex items-center justify-center text-blue-400 font-bold text-xs shrink-0">
                AR
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-white truncate">Admin Root</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">SYSTEM MANAGER</p>
              </div>
            </div>
            <button
              id="sidebar-toggle-collapse-btn"
              onClick={onToggleCollapse}
              aria-label="折叠导航侧边栏"
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-700 transition"
              title="折叠导航"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            id="sidebar-toggle-collapse-btn"
            onClick={onToggleCollapse}
            aria-label="展开导航侧边栏"
            className="w-full py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center transition"
            title="展开导航"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </aside>
  );
};
