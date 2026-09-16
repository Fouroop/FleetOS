import React, { useState } from 'react';
import { Vehicle, Driver, TransportTask } from '../../types';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  DollarSign, 
  Truck, 
  ShieldCheck, 
  Fuel, 
  Award,
  Layers
} from 'lucide-react';

interface StatisticsViewProps {
  vehicles: Vehicle[];
  drivers: Driver[];
  tasks: TransportTask[];
}

export const StatisticsView: React.FC<StatisticsViewProps> = ({
  vehicles,
  drivers,
  tasks,
}) => {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');

  // Month-by-month mock series
  const monthsData = [
    { month: '3月', mileage: 124000, revenue: 642000, fuelCost: 286000, safetyScore: 82.1 },
    { month: '4月', mileage: 138000, revenue: 712000, fuelCost: 312000, safetyScore: 83.5 },
    { month: '5月', mileage: 145000, revenue: 760000, fuelCost: 326000, safetyScore: 84.8 },
    { month: '6月', mileage: 152000, revenue: 810000, fuelCost: 341000, safetyScore: 85.2 },
    { month: '7月', mileage: 168000, revenue: 890000, fuelCost: 372000, safetyScore: 86.0 },
    { month: '8月', mileage: 184000, revenue: 980000, fuelCost: 398000, safetyScore: 87.4 },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-[1920px] mx-auto text-slate-100">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-sky-400" />
            <h1 className="font-bold text-lg text-white">车队大数据运营与 BI 商业智能分析</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            多维洞察车队里程、运费营收、能耗成本、单公里毛利与安全指数走势
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs">
          {(['week', 'month', 'year'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTimeRange(t)}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                timeRange === t ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t === 'week' ? '近7天' : t === 'month' ? '近6个月' : '近3年'}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow">
          <span className="text-slate-400 block text-[11px]">累计总运输里程</span>
          <div className="text-2xl font-black text-white font-mono mt-1">184,290 <span className="text-xs font-normal text-slate-400">km</span></div>
          <span className="text-[10px] text-emerald-400 mt-1 block">环比增长 +9.5%</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow">
          <span className="text-slate-400 block text-[11px]">运单总产值</span>
          <div className="text-2xl font-black text-amber-400 font-mono mt-1">¥980,450</div>
          <span className="text-[10px] text-emerald-400 mt-1 block">客单价环比提升 +4.2%</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow">
          <span className="text-slate-400 block text-[11px]">车队综合百公里能耗</span>
          <div className="text-2xl font-black text-sky-400 font-mono mt-1">30.8 <span className="text-xs font-normal text-slate-400">L/100km</span></div>
          <span className="text-[10px] text-emerald-400 mt-1 block">下降 1.4 L/100km</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow">
          <span className="text-slate-400 block text-[11px]">安全驾驶综合评分</span>
          <div className="text-2xl font-black text-emerald-400 font-mono mt-1">87.4 <span className="text-xs font-normal text-slate-400">分</span></div>
          <span className="text-[10px] text-emerald-400 mt-1 block">创历史最佳季度纪录</span>
        </div>
      </div>

      {/* Monthly Trend Visualizer Table & Bars */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl space-y-3">
        <h3 className="font-bold text-xs text-white pb-2 border-b border-slate-800 flex items-center justify-between">
          <span>近 6 个月关键业务指标演进</span>
          <span className="text-[11px] text-slate-400 font-normal">单位: 里程(km) / 营收与油耗(元) / 安全分</span>
        </h3>

        <div className="space-y-3 pt-2">
          {monthsData.map(d => (
            <div key={d.month} className="space-y-1.5 bg-slate-800/50 p-3 rounded-xl border border-slate-700/50 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">{d.month}</span>
                <div className="flex items-center gap-4 text-xs font-mono">
                  <span className="text-slate-300">里程: <strong className="text-white">{d.mileage.toLocaleString()}</strong> km</span>
                  <span className="text-amber-400">营收: <strong>¥{d.revenue.toLocaleString()}</strong></span>
                  <span className="text-sky-400">油耗: <strong>¥{d.fuelCost.toLocaleString()}</strong></span>
                  <span className="text-emerald-400">安全分: <strong>{d.safetyScore}</strong></span>
                </div>
              </div>

              {/* Progress visual bar */}
              <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden flex">
                <div
                  className="bg-amber-500 h-full"
                  style={{ width: `${(d.revenue / 1000000) * 60}%` }}
                ></div>
                <div
                  className="bg-sky-500 h-full"
                  style={{ width: `${(d.fuelCost / 1000000) * 40}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
