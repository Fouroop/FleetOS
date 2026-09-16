export type VehicleStatus = 'running' | 'parking' | 'offline' | 'alarm' | 'in_task';

export type VehicleType = 
  | 'heavy_truck'       // 重型牵引车
  | 'light_van'          // 城市配送轻卡/厢货
  | 'cold_chain'         // 冷链运输车
  | 'hazardous'          // 危险品运输车
  | 'concrete_mixer'     // 混凝土搅拌车
  | 'mining_dump'        // 矿山自卸车
  | 'passenger_bus'      // 客运大巴
  | 'service_car'        // 企业公务车
  | string;

export interface TelemetryData {
  speed: number;              // km/h
  heading: number;            // 0-360 degrees
  latitude: number;
  longitude: number;
  altitude?: number;           // m
  altitudeM?: number;
  engineStatus: 'running' | 'idle' | 'off';
  rpm?: number;
  batteryVoltage?: number;     // V
  waterTemp?: number;          // °C
  engineCoolantTemp?: number;
  fuelLevel: number;          // %
  oilPressure?: number;        // kPa
  cargoTemp?: number;         // °C (for cold chain)
  weightLoadTon?: number;     // ton
  tirePressurePsi?: number[]; // [frontLeft, frontRight, rearLeft, rearRight]
  lastUpdate: string;
  locationAddress?: string;
}

export interface Vehicle {
  id: string;
  plateNumber: string;
  vin: string;
  type: VehicleType;
  brand: string;
  model?: string;
  fleetId: string;
  fleetName: string;
  assignedDriverId?: string;
  assignedDriverName?: string;
  driverPhone?: string;
  status: VehicleStatus;
  telemetry: TelemetryData;
  address?: string;
  todayMileageKm: number;
  todayDrivingMinutes?: number;
  todayFuelLiters?: number;
  totalMileageKm: number;
  loadCapacityTon?: number;
  currentLoadTon?: number;
  fuelType?: string;
  fuelCapacityL?: number;
  healthScore: number;
  currentTaskId?: string;
  currentTaskNo?: string;
  simCardNumber?: string;
  simCardNo?: string;
  terminalId?: string;
  hardwareImei?: string;
  purchaseDate?: string;
  purchaseCostYuan?: number;
  registrationDate?: string;
  insuranceExpiryDate?: string;
  commercialInsuranceExpiryDate?: string;
  inspectionExpiryDate?: string;
  annualInspectionDate?: string;
  transportPermitExpiryDate?: string;
  maintenanceDueKm: number; // e.g. 1200 km to next service
}

export interface DriverScoreBreakdown {
  safeDriving?: number;
  standardCompliance?: number;
  fatigueRisk?: number;
  alarmHistory?: number;
  vehicleCare?: number;
  accidentRecord?: number;
  harshAcceleration?: number;
  harshBraking?: number;
  harshTurning?: number;
  speedingCount?: number;
  fatigueCount?: number;
  distractionCount?: number;
}

export interface Driver {
  id: string;
  name: string;
  avatar?: string;
  phone: string;
  idCard?: string;
  licenseType: string;      // A1, A2, B2, C1
  licenseNo?: string;
  licenseExpiry?: string;
  licenseExpiryDate?: string;
  qualificationCertNo?: string;
  qualificationExpiryDate?: string;
  joinDate?: string;
  fleetId: string;
  fleetName: string;
  currentVehicleId?: string;
  currentVehiclePlate?: string;
  safetyScore: number;       // 0 - 100
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  scoreBreakdown: DriverScoreBreakdown;
  drivingYears?: number;
  totalSafeMileageKm?: number;
  preTripInspectionPassRate?: number;
  monthlyMileageKm?: number;
  monthlyTrips?: number;
  overspeedCount?: number;
  harshBrakeCount?: number;
  harshAccelCount?: number;
  harshTurnCount?: number;
  fatigueDrivingCount?: number;
  alarmCount?: number;
  accidentCount?: number;
  aiComment?: string;
}

export type TaskStatus = 'pending' | 'pending_dispatch' | 'dispatched' | 'in_progress' | 'arrived' | 'delivered' | 'completed' | 'cancelled';

export interface TransportTask {
  id: string;
  taskNo: string;
  title: string;
  customer?: string;
  customerPhone?: string;
  cargoType: string;
  cargoWeightTon: number;
  cargoVolumeM3?: number;
  origin?: string;
  destination?: string;
  originName?: string;
  originAddress?: string;
  originCoord?: [number, number]; // [lng, lat]
  destinationName?: string;
  destinationAddress?: string;
  destCoord?: [number, number];
  destinationCoord?: [number, number];
  startTime?: string;
  plannedDepartureTime?: string;
  deadlineTime?: string;
  plannedArrivalTime?: string;
  assignedVehicleId?: string;
  assignedVehiclePlate?: string;
  assignedDriverId?: string;
  assignedDriverName?: string;
  driverPhone?: string;
  status: TaskStatus;
  plannedDistanceKm?: number;
  progressPercent: number;
  priority?: 'normal' | 'high' | 'urgent' | string;
  freightAmountYuan?: number;
  aiRecommendedVehicleId?: string;
  aiConfidenceScore?: number;
  aiMatchReason?: string;
  notes?: string;
  routeWaypoints?: [number, number][];
}

export type AlarmSeverity = 'normal' | 'moderate' | 'warning' | 'severe' | 'critical';

export type AlarmType = 
  | 'overspeed'
  | 'harsh_brake'
  | 'harsh_accel'
  | 'harsh_turn'
  | 'fatigue_driving'
  | 'long_idling'
  | 'geofence_breach'
  | 'route_deviation'
  | 'temp_abnormal'
  | 'tire_abnormal'
  | 'device_offline'
  | 'voltage_low'
  | 'sos_trigger'
  | string;

export interface AlarmRecord {
  id: string;
  vehicleId: string;
  plateNumber: string;
  driverId?: string;
  driverName?: string;
  driverPhone?: string;
  type: AlarmType;
  severity: AlarmSeverity;
  title: string;
  description: string;
  speed: number;
  locationName: string;
  coordinates: [number, number];
  timestamp: string;
  status: 'active' | 'pending' | 'confirmed' | 'dispatched' | 'resolved' | 'closed';
  handledBy?: string;
  handleAction?: string;
  handledAt?: string;
  aiEventCreated?: boolean;
}

export interface FleetEvent {
  id: string;
  eventNo: string;
  sourceAlarmId?: string;
  vehicleId: string;
  plateNumber: string;
  driverId?: string;
  driverName: string;
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
  severityLevel?: '特级' | '一级' | '二级' | '三级' | '四级' | string;
  title: string;
  category: '安全驾驶' | '温控合规' | '设备异常' | '围栏越界' | '调度延误' | '安全风险' | string;
  aiAnalysis?: string;
  aiRootCauseAnalysis?: string;
  aiActionPlan?: string;
  assignedTo?: string;
  deadline?: string;
  description?: string;
  rectificationNotes?: string;
  status: 'pending' | 'dispatched' | 'notified' | 'rectifying' | 'reviewing' | 'resolved' | 'closed' | 'archived';
  timeline?: {
    time: string;
    title: string;
    description: string;
    operator: string;
  }[];
  rectificationPlan?: string;
  createdAt: string;
}

export type GeofenceType = 'circle' | 'polygon' | 'route' | 'forbidden';

export interface Geofence {
  id: string;
  name: string;
  type: GeofenceType;
  category: '公司基地' | '仓储物流园' | '客户卸货点' | '服务维修区' | '禁行限行区' | '作业装卸区' | '限速管控区' | '服务区驻车点' | string;
  radiusMeter?: number;
  centerCoord?: [number, number]; // for circle
  coordinates?: [number, number][]; // for polygon/route
  alarmRule?: {
    onEnter: boolean;
    onExit: boolean;
    onDwellTimeout: boolean;
    dwellTimeoutMinutes?: number;
    speedLimitKmH?: number;
  };
  triggerType?: 'both' | 'enter' | 'exit' | string;
  maxSpeedLimitKm?: number;
  boundVehicleCount?: number;
  todayAlarmCount?: number;
  description?: string;
  assignedVehicleCount?: number;
  color: string;
  status: 'active' | 'inactive';
  createdAt?: string;
}

export interface GpsTrackPoint {
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  timestamp: string;
  address?: string;
  isAlarmPoint?: boolean;
  alarmText?: string;
  isStopPoint?: boolean;
  stopDurationMinutes?: number;
}

export interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  plateNumber: string;
  type: 'regular' | 'repair' | 'inspection' | '定期保养' | '故障维修' | '轮胎更换' | '电瓶检修' | '年度审验' | string;
  items?: string;
  costYuan?: number;
  cost?: number;
  serviceProvider?: string;
  vendor?: string;
  performedDate?: string;
  date?: string;
  mileageAtServiceKm?: number;
  currentMileageKm?: number;
  nextDueMileageKm?: number;
  nextMaintenanceKm?: number;
  description?: string;
  replacedParts?: string[];
  status: 'scheduled' | 'in_progress' | 'completed';
  aiPredictedNeed?: boolean;
  aiAdvice?: string;
}

export interface FuelRecord {
  id: string;
  vehicleId: string;
  plateNumber: string;
  driverName: string;
  date: string;
  fuelType: 'diesel' | '0#柴油' | '92#汽油' | '95#汽油' | 'LNG天然气' | '纯电充电' | string;
  liters: number;
  unitPrice?: number;
  unitPriceYuan?: number;
  totalAmount?: number;
  totalCostYuan?: number;
  odometerKm?: number;
  mileageAtRefuelKm?: number;
  calculated100KmConsumption?: number; // L/100km
  avgConsumptionLPer100Km?: number;
  isAnomaly?: boolean;
  isAbnormalHigh?: boolean;
  anomalyReason?: string;
  abnormalReason?: string;
  gasStation: string;
}

export interface ExpenseRecord {
  id: string;
  vehicleId: string;
  plateNumber: string;
  category: 'fuel' | 'etc_toll' | 'maintenance' | 'insurance' | 'parking' | '燃油费' | '过路费' | '维保费' | '保险费' | '停车费' | '人工司机' | '车辆折旧' | string;
  amount?: number;
  amountYuan?: number;
  date: string;
  description?: string;
  remark?: string;
  invoiceNo?: string;
  operator?: string;
  status?: string;
}

export interface AccidentRecord {
  id: string;
  accidentNo: string;
  vehicleId: string;
  plateNumber: string;
  driverName: string;
  date: string;
  location: string;
  type?: '轻微剐蹭' | '追尾事故' | '侧翻' | '机械失控' | '货物损坏' | string;
  severity: 'minor' | 'general' | 'critical' | '轻微' | '一般' | '重大' | string;
  estimatedLoss?: number;
  directLossYuan?: number;
  insuranceClaimAmount?: number;
  insuranceClaimYuan?: number;
  responsibility: '全责' | '同等' | '主责' | '次责' | '无责' | string;
  description: string;
  ai4FactorAnalysis?: {
    humanFactor: string;
    vehicleFactor: string;
    roadFactor: string;
    managementFactor: string;
  };
  aiCausalAnalysis?: {
    humanFactor: string;
    vehicleFactor: string;
    roadFactor: string;
    managementFactor: string;
    rectificationAdvice: string;
  };
  preventiveMeasures?: string;
  status: 'under_investigation' | 'claiming' | 'closed';
}

export interface DocumentItem {
  id: string;
  relatedType: 'vehicle' | 'driver';
  relatedId: string;
  name: string; // e.g. "行驶证", "交强险", "商业险", "道路运输证", "驾驶证", "从业资格证"
  plateOrDriver: string;
  docNumber: string;
  issueDate: string;
  expiryDate: string;
  daysRemaining: number;
  status: 'valid' | 'expiring_soon' | 'expired'; // <30 days = expiring_soon
}

export interface PreTripInspection {
  id: string;
  driverId: string;
  driverName: string;
  vehicleId: string;
  plateNumber: string;
  inspectTime: string;
  passed: boolean;
  score: number;
  items: {
    name: string;
    passed: boolean;
    remark: string;
  }[];
  aiAuditNotes: string;
}
