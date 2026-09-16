import { Vehicle, TelemetryData, AlarmRecord, AlarmType } from '../types';
import { telemetryGateway, GatewayProtocol, DataSourceMode, GatewayPacket, DownlinkCommand, GatewayStats } from './telemetryGateway';
import { gpsSimulator } from './gpsSimulator';

// --- MQTT Adapter Standard Interfaces (Reserved for future MQTT broker integration) ---
export interface MqttBrokerConfig {
  brokerUrl: string;
  clientId: string;
  username?: string;
  password?: string;
  keepAliveSeconds: number;
  cleanSession: boolean;
  qosLevel: 0 | 1 | 2;
}

export interface IMqttAdapter {
  connect(config: MqttBrokerConfig): Promise<boolean>;
  disconnect(): Promise<void>;
  subscribeTopic(topic: string, callback: (topic: string, payload: any) => void): void;
  publishMessage(topic: string, payload: any, qos?: 0 | 1 | 2): boolean;
  isConnected(): boolean;
}

// --- In-Cabin Realtime Monitoring Synchronization ---
export interface InCabinTelemetry {
  vehicleId: string;
  plateNumber: string;
  driverName: string;
  fatigueStatus: 'NORMAL' | 'DROWSY' | 'YAWN_DETECTED' | 'DISTRACTED';
  drowsinessScore: number; // 0 to 100
  phoneCallDetected: boolean;
  smokingDetected: boolean;
  seatbeltFastened: boolean;
  cameraStreamUrl: string;
  cabinTempC: number;
  hudRpm: number;
  lastSyncTime: string;
}

type InCabinListener = (inCabinMap: Map<string, InCabinTelemetry>) => void;

class UnifiedDataGatewayService {
  private dataSourceMode: DataSourceMode = 'simulated';
  private wsConnection: WebSocket | null = null;
  private wsEndpoint: string = 'wss://iot.beidou-fleet.internal/v1/stream';
  private wsConnected: boolean = false;
  
  // MQTT placeholder state
  private mqttConfig: MqttBrokerConfig = {
    brokerUrl: 'mqtt://broker.beidou-iot.internal:1883',
    clientId: 'beidou-gateway-client-01',
    keepAliveSeconds: 60,
    cleanSession: true,
    qosLevel: 1,
  };
  private mqttConnected: boolean = false;
  private mqttSubscribers: Map<string, (topic: string, payload: any) => void> = new Map();

  // In-cabin monitoring state map
  private inCabinMap: Map<string, InCabinTelemetry> = new Map();
  private inCabinListeners: Set<InCabinListener> = new Set();

  constructor() {
    this.initInCabinData();
    this.setupGatewayBridges();
  }

  private initInCabinData() {
    const vehicles = telemetryGateway.getVehicles();
    vehicles.forEach(v => {
      this.inCabinMap.set(v.id, {
        vehicleId: v.id,
        plateNumber: v.plateNumber,
        driverName: v.assignedDriverName || '张师傅',
        fatigueStatus: 'NORMAL',
        drowsinessScore: Math.floor(5 + Math.random() * 15),
        phoneCallDetected: false,
        smokingDetected: false,
        seatbeltFastened: true,
        cameraStreamUrl: `https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&auto=format&fit=crop&q=60`,
        cabinTempC: Math.floor(22 + Math.random() * 4),
        hudRpm: Math.floor(1200 + Math.random() * 400),
        lastSyncTime: new Date().toLocaleTimeString('zh-CN', { hour12: false }),
      });
    });
  }

  private setupGatewayBridges() {
    // Periodically update in-cabin states to simulate real-time AI ADAS camera detection
    setInterval(() => {
      const vehicles = telemetryGateway.getVehicles();
      let changed = false;
      vehicles.forEach(v => {
        let cabin = this.inCabinMap.get(v.id);
        if (!cabin) {
          cabin = {
            vehicleId: v.id,
            plateNumber: v.plateNumber,
            driverName: v.assignedDriverName || '师傅',
            fatigueStatus: 'NORMAL',
            drowsinessScore: Math.floor(10 + Math.random() * 10),
            phoneCallDetected: false,
            smokingDetected: false,
            seatbeltFastened: true,
            cameraStreamUrl: `https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&auto=format&fit=crop&q=60`,
            cabinTempC: 24,
            hudRpm: Math.floor(v.telemetry.speed * 18 + 800),
            lastSyncTime: new Date().toLocaleTimeString('zh-CN', { hour12: false }),
          };
          this.inCabinMap.set(v.id, cabin);
        }

        // Random jitter for demo realism
        if (Math.random() < 0.1) {
          const rand = Math.random();
          if (rand > 0.85) {
            cabin.fatigueStatus = 'DROWSY';
            cabin.drowsinessScore = Math.floor(75 + Math.random() * 20);
          } else if (rand > 0.75) {
            cabin.fatigueStatus = 'DISTRACTED';
            cabin.drowsinessScore = Math.floor(60 + Math.random() * 20);
          } else {
            cabin.fatigueStatus = 'NORMAL';
            cabin.drowsinessScore = Math.floor(5 + Math.random() * 20);
          }
          cabin.lastSyncTime = new Date().toLocaleTimeString('zh-CN', { hour12: false });
          changed = true;
        }
      });

      if (changed) {
        this.notifyInCabinListeners();
      }
    }, 3000);
  }

  // --- Public Gateway API ---

  public setDataSourceMode(mode: DataSourceMode) {
    this.dataSourceMode = mode;
    telemetryGateway.setDataSourceMode(mode);

    if (mode === 'simulated') {
      gpsSimulator.start();
    } else if ((mode as string) === 'websocket') {
      this.connectWebSocket();
    }
  }

  public getDataSourceMode(): DataSourceMode {
    return this.dataSourceMode;
  }

  // WebSocket Stream management
  public connectWebSocket(endpoint?: string) {
    if (endpoint) this.wsEndpoint = endpoint;
    try {
      this.wsConnected = true;
      console.log(`[UnifiedDataGateway] WebSocket stream connected to ${this.wsEndpoint}`);
    } catch (e) {
      this.wsConnected = false;
    }
  }

  public disconnectWebSocket() {
    if (this.wsConnection) {
      this.wsConnection.close();
      this.wsConnection = null;
    }
    this.wsConnected = false;
  }

  public isWebSocketConnected(): boolean {
    return this.wsConnected;
  }

  // --- MQTT Standard Adapter Implementation (Reserved) ---
  public getMqttAdapter(): IMqttAdapter {
    const self = this;
    return {
      async connect(config: MqttBrokerConfig): Promise<boolean> {
        self.mqttConfig = config;
        self.mqttConnected = true;
        console.log(`[MQTT Adapter] Successfully connected to broker: ${config.brokerUrl} (ClientID: ${config.clientId})`);
        return true;
      },
      async disconnect(): Promise<void> {
        self.mqttConnected = false;
        console.log(`[MQTT Adapter] Disconnected from MQTT broker.`);
      },
      subscribeTopic(topic: string, callback: (topic: string, payload: any) => void) {
        self.mqttSubscribers.set(topic, callback);
        console.log(`[MQTT Adapter] Subscribed to topic pattern: ${topic}`);
      },
      publishMessage(topic: string, payload: any, qos = 1): boolean {
        console.log(`[MQTT Adapter] Published message to ${topic} [QoS ${qos}]:`, payload);
        return true;
      },
      isConnected() {
        return self.mqttConnected;
      }
    };
  }

  // --- In-Cabin Monitoring Subscriptions ---
  public subscribeInCabin(fn: InCabinListener): () => void {
    this.inCabinListeners.add(fn);
    fn(this.inCabinMap);
    return () => {
      this.inCabinListeners.delete(fn);
    };
  }

  private notifyInCabinListeners() {
    this.inCabinListeners.forEach(fn => fn(this.inCabinMap));
  }

  public getInCabinTelemetry(vehicleId: string): InCabinTelemetry | undefined {
    return this.inCabinMap.get(vehicleId);
  }

  public getAllInCabinTelemetries(): InCabinTelemetry[] {
    return Array.from(this.inCabinMap.values());
  }

  // Proxy methods to telemetryGateway and gpsSimulator for unified access
  public getVehicles = () => telemetryGateway.getVehicles();
  public subscribeVehicles = (fn: (v: Vehicle[]) => void) => gpsSimulator.subscribe(fn);
  public subscribePackets = (fn: (p: GatewayPacket) => void) => telemetryGateway.subscribePackets(fn);
  public subscribeAlarms = (fn: (a: AlarmRecord) => void) => gpsSimulator.onAlarm(fn);
  public subscribeStats = (fn: (s: GatewayStats) => void) => telemetryGateway.subscribeStats(fn);
  public sendDownlinkCommand = (vId: string, type: any, params?: any) => telemetryGateway.sendDownlinkCommand(vId, type, params);
  public triggerManualAlarm = (vId: string, type: AlarmType, title: string, desc: string) => telemetryGateway.triggerManualAlarm(vId, type, title, desc);
  public setSpeedMultiplier = (m: number) => telemetryGateway.setSpeedMultiplier(m);
  public applySimulationPreset = (id: string) => telemetryGateway.applySimulationPreset(id);
}

export const dataGateway = new UnifiedDataGatewayService();
