import { useState } from 'react';
import { 
  Expedition, 
  Personnel, 
  Vehicle, 
  CargoItem, 
  Camp, 
  Emergency, 
  SystemAlert, 
  WeatherData, 
  MarkerFilter, 
  NavigationTab,
  EmergencyStatus
} from '../types';
import { PolarMap } from './PolarMap';
import { 
  Compass, 
  Users, 
  Package, 
  AlertTriangle, 
  CloudSnow, 
  ArrowRight, 
  Radio, 
  Fuel, 
  ShieldCheck,
  CheckCircle2,
  Navigation as NavIcon,
  User,
  Clock,
  MapPin,
  Truck,
  Activity
} from 'lucide-react';
import { motion } from 'motion/react';
import { useTranslation } from '../i18n';

interface DashboardViewProps {
  expeditions: Expedition[];
  personnel: Personnel[];
  vehicles: Vehicle[];
  cargo: CargoItem[];
  camps: Camp[];
  emergencies: Emergency[];
  alerts: SystemAlert[];
  weather: WeatherData;
  activeFilter: MarkerFilter;
  onFilterChange: (filter: MarkerFilter) => void;
  onNavigateTab: (tab: NavigationTab) => void;
  onOpenEmergencyModal: () => void;
  onResolveEmergency: (id: string) => void;
  onUpdateEmergencyStatus?: (id: string, status: EmergencyStatus) => void;
  onAdvanceEmergencyStatus?: (id: string) => void;
  onFocusCoordinates: (coords: [number, number]) => void;
  onSelectEntity: (type: 'vehicle' | 'personnel' | 'cargo' | 'camp' | 'emergency', id: string) => void;
  onOpenCargoDetails?: (id: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  expeditions,
  personnel,
  vehicles,
  cargo,
  camps,
  emergencies,
  alerts,
  weather,
  activeFilter,
  onFilterChange,
  onNavigateTab,
  onOpenEmergencyModal,
  onResolveEmergency,
  onUpdateEmergencyStatus,
  onAdvanceEmergencyStatus,
  onFocusCoordinates,
  onSelectEntity,
  onOpenCargoDetails
}) => {
  const { t, translateStatus } = useTranslation();
  const activeEmergencies = emergencies.filter(e => e.status !== 'Resolved');
  const primaryEmergency = activeEmergencies[0] || null;

  // Dynamic metrics from actual state data with fallbacks
  const expeditionsCount = expeditions?.length || 3;
  const activeExpeditionsCount = expeditions?.filter(e => e.status === 'Active').length || 2;

  const personnelCount = personnel?.length || 12;
  const deployedPersonnelCount = personnel?.filter(p => p.status === 'Active' || p.status === 'Moving' || p.status === 'In Transit').length || 0;
  const basePersonnelCount = personnel?.filter(p => p.status === 'At Base' || p.status === 'Standby').length || (personnelCount - deployedPersonnelCount);

  const cargoCount = cargo?.length || 28;
  const inTransitCargoCount = cargo?.filter(c => c.status === 'In Transit').length || 6;

  const activeEmergenciesCount = activeEmergencies.length;

  // Active moving unit: Snowcat V-03 is moving live
  const movingVehicle = vehicles.find(v => v.id === 'v-3') || vehicles[0];
  const [isFollowingUnit, setIsFollowingUnit] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-6"
    >
      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1 border-b border-[#EAE3D5]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-[#24313A] tracking-tight">
            {t('dashboard.title')}
          </h1>
          <p className="text-xs font-semibold text-[#C96A20] tracking-wide uppercase mt-0.5">
            {t('dashboard.subtitle')}
          </p>
        </div>

        {/* Weather Widget */}
        <div className="flex items-center gap-3.5 px-4 py-2 rounded-xl bg-[#FFFCF8] border border-[#EAE3D5] shadow-xs self-start sm:self-auto">
          <div className="w-8 h-8 rounded-lg bg-[#FFE5C7] flex items-center justify-center text-[#C96A20]">
            <CloudSnow className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-[#24313A] leading-none">
                {weather.tempC}°C
              </span>
              <span className="text-xs font-medium text-[#71808A]">
                {weather.condition}
              </span>
            </div>
            <div className="text-[11px] text-[#71808A] mt-0.5">
              {t('dashboard.wind')} {weather.windSpeedKmH} km/h • {t('dashboard.vis')} {weather.visibilityKm} km
            </div>
          </div>
        </div>
      </div>

      {/* ONLY FOUR Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Stat 1: Expeditions */}
        <button
          onClick={() => onNavigateTab('expeditions')}
          className="p-4 rounded-xl bg-[#FFFCF8] border border-[#EAE3D5] hover:border-[#F29A3D] text-left transition-all warm-card-shadow group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#71808A]">{t('dashboard.expeditions')}</span>
            <Compass className="w-4 h-4 text-[#F29A3D] group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-display text-[#24313A] mt-2">
            {expeditionsCount}
          </div>
          <div className="text-[11px] font-medium text-[#39A96B] mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#39A96B]" />
            <span>{activeExpeditionsCount} {t('dashboard.activeFieldMissions')}</span>
          </div>
        </button>

        {/* Stat 2: Personnel */}
        <button
          onClick={() => onNavigateTab('tracking')}
          className="p-4 rounded-xl bg-[#FFFCF8] border border-[#EAE3D5] hover:border-[#4AA9D8] text-left transition-all warm-card-shadow group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#71808A]">{t('dashboard.personnel')}</span>
            <Users className="w-4 h-4 text-[#4AA9D8] group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-display text-[#24313A] mt-2">
            {personnelCount}
          </div>
          <div className="text-[11px] font-medium text-[#4AA9D8] mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4AA9D8]" />
            <span>{deployedPersonnelCount} {t('dashboard.inField')} • {basePersonnelCount} {t('dashboard.base')}</span>
          </div>
        </button>

        {/* Stat 3: Cargo */}
        <button
          onClick={() => onNavigateTab('cargo')}
          className="p-4 rounded-xl bg-[#FFFCF8] border border-[#EAE3D5] hover:border-[#F29A3D] text-left transition-all warm-card-shadow group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#71808A]">{t('dashboard.cargo')}</span>
            <Package className="w-4 h-4 text-[#F29A3D] group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-display text-[#24313A] mt-2">
            {cargoCount}
          </div>
          <div className="text-[11px] font-medium text-[#C96A20] mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F29A3D]" />
            <span>{inTransitCargoCount} {t('dashboard.unitsInTransit')}</span>
          </div>
        </button>

        {/* Stat 4: Emergency */}
        <button
          onClick={() => onNavigateTab('emergency')}
          className={`p-4 rounded-xl border text-left transition-all warm-card-shadow group cursor-pointer ${
            activeEmergenciesCount > 0
              ? 'bg-[#FFFCF8] border-[#E84D4D] shadow-[0_0_12px_rgba(232,77,77,0.15)]'
              : 'bg-[#FFFCF8] border-[#EAE3D5]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#71808A]">{t('dashboard.emergency')}</span>
            <AlertTriangle className={`w-4 h-4 ${activeEmergenciesCount > 0 ? 'text-[#E84D4D] animate-pulse' : 'text-[#71808A]'}`} />
          </div>
          <div className={`text-2xl sm:text-3xl font-extrabold font-display mt-2 ${
            activeEmergenciesCount > 0 ? 'text-[#E84D4D]' : 'text-[#24313A]'
          }`}>
            {activeEmergenciesCount}
          </div>
          <div className="text-[11px] font-medium mt-1 flex items-center gap-1">
            {activeEmergenciesCount > 0 ? (
              <span className="text-[#E84D4D] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E84D4D] emergency-marker-pulse" />
                {activeEmergenciesCount} {t('dashboard.activeSosResponse')}
              </span>
            ) : (
              <span className="text-[#39A96B] flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#39A96B]" />
                {t('dashboard.allTeamsNominal')}
              </span>
            )}
          </div>
        </button>
      </div>

      {/* Emergency Notification Banner (If emergency active) */}
      {primaryEmergency && (
        <div 
          id="dashboard-emergency-card"
          className="p-4 sm:p-5 rounded-2xl bg-[#FFFCF8] border-2 border-[#E84D4D] warm-card-shadow space-y-3.5"
        >
          {/* Header row */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pb-3 border-b border-[#EAE3D5]">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FDE8E8] border border-[#E84D4D]/30 flex items-center justify-center text-[#E84D4D] shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[11px] font-extrabold text-[#E84D4D] bg-[#FDE8E8] px-2 py-0.5 rounded-md">
                    {primaryEmergency.id}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#E84D4D]">
                    🚨 {translateStatus(primaryEmergency.type)} {t('map.emergencyPrefix')}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FDE8E8] text-[#E84D4D] font-bold">
                    {translateStatus(primaryEmergency.severity)}
                  </span>
                  <span className="text-[11px] text-[#71808A]">
                    Updated: <strong className="text-[#24313A]">{primaryEmergency.lastUpdated}</strong>
                  </span>
                </div>
                <h2 className="text-base font-extrabold text-[#24313A] mt-1">
                  {primaryEmergency.locationName}
                </h2>
              </div>
            </div>

            {/* Quick action triggers */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <button
                id="emergency-details-btn"
                onClick={() => onSelectEntity('emergency', primaryEmergency.id)}
                className="flex-1 md:flex-none px-3 py-1.5 rounded-xl bg-[#F7F4EF] hover:bg-[#FFE5C7] text-[#24313A] text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-[#EAE3D5]"
              >
                <span>Emergency Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                id="emergency-view-route-btn"
                onClick={() => {
                  onFocusCoordinates([primaryEmergency.lat, primaryEmergency.lng]);
                  onSelectEntity('emergency', primaryEmergency.id);
                }}
                className="flex-1 md:flex-none px-3 py-1.5 rounded-xl bg-[#FFFCF8] border border-[#EAE3D5] hover:border-[#4AA9D8] text-[#24313A] text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <NavIcon className="w-3.5 h-3.5 text-[#4AA9D8]" />
                <span>{t('common.viewOnMap')}</span>
              </button>
            </div>
          </div>

          {/* All 7 Key Information Fields Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            {/* 1. Location */}
            <div className="p-2.5 rounded-xl bg-[#F7F4EF] border border-[#EAE3D5]">
              <span className="text-[10px] text-[#71808A] uppercase font-bold flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#F29A3D]" />
                Location
              </span>
              <strong className="text-xs font-extrabold text-[#24313A] block mt-0.5 truncate">
                {primaryEmergency.locationName}
              </strong>
              <span className="text-[10px] font-mono text-[#71808A]">
                {primaryEmergency.lat.toFixed(3)}°N, {primaryEmergency.lng.toFixed(3)}°E
              </span>
            </div>

            {/* 2. Affected Person */}
            <div className="p-2.5 rounded-xl bg-[#F7F4EF] border border-[#EAE3D5]">
              <span className="text-[10px] text-[#71808A] uppercase font-bold flex items-center gap-1">
                <User className="w-3 h-3 text-[#E84D4D]" />
                Affected Person
              </span>
              <strong className="text-xs font-extrabold text-[#24313A] block mt-0.5 truncate">
                {primaryEmergency.affectedPerson}
              </strong>
              <span className="text-[10px] text-[#71808A]">Reported {primaryEmergency.reportedAt}</span>
            </div>

            {/* 3. Nearest Response Team */}
            <div className="p-2.5 rounded-xl bg-[#F7F4EF] border border-[#EAE3D5]">
              <span className="text-[10px] text-[#71808A] uppercase font-bold flex items-center gap-1">
                <Truck className="w-3 h-3 text-[#39A96B]" />
                Nearest Team
              </span>
              <strong className="text-xs font-extrabold text-[#24313A] block mt-0.5 truncate">
                {primaryEmergency.nearestTeamName}
              </strong>
              <span className="text-[10px] text-[#71808A]">{primaryEmergency.distanceKm} km away</span>
            </div>

            {/* 4. ETA & Status */}
            <div className="p-2.5 rounded-xl bg-[#F7F4EF] border border-[#EAE3D5]">
              <span className="text-[10px] text-[#71808A] uppercase font-bold flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#C96A20]" />
                ETA / Status
              </span>
              <strong className="text-xs font-extrabold text-[#E84D4D] block mt-0.5">
                {primaryEmergency.status === 'Resolved' ? 'Resolved' : `${primaryEmergency.etaMinutes} min`}
              </strong>
              <span className="text-[10px] font-semibold text-[#E84D4D] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E84D4D] emergency-marker-pulse" />
                {primaryEmergency.status}
              </span>
            </div>
          </div>

          {/* Response Lifecycle Controls (Active → Response Assigned → Team En Route → Resolved) */}
          <div className="pt-2 border-t border-[#EAE3D5] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
              <span className="text-[10px] font-bold text-[#71808A] uppercase whitespace-nowrap mr-1">
                Lifecycle:
              </span>
              {(['Active', 'Response Assigned', 'Team En Route', 'Resolved'] as EmergencyStatus[]).map(st => {
                const isCurrent = primaryEmergency.status === st;
                return (
                  <button
                    key={st}
                    onClick={() => onUpdateEmergencyStatus?.(primaryEmergency.id, st)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      isCurrent
                        ? 'bg-[#E84D4D] text-white shadow-xs'
                        : 'bg-[#F7F4EF] text-[#71808A] hover:text-[#24313A] hover:bg-[#FFE5C7]'
                    }`}
                  >
                    {isCurrent ? '● ' : ''}{st}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              {primaryEmergency.status !== 'Resolved' && (
                <button
                  id="dashboard-advance-status-btn"
                  onClick={() => onAdvanceEmergencyStatus?.(primaryEmergency.id)}
                  className="px-3 py-1.5 rounded-xl bg-[#F29A3D] hover:bg-[#FFB45A] text-[#24313A] text-xs font-extrabold flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                >
                  <span>Next Status</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                id="emergency-resolve-btn"
                onClick={() => onResolveEmergency(primaryEmergency.id)}
                className="px-3 py-1.5 rounded-xl bg-[#39A96B] hover:bg-[#2e8a56] text-white text-xs font-bold transition-all flex items-center gap-1 shadow-xs cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{t('common.resolve')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTENT: GIS Map (approx 65% width) + LIVE Sidebar (approx 35% width) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Real GIS Interactive Map */}
        <div className="lg:col-span-8 space-y-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#24313A] tracking-wider uppercase">{t('dashboard.liveGisTheater')}</span>
              <span className="w-2 h-2 rounded-full bg-[#39A96B] live-indicator" />
            </div>
            <span className="text-xs text-[#71808A]">{t('dashboard.sector')}: Svalbard 78.4°N</span>
          </div>

          <PolarMap
            personnel={personnel}
            vehicles={vehicles}
            cargo={cargo}
            camps={camps}
            emergencies={emergencies}
            activeFilter={activeFilter}
            onFilterChange={onFilterChange}
            onSelectEntity={onSelectEntity}
            onOpenCargoDetails={onOpenCargoDetails}
            heightClass="h-[460px] sm:h-[500px]"
            activeEmergencyRoute={primaryEmergency?.responseRoute}
            isFollowing={isFollowingUnit}
            onToggleFollow={() => setIsFollowingUnit(!isFollowingUnit)}
            selectedEntity={isFollowingUnit ? { type: 'vehicle', id: movingVehicle.id } : null}
          />
        </div>

        {/* Right Side: LIVE Status & Active Moving Unit Card */}
        <div className="lg:col-span-4 space-y-4">
          {/* Live Status Box */}
          <div className="p-4 rounded-2xl bg-[#FFFCF8] border border-[#EAE3D5] warm-card-shadow">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE3D5]">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-[#39A96B]" />
                <h2 className="text-xs font-bold text-[#24313A] uppercase tracking-wider">{t('dashboard.liveStatus')}</h2>
              </div>
              <span className="text-[11px] font-bold text-[#39A96B] bg-[#E8F7EE] px-2 py-0.5 rounded-full">
                {t('dashboard.online')}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 py-3 text-center">
              <div className="p-2 rounded-xl bg-[#F7F4EF]">
                <div className="text-lg font-extrabold text-[#4AA9D8]">{personnel.length}</div>
                <div className="text-[10px] font-semibold text-[#71808A] uppercase">{t('dashboard.personnel')}</div>
              </div>
              <div className="p-2 rounded-xl bg-[#F7F4EF]">
                <div className="text-lg font-extrabold text-[#39A96B]">{vehicles.length}</div>
                <div className="text-[10px] font-semibold text-[#71808A] uppercase">{t('dashboard.vehicles')}</div>
              </div>
              <div className="p-2 rounded-xl bg-[#F7F4EF]">
                <div className="text-lg font-extrabold text-[#F29A3D]">{inTransitCargoCount}</div>
                <div className="text-[10px] font-semibold text-[#71808A] uppercase">{t('dashboard.cargo')}</div>
              </div>
            </div>
          </div>

          {/* Active Moving Unit Card */}
          {movingVehicle && (
            <div className="p-4 rounded-2xl bg-[#FFFCF8] border border-[#EAE3D5] warm-card-shadow space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#39A96B] live-indicator" />
                  <span className="text-xs font-bold text-[#24313A] uppercase tracking-wider">{t('dashboard.activeMovingUnit')}</span>
                </div>
                <span className="text-[10px] font-semibold text-[#71808A]">{movingVehicle.code}</span>
              </div>

              <div className="p-3 rounded-xl bg-[#FFF8EF] border border-[#F29A3D]/20">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-[#24313A]">{movingVehicle.name}</h4>
                  <span className="text-[11px] font-bold text-[#C96A20] bg-[#FFE5C7] px-2 py-0.5 rounded-md">
                    {movingVehicle.speedKmH} km/h
                  </span>
                </div>
                <div className="text-xs text-[#71808A] mt-0.5">{movingVehicle.type} • {t('tracking.driver')}: {movingVehicle.driver}</div>

                <div className="grid grid-cols-2 gap-2 mt-3 pt-2.5 border-t border-[#F29A3D]/15 text-xs">
                  <div className="flex items-center gap-1.5 text-[#71808A]">
                    <Fuel className="w-3.5 h-3.5 text-[#F29A3D]" />
                    <span>{t('map.fuel')}: <strong className="text-[#24313A]">{movingVehicle.fuelPercentage}%</strong></span>
                  </div>
                  <div className="text-right text-[#71808A]">
                    {t('map.gps')}: <span className="font-mono text-[#24313A] font-semibold">{movingVehicle.lat.toFixed(3)}, {movingVehicle.lng.toFixed(3)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  id="dashboard-follow-unit-btn"
                  onClick={() => {
                    setIsFollowingUnit(!isFollowingUnit);
                    onFocusCoordinates([movingVehicle.lat, movingVehicle.lng]);
                    onSelectEntity('vehicle', movingVehicle.id);
                  }}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    isFollowingUnit
                      ? 'bg-[#F29A3D] text-[#24313A] shadow-xs'
                      : 'bg-[#F7F4EF] text-[#24313A] hover:bg-[#FFE5C7]'
                  }`}
                >
                  <NavIcon className="w-3.5 h-3.5" />
                  <span>{isFollowingUnit ? t('dashboard.followingUnit') : t('dashboard.followUnit')}</span>
                </button>
                <button
                  id="dashboard-goto-tracking-btn"
                  onClick={() => onNavigateTab('tracking')}
                  className="py-2 px-3 rounded-xl bg-[#F7F4EF] hover:bg-[#EAE3D5] text-[#24313A] text-xs font-bold transition-all cursor-pointer"
                  title={t('dashboard.openTrackingTerminal')}
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* BELOW MAP: RECENT ALERTS (Only 3) & QUICK ACTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* RECENT ALERTS (Only 3 alerts) */}
        <div className="lg:col-span-7 p-5 rounded-2xl bg-[#FFFCF8] border border-[#EAE3D5] warm-card-shadow">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold text-[#24313A] tracking-wider uppercase">{t('dashboard.recentAlerts')}</h2>
            <span className="text-[11px] font-semibold text-[#71808A]">{t('dashboard.latest3Events')}</span>
          </div>

          <div className="space-y-2.5">
            {alerts.slice(0, 3).map(alert => (
              <div 
                key={alert.id}
                className="p-2.5 rounded-xl bg-[#F7F4EF] border border-[#EAE3D5] flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${
                    alert.type === 'emergency' ? 'bg-[#E84D4D]' :
                    alert.type === 'fuel' ? 'bg-[#E84D4D]' :
                    alert.type === 'cargo' ? 'bg-[#F29A3D]' : 'bg-[#4AA9D8]'
                  }`} />
                  <div className="truncate">
                    <div className="font-bold text-[#24313A] text-xs truncate">{alert.title}</div>
                    <div className="text-[11px] text-[#71808A] truncate">{alert.detail}</div>
                  </div>
                </div>
                <span className="text-[10px] text-[#71808A] font-medium shrink-0">{alert.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* QUICK ACTIONS: [Track], [Cargo], [Emergency] */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-[#FFFCF8] border border-[#EAE3D5] warm-card-shadow flex flex-col justify-between">
          <div>
            <h2 className="text-xs font-bold text-[#24313A] tracking-wider uppercase mb-1">{t('dashboard.quickActions')}</h2>
            <p className="text-xs text-[#71808A]">{t('dashboard.quickActionsDesc')}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-4">
            <button
              id="dashboard-action-track"
              onClick={() => onNavigateTab('tracking')}
              className="min-h-[76px] py-2.5 px-2 rounded-xl bg-[#F7F4EF] hover:bg-[#FFE5C7] border border-[#EAE3D5] text-[#24313A] text-xs font-bold flex sm:flex-col items-center justify-center gap-2 sm:gap-1.5 transition-all cursor-pointer text-center whitespace-normal break-words overflow-hidden"
            >
              <Radio className="w-4 h-4 text-[#39A96B] shrink-0" />
              <span className="leading-tight">{t('dashboard.actionTrack')}</span>
            </button>

            <button
              id="dashboard-action-cargo"
              onClick={() => onNavigateTab('cargo')}
              className="min-h-[76px] py-2.5 px-2 rounded-xl bg-[#F7F4EF] hover:bg-[#FFE5C7] border border-[#EAE3D5] text-[#24313A] text-xs font-bold flex sm:flex-col items-center justify-center gap-2 sm:gap-1.5 transition-all cursor-pointer text-center whitespace-normal break-words overflow-hidden"
            >
              <Package className="w-4 h-4 text-[#F29A3D] shrink-0" />
              <span className="leading-tight">{t('dashboard.actionCargo')}</span>
            </button>

            <button
              id="dashboard-action-emergency"
              onClick={onOpenEmergencyModal}
              className="min-h-[76px] py-2.5 px-2 rounded-xl bg-[#E84D4D] hover:bg-[#D43F3F] text-white text-xs font-bold flex sm:flex-col items-center justify-center gap-2 sm:gap-1.5 transition-all shadow-sm cursor-pointer text-center whitespace-normal break-words overflow-hidden"
            >
              <AlertTriangle className="w-4 h-4 text-white shrink-0 animate-pulse" />
              <span className="leading-tight">{t('dashboard.actionEmergency')}</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
