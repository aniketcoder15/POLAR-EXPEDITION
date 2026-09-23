import React from 'react';
import { 
  X, 
  AlertTriangle, 
  MapPin, 
  User, 
  Truck, 
  Clock, 
  ShieldCheck, 
  ArrowRight, 
  Activity,
  Compass,
  Radio
} from 'lucide-react';
import { Emergency, EmergencyStatus } from '../types';
import { useTranslation } from '../i18n';

interface EmergencyDetailModalProps {
  emergency: Emergency | null;
  onClose: () => void;
  onUpdateStatus: (id: string, status: EmergencyStatus) => void;
  onAdvanceStatus: (id: string) => void;
  onFocusCoordinates?: (coords: [number, number]) => void;
}

const LIFECYCLE_STEPS: EmergencyStatus[] = [
  'Active',
  'Response Assigned',
  'Team En Route',
  'Resolved'
];

export const EmergencyDetailModal: React.FC<EmergencyDetailModalProps> = ({
  emergency,
  onClose,
  onUpdateStatus,
  onAdvanceStatus,
  onFocusCoordinates
}) => {
  const { t, translateSeverity } = useTranslation();

  if (!emergency) return null;

  const currentIndex = LIFECYCLE_STEPS.indexOf(emergency.status);
  const nextStatus = currentIndex < LIFECYCLE_STEPS.length - 1 ? LIFECYCLE_STEPS[currentIndex + 1] : null;
  const isResolved = emergency.status === 'Resolved';

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#24313A]/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        id="emergency-detail-modal"
        className="w-full max-w-lg rounded-2xl bg-[#FFFCF8] border-2 border-[#E84D4D] warm-card-shadow overflow-hidden text-[#24313A]"
      >
        {/* Header with Emergency ID, Type, Severity */}
        <div className="p-5 bg-gradient-to-r from-[#FFFCF8] to-[#FFF5F5] border-b border-[#EAE3D5] flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
              isResolved ? 'bg-[#E8F7EE] text-[#39A96B]' : 'bg-[#FDE8E8] text-[#E84D4D]'
            }`}>
              <AlertTriangle className={`w-6 h-6 ${!isResolved ? 'animate-pulse' : ''}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-[#E84D4D] bg-[#FDE8E8] px-2 py-0.5 rounded-md">
                  {emergency.id}
                </span>
                <span className="text-[11px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-[#FFE5C7] text-[#C96A20]">
                  {emergency.type}
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#FDE8E8] text-[#E84D4D]">
                  {translateSeverity(emergency.severity)}
                </span>
              </div>
              <h2 className="text-base font-extrabold text-[#24313A] mt-1">
                {emergency.locationName}
              </h2>
            </div>
          </div>

          <button 
            id="close-emergency-detail-modal-btn"
            onClick={onClose}
            className="p-1 rounded-lg text-[#71808A] hover:text-[#24313A] hover:bg-[#F7F4EF] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4-Stage Response Lifecycle Stepper & Controls */}
        <div className="p-5 border-b border-[#EAE3D5] bg-[#F7F4EF]/70">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-[#71808A] uppercase tracking-wider">
              Response Lifecycle (Active → Response Assigned → Team En Route → Resolved)
            </span>
            <span className="text-xs font-extrabold text-[#E84D4D] flex items-center gap-1">
              {!isResolved && <span className="w-2 h-2 rounded-full bg-[#E84D4D] emergency-marker-pulse" />}
              {emergency.status}
            </span>
          </div>

          {/* Stepper Buttons (Interactive: Click any stage to move status) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            {LIFECYCLE_STEPS.map((step, idx) => {
              const isCurrent = emergency.status === step;
              const isPast = currentIndex > idx;
              return (
                <button
                  key={step}
                  onClick={() => onUpdateStatus(emergency.id, step)}
                  className={`px-2.5 py-2 rounded-xl text-left border text-xs font-bold transition-all cursor-pointer flex flex-col justify-between gap-1 ${
                    isCurrent
                      ? 'bg-[#E84D4D] text-white border-[#E84D4D] shadow-sm'
                      : isPast
                      ? 'bg-[#E8F7EE] text-[#39A96B] border-[#39A96B]/30 hover:bg-[#D4EEDB]'
                      : 'bg-[#FFFCF8] text-[#71808A] border-[#EAE3D5] hover:border-[#F29A3D]'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[10px] opacity-75">Stage {idx + 1}</span>
                    {isPast && <ShieldCheck className="w-3.5 h-3.5 text-[#39A96B]" />}
                    {isCurrent && <Activity className="w-3.5 h-3.5 text-white animate-pulse" />}
                  </div>
                  <span className="leading-tight text-[11px] font-extrabold">{step}</span>
                </button>
              );
            })}
          </div>

          {/* Advance Action Controls */}
          <div className="mt-3 flex items-center justify-between gap-2 pt-2 border-t border-[#EAE3D5]/80">
            <span className="text-[11px] text-[#71808A]">
              Last updated: <strong className="text-[#24313A]">{emergency.lastUpdated}</strong>
            </span>
            {nextStatus ? (
              <button
                id="advance-emergency-status-btn"
                onClick={() => onAdvanceStatus(emergency.id)}
                className="px-3.5 py-1.5 rounded-xl bg-[#F29A3D] hover:bg-[#FFB45A] text-[#24313A] text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <span>Advance to: {nextStatus}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={() => onUpdateStatus(emergency.id, 'Active')}
                className="px-3 py-1.5 rounded-xl bg-[#F7F4EF] hover:bg-[#FFE5C7] text-[#24313A] text-xs font-semibold transition-all cursor-pointer"
              >
                Reopen Incident
              </button>
            )}
          </div>
        </div>

        {/* 7 Required Fields Grid */}
        <div className="p-5 space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Field 1: Emergency Location */}
            <div className="p-3 rounded-xl bg-[#F7F4EF] border border-[#EAE3D5]">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#71808A] uppercase">
                <MapPin className="w-3.5 h-3.5 text-[#F29A3D]" />
                <span>Emergency Location</span>
              </div>
              <strong className="text-sm font-extrabold text-[#24313A] block mt-1">
                {emergency.locationName}
              </strong>
              <span className="text-[11px] font-mono text-[#71808A]">
                {emergency.lat.toFixed(4)}°N, {emergency.lng.toFixed(4)}°E
              </span>
            </div>

            {/* Field 2: Affected Person */}
            <div className="p-3 rounded-xl bg-[#F7F4EF] border border-[#EAE3D5]">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#71808A] uppercase">
                <User className="w-3.5 h-3.5 text-[#E84D4D]" />
                <span>Affected Person</span>
              </div>
              <strong className="text-sm font-extrabold text-[#24313A] block mt-1">
                {emergency.affectedPerson}
              </strong>
              <span className="text-[11px] text-[#71808A]">Reported: {emergency.reportedAt}</span>
            </div>

            {/* Field 3: Nearest Response Team / Personnel */}
            <div className="p-3 rounded-xl bg-[#F7F4EF] border border-[#EAE3D5]">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#71808A] uppercase">
                <Truck className="w-3.5 h-3.5 text-[#39A96B]" />
                <span>Nearest Response Team</span>
              </div>
              <strong className="text-sm font-extrabold text-[#24313A] block mt-1">
                {emergency.nearestTeamName}
              </strong>
              <span className="text-[11px] text-[#71808A]">{emergency.distanceKm} km distance</span>
            </div>

            {/* Field 4: ETA */}
            <div className="p-3 rounded-xl bg-[#F7F4EF] border border-[#EAE3D5]">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#71808A] uppercase">
                <Clock className="w-3.5 h-3.5 text-[#C96A20]" />
                <span>Estimated Time of Arrival (ETA)</span>
              </div>
              <strong className="text-sm font-extrabold text-[#E84D4D] block mt-1">
                {isResolved ? 'Arrived / Cleared' : `${emergency.etaMinutes} minutes`}
              </strong>
              <span className="text-[11px] text-[#71808A]">
                Ground route: {emergency.responseRoute?.length || 3} waypoints
              </span>
            </div>
          </div>

          {/* Description / Medical Notes */}
          {emergency.description && (
            <div className="p-3 rounded-xl bg-[#F7F4EF] border border-[#EAE3D5] text-xs">
              <span className="text-[10px] font-bold text-[#71808A] uppercase block mb-1">
                Incident Description & Field Notes
              </span>
              <p className="text-[#24313A] leading-relaxed font-medium">
                {emergency.description}
              </p>
            </div>
          )}

          {/* Footer Actions: Map Focus & Close */}
          <div className="pt-2 flex items-center justify-between gap-2 border-t border-[#EAE3D5]">
            {onFocusCoordinates && (
              <button
                id="focus-emergency-on-gis-btn"
                onClick={() => {
                  onFocusCoordinates([emergency.lat, emergency.lng]);
                  onClose();
                }}
                className="px-4 py-2 rounded-xl bg-[#F7F4EF] hover:bg-[#FFE5C7] text-[#24313A] text-xs font-bold border border-[#EAE3D5] flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Compass className="w-4 h-4 text-[#4AA9D8]" />
                <span>Focus on GIS Map</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#24313A] hover:bg-[#344450] text-white text-xs font-bold transition-all ml-auto cursor-pointer"
            >
              {t('common.close')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
