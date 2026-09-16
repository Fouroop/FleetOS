import React, { useState, useEffect, useRef } from 'react';
import { 
  Video, 
  Camera, 
  Maximize2, 
  Volume2, 
  Mic, 
  RefreshCw, 
  ShieldAlert, 
  Radio, 
  Settings, 
  Square, 
  Play, 
  ChevronRight, 
  Layers, 
  AlertTriangle,
  Download,
  Share2,
  Tv,
  Focus,
  Compass,
  CheckCircle2,
  VideoOff
} from 'lucide-react';
import { Vehicle } from '../../types';
import { dataGateway, InCabinTelemetry } from '../../services/gateway';

interface CameraSurveillanceViewProps {
  vehicles: Vehicle[];
}

interface CameraChannel {
  id: string;
  name: string;
  code: string;
  type: 'dsm' | 'adas' | 'cargo' | 'rear' | 'side';
  streamUrl: string;
  status: 'ONLINE' | 'RECORDING' | 'ALARM';
  resolution: string;
  fps: number;
  bitrate: string;
}

export const CameraSurveillanceView: React.FC<CameraSurveillanceViewProps> = ({ vehicles }) => {
  const [inCabinList, setInCabinList] = useState<InCabinTelemetry[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(vehicles[0]?.id || 'v-01');
  const [activeChannelId, setActiveChannelId] = useState<string>('ch-1');
  const [splitMode, setSplitMode] = useState<1 | 4>(1);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isIntercomActive, setIsIntercomActive] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Local webcam integration state
  const [useLocalWebcam, setUseLocalWebcam] = useState<boolean>(false);
  const [webcamError, setWebcamError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const showNotification = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  useEffect(() => {
    const unsub = dataGateway.subscribeInCabin((map) => {
      setInCabinList(Array.from(map.values()));
    });
    return () => unsub();
  }, []);

  // Handle local webcam stream start/stop
  useEffect(() => {
    if (useLocalWebcam) {
      navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 }, audio: false })
        .then((stream) => {
          mediaStreamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(err => console.log('Video play error:', err));
          }
          setWebcamError(null);
          showNotification('已成功接通本地摄像头实时视频流');
        })
        .catch((err) => {
          console.error('Webcam access error:', err);
          setWebcamError('无法访问摄像头，请检查浏览器权限');
          setUseLocalWebcam(false);
          showNotification('⚠️ 无法接通本地摄像头，已切回云端AI视频流');
        });
    } else {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }

    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [useLocalWebcam]);

  const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId) || vehicles[0];
  const selectedCabin = inCabinList.find(i => i.vehicleId === selectedVehicleId) || inCabinList[0];

  const channels: CameraChannel[] = [
    {
      id: 'ch-1',
      name: '主驾驶舱红外感知 (DSM)',
      code: 'CAM-IN-01',
      type: 'dsm',
      streamUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1200&auto=format&fit=crop&q=80',
      status: selectedCabin?.fatigueStatus !== 'NORMAL' ? 'ALARM' : 'ONLINE',
      resolution: '1920x1080 (1080P)',
      fps: 30,
      bitrate: '2.4 Mbps',
    },
    {
      id: 'ch-2',
      name: '前方道路ADAS碰撞感知',
      code: 'CAM-ROAD-02',
      type: 'adas',
      streamUrl: 'https://images.unsplash.com/photo-1506015391300-4802dc74de2e?w=1200&auto=format&fit=crop&q=80',
      status: 'ONLINE',
      resolution: '1920x1080 (1080P)',
      fps: 30,
      bitrate: '3.1 Mbps',
    },
    {
      id: 'ch-3',
      name: '厢内温湿度与货物状态监控',
      code: 'CAM-CARGO-03',
      type: 'cargo',
      streamUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&auto=format&fit=crop&q=80',
      status: 'ONLINE',
      resolution: '1280x720 (720P)',
      fps: 20,
      bitrate: '1.2 Mbps',
    },
    {
      id: 'ch-4',
      name: '尾部倒车雷达与盲区影像',
      code: 'CAM-REAR-04',
      type: 'rear',
      streamUrl: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=1200&auto=format&fit=crop&q=80',
      status: 'ONLINE',
      resolution: '1280x720 (720P)',
      fps: 25,
      bitrate: '1.5 Mbps',
    },
  ];

  const activeChannel = channels.find(c => c.id === activeChannelId) || channels[0];

  return (
    <div className="h-[calc(100vh-4rem)] p-4 sm:p-6 flex flex-col gap-4 max-w-[1920px] mx-auto text-slate-100 overflow-y-auto">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 bg-sky-600 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-sky-400 animate-bounce">
          <Radio className="w-5 h-5 animate-pulse" />
          <span className="text-sm font-semibold">{toastMsg}</span>
        </div>
      )}

      {/* Top Banner / Vehicle & Stream Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
            <Tv className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
              <span>全景车载视频与AI智能监控中心</span>
              <span className="text-[10px] bg-emerald-950 text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-800/80 font-mono">
                RTSP / WebRTC Stream Connected
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              接入多路车载云台与AI智能双向视音频网关，支持实时抓拍、远程对讲与PTZ云台控制
            </p>
          </div>
        </div>

        {/* Vehicle Selector Dropdown & Webcam Toggle */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setUseLocalWebcam(!useLocalWebcam)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-lg ${
              useLocalWebcam
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-400 animate-pulse'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
          >
            {useLocalWebcam ? <Video className="w-4 h-4 text-white" /> : <VideoOff className="w-4 h-4 text-slate-400" />}
            <span>{useLocalWebcam ? '本地摄像头实时直播中' : '接入本地摄像头 (Webcam)'}</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 shrink-0">当前车辆:</span>
            <select
              value={selectedVehicleId}
              onChange={(e) => setSelectedVehicleId(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-sky-500"
            >
              {vehicles.map(v => (
                <option key={v.id} value={v.id}>
                  {v.plateNumber} ({v.assignedDriverName || '主驾'}) - {v.status === 'alarm' ? '⚠️ 告警中' : '🟢 正常'}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Video Surveillance Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-[520px]">
        {/* Left / Center Video Display Area (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-3">
          {/* Main Video Viewport */}
          <div className="relative flex-1 bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col min-h-[420px] group">
            {splitMode === 1 ? (
              <div className="relative w-full h-full flex-1">
                {useLocalWebcam ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={activeChannel.streamUrl}
                    alt={activeChannel.name}
                    className="w-full h-full object-cover opacity-95 transition duration-500"
                  />
                )}
                
                {/* Simulated AI bounding boxes / face mesh for DSM */}
                {activeChannel.type === 'dsm' && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="absolute border-2 border-emerald-400/80 rounded-lg p-2 top-[35%] left-[38%] w-[24%] h-[32%] flex flex-col justify-between">
                      <div className="bg-emerald-950/80 text-emerald-300 text-[10px] font-mono px-1 rounded w-max">
                        Face AI: 99.8% | {useLocalWebcam ? 'Live Camera Feed' : 'Normal'}
                      </div>
                      <div className="border border-dashed border-emerald-400/50 h-6 rounded"></div>
                    </div>
                  </div>
                )}

                {/* ADAS forward collision overlay */}
                {activeChannel.type === 'adas' && (
                  <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6">
                    <div className="flex justify-between items-center">
                      <span className="bg-emerald-950/80 text-emerald-400 text-xs font-mono px-2 py-1 rounded border border-emerald-800">
                        前车距离: 38.5m | 车速: {selectedVehicle?.telemetry?.speed || 65} km/h
                      </span>
                      <span className="bg-blue-950/80 text-blue-300 text-xs font-mono px-2 py-1 rounded border border-blue-800">
                        {useLocalWebcam ? 'Webcam Live Stream' : '车道线识别: 正常居中'}
                      </span>
                    </div>
                    <div className="self-center border-b-2 border-dashed border-yellow-400 w-32"></div>
                  </div>
                )}
              </div>
            ) : (
              /* 4-Split Quad View Grid */
              <div className="grid grid-cols-2 grid-rows-2 w-full h-full gap-2 p-2 bg-slate-950">
                {channels.map(ch => (
                  <div 
                    key={ch.id} 
                    onClick={() => setActiveChannelId(ch.id)}
                    className={`relative rounded-xl overflow-hidden border cursor-pointer transition ${
                      activeChannelId === ch.id ? 'border-sky-500 ring-2 ring-sky-500/50' : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {useLocalWebcam && ch.id === activeChannelId ? (
                      <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                    ) : (
                      <img src={ch.streamUrl} alt={ch.name} className="w-full h-full object-cover" />
                    )}
                    <div className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-mono text-white">
                      {ch.code} - {ch.name.split(' ')[0]}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Video Overlay Top Bar */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
              <div className="flex items-center gap-2 bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700 text-xs font-mono text-white pointer-events-auto">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                <strong className="text-sky-400">{selectedVehicle.plateNumber}</strong>
                <span className="text-slate-400">|</span>
                <span>{activeChannel.name}</span>
              </div>

              <div className="flex items-center gap-2 pointer-events-auto">
                <span className="bg-slate-900/85 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-slate-700 text-xs font-mono text-emerald-400">
                  {activeChannel.resolution} / {activeChannel.fps}fps
                </span>
                <button 
                  onClick={() => setSplitMode(splitMode === 1 ? 4 : 1)}
                  className="bg-slate-900/85 hover:bg-slate-800 text-white p-2 rounded-xl border border-slate-700 text-xs flex items-center gap-1 transition"
                  title={splitMode === 1 ? "四画面分屏" : "单画面全屏"}
                >
                  <Layers className="w-4 h-4" />
                  <span>{splitMode === 1 ? '4分屏' : '单屏'}</span>
                </button>
              </div>
            </div>

            {/* Video Control Bottom Bar */}
            <div className="absolute bottom-4 left-4 right-4 bg-slate-900/90 backdrop-blur-md p-3 rounded-xl border border-slate-700/80 flex items-center justify-between text-xs pointer-events-auto">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => {
                    setIsRecording(!isRecording);
                    showNotification(isRecording ? '已停止云端视频录制' : '正在录制车载实时视频流...');
                  }}
                  className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition ${
                    isRecording ? 'bg-rose-600 text-white animate-pulse' : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${isRecording ? 'bg-white' : 'bg-rose-500'}`}></span>
                  <span>{isRecording ? '录制中...' : '录像'}</span>
                </button>

                <button 
                  onClick={() => showNotification(`已成功抓拍 ${selectedVehicle.plateNumber} - ${activeChannel.name} 高清截图`)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium transition flex items-center gap-1.5"
                >
                  <Camera className="w-3.5 h-3.5 text-sky-400" />
                  <span>抓拍</span>
                </button>

                <button 
                  onClick={() => {
                    setIsIntercomActive(!isIntercomActive);
                    showNotification(isIntercomActive ? '已断开语音对讲' : `已接通与 ${selectedVehicle.assignedDriverName || '司机'} 的双向语音对讲通道`);
                  }}
                  className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition ${
                    isIntercomActive ? 'bg-emerald-600 text-white animate-pulse' : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  }`}
                >
                  <Mic className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{isIntercomActive ? '对讲中 (PTT)' : '语音对讲'}</span>
                </button>
              </div>

              <div className="flex items-center gap-3 text-slate-300">
                <span className="flex items-center gap-1 font-mono text-xs">
                  <Volume2 className="w-4 h-4 text-sky-400" />
                  音量: 80%
                </span>
                <span className="text-slate-500">|</span>
                <span className="font-mono text-xs text-amber-400 font-bold">{activeChannel.bitrate}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Channel Selector & PTZ / Vehicle Telemetry (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Camera Channel Selector List */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
            <h3 className="font-bold text-sm text-white flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="flex items-center gap-2">
                <Video className="w-4 h-4 text-sky-400" />
                <span>多路摄像头通道切换</span>
              </span>
              <span className="text-xs text-slate-400 font-mono">4路在线</span>
            </h3>

            <div className="space-y-2">
              {channels.map(ch => {
                const isActive = activeChannelId === ch.id;
                return (
                  <div
                    key={ch.id}
                    onClick={() => setActiveChannelId(ch.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between text-xs ${
                      isActive
                        ? 'bg-sky-950/50 border-sky-500 shadow-md ring-1 ring-sky-500/40 text-white font-bold'
                        : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/60 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-2.5 h-2.5 rounded-full ${ch.status === 'ALARM' ? 'bg-rose-500 animate-ping' : 'bg-emerald-400'}`}></div>
                      <div>
                        <div className="font-bold">{ch.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{ch.code} · {ch.resolution}</div>
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 ${isActive ? 'text-sky-400' : 'text-slate-500'}`} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* PTZ Cloud Pan-Tilt-Zoom Simulation Controls */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
            <h3 className="font-bold text-sm text-white flex items-center gap-2 pb-2 border-b border-slate-800">
              <Compass className="w-4 h-4 text-indigo-400" />
              <span>PTZ 云台与视角微调</span>
            </h3>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div></div>
              <button 
                onClick={() => showNotification('云台指令: 镜头上仰')}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold"
              >
                ▲ 上仰
              </button>
              <div></div>

              <button 
                onClick={() => showNotification('云台指令: 镜头左转')}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold"
              >
                ◀ 左转
              </button>
              <button 
                onClick={() => showNotification('云台指令: 视角回中复位')}
                className="p-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold shadow"
              >
                ● 复位
              </button>
              <button 
                onClick={() => showNotification('云台指令: 镜头右转')}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold"
              >
                右转 ▶
              </button>

              <div></div>
              <button 
                onClick={() => showNotification('云台指令: 镜头下俯')}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold"
              >
                ▼ 下俯
              </button>
              <div></div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button 
                onClick={() => showNotification('光学变焦: 放大 2.0X')}
                className="flex-1 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold"
              >
                🔍 放大 (Zoom +)
              </button>
              <button 
                onClick={() => showNotification('光学变焦: 缩小 1.0X')}
                className="flex-1 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold"
              >
                🔎 缩小 (Zoom -)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
