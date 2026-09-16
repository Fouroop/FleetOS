import { Vehicle, TelemetryData, AlarmRecord, AlarmType } from '../types';
import { INITIAL_VEHICLES } from '../data/mockFleetData';
import { ROAD_CORRIDORS, densifyRoadCorridor } from './roadNetworkEngine';

export type GatewayProtocol = 'JT808-2019' | 'GB32960' | 'MQTT' | 'HTTP-REST' | 'WebSocket';

export type DataSourceMode = 'simulated' | 'replay' | 'custom_injection' | 'external_api';

export interface GatewayPacket {
  id: string;
  direction: 'INBOUND' | 'OUTBOUND';
  protocol: GatewayProtocol;
  vehicleId: string;
  plateNumber: string;
  terminalId: string;
  msgType: string;
  msgTypeName: string;
  rawHex: string;
  payload: any;
  timestamp: string;
  status: 'SUCCESS' | 'FILTERED' | 'TRANSFORMED' | 'ERROR';
  latencyMs: number;
}

export interface DownlinkCommand {
  id: string;
  vehicleId: string;
  plateNumber: string;
  commandType: 'QUERY_LOCATION' | 'LOCK_DOOR' | 'UNLOCK_DOOR' | 'CUT_FUEL' | 'RESTORE_FUEL' | 'SET_REPORT_INTERVAL' | 'UPGRADE_FIRMWARE' | 'TTS_VOICE_ALERT';
  commandName: string;
  params?: any;
  issuedAt: string;
  status: 'QUEUED' | 'SENT' | 'ACKED' | 'FAILED';
  ackMessage?: string;
}

export interface GatewayStats {
  inboundPacketsTotal: number;
  outboundCommandsTotal: number;
  bytesTransferred: number;
  qps: number;
  activeTerminals: number;
  avgLatencyMs: number;
  errorRatePercent: number;
  protocolDistribution: {
    'JT808-2019': number;
    'GB32960': number;
    'MQTT': number;
    'HTTP-REST': number;
    'WebSocket': number;
  };
}

export interface SimulationPreset {
  id: string;
  name: string;
  description: string;
  vehicleCount: number;
  updateIntervalMs: number;
  trafficScenario: 'normal_smooth' | 'rush_hour_congestion' | 'highway_high_speed' | 'severe_weather_alarms' | 'mountain_tunnel_packet_loss';
  alarmFrequency: 'low' | 'medium' | 'high';
}

type PacketListener = (packet: GatewayPacket) => void;
type VehicleListener = (vehicles: Vehicle[]) => void;
type AlarmListener = (alarm: AlarmRecord) => void;
type StatsListener = (stats: GatewayStats) => void;

interface VehicleCorridorState {
  corridorKey: string;
  points: { lat: number; lng: number; heading: number; speedKmH: number; roadName: string; district: string }[];
  currentIndex: number;
  direction: 1 | -1;
  pauseTicksLeft: number;
}

class TelemetryGatewayService {
  private vehicles: Vehicle[] = JSON.parse(JSON.stringify(INITIAL_VEHICLES));
  private vehicleStates: Map<string, VehicleCorridorState> = new Map();
  private packetBuffer: GatewayPacket[] = [];
  private downlinkCommands: DownlinkCommand[] = [];

  private packetListeners: Set<PacketListener> = new Set();
  private vehicleListeners: Set<VehicleListener> = new Set();
  private alarmListeners: Set<AlarmListener> = new Set();
  private statsListeners: Set<StatsListener> = new Set();

  private isRunning: boolean = true;
  private timer: any = null;
  private statsTimer: any = null;

  // Gateway Settings
  private dataSourceMode: DataSourceMode = 'simulated';
  private activeProtocol: GatewayProtocol = 'JT808-2019';
  private updateIntervalMs: number = 2000;
  private speedMultiplier: number = 1;
  private isPacketLossSimulated: boolean = false;
  private packetLossRate: number = 0; // 0 to 100%
  private activePreset: string = 'preset-standard';

  // Stats Counters
  private stats: GatewayStats = {
    inboundPacketsTotal: 12450,
    outboundCommandsTotal: 182,
    bytesTransferred: 4892040,
    qps: 5.2,
    activeTerminals: 10,
    avgLatencyMs: 18,
    errorRatePercent: 0.1,
    protocolDistribution: {
      'JT808-2019': 68,
      'GB32960': 18,
      'MQTT': 10,
      'HTTP-REST': 3,
      'WebSocket': 1,
    },
  };

  constructor() {
    this.initRoadCorridorBindings();
    this.start();
  }

  private initRoadCorridorBindings() {
    const corridorKeys = Object.keys(ROAD_CORRIDORS);

    this.vehicles.forEach((veh, index) => {
      let key = corridorKeys[index % corridorKeys.length];
      if (veh.plateNumber.startsWith('粤B')) key = 'corridor-shenzhen';
      else if (veh.plateNumber.startsWith('沪A')) key = 'corridor-shanghai-suzhou';
      else if (veh.plateNumber.startsWith('京C')) key = 'corridor-beijing-tianjin';
      else if (veh.plateNumber.startsWith('苏E')) key = 'corridor-suzhou-city';
      else if (veh.plateNumber.startsWith('浙A')) key = 'corridor-hangzhou';
      else if (veh.plateNumber.startsWith('鲁B')) key = 'corridor-qingdao';
      else if (veh.plateNumber.startsWith('川A')) key = 'corridor-chengdu';
      else if (veh.plateNumber.startsWith('鄂A')) key = 'corridor-wuhan';
      else if (veh.plateNumber.startsWith('陕A')) key = 'corridor-xian';
      else if (veh.plateNumber.startsWith('闽D')) key = 'corridor-xiamen';

      const corridor = ROAD_CORRIDORS[key];
      const { points } = densifyRoadCorridor(corridor, 0.15);

      const initialIdx = Math.floor((index / Math.max(1, this.vehicles.length)) * (points.length - 1));
      const pt = points[initialIdx] || points[0];

      this.vehicleStates.set(veh.id, {
        corridorKey: key,
        points,
        currentIndex: initialIdx,
        direction: index % 2 === 0 ? 1 : -1,
        pauseTicksLeft: veh.status === 'parking' ? 12 : 0,
      });

      veh.telemetry.latitude = pt.lat;
      veh.telemetry.longitude = pt.lng;
      veh.telemetry.heading = pt.heading;
      veh.telemetry.speed = veh.status === 'parking' ? 0 : pt.speedKmH;
      veh.address = `${corridor.city} · ${pt.district} ${pt.roadName}`;
      if (!veh.terminalId) {
        veh.terminalId = `JT808-0138${index.toString().padStart(6, '0')}`;
      }
    });

    this.stats.activeTerminals = this.vehicles.length;
  }

  // --- Subscriptions ---
  public subscribeVehicles(fn: VehicleListener): () => void {
    this.vehicleListeners.add(fn);
    fn(this.vehicles);
    return () => this.vehicleListeners.delete(fn);
  }

  public subscribePackets(fn: PacketListener): () => void {
    this.packetListeners.add(fn);
    return () => this.packetListeners.delete(fn);
  }

  public subscribeAlarms(fn: AlarmListener): () => void {
    this.alarmListeners.add(fn);
    return () => this.alarmListeners.delete(fn);
  }

  public subscribeStats(fn: StatsListener): () => void {
    this.statsListeners.add(fn);
    fn(this.stats);
    return () => this.statsListeners.delete(fn);
  }

  public getVehicles(): Vehicle[] {
    return this.vehicles;
  }

  public getRecentPackets(): GatewayPacket[] {
    return this.packetBuffer.slice(0, 100);
  }

  public getDownlinkCommands(): DownlinkCommand[] {
    return this.downlinkCommands;
  }

  public getStats(): GatewayStats {
    return this.stats;
  }

  public getDataSourceMode(): DataSourceMode {
    return this.dataSourceMode;
  }

  public getActiveProtocol(): GatewayProtocol {
    return this.activeProtocol;
  }

  // --- Mode and Protocol Switching ---
  public setDataSourceMode(mode: DataSourceMode) {
    this.dataSourceMode = mode;
    this.notifyStats();
  }

  public setActiveProtocol(protocol: GatewayProtocol) {
    this.activeProtocol = protocol;
    this.notifyStats();
  }

  public setSpeedMultiplier(mult: number) {
    this.speedMultiplier = mult;
  }

  public setUpdateInterval(intervalMs: number) {
    this.updateIntervalMs = intervalMs;
    this.restartLoop();
  }

  public setPacketLossRate(rate: number) {
    this.packetLossRate = rate;
    this.isPacketLossSimulated = rate > 0;
  }

  public applySimulationPreset(presetId: string) {
    this.activePreset = presetId;
    switch (presetId) {
      case 'preset-standard':
        this.setVehicleCount(10);
        this.setUpdateInterval(2000);
        this.setSpeedMultiplier(1);
        this.setPacketLossRate(0);
        break;
      case 'preset-rush-hour':
        this.setVehicleCount(20);
        this.setUpdateInterval(1500);
        this.setSpeedMultiplier(0.7);
        this.setPacketLossRate(2);
        break;
      case 'preset-highway-fast':
        this.setVehicleCount(12);
        this.setUpdateInterval(1000);
        this.setSpeedMultiplier(2);
        this.setPacketLossRate(0);
        break;
      case 'preset-high-load':
        this.setVehicleCount(35);
        this.setUpdateInterval(800);
        this.setSpeedMultiplier(1.5);
        this.setPacketLossRate(5);
        break;
      case 'preset-tunnel-degrade':
        this.setVehicleCount(10);
        this.setUpdateInterval(3000);
        this.setSpeedMultiplier(0.5);
        this.setPacketLossRate(30);
        break;
    }
  }

  public setVehicleCount(count: number) {
    if (count <= 10) {
      this.vehicles = JSON.parse(JSON.stringify(INITIAL_VEHICLES.slice(0, count)));
    } else {
      const base = JSON.parse(JSON.stringify(INITIAL_VEHICLES));
      const extra: Vehicle[] = [];
      const prefixes = ['粤B', '沪A', '京C', '苏E', '浙A', '鲁B', '川A', '鄂A', '陕A', '闽D'];
      const driverNames = ['赵强', '钱勇', '孙磊', '李杰', '周涛', '吴军', '郑威', '王斌', '陈刚', '刘洋'];

      for (let i = 10; i < count; i++) {
        const p = prefixes[i % prefixes.length];
        const num = String(10000 + i).slice(1);
        const letter = String.fromCharCode(65 + (i % 26));
        const baseVeh = base[i % base.length];

        extra.push({
          ...baseVeh,
          id: `v-${i + 1}`,
          plateNumber: `${p}·${num}${letter}`,
          terminalId: `JT808-0138${i.toString().padStart(6, '0')}`,
          vin: `LSV${Math.floor(10000000 + Math.random() * 90000000)}`,
          assignedDriverName: driverNames[i % driverNames.length],
          assignedDriverId: `d-${i + 1}`,
          telemetry: {
            ...baseVeh.telemetry,
            speed: Math.floor(45 + Math.random() * 45),
            waterTemp: Math.floor(82 + Math.random() * 10),
            fuelLevel: Math.floor(30 + Math.random() * 65),
            batteryVoltage: +(24 + Math.random() * 0.8).toFixed(1),
          },
          status: Math.random() > 0.88 ? 'alarm' : Math.random() > 0.4 ? 'in_task' : 'running',
          todayMileageKm: Math.floor(100 + Math.random() * 300),
          totalMileageKm: Math.floor(50000 + Math.random() * 200000),
        });
      }
      this.vehicles = [...base, ...extra];
    }
    this.initRoadCorridorBindings();
    this.notifyVehicles();
  }

  // --- Inbound Data Injection (Simulating Gateway Ingestion) ---
  public injectVehicleTelemetry(vehicleId: string, partialTelemetry: Partial<TelemetryData>) {
    const v = this.vehicles.find(item => item.id === vehicleId);
    if (!v) return;

    v.telemetry = {
      ...v.telemetry,
      ...partialTelemetry,
      lastUpdate: new Date().toLocaleTimeString('zh-CN', { hour12: false }),
    };

    // Synthesize Gateway Packet
    const packet = this.createTelemetryPacket(v, this.activeProtocol, 'CUSTOM_INJECTION');
    this.recordInboundPacket(packet);
    this.notifyVehicles();
  }

  // --- Downlink Command Dispatch (Simulating Gateway Egress) ---
  public sendDownlinkCommand(
    vehicleId: string, 
    commandType: DownlinkCommand['commandType'], 
    params?: any
  ): DownlinkCommand {
    const v = this.vehicles.find(item => item.id === vehicleId) || this.vehicles[0];
    const cmdNames: Record<DownlinkCommand['commandType'], string> = {
      QUERY_LOCATION: '0x8201 位置信息查询',
      LOCK_DOOR: '0x8500 车辆车门加锁',
      UNLOCK_DOOR: '0x8500 车辆车门解锁',
      CUT_FUEL: '0x8500 远程断油断电',
      RESTORE_FUEL: '0x8500 恢复油路电路',
      SET_REPORT_INTERVAL: '0x8103 设置汇报时间间隔',
      UPGRADE_FIRMWARE: '0x8108 下发终端升级包',
      TTS_VOICE_ALERT: '0x8300 文本下发与语音播报',
    };

    const cmd: DownlinkCommand = {
      id: `cmd-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      vehicleId: v.id,
      plateNumber: v.plateNumber,
      commandType,
      commandName: cmdNames[commandType],
      params,
      issuedAt: new Date().toLocaleTimeString('zh-CN', { hour12: false }),
      status: 'SENT',
    };

    this.downlinkCommands.unshift(cmd);
    if (this.downlinkCommands.length > 50) this.downlinkCommands.pop();

    this.stats.outboundCommandsTotal++;

    // Generate Raw Hex Protocol Frame
    const rawHex = this.generateCommandHex(this.activeProtocol, commandType, v);

    // Create Outbound Packet in Log
    const outboundPacket: GatewayPacket = {
      id: `pkt-out-${Date.now()}`,
      direction: 'OUTBOUND',
      protocol: this.activeProtocol,
      vehicleId: v.id,
      plateNumber: v.plateNumber,
      terminalId: v.terminalId || 'JT808-000001',
      msgType: commandType.startsWith('0x') ? commandType : '0x8500',
      msgTypeName: cmd.commandName,
      rawHex,
      payload: { command: commandType, params, targetPlate: v.plateNumber },
      timestamp: cmd.issuedAt,
      status: 'SUCCESS',
      latencyMs: Math.floor(10 + Math.random() * 15),
    };

    this.recordInboundPacket(outboundPacket);

    // Simulate Terminal Ack after 300-800ms
    setTimeout(() => {
      cmd.status = 'ACKED';
      cmd.ackMessage = '终端0x0001通用应答: 执行成功 [RESULT=0]';

      // If cut fuel, update telemetry
      if (commandType === 'CUT_FUEL') {
        v.telemetry.engineStatus = 'off';
        v.telemetry.speed = 0;
        v.status = 'parking';
        this.notifyVehicles();
      } else if (commandType === 'RESTORE_FUEL') {
        v.telemetry.engineStatus = 'running';
        this.notifyVehicles();
      }

      // Terminal Ack Inbound Packet
      const ackPacket: GatewayPacket = {
        id: `pkt-ack-${Date.now()}`,
        direction: 'INBOUND',
        protocol: this.activeProtocol,
        vehicleId: v.id,
        plateNumber: v.plateNumber,
        terminalId: v.terminalId || 'JT808-000001',
        msgType: '0x0001',
        msgTypeName: '终端通用应答 (ACK)',
        rawHex: `7E 00 01 00 05 ${v.terminalId?.slice(-6) || '013801'} 00 01 00 00 00 7E`,
        payload: { ackSeq: cmd.id, result: 0, desc: 'SUCCESS' },
        timestamp: new Date().toLocaleTimeString('zh-CN', { hour12: false }),
        status: 'SUCCESS',
        latencyMs: Math.floor(15 + Math.random() * 20),
      };
      this.recordInboundPacket(ackPacket);
      this.notifyStats();
    }, 450);

    return cmd;
  }

  // --- Manual Alarm Trigger ---
  public triggerManualAlarm(vehicleId: string, type: AlarmType, title: string, description: string) {
    const v = this.vehicles.find(item => item.id === vehicleId);
    if (!v) return;

    v.status = 'alarm';
    const alarm: AlarmRecord = {
      id: `alm-${Date.now()}`,
      vehicleId: v.id,
      plateNumber: v.plateNumber,
      driverId: v.assignedDriverId,
      driverName: v.assignedDriverName,
      driverPhone: v.driverPhone,
      type,
      severity: 'severe',
      title,
      description,
      speed: v.telemetry.speed,
      locationName: v.address || '高等级货运通道',
      coordinates: [v.telemetry.longitude, v.telemetry.latitude],
      timestamp: new Date().toLocaleTimeString('zh-CN', { hour12: false }),
      status: 'active',
      aiEventCreated: true,
    };

    // Create Alarm Inbound Gateway Packet
    const alarmPacket: GatewayPacket = {
      id: `pkt-alm-${Date.now()}`,
      direction: 'INBOUND',
      protocol: this.activeProtocol,
      vehicleId: v.id,
      plateNumber: v.plateNumber,
      terminalId: v.terminalId || 'JT808-000001',
      msgType: '0x0200_ALARM',
      msgTypeName: '0x0200 报警状态主动上报',
      rawHex: this.generateTelemetryHex(this.activeProtocol, v, true),
      payload: {
        alarmType: type,
        title,
        speed: v.telemetry.speed,
        lat: v.telemetry.latitude,
        lng: v.telemetry.longitude,
      },
      timestamp: alarm.timestamp,
      status: 'SUCCESS',
      latencyMs: Math.floor(8 + Math.random() * 10),
    };

    this.recordInboundPacket(alarmPacket);
    this.alarmListeners.forEach(fn => fn(alarm));
    this.notifyVehicles();
  }

  // --- Simulation Lifecycle Engine ---
  public start() {
    if (this.timer) clearInterval(this.timer);
    if (this.statsTimer) clearInterval(this.statsTimer);
    this.isRunning = true;

    this.timer = setInterval(() => {
      if (!this.isRunning) return;
      this.stepSimulation();
    }, this.updateIntervalMs);

    this.statsTimer = setInterval(() => {
      this.updateStatsMetrics();
    }, 1000);
  }

  public stop() {
    this.isRunning = false;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    if (this.statsTimer) {
      clearInterval(this.statsTimer);
      this.statsTimer = null;
    }
  }

  public togglePlay(running?: boolean) {
    this.isRunning = running !== undefined ? running : !this.isRunning;
  }

  private restartLoop() {
    if (this.timer) clearInterval(this.timer);
    if (this.isRunning) {
      this.timer = setInterval(() => {
        if (!this.isRunning) return;
        this.stepSimulation();
      }, this.updateIntervalMs);
    }
  }

  private stepSimulation() {
    if (this.dataSourceMode === 'custom_injection') {
      // In manual mode, we do not auto-advance coordinates
      return;
    }

    const nowStr = new Date().toLocaleTimeString('zh-CN', { hour12: false });
    
    this.vehicles = this.vehicles.map((v, index) => {
      let state = this.vehicleStates.get(v.id);
      if (!state) {
        const corridor = ROAD_CORRIDORS['corridor-shenzhen'];
        const { points } = densifyRoadCorridor(corridor, 0.15);
        state = {
          corridorKey: 'corridor-shenzhen',
          points,
          currentIndex: 0,
          direction: 1,
          pauseTicksLeft: 0,
        };
        this.vehicleStates.set(v.id, state);
      }

      if (v.status === 'offline') {
        return {
          ...v,
          telemetry: {
            ...v.telemetry,
            speed: 0,
            lastUpdate: nowStr,
          }
        };
      }

      if (v.status === 'parking') {
        if (state.pauseTicksLeft > 0) {
          state.pauseTicksLeft--;
          return {
            ...v,
            telemetry: {
              ...v.telemetry,
              speed: 0,
              lastUpdate: nowStr,
            }
          };
        } else {
          v.status = 'running';
        }
      }

      const totalPts = state.points.length;
      if (totalPts < 2) return v;

      const stepIndexIncrement = Math.max(1, Math.round(1 * this.speedMultiplier));
      let nextIndex = state.currentIndex + state.direction * stepIndexIncrement;

      if (nextIndex >= totalPts) {
        state.direction = -1;
        nextIndex = totalPts - 2;
      } else if (nextIndex < 0) {
        state.direction = 1;
        nextIndex = 1;
      }

      state.currentIndex = nextIndex;
      const curPt = state.points[nextIndex];
      const heading = state.direction === 1 
        ? curPt.heading 
        : (curPt.heading + 180) % 360;

      const speedJitter = Math.floor(Math.random() * 5) - 2;
      const speed = Math.max(25, Math.min(115, curPt.speedKmH + speedJitter));

      const updatedVeh: Vehicle = {
        ...v,
        address: `${ROAD_CORRIDORS[state.corridorKey]?.city || '中国'} · ${curPt.district} ${curPt.roadName}`,
        todayMileageKm: +(v.todayMileageKm + (speed * (this.updateIntervalMs / 3600000))).toFixed(2),
        totalMileageKm: +(v.totalMileageKm + (speed * (this.updateIntervalMs / 3600000))).toFixed(2),
        telemetry: {
          ...v.telemetry,
          latitude: curPt.lat,
          longitude: curPt.lng,
          speed,
          heading,
          lastUpdate: nowStr,
          waterTemp: Math.min(98, Math.max(78, (v.telemetry.waterTemp || 85) + (Math.random() > 0.5 ? 0.3 : -0.3))),
          fuelLevel: Math.max(5, +(v.telemetry.fuelLevel - 0.005).toFixed(2)),
          batteryVoltage: +(24 + (Math.random() * 0.4 - 0.2)).toFixed(1),
          rpm: Math.floor(speed * 18 + 750),
          altitudeM: Math.floor(20 + Math.sin(nextIndex) * 15),
        }
      };

      // Ingest Packet through Gateway pipeline
      const isLost = this.isPacketLossSimulated && (Math.random() * 100 < this.packetLossRate);
      if (!isLost) {
        const packet = this.createTelemetryPacket(updatedVeh, this.activeProtocol, 'LOCATION_REPORT');
        this.recordInboundPacket(packet);
      }

      return updatedVeh;
    });

    this.notifyVehicles();
  }

  private recordInboundPacket(packet: GatewayPacket) {
    this.packetBuffer.unshift(packet);
    if (this.packetBuffer.length > 200) {
      this.packetBuffer.pop();
    }

    this.stats.inboundPacketsTotal++;
    this.stats.bytesTransferred += (packet.rawHex.length / 3) + 40;

    this.packetListeners.forEach(fn => fn(packet));
  }

  private updateStatsMetrics() {
    this.stats.qps = +(this.vehicles.length / (this.updateIntervalMs / 1000)).toFixed(1);
    this.stats.avgLatencyMs = Math.floor(14 + Math.random() * 8);
    this.stats.activeTerminals = this.vehicles.filter(v => v.status !== 'offline').length;
    this.notifyStats();
  }

  private notifyVehicles() {
    this.vehicleListeners.forEach(fn => fn(this.vehicles));
  }

  private notifyStats() {
    this.statsListeners.forEach(fn => fn({ ...this.stats }));
  }

  // --- Raw Protocol Hex Generator Helpers ---
  private createTelemetryPacket(
    v: Vehicle, 
    protocol: GatewayProtocol, 
    msgTag: string
  ): GatewayPacket {
    const rawHex = this.generateTelemetryHex(protocol, v);
    const msgTypeMap: Record<GatewayProtocol, { type: string; name: string }> = {
      'JT808-2019': { type: '0x0200', name: '0x0200 位置信息汇报' },
      'GB32960': { type: '0x02', name: '0x02 新能源实时数据上报' },
      'MQTT': { type: 'PUB_TELEMETRY', name: 'MQTT QoS1 遥测主题发布' },
      'HTTP-REST': { type: 'POST_LOCATION', name: 'RESTful API /v1/telemetry' },
      'WebSocket': { type: 'WS_PUSH', name: 'WebSocket 双向流帧' },
    };

    return {
      id: `pkt-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      direction: 'INBOUND',
      protocol,
      vehicleId: v.id,
      plateNumber: v.plateNumber,
      terminalId: v.terminalId || 'JT808-000001',
      msgType: msgTypeMap[protocol].type,
      msgTypeName: msgTypeMap[protocol].name,
      rawHex,
      payload: {
        plate: v.plateNumber,
        lat: v.telemetry.latitude,
        lng: v.telemetry.longitude,
        speed: v.telemetry.speed,
        heading: v.telemetry.heading,
        status: v.status,
        engine: v.telemetry.engineStatus,
        fuel: v.telemetry.fuelLevel,
        voltage: v.telemetry.batteryVoltage,
        waterTemp: v.telemetry.waterTemp,
      },
      timestamp: new Date().toLocaleTimeString('zh-CN', { hour12: false }),
      status: 'SUCCESS',
      latencyMs: Math.floor(10 + Math.random() * 18),
    };
  }

  private generateTelemetryHex(protocol: GatewayProtocol, v: Vehicle, isAlarm: boolean = false): string {
    const latInt = Math.floor(v.telemetry.latitude * 1000000).toString(16).padStart(8, '0').toUpperCase();
    const lngInt = Math.floor(v.telemetry.longitude * 1000000).toString(16).padStart(8, '0').toUpperCase();
    const spdHex = Math.floor(v.telemetry.speed * 10).toString(16).padStart(4, '0').toUpperCase();
    const hdHex = Math.floor(v.telemetry.heading).toString(16).padStart(4, '0').toUpperCase();

    if (protocol === 'JT808-2019') {
      const alarmFlag = isAlarm ? '00 00 00 02' : '00 00 00 00';
      const termNo = (v.terminalId?.slice(-6) || '013801');
      return `7E 02 00 00 28 ${termNo} 00 A1 ${alarmFlag} 00 00 00 03 ${latInt.match(/../g)?.join(' ')} ${lngInt.match(/../g)?.join(' ')} 00 1E ${spdHex.match(/../g)?.join(' ')} ${hdHex.match(/../g)?.join(' ')} 26 08 20 07 58 00 7E`;
    }

    if (protocol === 'GB32960') {
      return `23 23 02 FE ${v.vin.slice(0, 8)} 01 00 3C 26 08 20 07 58 00 01 ${spdHex.match(/../g)?.join(' ')} ${latInt.match(/../g)?.join(' ')} ${lngInt.match(/../g)?.join(' ')} FF FF CC`;
    }

    if (protocol === 'MQTT') {
      return `30 4E 00 18 /fleet/telemetry/${v.id} 7B 22 73 70 64 22 3A ${v.telemetry.speed} 2C 22 6C 61 74 22 3A ${v.telemetry.latitude} 7D`;
    }

    return `50 4F 53 54 20 2F 61 70 69 2F 76 31 2F 74 65 6C 65 6D 65 74 72 79 20 48 54 54 50 2F 31 2E 31`;
  }

  private generateCommandHex(protocol: GatewayProtocol, commandType: string, v: Vehicle): string {
    const termNo = (v.terminalId?.slice(-6) || '013801');
    if (commandType === 'CUT_FUEL') {
      return `7E 85 00 00 02 ${termNo} 00 12 01 01 8B 7E`;
    }
    if (commandType === 'RESTORE_FUEL') {
      return `7E 85 00 00 02 ${termNo} 00 13 01 00 8A 7E`;
    }
    if (commandType === 'QUERY_LOCATION') {
      return `7E 82 01 00 00 ${termNo} 00 14 9F 7E`;
    }
    return `7E 83 00 00 08 ${termNo} 00 15 01 01 C4 E3 B2 D3 7E`;
  }
}

export const telemetryGateway = new TelemetryGatewayService();
