import React, { useState } from 'react';
import { TransportTask, Vehicle, Driver } from '../../types';
import { getAiDispatchRecommendation, DispatchRecommendation } from '../../services/api';
import { 
  Send, 
  Plus, 
  MapPin, 
  Clock, 
  Truck, 
  User, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  Package, 
  AlertCircle,
  FileText,
  Sliders,
  DollarSign,
  Route
} from 'lucide-react';

interface TaskDispatchViewProps {
  tasks: TransportTask[];
  vehicles: Vehicle[];
  drivers: Driver[];
  onAddTask: (task: Partial<TransportTask>) => void;
  onUpdateTaskStatus: (taskId: string, newStatus: TransportTask['status']) => void;
}

export const TaskDispatchView: React.FC<TaskDispatchViewProps> = ({
  tasks,
  vehicles,
  drivers,
  onAddTask,
  onUpdateTaskStatus,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [cargoType, setCargoType] = useState('电子数码 / 精密仪器');
  const [weightTon, setWeightTon] = useState<number>(18.5);
  const [origin, setOrigin] = useState('上海市青浦区华新物流园');
  const [destination, setDestination] = useState('浙江省杭州市余杭区阿里巴巴菜鸟物流基地');
  const [deadline, setDeadline] = useState('今日 18:30 前');
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [aiRecommendation, setAiRecommendation] = useState<DispatchRecommendation | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  // Available vehicles
  const availableVehicles = vehicles.filter(v => v.status === 'parking' || v.status === 'running');

  const handleFetchAiRecommendation = async () => {
    setLoadingAi(true);
    const candidateTask = {
      title: taskTitle || '新运单提货任务',
      origin,
      destination,
      cargoWeightTon: weightTon,
      cargoType,
    };

    const res = await getAiDispatchRecommendation(candidateTask, availableVehicles);
    setAiRecommendation(res);
    if (res && res.bestVehicleId) {
      setSelectedVehicleId(res.bestVehicleId);
    }
    setLoadingAi(false);
  };

  const handleCreateTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim() || !origin.trim() || !destination.trim()) return;

    const assignedVeh = vehicles.find(v => v.id === selectedVehicleId);
    const assignedDriver = assignedVeh ? drivers.find(d => d.id === assignedVeh.assignedDriverId) : null;

    onAddTask({
      id: `task-${Date.now()}`,
      taskNo: `TK-202608-${Math.floor(1000 + Math.random() * 9000)}`,
      title: taskTitle.trim(),
      cargoType,
      cargoWeightTon: weightTon,
      origin,
      destination,
      originCoord: [121.15, 31.18],
      destCoord: [119.98, 30.28],
      plannedDepartureTime: '2026-08-20 10:00',
      plannedArrivalTime: deadline,
      assignedVehicleId: assignedVeh?.id,
      assignedVehiclePlate: assignedVeh?.plateNumber,
      assignedDriverId: assignedDriver?.id,
      assignedDriverName: assignedDriver?.name || assignedVeh?.assignedDriverName,
      driverPhone: assignedDriver?.phone || assignedVeh?.driverPhone,
      status: assignedVeh ? 'dispatched' : 'pending_dispatch',
      progressPercent: assignedVeh ? 15 : 0,
      priority: 'high',
      freightAmountYuan: 4200,
      aiRecommendedVehicleId: aiRecommendation?.bestVehicleId,
      aiConfidenceScore: aiRecommendation?.confidenceScore,
      aiMatchReason: aiRecommendation?.reasoning,
    });

    // Reset & Close
    setShowCreateModal(false);
    setTaskTitle('');
    setAiRecommendation(null);
  };

  const columns: { key: TransportTask['status']; label: string; countColor: string }[] = [
    { key: 'pending_dispatch', label: '待指派调度', countColor: 'bg-slate-700 text-slate-300' },
    { key: 'dispatched', label: '已派单 · 待发车', countColor: 'bg-sky-500/20 text-sky-400' },
    { key: 'in_progress', label: '在途运输中', countColor: 'bg-blue-500/20 text-blue-400' },
    { key: 'delivered', label: '已送达签收', countColor: 'bg-emerald-500/20 text-emerald-400' },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-[1920px] mx-auto text-slate-100">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <Send className="w-5 h-5 text-sky-400" />
            <h1 className="font-bold text-lg text-white">任务调度与智能派车中心</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            融合“就近寻车 + 载重配载 + 驾驶员安全等级 + 空驶能耗最小化”的 AI 智能调度算法
          </p>
        </div>

        <button
          id="btn-create-task"
          onClick={() => {
            setShowCreateModal(true);
            handleFetchAiRecommendation();
          }}
          className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-lg shadow-sky-600/30 transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>新建运单并 AI 推荐车辆</span>
        </button>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {columns.map(col => {
          const colTasks = tasks.filter(t => t.status === col.key);
          return (
            <div key={col.key} className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col h-[calc(100vh-14rem)] shadow-lg">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="font-bold text-xs text-slate-200">{col.label}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${col.countColor}`}>
                  {colTasks.length}
                </span>
              </div>

              {/* Tasks List */}
              <div className="flex-1 overflow-y-auto mt-3 space-y-3 pr-1">
                {colTasks.length === 0 ? (
                  <div className="text-center py-12 text-xs text-slate-500">暂无任务</div>
                ) : (
                  colTasks.map(t => (
                    <div
                      key={t.id}
                      className="bg-slate-800/70 hover:bg-slate-800 border border-slate-700/60 rounded-xl p-3 shadow-md space-y-2.5 transition text-xs"
                    >
                      <div className="flex items-start justify-between">
                        <span className="font-bold text-sky-400 font-mono text-[11px]">{t.taskNo}</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                          t.priority === 'urgent' ? 'bg-rose-500/20 text-rose-300' :
                          t.priority === 'high' ? 'bg-amber-500/20 text-amber-300' :
                          'bg-slate-700 text-slate-300'
                        }`}>
                          {t.priority === 'urgent' ? '紧急' : t.priority === 'high' ? '优先' : '常规'}
                        </span>
                      </div>

                      <h4 className="font-bold text-slate-100 text-xs leading-tight">{t.title}</h4>

                      {/* Origin & Destination */}
                      <div className="space-y-1 text-[11px] text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                          <span className="truncate text-slate-400">起: {t.origin}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                          <span className="truncate text-slate-400">终: {t.destination}</span>
                        </div>
                      </div>

                      {/* Cargo & Assigned Vehicle */}
                      <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800 space-y-1 text-[11px]">
                        <div className="flex justify-between text-slate-400">
                          <span>货物: {t.cargoType}</span>
                          <span className="text-slate-200 font-medium">{t.cargoWeightTon} 吨</span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>车辆: {t.assignedVehiclePlate || '待指派'}</span>
                          <span className="text-slate-200">{t.assignedDriverName || '待定'}</span>
                        </div>
                      </div>

                      {/* AI Matching Reason Tag if present */}
                      {t.aiMatchReason && (
                        <div className="p-2 rounded bg-purple-950/40 border border-purple-800/40 text-[10px] text-purple-300">
                          <div className="flex items-center gap-1 font-bold text-purple-200">
                            <Sparkles className="w-3 h-3" />
                            <span>AI 智能匹配</span>
                          </div>
                          <p className="line-clamp-2 mt-0.5">{t.aiMatchReason}</p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between">
                        <span className="text-[11px] font-bold text-amber-400">¥{t.freightAmountYuan}</span>
                        
                        <div className="flex items-center gap-1">
                          {col.key === 'pending_dispatch' && (
                            <button
                              onClick={() => onUpdateTaskStatus(t.id, 'dispatched')}
                              className="px-2 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded text-[11px] font-medium"
                            >
                              指派发车
                            </button>
                          )}
                          {col.key === 'dispatched' && (
                            <button
                              onClick={() => onUpdateTaskStatus(t.id, 'in_progress')}
                              className="px-2 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-[11px] font-medium"
                            >
                              开始在途
                            </button>
                          )}
                          {col.key === 'in_progress' && (
                            <button
                              onClick={() => onUpdateTaskStatus(t.id, 'delivered')}
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-medium"
                            >
                              签收送达
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Create Task & AI Recommendation */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-sky-400" />
                <h3 className="font-bold text-base text-white">新建运输任务与 AI 智能推荐</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTaskSubmit} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">任务/运单名称</label>
                <input
                  type="text"
                  required
                  placeholder="例如: 华东冷链生鲜次晨达干线运输"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">货物类型</label>
                  <select
                    value={cargoType}
                    onChange={(e) => setCargoType(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="电子数码 / 精密仪器">电子数码 / 精密仪器</option>
                    <option value="生鲜冷链 (-18℃)">生鲜冷链 (-18℃)</option>
                    <option value="普货干线快运">普货干线快运</option>
                    <option value="危险化学品 (甲类)">危险化学品 (甲类)</option>
                    <option value="工程建材混泥土">工程建材混泥土</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">货物重量 (吨)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={weightTon}
                    onChange={(e) => setWeightTon(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">始发提货地</label>
                  <input
                    type="text"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">目的卸货地</label>
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* AI Dispatch Recommendation Box */}
              <div className="p-3.5 bg-gradient-to-r from-purple-950/70 via-slate-800 to-indigo-950/70 rounded-xl border border-purple-800/50 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-purple-300">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span>AI 推荐派车算法 (Gemini Fleet Matcher)</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleFetchAiRecommendation}
                    className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded text-[11px] font-bold"
                  >
                    {loadingAi ? 'AI 计算中...' : '重新智能匹配'}
                  </button>
                </div>

                {aiRecommendation && (
                  <div className="space-y-1.5 text-[11px] text-slate-200">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">推荐优选车辆:</span>
                      <span className="font-bold text-sky-400 text-xs">
                        {vehicles.find(v => v.id === aiRecommendation.bestVehicleId)?.plateNumber || aiRecommendation.bestVehicleId}
                      </span>
                      <span className="text-emerald-400 font-semibold font-mono">
                        (匹配度 {aiRecommendation.confidenceScore}%)
                      </span>
                    </div>
                    <p className="text-slate-300 leading-relaxed bg-slate-900/60 p-2 rounded border border-slate-800">
                      💡 {aiRecommendation.reasoning}
                    </p>
                  </div>
                )}
              </div>

              {/* Vehicle Selection */}
              <div>
                <label className="block text-slate-300 font-medium mb-1">指派执行车辆与驾驶员</label>
                <select
                  value={selectedVehicleId}
                  onChange={(e) => setSelectedVehicleId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                >
                  <option value="">-- 请选择或使用 AI 推荐车辆 --</option>
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.plateNumber} ({v.brand}) - 司机: {v.assignedDriverName || '待指定'} - 状态: {v.status === 'parking' ? '空闲' : '运行中'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold"
                >
                  确认下发任务
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
