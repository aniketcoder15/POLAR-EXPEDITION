import { useState, useEffect, useCallback } from 'react';
import { 
  NavigationTab, 
  MarkerFilter, 
  Expedition, 
  Personnel, 
  Vehicle, 
  CargoItem, 
  Camp, 
  Emergency, 
  InventoryItem, 
  SystemAlert, 
  WeatherData,
  CargoStatus,
  EmergencyType,
  EmergencySeverity,
  EmergencyStatus,
  AuthUser
} from './types';
import { dataService } from './services/dataService';
import { authService } from './services/authService';
import { useTranslation } from './i18n';
import { LanguageSelector } from './components/LanguageSelector';
import { Navigation } from './components/Navigation';
import { DashboardView } from './components/DashboardView';
import { TrackingView } from './components/TrackingView';
import { ExpeditionsView } from './components/ExpeditionsView';
import { CargoView } from './components/CargoView';
import { InventoryView } from './components/InventoryView';
import { EmergencyView } from './components/EmergencyView';
import { ReportsView } from './components/ReportsView';
import { EmergencyModal } from './components/EmergencyModal';
import { EmergencyDetailModal } from './components/EmergencyDetailModal';
import { EmergencyToast } from './components/EmergencyToast';
import { PersonnelModal } from './components/PersonnelModal';
import { CargoDetailModal } from './components/CargoDetailModal';
import { PolarAssistantModal } from './components/PolarAssistantModal';
import { LoginView } from './components/LoginView';
import { Bot } from 'lucide-react';

export default function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => authService.getCurrentUser());

  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');
  const [activeFilter, setActiveFilter] = useState<MarkerFilter>('all');
  
  // Data State
  const [expeditions, setExpeditions] = useState<Expedition[]>([]);
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [cargo, setCargo] = useState<CargoItem[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [emergencies, setEmergencies] = useState<Emergency[]>([]);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [camps, setCamps] = useState<Camp[]>([]);
  const [weather, setWeather] = useState<WeatherData>(dataService.getWeather());

  // Interactive Map & Entity State
  const [selectedEntity, setSelectedEntity] = useState<{ type: 'vehicle' | 'personnel' | 'cargo' | 'camp' | 'emergency'; id: string } | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [focusTarget, setFocusTarget] = useState<[number, number] | null>(null);

  // Modals & Notifications
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [selectedEmergencyId, setSelectedEmergencyId] = useState<string | null>(null);
  const [toastEmergency, setToastEmergency] = useState<Emergency | null>(null);
  const [inspectPersonnel, setInspectPersonnel] = useState<Personnel | null>(null);
  const [selectedCargoId, setSelectedCargoId] = useState<string | null>(null);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  const inspectEmergency = emergencies.find(e => e.id === selectedEmergencyId) || null;
  const inspectCargo = cargo.find(c => c.id === selectedCargoId) || null;

  // Synchronize state with dataService
  const syncData = useCallback(() => {
    setExpeditions(dataService.getExpeditions());
    setPersonnel(dataService.getPersonnel());
    setVehicles(dataService.getVehicles());
    setCargo(dataService.getCargo());
    setInventory(dataService.getInventory());
    setEmergencies(dataService.getEmergencies());
    setAlerts(dataService.getAlerts());
    setCamps(dataService.getCamps());
    setWeather(dataService.getWeather());
  }, []);

  useEffect(() => {
    syncData();
    const unsubscribe = dataService.subscribe(() => {
      syncData();
    });
    return () => unsubscribe();
  }, [syncData]);

  // Route protection based on user role
  useEffect(() => {
    if (currentUser && !currentUser.allowedTabs.includes(currentTab)) {
      setCurrentTab('dashboard');
    }
  }, [currentUser, currentTab]);

  // Auth Handlers
  const handleLoginSuccess = (user: AuthUser) => {
    setCurrentUser(user);
    setCurrentTab('dashboard');
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setCurrentTab('dashboard');
  };

  const handleCreateEmergency = (params: {
    type: EmergencyType;
    severity: EmergencySeverity;
    locationName: string;
    lat: number;
    lng: number;
    description?: string;
    affectedPerson?: string;
  }) => {
    const newEmg = dataService.createEmergency(params);
    setToastEmergency(newEmg);
    setFocusTarget([newEmg.lat, newEmg.lng]);
    setSelectedEntity({ type: 'emergency', id: newEmg.id });
    setSelectedEmergencyId(newEmg.id);
    setCurrentTab('dashboard'); // take to dashboard to view the map route
  };

  const handleResolveEmergency = (id: string) => {
    dataService.resolveEmergency(id);
    if (toastEmergency?.id === id) {
      setToastEmergency(null);
    }
  };

  const handleUpdateEmergencyStatus = (id: string, status: EmergencyStatus) => {
    dataService.updateEmergencyStatus(id, status);
  };

  const handleAdvanceEmergencyStatus = (id: string) => {
    dataService.advanceEmergencyStatus(id);
  };

  const handleUpdateCargoStatus = (id: string, status: CargoStatus) => {
    dataService.updateCargoStatus(id, status);
  };

  const handleUpdateInventoryQuantity = (id: string, delta: number, reason?: string) => {
    dataService.updateInventoryQuantity(id, delta, reason);
  };

  const handleReceiveStock = (id: string, amount: number, notes?: string, performedBy?: string) => {
    dataService.receiveStock(id, amount, notes, performedBy);
  };

  const handleConsumeStock = (id: string, amount: number, notes?: string, performedBy?: string) => {
    dataService.consumeStock(id, amount, notes, performedBy);
  };

  const handleDeliverCargo = (cargoId: string) => {
    dataService.updateCargoStatus(cargoId, 'Delivered');
  };

  const handleFocusCoordinates = (coords: [number, number]) => {
    setFocusTarget(coords);
  };

  const handleSelectEntity = (type: 'vehicle' | 'personnel' | 'cargo' | 'camp' | 'emergency', id: string) => {
    setSelectedEntity({ type, id });
    if (type === 'personnel') {
      const p = personnel.find(item => item.id === id);
      if (p) setInspectPersonnel(p);
    } else if (type === 'emergency') {
      setSelectedEmergencyId(id);
    }
  };

  const { t } = useTranslation();
  const activeEmergenciesCount = emergencies.filter(e => e.status !== 'Resolved').length;

  // Render Login Screen if not authenticated
  if (!currentUser) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-[#FFFCF8] text-[#24313A] flex flex-col relative overflow-x-hidden selection:bg-[#F29A3D]/25 selection:text-[#24313A]">
      {/* Subtle Warm Polar Mountain Atmosphere */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 opacity-40 bg-cover bg-center"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 0%, #FFE5C7 0%, transparent 60%)`
        }}
      />

      {/* Navigation Sidebar & Header */}
      <Navigation
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        activeEmergenciesCount={activeEmergenciesCount}
        onOpenEmergencyModal={() => setIsEmergencyModalOpen(true)}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenAssistant={() => setIsAssistantOpen(true)}
        isAssistantOpen={isAssistantOpen}
      />

      {/* Main Content Area (Offset by desktop sidebar width) */}
      <main className="flex-1 lg:pl-64 pt-14 lg:pt-0 pb-20 lg:pb-10 relative z-10">
        {/* Desktop Top Header with Live Telemetry & Language Selector */}
        <header className="hidden lg:flex items-center justify-between px-6 lg:px-8 py-3.5 bg-[#FFFCF8]/90 backdrop-blur-md border-b border-[#EAE3D5] sticky top-0 z-30">
          <div className="flex items-center gap-2.5 text-xs font-semibold text-[#71808A]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#39A96B] animate-pulse" />
            <span className="tracking-wider text-[11px] font-mono text-[#24313A]/80 uppercase">
              {t('nav.liveTelemetry')}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSelector />
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {currentTab === 'dashboard' && (
            <DashboardView
              expeditions={expeditions}
              personnel={personnel}
              vehicles={vehicles}
              cargo={cargo}
              camps={camps}
              emergencies={emergencies}
              alerts={alerts}
              weather={weather}
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
              onNavigateTab={setCurrentTab}
              onOpenEmergencyModal={() => setIsEmergencyModalOpen(true)}
              onResolveEmergency={handleResolveEmergency}
              onUpdateEmergencyStatus={handleUpdateEmergencyStatus}
              onAdvanceEmergencyStatus={handleAdvanceEmergencyStatus}
              onFocusCoordinates={handleFocusCoordinates}
              onSelectEntity={handleSelectEntity}
              onOpenCargoDetails={(id) => setSelectedCargoId(id)}
            />
          )}

          {currentTab === 'tracking' && (
            <TrackingView
              personnel={personnel}
              vehicles={vehicles}
              cargo={cargo}
              camps={camps}
              emergencies={emergencies}
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
              selectedEntity={selectedEntity}
              onSelectEntity={handleSelectEntity}
              isFollowing={isFollowing}
              onToggleFollow={() => setIsFollowing(!isFollowing)}
              onFocusCoordinates={handleFocusCoordinates}
              onOpenPersonnelModal={setInspectPersonnel}
              onOpenCargoDetails={(id) => setSelectedCargoId(id)}
            />
          )}

          {currentTab === 'expeditions' && (
            <ExpeditionsView
              expeditions={expeditions}
              personnel={personnel}
              vehicles={vehicles}
              cargo={cargo}
              camps={camps}
              emergencies={emergencies}
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
              onFocusCoordinates={handleFocusCoordinates}
              onStartExpedition={(id) => dataService.startExpedition(id)}
              onCreateExpedition={(params) => dataService.createExpedition(params)}
              onTrackOnMap={(exp) => {
                if (exp.routeCoordinates && exp.routeCoordinates.length > 0) {
                  handleFocusCoordinates(exp.routeCoordinates[0]);
                }
              }}
            />
          )}

          {currentTab === 'cargo' && (
            <CargoView
              cargo={cargo}
              vehicles={vehicles}
              personnel={personnel}
              camps={camps}
              emergencies={emergencies}
              activeFilter={activeFilter}
              selectedEntity={selectedEntity}
              onFilterChange={setActiveFilter}
              onUpdateCargoStatus={handleUpdateCargoStatus}
              onFocusCoordinates={handleFocusCoordinates}
              onSelectEntity={handleSelectEntity}
              onOpenCargoDetails={(id) => setSelectedCargoId(id)}
            />
          )}

          {currentTab === 'inventory' && (
            <InventoryView
              inventory={inventory}
              cargo={cargo}
              onUpdateQuantity={handleUpdateInventoryQuantity}
              onReceiveStock={handleReceiveStock}
              onConsumeStock={handleConsumeStock}
              onDeliverCargo={handleDeliverCargo}
              onOpenCargoDetails={(id) => setSelectedCargoId(id)}
            />
          )}

          {currentTab === 'emergency' && (
            <EmergencyView
              emergencies={emergencies}
              personnel={personnel}
              vehicles={vehicles}
              cargo={cargo}
              camps={camps}
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
              onOpenEmergencyModal={() => setIsEmergencyModalOpen(true)}
              onResolveEmergency={handleResolveEmergency}
              onUpdateEmergencyStatus={handleUpdateEmergencyStatus}
              onAdvanceEmergencyStatus={handleAdvanceEmergencyStatus}
              onFocusCoordinates={handleFocusCoordinates}
              onSelectEmergency={(id) => setSelectedEmergencyId(id)}
            />
          )}

          {currentTab === 'reports' && (
            <ReportsView />
          )}
        </div>
      </main>

      {/* Emergency Report Modal */}
      <EmergencyModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
        camps={camps}
        onSubmit={handleCreateEmergency}
      />

      {/* Emergency Detail & Full Lifecycle Modal */}
      <EmergencyDetailModal
        emergency={inspectEmergency}
        onClose={() => setSelectedEmergencyId(null)}
        onUpdateStatus={handleUpdateEmergencyStatus}
        onAdvanceStatus={handleAdvanceEmergencyStatus}
        onFocusCoordinates={(coords) => {
          handleFocusCoordinates(coords);
          setCurrentTab('dashboard');
        }}
      />

      {/* Emergency Notification Toast */}
      <EmergencyToast
        emergency={toastEmergency}
        onDismiss={() => setToastEmergency(null)}
        onView={() => {
          if (toastEmergency) {
            handleFocusCoordinates([toastEmergency.lat, toastEmergency.lng]);
            setSelectedEmergencyId(toastEmergency.id);
            setCurrentTab('emergency');
            setToastEmergency(null);
          }
        }}
      />

      {/* Personnel Profile & Movement History Modal */}
      <PersonnelModal
        personnel={inspectPersonnel}
        onClose={() => setInspectPersonnel(null)}
        onViewOnMap={(lat, lng) => {
          handleFocusCoordinates([lat, lng]);
          if (inspectPersonnel) {
            handleSelectEntity('personnel', inspectPersonnel.id);
          }
          setCurrentTab('tracking');
        }}
      />

      {/* Cargo Logistics Details & Movement Timeline Modal */}
      <CargoDetailModal
        cargo={inspectCargo}
        onClose={() => setSelectedCargoId(null)}
        onUpdateStatus={handleUpdateCargoStatus}
        onTrackOnMap={(item) => {
          handleSelectEntity('cargo', item.id);
          handleFocusCoordinates([item.lat, item.lng]);
          setCurrentTab('cargo');
        }}
      />

      {/* Floating Polar Assistant Trigger Button */}
      {!isAssistantOpen && (
        <button
          id="floating-polar-assistant-btn"
          onClick={() => setIsAssistantOpen(true)}
          className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40 px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-2xl bg-gradient-to-r from-[#F29A3D] to-[#E08A2D] hover:from-[#E08A2D] hover:to-[#C96A20] text-[#24313A] font-extrabold text-xs flex items-center gap-2.5 shadow-xl border border-[#FFE5C7] hover:scale-105 transition-all cursor-pointer group"
          title="Open Polar Assistant"
        >
          <div className="relative">
            <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-[#24313A] group-hover:rotate-12 transition-transform" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#39A96B] ring-2 ring-white animate-pulse" />
          </div>
          <span className="tracking-tight hidden sm:inline">Polar Assistant</span>
        </button>
      )}

      {/* Polar Assistant Local Operations Chatbot Modal */}
      <PolarAssistantModal
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        personnel={personnel}
        expeditions={expeditions}
        vehicles={vehicles}
        cargo={cargo}
        inventory={inventory}
        emergencies={emergencies}
        camps={camps}
      />
    </div>
  );
}
