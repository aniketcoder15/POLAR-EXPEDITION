import React, { useState } from 'react';
import { Personnel } from '../types';
import { PREDEFINED_ROUTES, PredefinedRoute } from '../services/dataService';
import { 
  X, 
  Compass, 
  Users, 
  Calendar, 
  MapPin, 
  Plus, 
  Check, 
  Route as RouteIcon,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CreateExpeditionModalProps {
  personnel: Personnel[];
  isOpen: boolean;
  onClose: () => void;
  onCreateExpedition: (params: {
    title: string;
    lead: string;
    startDate: string;
    endDate: string;
    teamMemberIds: string[];
    routeId: string;
  }) => void;
}

export const CreateExpeditionModal: React.FC<CreateExpeditionModalProps> = ({
  personnel,
  isOpen,
  onClose,
  onCreateExpedition
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

  // Pre-fill sensible default dates: today and today + 14 days
  const todayStr = new Date().toISOString().split('T')[0];
  const defaultEnd = new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0];

  const [title, setTitle] = useState('');
  const [lead, setLead] = useState(personnel[0]?.name || 'Dr. Evelyn Vance');
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(defaultEnd);
  const [selectedRouteId, setSelectedRouteId] = useState<string>(PREDEFINED_ROUTES[0].id);
  const [selectedPersonnelIds, setSelectedPersonnelIds] = useState<string[]>(() => {
    // Pick the lead or first 2-3 personnel as initial selection
    return personnel.slice(0, 3).map(p => p.id);
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentRoute = PREDEFINED_ROUTES.find(r => r.id === selectedRouteId) || PREDEFINED_ROUTES[0];

  const handleTogglePersonnel = (id: string) => {
    if (selectedPersonnelIds.includes(id)) {
      if (selectedPersonnelIds.length === 1) {
        setErrorMessage('Expedition must have at least one team member.');
        return;
      }
      setSelectedPersonnelIds(prev => prev.filter(pId => pId !== id));
      setErrorMessage(null);
    } else {
      setSelectedPersonnelIds(prev => [...prev, id]);
      setErrorMessage(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMessage('Please enter an expedition name.');
      return;
    }

    if (!startDate || !endDate) {
      setErrorMessage('Please specify both start and end dates.');
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      setErrorMessage('End date cannot precede start date.');
      return;
    }

    onCreateExpedition({
      title: title.trim(),
      lead,
      startDate,
      endDate,
      teamMemberIds: selectedPersonnelIds,
      routeId: selectedRouteId
    });

    onClose();
  };

  return (
    <AnimatePresence>
      <div 
        id="create-expedition-modal-overlay"
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
          className="relative z-10 w-full max-w-2xl rounded-2xl bg-[#FFFCF8] border border-[#EAE3D5] warm-card-shadow overflow-hidden flex flex-col max-h-[90vh] shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#EAE3D5] bg-[#FFFBF5]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FFE5C7] border border-[#F29A3D]/40 flex items-center justify-center text-[#C96A20] shadow-xs">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-[#24313A] font-display">
                  Plan New Expedition
                </h2>
                <p className="text-xs text-[#71808A]">
                  Configure traverse route, leadership, and team roster
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#71808A] hover:text-[#24313A] hover:bg-[#F7F4EF] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
            {errorMessage && (
              <div className="p-3 rounded-xl bg-[#FDE8E8] border border-[#FCA5A5] text-[#E84D4D] text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* 1. Expedition Name */}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-[#71808A] tracking-wider block">
                Expedition Name *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Ice Shelf Acoustic Survey"
                className="w-full px-3.5 py-2 rounded-xl bg-[#F7F4EF] border border-[#EAE3D5] text-xs font-bold text-[#24313A] placeholder-[#71808A] focus:outline-none focus:border-[#F29A3D] focus:ring-1 focus:ring-[#F29A3D]"
              />
            </div>

            {/* 2. Leader & Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Leader */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-[#71808A] tracking-wider block">
                  Expedition Leader *
                </label>
                <select
                  value={lead}
                  onChange={e => setLead(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#F7F4EF] border border-[#EAE3D5] text-xs font-bold text-[#24313A] focus:outline-none focus:border-[#F29A3D]"
                >
                  {personnel.map(p => (
                    <option key={p.id} value={p.name}>
                      {p.name} ({p.role})
                    </option>
                  ))}
                </select>
              </div>

              {/* Start Date */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-[#71808A] tracking-wider block">
                  Start Date *
                </label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#F7F4EF] border border-[#EAE3D5] text-xs font-bold text-[#24313A] focus:outline-none focus:border-[#F29A3D]"
                />
              </div>

              {/* End Date */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-[#71808A] tracking-wider block">
                  End Date *
                </label>
                <input
                  type="date"
                  required
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#F7F4EF] border border-[#EAE3D5] text-xs font-bold text-[#24313A] focus:outline-none focus:border-[#F29A3D]"
                />
              </div>
            </div>

            {/* 3. Select Route */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-[#71808A] tracking-wider block flex items-center justify-between">
                <span>Select Traverse Route *</span>
                <span className="text-[11px] font-normal text-[#C96A20]">
                  {currentRoute.distanceKm} km • {currentRoute.durationDays} days est.
                </span>
              </label>

              <select
                value={selectedRouteId}
                onChange={e => setSelectedRouteId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F4EF] border border-[#EAE3D5] text-xs font-bold text-[#24313A] focus:outline-none focus:border-[#F29A3D]"
              >
                {PREDEFINED_ROUTES.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.distanceKm} km)
                  </option>
                ))}
              </select>

              {/* Waypoints preview chip chain */}
              <div className="p-2.5 rounded-xl bg-[#FFF8EF] border border-[#F29A3D]/20 text-[11px] flex flex-wrap items-center gap-1.5 text-[#24313A]">
                <span className="font-bold text-[#C96A20]">Waypoints:</span>
                {currentRoute.camps.map((camp, idx) => (
                  <span key={camp} className="flex items-center gap-1">
                    <span className="bg-[#FFFCF8] px-2 py-0.5 rounded border border-[#EAE3D5] font-medium">
                      {camp}
                    </span>
                    {idx < currentRoute.camps.length - 1 && <span className="text-[#71808A]">➔</span>}
                  </span>
                ))}
              </div>
            </div>

            {/* 4. Select Team Members from Existing Personnel */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase text-[#71808A] tracking-wider block">
                  Select Team Members ({selectedPersonnelIds.length} selected) *
                </label>
                <span className="text-[11px] text-[#71808A]">
                  Click to add/remove specialists
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1 border border-[#EAE3D5] rounded-xl bg-[#F7F4EF]/50">
                {personnel.map(person => {
                  const isSelected = selectedPersonnelIds.includes(person.id);
                  const isLeadSelected = person.name === lead;

                  return (
                    <div
                      key={person.id}
                      onClick={() => handleTogglePersonnel(person.id)}
                      className={`p-2 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between gap-2 ${
                        isSelected
                          ? 'bg-[#FFFCF8] border-[#F29A3D] ring-1 ring-[#F29A3D]/40'
                          : 'bg-[#FFFCF8]/60 border-[#EAE3D5] opacity-75 hover:opacity-100 hover:border-[#F29A3D]/40'
                      }`}
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 text-white ${
                          isSelected ? 'bg-[#F29A3D]' : 'border border-[#CBD5E1] bg-white'
                        }`}>
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                        </div>
                        <div className="truncate">
                          <div className="flex items-center gap-1 truncate">
                            <span className="font-bold text-[#24313A] truncate">{person.name}</span>
                            {isLeadSelected && (
                              <span className="text-[9px] font-extrabold uppercase px-1 rounded bg-[#FFE5C7] text-[#C96A20]">
                                Lead
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-[#71808A] block truncate">{person.role} • {person.location}</span>
                        </div>
                      </div>

                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${
                        person.status === 'Active'
                          ? 'bg-[#E8F7EE] text-[#39A96B]'
                          : 'bg-[#F7F4EF] text-[#71808A]'
                      }`}>
                        {person.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#EAE3D5]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-[#F7F4EF] hover:bg-[#EAE3D5] text-[#24313A] text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                id="submit-create-expedition-btn"
                className="px-5 py-2 rounded-xl bg-[#F29A3D] hover:bg-[#FFB45A] text-[#24313A] text-xs font-extrabold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Expedition (Planning)</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
