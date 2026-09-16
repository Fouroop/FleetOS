import React, { useState, useEffect } from 'react';
import { 
  Vehicle, 
  Driver, 
  TransportTask, 
  AlarmRecord, 
  FleetEvent, 
  MaintenanceRecord, 
  FuelRecord, 
  ExpenseRecord, 
  AccidentRecord, 
  Geofence 
} from './types';
import { 
  INITIAL_VEHICLES, 
  INITIAL_DRIVERS, 
  INITIAL_TASKS, 
  INITIAL_ALARMS, 
  INITIAL_EVENTS, 
  INITIAL_MAINTENANCE, 
  INITIAL_FUEL_RECORDS, 
  INITIAL_EXPENSES, 
  INITIAL_ACCIDENTS, 
  INITIAL_GEOFENCES 
} from './data/mockFleetData';
import { gpsSimulator } from './services/gpsSimulator';

import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { CockpitView } from './components/cockpit/CockpitView';
import { MonitoringView } from './components/monitoring/MonitoringView';
import { VehicleManagementView } from './components/vehicles/VehicleManagementView';
import { DriverManagementView } from './components/drivers/DriverManagementView';
import { TaskDispatchView } from './components/dispatch/TaskDispatchView';
import { TrackManagementView } from './components/tracks/TrackManagementView';
import { GeofenceView } from './components/geofence/GeofenceView';
import { SafetyManagementView } from './components/safety/SafetyManagementView';
import { AlarmCenterView } from './components/alarms/AlarmCenterView';
import { EventCenterView } from './components/events/EventCenterView';
import { MaintenanceView } from './components/maintenance/MaintenanceView';
import { FuelManagementView } from './components/fuel/FuelManagementView';
import { CostManagementView } from './components/costs/CostManagementView';
import { AccidentManagementView } from './components/accidents/AccidentManagementView';
import { DocumentManagementView } from './components/documents/DocumentManagementView';
import { StatisticsView } from './components/stats/StatisticsView';
import { AiStewardView } from './components/ai/AiStewardView';
import { DriverMobileSimulator } from './components/mobile/DriverMobileSimulator';
import { SystemSettingsView } from './components/settings/SystemSettingsView';
import { GatewayManagementView } from './components/gateway/GatewayManagementView';
import { CameraSurveillanceView } from './components/gateway/CameraSurveillanceView';
import { VehicleDetailModal } from './components/vehicles/VehicleDetailModal';

export default function App() {
  const [activeTab, setActiveTab] = useState('cockpit');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Core Data Stores
  const [vehicles, setVehicles] = useState<Vehicle[]>(INITIAL_VEHICLES);
  const [drivers, setDrivers] = useState<Driver[]>(INITIAL_DRIVERS);
  const [tasks, setTasks] = useState<TransportTask[]>(INITIAL_TASKS);
  const [alarms, setAlarms] = useState<AlarmRecord[]>(INITIAL_ALARMS);
  const [events, setEvents] = useState<FleetEvent[]>(INITIAL_EVENTS);
  const [maintenance, setMaintenance] = useState<MaintenanceRecord[]>(INITIAL_MAINTENANCE);
  const [fuelRecords, setFuelRecords] = useState<FuelRecord[]>(INITIAL_FUEL_RECORDS);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>(INITIAL_EXPENSES);
  const [accidents, setAccidents] = useState<AccidentRecord[]>(INITIAL_ACCIDENTS);
  const [geofences, setGeofences] = useState<Geofence[]>(INITIAL_GEOFENCES);

  const [selectedVehicleForTrack, setSelectedVehicleForTrack] = useState<Vehicle | null>(null);
  const [selectedVehicleForDetail, setSelectedVehicleForDetail] = useState<Vehicle | null>(null);
  const [showVehicleDetailModal, setShowVehicleDetailModal] = useState(false);

  // Initialize and subscribe to Telemetry Simulation Engine
  useEffect(() => {
    gpsSimulator.start();

    // Telemetry updates (every 2-3s)
    const unsubscribeVehicles = gpsSimulator.subscribe((updatedVehicles) => {
      setVehicles(updatedVehicles);
    });

    // Real-time alarm stream
    const unsubscribeAlarms = gpsSimulator.onAlarm((newAlarm) => {
      setAlarms((prev) => [newAlarm, ...prev]);
    });

    return () => {
      unsubscribeVehicles();
      unsubscribeAlarms();
      gpsSimulator.stop();
    };
  }, []);

  // Handlers for data updates
  const handleAddVehicle = (newVeh: Partial<Vehicle>) => {
    const fullVeh: Vehicle = {
      id: newVeh.id || `v-${Date.now()}`,
      plateNumber: newVeh.plateNumber || '沪A·NEW01',
      vin: newVeh.vin || 'LHG12345678901234',
      type: newVeh.type || '重型厢式货车 (16.5m)',
      brand: newVeh.brand || '一汽解放 J7',
      fleetName: newVeh.fleetName || '华东干线一队',
      fleetId: 'f-01',
      assignedDriverName: newVeh.assignedDriverName || '待指派',
      assignedDriverId: newVeh.assignedDriverId,
      driverPhone: newVeh.driverPhone || '13800000000',
      status: newVeh.status || 'parking',
      loadCapacityTon: newVeh.loadCapacityTon || 30,
      currentLoadTon: 0,
      todayMileageKm: 0,
      totalMileageKm: 1200,
      fuelType: newVeh.fuelType || 'diesel',
      fuelCapacityL: 450,
      telemetry: {
        latitude: 31.2304,
        longitude: 121.4737,
        speed: 0,
        heading: 90,
        altitudeM: 15,
        engineStatus: 'off',
        fuelLevel: 85,
        engineCoolantTemp: 70,
        batteryVoltage: 24.5,
        tirePressurePsi: [110, 110, 110, 110],
        lastUpdate: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        locationAddress: '上海市青浦区华新物流园',
      },
      healthScore: 95,
      maintenanceDueKm: 8800,
      insuranceExpiryDate: '2027-08-20',
      commercialInsuranceExpiryDate: '2027-08-20',
      annualInspectionDate: '2027-08-20',
      transportPermitExpiryDate: '2028-08-20',
      registrationDate: '2024-01-10',
      purchaseCostYuan: 450000,
      hardwareImei: '868123069123456',
      simCardNo: '1064812345678',
    };
    setVehicles((prev) => [fullVeh, ...prev]);
  };

  const handleUpdateVehicle = (updated: Vehicle) => {
    setVehicles((prev) => prev.map((v) => (v.id === updated.id ? updated : v)));
  };

  const handleDeleteVehicle = (id: string) => {
    setVehicles((prev) => prev.filter((v) => v.id !== id));
  };

  const handleAddTask = (newTask: Partial<TransportTask>) => {
    setTasks((prev) => [newTask as TransportTask, ...prev]);
  };

  const handleUpdateTaskStatus = (taskId: string, newStatus: TransportTask['status']) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );
  };

  const handleConfirmAlarm = (alarmId: string, remark: string) => {
    setAlarms((prev) =>
      prev.map((a) => (a.id === alarmId ? { ...a, status: 'confirmed' } : a))
    );
  };

  const handleDispatchedToEvent = (alarmId: string) => {
    const targetAlarm = alarms.find((a) => a.id === alarmId);
    if (!targetAlarm) return;

    const newEvent: FleetEvent = {
      id: `ev-${Date.now()}`,
      eventNo: `EV-202608-${Math.floor(1000 + Math.random() * 9000)}`,
      title: `${targetAlarm.plateNumber} ${targetAlarm.title} 专项整改案卷`,
      category: '安全风险',
      severityLevel: targetAlarm.severity === 'critical' ? '一级' : '二级',
      sourceAlarmId: targetAlarm.id,
      vehicleId: targetAlarm.vehicleId,
      plateNumber: targetAlarm.plateNumber,
      driverId: targetAlarm.driverId,
      driverName: targetAlarm.driverName,
      status: 'rectifying',
      createdAt: '2026-08-20 ' + targetAlarm.timestamp,
      deadline: '2026-08-22 18:00',
      assignedTo: '安全督导部 (赵主管)',
      description: `系统由报警[${targetAlarm.title}]自动升级而来：${targetAlarm.description}。`,
      aiRootCauseAnalysis: '车载北斗显示车速持续超过道路安全限制，且该路段为事故多发长下坡，驾驶员未提前减速降挡。',
      aiActionPlan: '1. 电话联系驾驶员下发减速警告；2. 责成参加本周六防御驾驶复训；3. 扣减当月安全奖 200 元。',
    };

    setEvents((prev) => [newEvent, ...prev]);
    setAlarms((prev) =>
      prev.map((a) => (a.id === alarmId ? { ...a, status: 'resolved' } : a))
    );
    setActiveTab('events');
  };

  const handleUpdateEventStatus = (
    eventId: string,
    status: FleetEvent['status'],
    notes?: string
  ) => {
    setEvents((prev) =>
      prev.map((e) =>
        e.id === eventId ? { ...e, status, rectificationNotes: notes } : e
      )
    );
  };

  const handleAddMaintenance = (rec: Partial<MaintenanceRecord>) => {
    setMaintenance((prev) => [rec as MaintenanceRecord, ...prev]);
  };

  const handleAddFuelRecord = (rec: Partial<FuelRecord>) => {
    setFuelRecords((prev) => [rec as FuelRecord, ...prev]);
  };

  const handleAddExpense = (exp: Partial<ExpenseRecord>) => {
    setExpenses((prev) => [exp as ExpenseRecord, ...prev]);
  };

  const handleAddAccident = (acc: Partial<AccidentRecord>) => {
    setAccidents((prev) => [acc as AccidentRecord, ...prev]);
  };

  const handleAddGeofence = (gf: Partial<Geofence>) => {
    setGeofences((prev) => [gf as Geofence, ...prev]);
  };

  const handleToggleGeofenceStatus = (id: string) => {
    setGeofences((prev) =>
      prev.map((g) =>
        g.id === id
          ? { ...g, status: g.status === 'active' ? 'inactive' : 'active' }
          : g
      )
    );
  };

  const handleResetAllData = () => {
    setVehicles(INITIAL_VEHICLES);
    setDrivers(INITIAL_DRIVERS);
    setTasks(INITIAL_TASKS);
    setAlarms(INITIAL_ALARMS);
    setEvents(INITIAL_EVENTS);
    setMaintenance(INITIAL_MAINTENANCE);
    setFuelRecords(INITIAL_FUEL_RECORDS);
    setExpenses(INITIAL_EXPENSES);
    setAccidents(INITIAL_ACCIDENTS);
    setGeofences(INITIAL_GEOFENCES);
  };

  const handleNavigateToTrack = (vehicle: Vehicle) => {
    setSelectedVehicleForTrack(vehicle);
    setActiveTab('tracks');
  };

  const pendingAlarmsCount = alarms.filter((a) => a.status === 'pending').length;

  return (
    <div className="flex h-screen bg-[#0F172A] text-slate-100 font-sans overflow-hidden antialiased selection:bg-blue-500 selection:text-white">
      {/* Global Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        pendingAlarmsCount={pendingAlarmsCount}
        eventCount={events.filter(e => e.status === 'open' || e.status === 'investigating' || e.status === 'rectifying').length}
      />

      {/* Main App Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#0F172A]">
        {/* Global Top Header */}
        <Header
          vehicles={vehicles}
          alarms={alarms}
          onSelectTab={setActiveTab}
          onOpenAiSteward={() => setActiveTab('ai_steward')}
          onOpenQuickDispatch={() => setActiveTab('dispatch')}
          onOpenMobileSim={() => setActiveTab('mobile_driver')}
        />

        {/* View Router */}
        <main className="flex-1 overflow-y-auto bg-[#0F172A] scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-slate-900">
          {activeTab === 'cockpit' && (
            <CockpitView
              vehicles={vehicles}
              drivers={drivers}
              alarms={alarms}
              tasks={tasks}
              events={events}
              geofences={geofences}
              onNavigateTab={setActiveTab}
              onNavigateToTab={setActiveTab}
              onSelectVehicle={(v) => {
                setSelectedVehicleForDetail(v);
                setShowVehicleDetailModal(true);
              }}
              onSelectVehicleForTrack={handleNavigateToTrack}
              onViewTrack={handleNavigateToTrack}
              onViewDetail={(v) => {
                setSelectedVehicleForDetail(v);
                setShowVehicleDetailModal(true);
              }}
              onAskAi={(q) => {
                setActiveTab('ai_steward');
              }}
            />
          )}

          {activeTab === 'monitoring' && (
            <MonitoringView
              vehicles={vehicles}
              geofences={geofences}
              onViewTrack={handleNavigateToTrack}
              onViewDetail={(v) => {
                setSelectedVehicleForDetail(v);
                setShowVehicleDetailModal(true);
              }}
              onContactDriver={(v) => {
                alert(`已发起呼叫：${v.assignedDriverName || '主驾'}（${v.driverPhone}）`);
              }}
              onSendTask={(v) => {
                setActiveTab('dispatch');
              }}
            />
          )}

          {activeTab === 'gateway' && (
            <GatewayManagementView
              vehicles={vehicles}
            />
          )}

          {activeTab === 'camera_streams' && (
            <CameraSurveillanceView
              vehicles={vehicles}
            />
          )}

          {activeTab === 'vehicles' && (
            <VehicleManagementView
              vehicles={vehicles}
              onAddVehicle={handleAddVehicle}
              onUpdateVehicle={handleUpdateVehicle}
              onDeleteVehicle={handleDeleteVehicle}
              onViewTrack={handleNavigateToTrack}
              onViewDetail={(v) => {
                setSelectedVehicleForDetail(v);
                setShowVehicleDetailModal(true);
              }}
              onSendTask={(v) => {
                setActiveTab('dispatch');
              }}
            />
          )}

          {activeTab === 'drivers' && (
            <DriverManagementView
              drivers={drivers}
              onAddDriver={(d) => setDrivers((prev) => [d as Driver, ...prev])}
            />
          )}

          {activeTab === 'dispatch' && (
            <TaskDispatchView
              tasks={tasks}
              vehicles={vehicles}
              drivers={drivers}
              onAddTask={handleAddTask}
              onUpdateTaskStatus={handleUpdateTaskStatus}
            />
          )}

          {activeTab === 'tracks' && (
            <TrackManagementView
              vehicles={vehicles}
              initialVehicle={selectedVehicleForTrack}
            />
          )}

          {activeTab === 'geofences' && (
            <GeofenceView
              geofences={geofences}
              vehicles={vehicles}
              onAddGeofence={handleAddGeofence}
              onToggleStatus={handleToggleGeofenceStatus}
            />
          )}

          {activeTab === 'safety' && (
            <SafetyManagementView
              drivers={drivers}
              vehicles={vehicles}
              onSelectDriver={() => setActiveTab('drivers')}
            />
          )}

          {activeTab === 'alarms' && (
            <AlarmCenterView
              alarms={alarms}
              vehicles={vehicles}
              onConfirmAlarm={handleConfirmAlarm}
              onDispatchedToEvent={handleDispatchedToEvent}
            />
          )}

          {activeTab === 'events' && (
            <EventCenterView
              events={events}
              onUpdateEventStatus={handleUpdateEventStatus}
            />
          )}

          {activeTab === 'maintenance' && (
            <MaintenanceView
              maintenanceList={maintenance}
              vehicles={vehicles}
              onAddMaintenance={handleAddMaintenance}
            />
          )}

          {activeTab === 'fuel' && (
            <FuelManagementView
              fuelRecords={fuelRecords}
              vehicles={vehicles}
              onAddFuelRecord={handleAddFuelRecord}
            />
          )}

          {activeTab === 'costs' && (
            <CostManagementView
              expenses={expenses}
              vehicles={vehicles}
              onAddExpense={handleAddExpense}
            />
          )}

          {activeTab === 'accidents' && (
            <AccidentManagementView
              accidents={accidents}
              vehicles={vehicles}
              onAddAccident={handleAddAccident}
            />
          )}

          {activeTab === 'documents' && (
            <DocumentManagementView
              vehicles={vehicles}
              drivers={drivers}
            />
          )}

          {activeTab === 'stats' && (
            <StatisticsView
              vehicles={vehicles}
              drivers={drivers}
              tasks={tasks}
            />
          )}

          {activeTab === 'ai_steward' && (
            <AiStewardView
              vehicles={vehicles}
              drivers={drivers}
              alarms={alarms}
              tasks={tasks}
              maintenance={maintenance}
            />
          )}

          {activeTab === 'mobile_driver' && (
            <DriverMobileSimulator
              vehicles={vehicles}
              drivers={drivers}
              tasks={tasks}
              onUpdateTaskStatus={handleUpdateTaskStatus}
            />
          )}

          {activeTab === 'settings' && (
            <SystemSettingsView
              onResetData={handleResetAllData}
            />
          )}
        </main>

        {/* Global Vehicle Full Lifecycle Detail Modal */}
        {showVehicleDetailModal && selectedVehicleForDetail && (
          <VehicleDetailModal
            vehicle={selectedVehicleForDetail}
            onClose={() => {
              setShowVehicleDetailModal(false);
              setSelectedVehicleForDetail(null);
            }}
            onViewTrack={(v) => {
              setShowVehicleDetailModal(false);
              handleNavigateToTrack(v);
            }}
          />
        )}

        {/* Professional Polish System Status Footer */}
        <footer className="h-9 border-t border-slate-800 bg-[#0F172A] px-4 sm:px-6 flex items-center justify-between text-[10px] text-slate-500 font-mono select-none shrink-0 z-20">
          <div className="flex items-center gap-3 sm:gap-4">
            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              ALL SERVICES OPERATIONAL
            </span>
            <span className="hidden md:inline text-slate-700">|</span>
            <span className="hidden md:inline">CPU: 12%</span>
            <span className="hidden md:inline text-slate-700">|</span>
            <span className="hidden md:inline">MAP_TILES: CACHED (LEAFLET/GIS)</span>
            <span className="hidden lg:inline text-slate-700">|</span>
            <span className="hidden lg:inline">TELEMETRY_LATENCY: 14ms</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline">SYSTEM VERSION: V4.8.2-PREMIUM</span>
            <span className="hidden sm:inline text-slate-700">|</span>
            <span className="text-blue-400 font-semibold uppercase tracking-wider">FLEETOS AI</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
