import { useState } from 'react';
import { Emergency, Personnel, Vehicle, CargoItem, Camp, MarkerFilter, EmergencyStatus } from '../types';
import { PolarMap } from './PolarMap';
import { 
  AlertTriangle, 
  ShieldCheck, 
  Radio, 
  Truck, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Plus,
  User,
  ArrowRight,
  Activity,
  ExternalLink
} from 'lucide-react';
import { motion } from 'motion/react';
import { useTranslation } from '../i18n';

interface EmergencyViewProps {
  emergencies: Emergency[];
  personnel: Personnel[];
  vehicles: Vehicle[];
  cargo: CargoItem[];
  camps: Camp[];
  activeFilter: MarkerFilter;
  onFilterChange: (filter: MarkerFilter) => void;
  onOpenEmergencyModal: () => void;
  onResolveEmergency: (id: string) => void;
  onUpdateEmergencyStatus?: (id: string, status: EmergencyStatus) => void;
  onAdvanceEmergencyStatus?: (id: string) => void;
  onFocusCoordinates: (coords: [number, number]) => void;
  onSelectEmergency?: (id: string) => void;
}

export const EmergencyView: React.FC<EmergencyViewProps> = ({
  emergencies,
  personnel,
  vehicles,
  cargo,
  camps,
  activeFilter,
  onFilterChange,
  onOpenEmergencyModal,
  onResolveEmergency,
  onUpdateEmergencyStatus,
  onAdvanceEmergencyStatus,
  onFocusCoordinates,
  onSelectEmergency
}) => {
  const { t, translateStatus, translateSeverity } = useTranslation();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const activeEmergencies = emergencies.filter(e => e.status !== 'Resolved');
  const activeEmg = activeEmergencies[0] || null;

  const handleDispatchTeam = (emg: Emergency) => {
    if (onUpdateEmergencyStatus && emg.status === 'Active') {
      onUpdateEmergencyStatus(emg.id, 'Response Assigned');
    }
    setToastMessage(t('emergency.dispatchedSuccess'));
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSendSOSBroadcast = (emg: Emergency) => {
    setToastMessage(t('emergency.broadcastSuccess'));
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleResolve = (id: string) => {
    onResolveEmergency(id);
    setToastMessage(t('emergency.resolvedSuccess'));
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-5"
    >
      {/* Header */}
      <div className="p-4 rounded-2xl bg-[#FFFCF8] border border-[#EAE3D5] warm-card-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FDE8E8] border border-[#E84D4D]/40 flex items-center justify-center text-[#E84D4D]">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-[#24313A] font-display">
              {t('emergency.title')}
            </h1>
            <p className="text-xs text-[#71808A]">
              {t('emergency.subtitle')}
            </p>
          </div>
        </div>

        <button
          id="report-emergency-primary-btn"
          onClick={onOpenEmergencyModal}
          className="px-4 py-2 rounded-xl bg-[#E84D4D] hover:bg-[#D43F3F] text-white font-bold text-xs flex items-center gap-2 transition-all shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t('emergency.reportSosBtn')}</span>
        </button>
      </div>

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="p-3 rounded-xl bg-[#FFF8EF] border border-[#F29A3D]/40 text-[#24313A] text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#C96A20]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP BANNER: ACTIVE EMERGENCY */}
      {activeEmg ? (
        <div className="p-5 rounded-2xl bg-[#FFFCF8] border-2 border-[#E84D4D] warm-card-shadow space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#EAE3D5]">
            <div className="flex items-center gap-3">
              <span className="w-3.5 h-3.5 rounded-full bg-[#E84D4D] emergency-marker-pulse shrink-0" />
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-extrabold text-[#E84D4D] bg-[#FDE8E8] px-2 py-0.5 rounded-md">
                    {activeEmg.id}
                  </span>
                  <span className="text-[10px] font-bold tracking-widest text-[#E84D4D] uppercase">
                    {t('emergency.activeSos')}
                  </span>
                </div>
                <h2 className="text-lg font-extrabold text-[#24313A] mt-0.5">
                  {activeEmg.type} - {activeEmg.locationName}
                </h2>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-[#FDE8E8] text-[#E84D4D] border border-[#E84D4D]/30">
                {translateSeverity(activeEmg.severity)}
              </span>
              <span className="text-xs text-[#71808A]">{t('map.reported')}: {activeEmg.reportedAt}</span>
              <span className="text-xs text-[#71808A]">| Updated: <strong className="text-[#24313A]">{activeEmg.lastUpdated}</strong></span>
              {onSelectEmergency && (
                <button
                  onClick={() => onSelectEmergency(activeEmg.id)}
                  className="px-2.5 py-1 rounded-lg bg-[#F7F4EF] hover:bg-[#FFE5C7] text-[#24313A] text-xs font-bold border border-[#EAE3D5] flex items-center gap-1 cursor-pointer transition-all ml-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Details</span>
                </button>
              )}
            </div>
          </div>

          {/* All 7 Key Information Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            {/* Field 1: Location */}
            <div className="p-3 rounded-xl bg-[#F7F4EF] border border-[#EAE3D5]">
              <span className="text-[10px] text-[#71808A] uppercase font-bold flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#F29A3D]" />
                Emergency Location
              </span>
              <strong className="text-sm font-extrabold text-[#24313A] block mt-1 truncate">
                {activeEmg.locationName}
              </strong>
              <span className="text-[11px] font-mono text-[#71808A] block mt-0.5">
                {activeEmg.lat.toFixed(4)}°N, {activeEmg.lng.toFixed(4)}°E
              </span>
            </div>

            {/* Field 2: Affected Person */}
            <div className="p-3 rounded-xl bg-[#F7F4EF] border border-[#EAE3D5]">
              <span className="text-[10px] text-[#71808A] uppercase font-bold flex items-center gap-1">
                <User className="w-3 h-3 text-[#E84D4D]" />
                Affected Person
              </span>
              <strong className="text-sm font-extrabold text-[#24313A] block mt-1 truncate">
                {activeEmg.affectedPerson}
              </strong>
              <span className="text-[11px] text-[#71808A] block mt-0.5">
                Reported {activeEmg.reportedAt}
              </span>
            </div>

            {/* Field 3: Nearest Response Team */}
            <div className="p-3 rounded-xl bg-[#F7F4EF] border border-[#EAE3D5]">
              <span className="text-[10px] text-[#71808A] uppercase font-bold flex items-center gap-1">
                <Truck className="w-3 h-3 text-[#39A96B]" />
                {t('emergency.nearestTeam')}
              </span>
              <strong className="text-sm font-extrabold text-[#24313A] block mt-1 truncate">
                {activeEmg.nearestTeamName}
              </strong>
              <span className="text-[11px] text-[#71808A] block mt-0.5">
                {activeEmg.distanceKm} km {t('dashboard.distanceAway')}
              </span>
            </div>

            {/* Field 4: ETA & Current Status */}
            <div className="p-3 rounded-xl bg-[#F7F4EF] border border-[#EAE3D5]">
              <span className="text-[10px] text-[#71808A] uppercase font-bold flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#C96A20]" />
                ETA & Current Status
              </span>
              <strong className="text-sm font-extrabold text-[#E84D4D] block mt-1">
                {activeEmg.etaMinutes} min ETA
              </strong>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-[#E84D4D] live-indicator" />
                <strong className="text-xs font-bold text-[#E84D4D]">{activeEmg.status}</strong>
              </div>
            </div>
          </div>

          {activeEmg.description && (
            <p className="text-xs text-[#71808A] bg-[#F7F4EF] p-2.5 rounded-xl border border-[#EAE3D5]">
              <strong>{t('common.details')}:</strong> {activeEmg.description}
            </p>
          )}

          {/* 4-Stage Response Lifecycle Stepper & Quick Controls */}
          <div className="p-3 rounded-xl bg-[#F7F4EF]/70 border border-[#EAE3D5] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#71808A] uppercase tracking-wider">
                Lifecycle Progression (Click any stage to set status):
              </span>
              <span className="text-[11px] font-bold text-[#E84D4D]">
                Current: {activeEmg.status}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['Active', 'Response Assigned', 'Team En Route', 'Resolved'] as EmergencyStatus[]).map((step, idx) => {
                const isCurrent = activeEmg.status === step;
                return (
                  <button
                    key={step}
                    onClick={() => onUpdateEmergencyStatus?.(activeEmg.id, step)}
                    className={`p-2 rounded-xl text-left border text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
                      isCurrent
                        ? 'bg-[#E84D4D] text-white border-[#E84D4D] shadow-xs'
                        : 'bg-[#FFFCF8] text-[#71808A] border-[#EAE3D5] hover:border-[#F29A3D] hover:text-[#24313A]'
                    }`}
                  >
                    <span>{idx + 1}. {step}</span>
                    {isCurrent && <Activity className="w-3.5 h-3.5 text-white animate-pulse" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Working Actions: [Advance Next] [Dispatch Team] [Send SOS Broadcast] [Mark Resolved] */}
          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            {activeEmg.status !== 'Resolved' && (
              <button
                id="emergency-advance-btn"
                onClick={() => onAdvanceEmergencyStatus?.(activeEmg.id)}
                className="flex-1 py-2 px-3 rounded-xl bg-[#F29A3D] hover:bg-[#FFB45A] text-[#24313A] text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span>Advance Next Status</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              id="emergency-dispatch-btn"
              onClick={() => handleDispatchTeam(activeEmg)}
              className="flex-1 py-2 px-3 rounded-xl bg-[#F7F4EF] hover:bg-[#FFE5C7] border border-[#EAE3D5] text-[#24313A] text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Truck className="w-3.5 h-3.5 text-[#39A96B]" />
              <span>{t('emergency.dispatchTeam')}</span>
            </button>

            <button
              id="emergency-sos-broadcast-btn"
              onClick={() => handleSendSOSBroadcast(activeEmg)}
              className="flex-1 py-2 px-3 rounded-xl bg-[#F7F4EF] hover:bg-[#FDE8E8] border border-[#EAE3D5] text-[#24313A] text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Radio className="w-3.5 h-3.5 text-[#E84D4D]" />
              <span>{t('emergency.broadcastSos')}</span>
            </button>

            <button
              id="emergency-mark-resolved-btn"
              onClick={() => handleResolve(activeEmg.id)}
              className="flex-1 py-2 px-3 rounded-xl bg-[#39A96B] hover:bg-[#2e8a56] text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{t('emergency.resolveEmergency')}</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-2xl bg-[#FFFCF8] border border-[#EAE3D5] warm-card-shadow text-center space-y-2">
          <CheckCircle2 className="w-8 h-8 text-[#39A96B] mx-auto" />
          <h3 className="text-base font-bold text-[#24313A]">{t('emergency.noDistress')}</h3>
        </div>
      )}

      {/* Main Grid: Interactive Emergency Map (Left/Center) + Emergency Log (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Real GIS Tactical Map */}
        <div className="lg:col-span-7 space-y-3">
          <div className="p-4 rounded-2xl bg-[#FFFCF8] border border-[#EAE3D5] warm-card-shadow space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[#E84D4D] font-bold uppercase tracking-wider">{t('emergency.activeSos')}</span>
                <h4 className="text-sm font-bold text-[#24313A]">Tactical Response GIS</h4>
              </div>
              <span className="text-xs text-[#71808A]">{t('simulation.telemetryActive')}</span>
            </div>

            <PolarMap
              personnel={personnel}
              vehicles={vehicles}
              cargo={cargo}
              camps={camps}
              emergencies={emergencies}
              activeFilter="emergency"
              onFilterChange={onFilterChange}
              onSelectEntity={(type, id) => {
                if (type === 'emergency' && onSelectEmergency) {
                  onSelectEmergency(id);
                }
              }}
              heightClass="h-[460px] sm:h-[500px]"
              activeEmergencyRoute={activeEmg?.responseRoute}
            />
          </div>
        </div>

        {/* EMERGENCY LOG: Cards of active & past emergencies with all 7 fields */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-bold text-[#71808A] uppercase tracking-wider px-1">
            Emergency Incidents ({emergencies.length})
          </div>

          <div className="space-y-2.5">
            {emergencies.map(emg => {
              const isResolved = emg.status === 'Resolved';
              return (
                <div
                  key={emg.id}
                  className={`p-4 rounded-xl border text-left transition-all warm-card-shadow space-y-2.5 ${
                    !isResolved
                      ? 'bg-[#FFFCF8] border-[#E84D4D]/60 ring-1 ring-[#E84D4D]/30'
                      : 'bg-[#FFFCF8] border-[#EAE3D5]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold text-[#E84D4D] bg-[#FDE8E8] px-1.5 py-0.5 rounded">
                        {emg.id}
                      </span>
                      <span className="text-xs font-extrabold text-[#24313A]">
                        {emg.type}
                      </span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      !isResolved
                        ? 'bg-[#FDE8E8] text-[#E84D4D]'
                        : 'bg-[#E8F7EE] text-[#39A96B]'
                    }`}>
                      ● {emg.status}
                    </span>
                  </div>

                  {/* Location & Affected Person */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-[#71808A] pt-1">
                    <div className="flex items-center gap-1 truncate">
                      <MapPin className="w-3.5 h-3.5 text-[#F29A3D] shrink-0" />
                      <span className="font-semibold text-[#24313A] truncate">{emg.locationName}</span>
                    </div>
                    <div className="flex items-center gap-1 truncate">
                      <User className="w-3.5 h-3.5 text-[#E84D4D] shrink-0" />
                      <span className="truncate">{emg.affectedPerson}</span>
                    </div>
                  </div>

                  {/* Nearest Team & ETA */}
                  <div className="flex items-center justify-between text-[11px] text-[#71808A] pt-1 border-t border-[#EAE3D5]">
                    <span>Team: <strong className="text-[#24313A]">{emg.nearestTeamName}</strong></span>
                    <span className="font-bold text-[#C96A20]">
                      {isResolved ? 'Resolved' : `${emg.etaMinutes}m ETA`}
                    </span>
                  </div>

                  {/* Last updated & Actions */}
                  <div className="flex items-center justify-between text-[10px] text-[#71808A] pt-1 border-t border-[#EAE3D5]/60">
                    <span>Updated: {emg.lastUpdated}</span>
                    <span>Reported: {emg.reportedAt}</span>
                  </div>

                  {/* Action buttons */}
                  <div className="pt-1 flex gap-2">
                    {onSelectEmergency && (
                      <button
                        onClick={() => onSelectEmergency(emg.id)}
                        className="flex-1 py-1 text-xs font-bold text-[#24313A] bg-[#F7F4EF] hover:bg-[#FFE5C7] rounded-lg transition-colors cursor-pointer border border-[#EAE3D5]"
                      >
                        Details
                      </button>
                    )}
                    <button
                      onClick={() => onFocusCoordinates([emg.lat, emg.lng])}
                      className="flex-1 py-1 text-xs font-bold text-[#24313A] bg-[#F7F4EF] hover:bg-[#FFE5C7] rounded-lg transition-colors cursor-pointer"
                    >
                      {t('personnelModal.viewOnMap')}
                    </button>
                    {!isResolved && (
                      <button
                        onClick={() => handleResolve(emg.id)}
                        className="flex-1 py-1 text-xs font-bold text-white bg-[#39A96B] hover:bg-[#2e8a56] rounded-lg transition-colors cursor-pointer"
                      >
                        {t('emergency.resolveEmergency')}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
