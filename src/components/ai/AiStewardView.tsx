import React, { useState } from 'react';
import { Vehicle, Driver, AlarmRecord, TransportTask, MaintenanceRecord } from '../../types';
import { askAiSteward, generateDailyBriefing, AiStewardMessage } from '../../services/api';
import { 
  Bot, 
  Sparkles, 
  Send, 
  FileText, 
  UserCheck, 
  ShieldAlert, 
  Fuel, 
  Wrench, 
  FileCheck, 
  Heart, 
  RefreshCw, 
  Copy, 
  Check,
  Brain,
  MessageSquare
} from 'lucide-react';

interface AiStewardViewProps {
  vehicles: Vehicle[];
  drivers: Driver[];
  alarms: AlarmRecord[];
  tasks: TransportTask[];
  maintenance: MaintenanceRecord[];
}

export const AiStewardView: React.FC<AiStewardViewProps> = ({
  vehicles,
  drivers,
  alarms,
  tasks,
  maintenance,
}) => {
  const [selectedAgentId, setSelectedAgentId] = useState<string>('dispatch');
  const [messages, setMessages] = useState<AiStewardMessage[]>([
    {
      id: 'msg-init',
      sender: 'ai',
      text: '您好！我是 FleetOS AI 智能车队管家。我已经实时同步了全车队的北斗定位、主动安全ADAS/DMS数据、加油报销与预测性维保工单。请问今天需要我协助分析哪些车队业务？',
      timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);
  const [dailyReport, setDailyReport] = useState<string | null>(null);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [copied, setCopied] = useState(false);

  const subAgents = [
    { id: 'dispatch', name: '智能调度优化专家', icon: Bot, desc: '货车配载、回程寻货、就近指派' },
    { id: 'safety', name: '主动安全风控专家', icon: ShieldAlert, desc: 'ADAS/DMS告警分析、高风险驾驶干预' },
    { id: 'fuel', name: '能耗油耗精细化分析师', icon: Fuel, desc: '百公里油耗波动诊断、怠速偷油识别' },
    { id: 'maintenance', name: '预测性维保工程师', icon: Wrench, desc: '刹车片/机油寿命预测、预防性保养' },
    { id: 'compliance', name: '合规督导与资质官', icon: FileCheck, desc: '年审保险到期预警、超载禁行监管' },
    { id: 'advisor', name: '运营战略与成本顾问', icon: FileText, desc: '单公里TCO分析、车队降本增效建议' },
    { id: 'care', name: '驾驶员心理关怀教练', icon: Heart, desc: '长途疲劳疏导、防御驾驶沟通话术' },
  ];

  const quickPrompts = [
    '帮我诊断当前处于中高风险的驾驶员，并给出针对性督导方案',
    '如何优化上海至杭州干线的空驶率与单公里综合燃油成本？',
    '检查未来30天内即将到期的车辆年审、保险与维保项目',
    '分析近期高发的超速与急刹车事件，找出关键路段规律',
  ];

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputText;
    if (!textToSend.trim() || loadingAi) return;

    const userMsg: AiStewardMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setLoadingAi(true);

    const contextData = {
      agentRole: selectedAgentId,
      totalVehicles: vehicles.length,
      activeVehicles: vehicles.filter(v => v.status === 'running').length,
      averageDriverScore: +(drivers.reduce((s, d) => s + d.safetyScore, 0) / (drivers.length || 1)).toFixed(1),
      highRiskDrivers: drivers.filter(d => d.riskLevel === 'high').map(d => d.name),
      pendingAlarms: alarms.filter(a => a.status === 'pending').length,
      vehiclesNearMaintenance: vehicles.filter(v => v.maintenanceDueKm < 2000).map(v => v.plateNumber),
    };

    const aiReplyText = await askAiSteward(textToSend, selectedAgentId, contextData);

    const aiMsg: AiStewardMessage = {
      id: `msg-${Date.now() + 1}`,
      sender: 'ai',
      text: aiReplyText,
      timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, aiMsg]);
    setLoadingAi(false);
  };

  const handleGenerateDailyReport = async () => {
    setGeneratingReport(true);
    const report = await generateDailyBriefing({
      vehicles,
      drivers,
      alarms,
      tasks,
    });
    setDailyReport(report);
    setGeneratingReport(false);
  };

  const handleCopyReport = () => {
    if (!dailyReport) return;
    navigator.clipboard.writeText(dailyReport);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-[1920px] mx-auto text-slate-100">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-400" />
            <h1 className="font-bold text-lg text-white">AI 车队智能管家与专家顾问工作台</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            由 Gemini 2.5 驱动的 7 位专业车队领域 Agent，协同解决调度配载、安全督导、能耗诊断与经营决策
          </p>
        </div>

        <button
          onClick={handleGenerateDailyReport}
          disabled={generatingReport}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4" />
          <span>{generatingReport ? 'AI 正在生成日报...' : '一键生成今日车队运营日报'}</span>
        </button>
      </div>

      {/* Main Grid: Left Sub-Agent selector + Center Chat Room + Right Daily Briefing */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Sub-Agent List (3 Cols) */}
        <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-xl space-y-2.5">
          <h3 className="font-bold text-xs text-slate-300 pb-2 border-b border-slate-800">
            领域专家 Sub-Agents
          </h3>

          <div className="space-y-1.5 text-xs">
            {subAgents.map(ag => {
              const Icon = ag.icon;
              const isSelected = selectedAgentId === ag.id;
              return (
                <button
                  key={ag.id}
                  onClick={() => setSelectedAgentId(ag.id)}
                  className={`w-full text-left p-2.5 rounded-xl border transition flex items-start gap-2.5 ${
                    isSelected
                      ? 'bg-purple-950/40 border-purple-500/60 text-white shadow-md'
                      : 'bg-slate-800/60 border-slate-700/50 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg shrink-0 ${isSelected ? 'bg-purple-600 text-white' : 'bg-slate-700 text-slate-400'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-xs block">{ag.name}</span>
                    <span className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{ag.desc}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Center Interactive Chat Console (6 Cols) */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl flex flex-col h-[640px]">
          {/* Active Agent Banner */}
          <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="font-bold text-xs text-white">
                当前对话: {subAgents.find(a => a.id === selectedAgentId)?.name}
              </span>
            </div>
            <span className="text-[10px] text-purple-400 px-2 py-0.5 bg-purple-500/10 rounded-full border border-purple-500/30 font-semibold">
              Gemini 2.5 Flash
            </span>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto my-3 space-y-3.5 pr-1 text-xs">
            {messages.map(m => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'ai' && (
                  <div className="w-7 h-7 rounded-full bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300 font-bold shrink-0">
                    AI
                  </div>
                )}
                <div
                  className={`p-3 rounded-2xl max-w-[85%] leading-relaxed space-y-1 ${
                    m.sender === 'user'
                      ? 'bg-sky-600 text-white rounded-tr-none'
                      : 'bg-slate-800 border border-slate-700/70 text-slate-200 rounded-tl-none whitespace-pre-wrap'
                  }`}
                >
                  <p className="text-xs">{m.text}</p>
                  <span className={`text-[9px] block text-right ${m.sender === 'user' ? 'text-sky-200' : 'text-slate-500'}`}>
                    {m.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {loadingAi && (
              <div className="flex gap-2 items-center text-xs text-purple-300 p-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>AI 正在研判全车队遥测与业务数据...</span>
              </div>
            )}
          </div>

          {/* Quick Prompt Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 text-[11px] scrollbar-none">
            {quickPrompts.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(q)}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full border border-slate-700 whitespace-nowrap shrink-0 transition"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="pt-2 border-t border-slate-800 flex items-center gap-2"
          >
            <input
              type="text"
              placeholder={`向 ${subAgents.find(a => a.id === selectedAgentId)?.name} 提问或发出调度指令...`}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || loadingAi}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 transition shadow"
            >
              <Send className="w-3.5 h-3.5" />
              <span>发送</span>
            </button>
          </form>
        </div>

        {/* Right Daily Briefing Card (3 Cols) */}
        <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl flex flex-col h-[640px]">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
            <div className="flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-sky-400" />
              <span className="font-bold text-xs text-white">AI 智能运营日报 (每日简报)</span>
            </div>
            {dailyReport && (
              <button
                onClick={handleCopyReport}
                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] flex items-center gap-1"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? '已复制' : '复制'}</span>
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto my-3 text-xs leading-relaxed text-slate-300 pr-1">
            {dailyReport ? (
              <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700 whitespace-pre-wrap font-sans text-xs">
                {dailyReport}
              </div>
            ) : (
              <div className="text-center py-20 text-slate-500 space-y-2">
                <Sparkles className="w-6 h-6 mx-auto text-slate-600" />
                <p>点击右上角“一键生成今日车队运营日报”，AI将自动汇总里程、能耗、异常报警与调度整改要点。</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
