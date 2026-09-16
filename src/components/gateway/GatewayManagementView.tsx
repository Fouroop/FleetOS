import React, { useState, useEffect, useRef } from 'react';
import { 
  Vehicle, 
  TelemetryData 
} from '../../types';
import { 
  telemetryGateway, 
  GatewayPacket, 
  DownlinkCommand, 
  GatewayStats, 
  GatewayProtocol, 
  DataSourceMode 
} from '../../services/telemetryGateway';
import { dataGateway } from '../../services/gateway';
import { InCabinMonitorPanel } from './InCabinMonitorPanel';
import { 
  Radio, 
  Server, 
  Activity, 
  Send, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Zap, 
  Sliders, 
  Terminal, 
  ShieldAlert, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  Lock, 
  Unlock, 
  Flame, 
  Fuel, 
  Cpu, 
  Search, 
  Code2, 
  Filter, 
  Database, 
  Volume2, 
  RefreshCw, 
  Layers, 
  AlertTriangle,
  ArrowRight,
  WifiOff
} from 'lucide-react';

interface GatewayManagementViewProps {
  vehicles: Vehicle[];
}

export const GatewayManagementView: React.FC<GatewayManagementViewProps> = ({ vehicles }) => {
  const [stats, setStats] = useState<GatewayStats>(telemetryGateway.getStats());
  const [packets, setPackets] = useState<GatewayPacket[]>(telemetryGateway.getRecentPackets());
  const [downlinkLogs, setDownlinkLogs] = useState<DownlinkCommand[]>(telemetryGateway.getDownlinkCommands());
  const [activeProtocol, setActiveProtocol] = useState<GatewayProtocol>(telemetryGateway.getActiveProtocol());
  const [dataMode, setDataMode] = useState<DataSourceMode>(telemetryGateway.getDataSourceMode());
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(vehicles[0]?.id || 'v-01');
  const [selectedPacket, setSelectedPacket] = useState<GatewayPacket | null>(null);

  // Command & Injection states
  const [customSpeed, setCustomSpeed] = useState<number>(65);
  const [customWaterTemp, setCustomWaterTemp] = useState<number>(88);
  const [customFuel, setCustomFuel] = useState<number>(75);
  const [ttsText, setTtsText] = useState<string>('请注意，您已进入沈海高速限速管控路段，请保持安全车距。');
  const [activePreset, setActivePreset] = useState<string>('preset-standard');
  const [packetFilter, setPacketFilter] = useState<'ALL' | 'INBOUND' | 'OUTBOUND' | 'ALARM'>('ALL');
  const [autoScrollPackets, setAutoScrollPackets] = useState<boolean>(true);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [packetLossRate, setPacketLossRate] = useState<number>(0);
  const [simInterval, setSimInterval] = useState<number>(2000);

  const packetContainerRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  useEffect(() => {
    const unsubStats = telemetryGateway.subscribeStats((newStats) => {
      setStats(newStats);
    });

    const unsubPackets = telemetryGateway.subscribePackets((newPacket) => {
      setPackets((prev) => [newPacket, ...prev.slice(0, 150)]);
    });

    return () => {
      unsubStats();
      unsubPackets();
    };
  }, []);

  const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId) || vehicles[0];

  // Apply Simulation Preset
  const handleSelectPreset = (presetId: string) => {
    setActivePreset(presetId);
    telemetryGateway.applySimulationPreset(presetId);
    if (presetId === 'preset-standard') {
      setSimInterval(2000);
      setPacketLossRate(0);
      showToast('已加载【标准工况】仿真场景 (10辆车 · 2.0s汇报)');
    } else if (presetId === 'preset-rush-hour') {
      setSimInterval(1500);
      setPacketLossRate(2);
      showToast('已加载【早晚高峰拥堵】仿真场景 (20辆车 · 走停交替)');
    } else if (presetId === 'preset-highway-fast') {
      setSimInterval(1000);
      setPacketLossRate(0);
      showToast('已加载【高速干线极速】仿真场景 (100km/h+ 高速上报)');
    } else if (presetId === 'preset-high-load') {
      setSimInterval(800);
      setPacketLossRate(5);
      showToast('已加载【高并发压力测试】(35辆终端 · 800ms高密上报)');
    } else if (presetId === 'preset-tunnel-degrade') {
      setSimInterval(3000);
      setPacketLossRate(30);
      showToast('已加载【山区隧道丢包弱网】(30%网络丢包模拟)');
    }
  };

  // Change Data Mode
  const handleChangeDataMode = (mode: DataSourceMode) => {
    setDataMode(mode);
    telemetryGateway.setDataSourceMode(mode);
    if (mode === 'simulated') {
      showToast('已切换至【多场景全自动路网仿真模式】');
    } else if (mode === 'custom_injection') {
      showToast('已切换至【单车手动遥测注入与调试模式】');
    } else if (mode === 'replay') {
      showToast('已切换至【真实历史行程按时序重放模式】');
    } else if (mode === 'external_api') {
      showToast('已切换至【外部第三方车联网API网关代理模式】');
    }
  };

  // Change Active Protocol Standard
  const handleChangeProtocol = (proto: GatewayProtocol) => {
    setActiveProtocol(proto);
    telemetryGateway.setActiveProtocol(proto);
    showToast(`网关协议解析与下发封装已切换为: ${proto}`);
  };

  // Send Downlink Command via Gateway
  const handleSendCommand = (cmdType: DownlinkCommand['commandType'], params?: any) => {
    if (!selectedVehicle) return;
    const cmd = telemetryGateway.sendDownlinkCommand(selectedVehicle.id, cmdType, params);
    setDownlinkLogs(telemetryGateway.getDownlinkCommands());
    showToast(`下行指令已成功派发给网关: [${cmd.commandName}] -> ${selectedVehicle.plateNumber}`);
  };

  // Manual Inbound Injection
  const handleInjectTelemetry = () => {
    if (!selectedVehicle) return;
    telemetryGateway.injectVehicleTelemetry(selectedVehicle.id, {
      speed: customSpeed,
      waterTemp: customWaterTemp,
      fuelLevel: customFuel,
      engineStatus: customSpeed > 0 ? 'running' : 'idle',
    });
    showToast(`已向网关注入 [${selectedVehicle.plateNumber}] 瞬时遥测: ${customSpeed}km/h, 油量${customFuel}%`);
  };

  const filteredPackets = packets.filter(p => {
    if (packetFilter === 'ALL') return true;
    if (packetFilter === 'INBOUND') return p.direction === 'INBOUND';
    if (packetFilter === 'OUTBOUND') return p.direction === 'OUTBOUND';
    if (packetFilter === 'ALARM') return p.msgType.includes('ALARM') || p.msgType.includes('0200_ALARM');
    return true;
  });

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-[1920px] mx-auto text-slate-100">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
        <div>
          <div className="flex items-center gap-2.5">
            <Radio className="w-5 h-5 text-sky-400 animate-pulse" />
            <h1 className="font-bold text-lg text-white">车联网数据统一出入网关 (IoT Telemetry Gateway)</h1>
            <span className="px-2 py-0.5 rounded-full text-[11px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 font-mono">
              <CheckCircle2 className="w-3.5 h-3.5" />
              双向链路已就绪
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            所有车辆位置、传感器遥测、告警上报 (Inbound) 与远程控制/配置指令 (Outbound) 全量经过网关协议适配、清洗与加解密
          </p>
        </div>

        {/* Global Toast Alert */}
        {toastMsg && (
          <div className="px-3 py-1.5 rounded-lg bg-sky-500/20 text-sky-300 border border-sky-500/40 text-xs font-bold flex items-center gap-1.5 animate-bounce">
            <Zap className="w-3.5 h-3.5" />
            <span>{toastMsg}</span>
          </div>
        )}
      </div>

      {/* Gateway Telemetry Realtime Metrics Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>实时入网 QPS</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-emerald-400 font-mono mt-1">
            {stats.qps} <span className="text-xs text-slate-400 font-normal">msg/s</span>
          </div>
          <span className="text-[10px] text-slate-500">平稳接收中</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>已接入在线终端</span>
            <Server className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-xl font-bold text-sky-400 font-mono mt-1">
            {stats.activeTerminals} <span className="text-xs text-slate-400 font-normal">台</span>
          </div>
          <span className="text-[10px] text-slate-500">双向TCP会话保活</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>累计上行帧数 (Inbound)</span>
            <ArrowDownLeft className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-xl font-bold text-indigo-400 font-mono mt-1">
            {stats.inboundPacketsTotal.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-500">位置/状态/报警包</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>下行控制指令 (Outbound)</span>
            <ArrowUpRight className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold text-amber-400 font-mono mt-1">
            {stats.outboundCommandsTotal} <span className="text-xs text-slate-400 font-normal">条</span>
          </div>
          <span className="text-[10px] text-slate-500">100% 成功回执 ACK</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>平均网关端到端时延</span>
            <Zap className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-xl font-bold text-teal-400 font-mono mt-1">
            {stats.avgLatencyMs} <span className="text-xs text-slate-400 font-normal">ms</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-medium">极速微秒级解析</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>网络丢包/异常率</span>
            <WifiOff className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-xl font-bold text-rose-400 font-mono mt-1">
            {packetLossRate > 0 ? `${packetLossRate}%` : '0.0%'}
          </div>
          <span className="text-[10px] text-slate-500">{packetLossRate > 0 ? '已模拟弱网衰减' : '链路质量优秀'}</span>
        </div>
      </div>

      {/* Real-time In-Cabin & ADAS Multi-Camera Synchronized Display */}
      <InCabinMonitorPanel />

      {/* Control Switchboard: Mode Switcher & Protocol Standard Switcher */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left 4 Cols: Data Source Mode & Simulation Scenarios */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="font-bold text-xs text-white flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-sky-400" />
              <span>数据源模式切换 (Data Source Mode)</span>
            </h3>
            <span className="text-[10px] text-slate-400">实时生效</span>
          </div>

          {/* Mode Switch Cards */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => handleChangeDataMode('simulated')}
              className={`p-3 rounded-lg border text-left transition flex flex-col justify-between ${
                dataMode === 'simulated'
                  ? 'bg-sky-950/70 border-sky-500 text-white shadow-lg'
                  : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold">路网仿真模式</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1">沿高精度道路拓扑自动巡航</span>
            </button>

            <button
              onClick={() => handleChangeDataMode('custom_injection')}
              className={`p-3 rounded-lg border text-left transition flex flex-col justify-between ${
                dataMode === 'custom_injection'
                  ? 'bg-sky-950/70 border-sky-500 text-white shadow-lg'
                  : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold">手动注入调试</span>
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1">手工调试指定车辆时速/油耗</span>
            </button>

            <button
              onClick={() => handleChangeDataMode('replay')}
              className={`p-3 rounded-lg border text-left transition flex flex-col justify-between ${
                dataMode === 'replay'
                  ? 'bg-sky-950/70 border-sky-500 text-white shadow-lg'
                  : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold">历史轨迹时序重放</span>
                <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1">按原始时间戳回放实测点位</span>
            </button>

            <button
              onClick={() => handleChangeDataMode('external_api')}
              className={`p-3 rounded-lg border text-left transition flex flex-col justify-between ${
                dataMode === 'external_api'
                  ? 'bg-sky-950/70 border-sky-500 text-white shadow-lg'
                  : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold">第三方网关代理</span>
                <span className="w-2 h-2 rounded-full bg-purple-400"></span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1">接收外部 REST / MQTT 推送</span>
            </button>
          </div>

          {/* Simulation Preset Scenarios */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>快速预设运行工况与网络仿真场景:</span>
            </span>

            <div className="space-y-1.5 text-xs">
              {[
                { id: 'preset-standard', name: '标准工况场景', desc: '10辆车 · 2.0s汇报 · 正常干线巡航' },
                { id: 'preset-rush-hour', name: '早晚高峰拥堵工况', desc: '20辆车 · 1.5s汇报 · 走停交替慢速' },
                { id: 'preset-highway-fast', name: '高速快运干线场景', desc: '12辆车 · 1.0s高速汇报 · 极速巡航' },
                { id: 'preset-high-load', name: '高并发高负荷压测', desc: '35辆车 · 800ms高密上报 · 压力测试' },
                { id: 'preset-tunnel-degrade', name: '山区隧道与弱网丢包', desc: '10辆车 · 30%网络随机丢包' },
              ].map(preset => (
                <button
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset.id)}
                  className={`w-full p-2 rounded-lg border text-left flex items-center justify-between transition ${
                    activePreset === preset.id
                      ? 'bg-sky-600/30 border-sky-500 text-sky-200'
                      : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div>
                    <div className="font-bold text-[11px] text-white">{preset.name}</div>
                    <div className="text-[10px] text-slate-400">{preset.desc}</div>
                  </div>
                  {activePreset === preset.id && <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Middle 4 Cols: Protocol Standard & Downlink Command Dispatch */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="font-bold text-xs text-white flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-sky-400" />
              <span>车机通信协议标准切换</span>
            </h3>
            <span className="font-mono text-sky-400 text-xs font-bold">{activeProtocol}</span>
          </div>

          {/* Protocol Switch Buttons */}
          <div className="grid grid-cols-3 gap-1.5 text-xs">
            {(['JT808-2019', 'GB32960', 'MQTT', 'HTTP-REST', 'WebSocket'] as GatewayProtocol[]).map(proto => (
              <button
                key={proto}
                onClick={() => handleChangeProtocol(proto)}
                className={`py-2 px-2 rounded-lg border font-mono font-medium text-[11px] transition text-center ${
                  activeProtocol === proto
                    ? 'bg-sky-600 border-sky-400 text-white shadow'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-750 hover:text-white'
                }`}
              >
                {proto}
              </button>
            ))}
          </div>

          {/* Target Vehicle Select */}
          <div className="space-y-1.5 pt-1">
            <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
              <span>目标操作车辆:</span>
              <span className="text-[10px] text-sky-400 font-mono">Terminal: {selectedVehicle?.terminalId || 'JT808-013801'}</span>
            </label>
            <select
              value={selectedVehicleId}
              onChange={(e) => setSelectedVehicleId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-sky-500"
            >
              {vehicles.map(v => (
                <option key={v.id} value={v.id}>
                  {v.plateNumber} · {v.brand} ({v.assignedDriverName || '未指定'})
                </option>
              ))}
            </select>
          </div>

          {/* Downlink Remote Control Command Panel */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5 text-sky-400" />
              <span>网关下行远程控制指令 (Outbound Commands):</span>
            </span>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => handleSendCommand('QUERY_LOCATION')}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 flex items-center gap-2 transition"
              >
                <Search className="w-3.5 h-3.5 text-sky-400" />
                <span>0x8201 查位置</span>
              </button>

              <button
                onClick={() => handleSendCommand('SET_REPORT_INTERVAL', { intervalSec: 5 })}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 flex items-center gap-2 transition"
              >
                <RefreshCw className="w-3.5 h-3.5 text-teal-400" />
                <span>0x8103 改汇报率</span>
              </button>

              <button
                onClick={() => handleSendCommand('CUT_FUEL')}
                className="p-2 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 text-rose-300 flex items-center gap-2 transition"
              >
                <Flame className="w-3.5 h-3.5 text-rose-400" />
                <span>0x8500 远程断油电</span>
              </button>

              <button
                onClick={() => handleSendCommand('RESTORE_FUEL')}
                className="p-2 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-800/60 text-emerald-300 flex items-center gap-2 transition"
              >
                <Fuel className="w-3.5 h-3.5 text-emerald-400" />
                <span>0x8500 恢复油路</span>
              </button>
            </div>

            {/* TTS Voice Dispatch Input */}
            <div className="pt-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={ttsText}
                  onChange={(e) => setTtsText(e.target.value)}
                  placeholder="输入下发给车机的语音文本..."
                  className="flex-1 bg-slate-800 border border-slate-700 text-white rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-sky-500"
                />
                <button
                  onClick={() => handleSendCommand('TTS_VOICE_ALERT', { text: ttsText })}
                  className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-medium flex items-center gap-1 transition shrink-0"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>下发语音</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Manual Telemetry Injection (If in injection mode) or Downlink Command Log */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-3 flex flex-col">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="font-bold text-xs text-white flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>遥测实时注入与下行指令回执流水</span>
            </h3>
            <span className="text-[10px] text-slate-500 font-mono">{downlinkLogs.length} 条记录</span>
          </div>

          {/* Quick Manual Injection Controls */}
          <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between items-center text-slate-300 font-medium">
              <span>自定义注入时速 (km/h):</span>
              <span className="font-mono text-sky-400 font-bold">{customSpeed} km/h</span>
            </div>
            <input
              type="range"
              min="0"
              max="130"
              value={customSpeed}
              onChange={(e) => setCustomSpeed(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
            />

            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <span className="text-[10px] text-slate-400 block">水温 (°C):</span>
                <input
                  type="number"
                  value={customWaterTemp}
                  onChange={(e) => setCustomWaterTemp(parseInt(e.target.value) || 80)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded px-2 py-1 text-xs"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">油量 (%):</span>
                <input
                  type="number"
                  value={customFuel}
                  onChange={(e) => setCustomFuel(parseInt(e.target.value) || 50)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded px-2 py-1 text-xs"
                />
              </div>
            </div>

            <button
              onClick={handleInjectTelemetry}
              className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition flex items-center justify-center gap-1.5 shadow"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>向网关注入该帧遥测数据包</span>
            </button>
          </div>

          {/* Downlink ACK Logs List */}
          <div className="flex-1 overflow-y-auto max-h-48 space-y-2 pr-1 text-xs">
            <span className="text-[10px] text-slate-500 font-semibold block uppercase tracking-wider">
              最近下发指令与终端应答:
            </span>
            {downlinkLogs.length === 0 ? (
              <div className="text-center py-6 text-slate-500 text-xs">
                暂无下行指令，请点击左侧控制按钮进行下发
              </div>
            ) : (
              downlinkLogs.map((cmd) => (
                <div
                  key={cmd.id}
                  className="p-2 bg-slate-800/80 rounded-lg border border-slate-700/60 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sky-300 font-mono">{cmd.plateNumber}</span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/60 font-mono">
                      {cmd.status}
                    </span>
                  </div>
                  <div className="text-slate-200 text-[11px] font-medium">{cmd.commandName}</div>
                  {cmd.ackMessage && (
                    <div className="text-[10px] text-slate-400 font-mono bg-slate-900/80 px-1.5 py-0.5 rounded">
                      {cmd.ackMessage}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Bottom Wide Section: Raw Gateway Hex Packets Stream & Packet Inspector */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl space-y-3">
        {/* Stream Filter & Control Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-sky-400" />
            <h3 className="font-bold text-sm text-white">网关数据帧实时流动抓包台 (Packet Inspection Stream)</h3>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
              {(['ALL', 'INBOUND', 'OUTBOUND', 'ALARM'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setPacketFilter(f)}
                  className={`px-2.5 py-1 rounded text-[10px] font-bold transition ${
                    packetFilter === f ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {f === 'ALL' ? '全部数据包' : f === 'INBOUND' ? '仅入网 (Inbound)' : f === 'OUTBOUND' ? '仅下发 (Outbound)' : '仅告警帧'}
                </button>
              ))}
            </div>

            <button
              onClick={() => setAutoScrollPackets(!autoScrollPackets)}
              className={`px-2.5 py-1 rounded-lg border text-[11px] transition ${
                autoScrollPackets ? 'bg-sky-950/60 border-sky-500 text-sky-300' : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
            >
              {autoScrollPackets ? '自动滚动: 开启' : '自动滚动: 已暂停'}
            </button>
          </div>
        </div>

        {/* Two-Pane Layout: Left Live Packets Table, Right Packet Inspector Detail */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
          {/* Packets Stream Table (7 Cols) */}
          <div 
            ref={packetContainerRef}
            className="lg:col-span-7 h-80 overflow-y-auto rounded-lg border border-slate-800 bg-slate-950 font-mono text-xs divide-y divide-slate-800/80"
          >
            {filteredPackets.map((pkt) => {
              const isSelected = selectedPacket?.id === pkt.id;
              const isInbound = pkt.direction === 'INBOUND';
              const isAlarm = pkt.msgType.includes('ALARM');

              return (
                <div
                  key={pkt.id}
                  onClick={() => setSelectedPacket(pkt)}
                  className={`p-2.5 cursor-pointer transition flex items-center justify-between gap-2 hover:bg-slate-900 ${
                    isSelected ? 'bg-sky-950/80 border-l-4 border-sky-400' : ''
                  } ${isAlarm ? 'bg-rose-950/30' : ''}`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                      isInbound 
                        ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60' 
                        : 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                    }`}>
                      {isInbound ? '⬇ IN' : '⬆ OUT'}
                    </span>
                    <span className="text-slate-400 text-[11px] shrink-0">{pkt.timestamp}</span>
                    <span className="font-bold text-white shrink-0">{pkt.plateNumber}</span>
                    <span className="text-sky-300 text-[11px] truncate">{pkt.msgTypeName}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-slate-500 text-[10px] truncate max-w-[120px] hidden sm:inline">
                      {pkt.rawHex.slice(0, 24)}...
                    </span>
                    <span className="text-[10px] text-teal-400">{pkt.latencyMs}ms</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Packet Inspector Detail Panel (5 Cols) */}
          <div className="lg:col-span-5 h-80 overflow-y-auto bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs space-y-3 font-mono">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-sky-400" />
                <span>协议帧深度解析器 (Inspector)</span>
              </span>
              <span className="text-slate-500 text-[10px]">
                {selectedPacket ? selectedPacket.protocol : '请点击左侧数据包'}
              </span>
            </div>

            {selectedPacket ? (
              <div className="space-y-2.5">
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="bg-slate-900 p-2 rounded border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">协议标准 / 报文类型</span>
                    <span className="font-bold text-sky-400">{selectedPacket.protocol} · {selectedPacket.msgType}</span>
                  </div>
                  <div className="bg-slate-900 p-2 rounded border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">终端标识 (Terminal ID)</span>
                    <span className="font-bold text-emerald-400">{selectedPacket.terminalId}</span>
                  </div>
                </div>

                {/* Raw Hex View */}
                <div>
                  <span className="text-[10px] text-slate-400 block mb-1">原始网络二进制帧 (Hex Stream):</span>
                  <div className="bg-slate-900 p-2 rounded border border-slate-800 text-amber-300 break-all leading-relaxed text-[11px]">
                    {selectedPacket.rawHex}
                  </div>
                </div>

                {/* Parsed JSON Payload */}
                <div>
                  <span className="text-[10px] text-slate-400 block mb-1">网关解构后的结构化 Payload:</span>
                  <pre className="bg-slate-900 p-2 rounded border border-slate-800 text-slate-200 overflow-x-auto text-[10px] leading-tight">
                    {JSON.stringify(selectedPacket.payload, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-52 text-slate-500 space-y-2">
                <Search className="w-8 h-8 text-slate-600" />
                <span>在左侧数据流列表中点击任意数据帧查看 Hex 二进制解构</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
