import React from 'react';
import { Expedition, Personnel } from '../types';
import { 
  X, 
  Compass, 
  Calendar, 
  Users, 
  MapPin, 
  Play, 
  CheckCircle2, 
  Clock, 
  Mountain, 
  Navigation as NavigationIcon,
  Flag,
  ArrowRight,
  ShieldAlert,
  Radio
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ExpeditionDetailModalProps {
  expedition: Expedition | null;
  personnel: Personnel[];
  isOpen: boolean;
  onClose: () => void;
  onStartExpedition?: (id: string) => void;
  onTrackOnMap?: (expedition: Expedition) => void;
}

export const ExpeditionDetailModal: React.FC<ExpeditionDetailModalProps> = ({
  expedition,
  personnel,
  isOpen,
  onClose,
  onStartExpedition,
  onTrackOnMap
}) => {
  // Prevent background scrolling and lock body when modal is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !expedition) return null;

  // Filter assigned personnel matching teamMemberIds or teamMemberNames
  const assignedPersonnel = personnel.filter(p => 
    (expedition.teamMemberIds && expedition.teamMemberIds.includes(p.id)) ||
    (expedition.teamMemberNames && expedition.teamMemberNames.includes(p.name)) ||
    p.name === expedition.lead
  );

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-[#E8F7EE] text-[#39A96B] border-[#A5D6A7]';
      case 'Planning':
      case 'Planned':
        return 'bg-[#FFF8EF] text-[#C96A20] border-[#F29A3D]/40';
      case 'Completed':
        return 'bg-[#F0F4F8] text-[#5A6872] border-[#CBD5E1]';
      default:
        return 'bg-[#F7F4EF] text-[#71808A] border-[#EAE3D5]';
    }
  };

  const getPersonnelStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
      case 'In Transit':
      case 'Moving':
        return 'bg-[#E8F7EE] text-[#39A96B] border-[#A5D6A7]';
      case 'Standby':
      case 'At Base':
        return 'bg-[#FFF8EF] text-[#C96A20] border-[#F29A3D]/30';
      case 'Emergency':
        return 'bg-[#FDE8E8] text-[#E84D4D] border-[#FCA5A5]';
      default:
        return 'bg-[#F7F4EF] text-[#71808A] border-[#EAE3D5]';
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'TBD';
    return dateStr;
  };

  return (
    <AnimatePresence>
      <div 
        id="expedition-detail-modal-overlay"
        className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-[#24313A]/75 backdrop-blur-sm overflow-y-auto"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.2 }}
          className="relative z-10 w-full max-w-3xl rounded-2xl bg-[#FFFCF8] border border-[#EAE3D5] warm-card-shadow overflow-hidden flex flex-col max-h-[90vh] shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="flex items-start justify-between p-4 sm:p-5 border-b border-[#EAE3D5] bg-[#FFFBF5]">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-[#FFE5C7] border border-[#F29A3D]/40 flex items-center justify-center text-[#C96A20] shrink-0">
                <Compass className="w-6 h-6" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-black text-[#C96A20] bg-[#FFE5C7] px-2.5 py-0.5 rounded-md border border-[#F29A3D]/30">
                    {expedition.code}
                  </span>
                  <span className={`text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-md border ${getStatusBadgeStyle(expedition.status)}`}>
                    ● {expedition.status === 'Planned' ? 'Planning' : expedition.status}
                  </span>
                  <span className="text-[11px] font-semibold text-[#71808A] bg-[#F7F4EF] px-2 py-0.5 rounded-md border border-[#EAE3D5]">
                    {expedition.region}
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-black text-[#24313A] mt-1 font-display">
                  {expedition.title}
                </h2>
              </div>
            </div>

            <button
              id="close-expedition-detail-modal-btn"
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#71808A] hover:text-[#24313A] hover:bg-[#F7F4EF] transition-colors cursor-pointer shrink-0 ml-2"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Content - Scrollable */}
          <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
            {/* 1. Overview Hero Banner: Progress & Key Metrics */}
            <div className="p-4 rounded-xl bg-[#FFF8EF] border border-[#F29A3D]/30 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#71808A] tracking-wider block">
                    Traverse Progress
                  </span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-3xl font-black text-[#24313A] font-mono">
                      {expedition.progress}%
                    </span>
                    <span className="text-xs font-bold text-[#71808A]">
                      completed
                    </span>
                  </div>
                </div>

                {/* Status action buttons inside overview */}
                <div className="flex items-center gap-2">
                  {expedition.status === 'Planning' && onStartExpedition && (
                    <button
                      id="modal-start-expedition-btn"
                      onClick={() => {
                        onStartExpedition(expedition.id);
                      }}
                      className="px-3.5 py-1.5 rounded-lg bg-[#F29A3D] hover:bg-[#FFB45A] text-[#24313A] text-xs font-extrabold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Start Expedition</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-[#EAE3D5] rounded-full h-2.5 overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${
                    expedition.status === 'Completed' 
                      ? 'bg-[#39A96B]' 
                      : expedition.status === 'Active' 
                      ? 'bg-[#F29A3D]' 
                      : 'bg-[#71808A]'
                  }`}
                  style={{ width: `${expedition.progress}%` }}
                />
              </div>
            </div>

            {/* 2. Overview Info Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              {/* Leader */}
              <div className="p-3 rounded-xl bg-[#F7F4EF] border border-[#EAE3D5]">
                <span className="text-[10px] text-[#71808A] uppercase font-bold flex items-center gap-1">
                  <Users className="w-3 h-3 text-[#F29A3D]" />
                  Expedition Leader
                </span>
                <strong className="text-xs font-bold text-[#24313A] block mt-1">
                  {expedition.lead}
                </strong>
              </div>

              {/* Start Date */}
              <div className="p-3 rounded-xl bg-[#F7F4EF] border border-[#EAE3D5]">
                <span className="text-[10px] text-[#71808A] uppercase font-bold flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-[#39A96B]" />
                  Start Date
                </span>
                <strong className="text-xs font-mono font-bold text-[#24313A] block mt-1">
                  {formatDate(expedition.startDate)}
                </strong>
              </div>

              {/* End Date */}
              <div className="p-3 rounded-xl bg-[#F7F4EF] border border-[#EAE3D5]">
                <span className="text-[10px] text-[#71808A] uppercase font-bold flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-[#0284C7]" />
                  End Date
                </span>
                <strong className="text-xs font-mono font-bold text-[#24313A] block mt-1">
                  {formatDate(expedition.endDate)}
                </strong>
              </div>

              {/* Team Size */}
              <div className="p-3 rounded-xl bg-[#F7F4EF] border border-[#EAE3D5]">
                <span className="text-[10px] text-[#71808A] uppercase font-bold flex items-center gap-1">
                  <Users className="w-3 h-3 text-[#8B5CF6]" />
                  Team Size
                </span>
                <strong className="text-xs font-bold text-[#24313A] block mt-1">
                  {assignedPersonnel.length || expedition.assignedTeamCount} Specialists
                </strong>
              </div>
            </div>

            {/* 3. Current / Next Checkpoint Highlight Banner */}
            <div className="p-3.5 rounded-xl bg-[#FFFCF8] border border-[#EAE3D5] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#E8F7EE] border border-[#A5D6A7] flex items-center justify-center text-[#39A96B] shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#71808A] block">
                    Current Checkpoint
                  </span>
                  <span className="text-xs font-extrabold text-[#24313A]">
                    {expedition.currentCheckpoint || expedition.camps[0] || 'Base Camp'}
                  </span>
                </div>
              </div>

              <ArrowRight className="w-4 h-4 text-[#F29A3D] hidden sm:block shrink-0" />

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#FFE5C7] border border-[#F29A3D]/40 flex items-center justify-center text-[#C96A20] shrink-0">
                  <Flag className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#71808A] block">
                    Next Checkpoint
                  </span>
                  <span className="text-xs font-extrabold text-[#C96A20]">
                    {expedition.nextCheckpoint || expedition.camps[1] || 'Ice Camp'}
                  </span>
                </div>
              </div>

              <div className="sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-[#EAE3D5]">
                <span className="text-[10px] uppercase font-bold text-[#71808A] block">
                  Route Distance
                </span>
                <span className="text-xs font-mono font-bold text-[#24313A]">
                  {expedition.distanceKm || 84} km • {expedition.estimatedDurationDays || 6} days
                </span>
              </div>
            </div>

            {/* 4. Checkpoints Sequential Trail */}
            <div className="p-3.5 rounded-xl bg-[#F7F4EF] border border-[#EAE3D5] space-y-2">
              <span className="text-xs font-bold uppercase text-[#24313A] tracking-wider block">
                Route Waypoints & Checkpoints
              </span>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                {expedition.camps.map((campName, idx) => {
                  const isCurrent = campName === expedition.currentCheckpoint;
                  const isNext = campName === expedition.nextCheckpoint;

                  return (
                    <React.Fragment key={`cp-${idx}`}>
                      <div className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 ${
                        isCurrent
                          ? 'bg-[#E8F7EE] text-[#2E7D32] border-[#A5D6A7]'
                          : isNext
                          ? 'bg-[#FFE5C7] text-[#C96A20] border-[#F29A3D]/50'
                          : 'bg-[#FFFCF8] text-[#24313A] border-[#EAE3D5]'
                      }`}>
                        <span className="font-mono text-[10px] opacity-70">#{idx + 1}</span>
                        <span>{campName}</span>
                        {isCurrent && <span className="text-[10px] font-black uppercase text-[#2E7D32]">• Current</span>}
                        {isNext && <span className="text-[10px] font-black uppercase text-[#C96A20]">• Next</span>}
                      </div>
                      {idx < expedition.camps.length - 1 && (
                        <ArrowRight className="w-3.5 h-3.5 text-[#71808A] shrink-0" />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            {/* 5. Assigned Team Members Roster */}
            <div className="p-3.5 rounded-xl bg-[#FFFCF8] border border-[#EAE3D5] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-[#24313A] tracking-wider flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#F29A3D]" />
                  Assigned Team Members ({assignedPersonnel.length})
                </span>
                <span className="text-[11px] text-[#71808A]">
                  Synced from Svalbard Personnel
                </span>
              </div>

              {assignedPersonnel.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {assignedPersonnel.map((person) => {
                    const isLead = person.name === expedition.lead;

                    return (
                      <div
                        key={person.id}
                        className="p-2.5 rounded-lg bg-[#F7F4EF] border border-[#EAE3D5] flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          <div className={`w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold shrink-0 ${
                            isLead ? 'bg-[#FFE5C7] text-[#C96A20]' : 'bg-[#EAE3D5] text-[#24313A]'
                          }`}>
                            {person.name.charAt(0)}
                          </div>
                          <div className="truncate">
                            <div className="flex items-center gap-1.5 truncate">
                              <span className="text-xs font-bold text-[#24313A] truncate">
                                {person.name}
                              </span>
                              {isLead && (
                                <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-[#FFE5C7] text-[#C96A20] border border-[#F29A3D]/30 shrink-0">
                                  Lead
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-[#71808A] block truncate">
                              {person.role} • {person.location}
                            </span>
                          </div>
                        </div>

                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border shrink-0 ${getPersonnelStatusBadge(person.status)}`}>
                          ● {person.status}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-3 text-center rounded-lg bg-[#F7F4EF] text-xs text-[#71808A]">
                  Lead: {expedition.lead} (Specialists assigned on deployment)
                </div>
              )}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="p-3 sm:p-4 border-t border-[#EAE3D5] bg-[#FFFBF5] flex flex-wrap items-center justify-between gap-2">
            <div className="text-[11px] text-[#71808A]">
              Expedition ID: <strong className="font-mono text-[#24313A]">{expedition.code}</strong>
            </div>

            <div className="flex items-center gap-2">
              {expedition.status === 'Planning' && onStartExpedition && (
                <button
                  id="modal-footer-start-expedition-btn"
                  onClick={() => {
                    onStartExpedition(expedition.id);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-[#F29A3D] hover:bg-[#FFB45A] text-[#24313A] text-xs font-extrabold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Start Expedition</span>
                </button>
              )}

              {onTrackOnMap && (
                <button
                  id="modal-footer-track-btn"
                  onClick={() => {
                    onTrackOnMap(expedition);
                    onClose();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-[#FFFCF8] hover:bg-[#F7F4EF] border border-[#EAE3D5] text-[#24313A] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <NavigationIcon className="w-3.5 h-3.5 text-[#4AA9D8]" />
                  <span>Track on Map</span>
                </button>
              )}

              <button
                onClick={onClose}
                className="px-3 py-1.5 rounded-lg bg-[#F7F4EF] hover:bg-[#EAE3D5] text-[#24313A] text-xs font-bold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
