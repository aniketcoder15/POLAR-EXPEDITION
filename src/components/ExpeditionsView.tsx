import React, { useState, useMemo } from 'react';
import { Expedition, Personnel, Vehicle, CargoItem, Camp, Emergency, MarkerFilter, ExpeditionStatus } from '../types';
import { PolarMap } from './PolarMap';
import { ExpeditionDetailModal } from './ExpeditionDetailModal';
import { CreateExpeditionModal } from './CreateExpeditionModal';
import { dataService } from '../services/dataService';
import { 
  Compass, 
  Users, 
  MapPin, 
  Plus, 
  Play, 
  CheckCircle2, 
  Clock, 
  Calendar,
  ArrowRight,
  Flag,
  Navigation as NavigationIcon,
  Eye,
  SlidersHorizontal,
  Check,
  Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from '../i18n';

interface ExpeditionsViewProps {
  expeditions: Expedition[];
  personnel: Personnel[];
  vehicles: Vehicle[];
  cargo: CargoItem[];
  camps: Camp[];
  emergencies: Emergency[];
  activeFilter: MarkerFilter;
  onFilterChange: (filter: MarkerFilter) => void;
  onFocusCoordinates: (coords: [number, number]) => void;
  onStartExpedition?: (id: string) => void;
  onCreateExpedition?: (params: {
    title: string;
    lead: string;
    startDate: string;
    endDate: string;
    teamMemberIds: string[];
    routeId: string;
  }) => void;
  onTrackOnMap?: (expedition: Expedition) => void;
}

export const ExpeditionsView: React.FC<ExpeditionsViewProps> = ({
  expeditions,
  personnel,
  vehicles,
  cargo,
  camps,
  emergencies,
  activeFilter,
  onFilterChange,
  onFocusCoordinates,
  onStartExpedition,
  onCreateExpedition,
  onTrackOnMap
}) => {
  const { t } = useTranslation();

  // Active / Selected state for GIS Route Map
  const [selectedExpedition, setSelectedExpedition] = useState<Expedition>(() => expeditions[0] || null);
  
  // Modals state
  const [inspectingExpedition, setInspectingExpedition] = useState<Expedition | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Filters & Search
  const [statusFilter, setStatusFilter] = useState<'All' | 'Planning' | 'Active' | 'Completed'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Toast / Feedback message
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const showToast = (message: string) => {
    setActionFeedback(message);
    setTimeout(() => setActionFeedback(null), 3500);
  };

  // Filtered roster of expeditions
  const filteredExpeditions = useMemo(() => {
    return expeditions.filter(exp => {
      const expStatus = exp.status === 'Planned' ? 'Planning' : exp.status;
      if (statusFilter !== 'All' && expStatus !== statusFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesCode = exp.code.toLowerCase().includes(q);
        const matchesTitle = exp.title.toLowerCase().includes(q);
        const matchesLead = exp.lead.toLowerCase().includes(q);
        const matchesRegion = exp.region.toLowerCase().includes(q);
        if (!matchesCode && !matchesTitle && !matchesLead && !matchesRegion) {
          return false;
        }
      }
      return true;
    });
  }, [expeditions, statusFilter, searchQuery]);

  // Keep selectedExpedition in sync if list updates
  React.useEffect(() => {
    if (selectedExpedition) {
      const updated = expeditions.find(e => e.id === selectedExpedition.id);
      if (updated) {
        setSelectedExpedition(updated);
      }
    } else if (expeditions.length > 0) {
      setSelectedExpedition(expeditions[0]);
    }
  }, [expeditions]);

  const handleSelectExpedition = (exp: Expedition) => {
    setSelectedExpedition(exp);
    if (exp.routeCoordinates && exp.routeCoordinates.length > 0) {
      onFocusCoordinates(exp.routeCoordinates[0]);
    }
  };

  const handleStartExpedition = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    if (onStartExpedition) {
      onStartExpedition(id);
    } else {
      dataService.startExpedition(id);
    }

    const exp = expeditions.find(item => item.id === id);
    const title = exp ? exp.title : 'Expedition';
    showToast(`Expedition "${title}" started! Status changed: Planning ➔ Active. Personnel and GIS route synchronized.`);
    
    // Auto-focus coordinates on start
    if (exp && exp.routeCoordinates && exp.routeCoordinates.length > 0) {
      onFocusCoordinates(exp.routeCoordinates[0]);
    }
  };

  const handleTrackOnMap = (exp: Expedition, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedExpedition(exp);
    
    if (exp.routeCoordinates && exp.routeCoordinates.length > 0) {
      onFocusCoordinates(exp.routeCoordinates[0]);
    }

    if (onTrackOnMap) {
      onTrackOnMap(exp);
    } else {
      showToast(`Tracking ${exp.code} - ${exp.title} on GIS theater.`);
    }

    // Smooth scroll to the existing GIS route map panel
    setTimeout(() => {
      const mapElement = document.getElementById('expedition-route-map-panel');
      if (mapElement) {
        mapElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 50);
  };

  const handleCreateExpedition = (params: {
    title: string;
    lead: string;
    startDate: string;
    endDate: string;
    teamMemberIds: string[];
    routeId: string;
  }) => {
    if (onCreateExpedition) {
      onCreateExpedition(params);
    } else {
      dataService.createExpedition(params);
    }
    showToast(`New Expedition "${params.title}" created in Planning status.`);
  };

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

  // KPI stats
  const stats = useMemo(() => {
    const total = expeditions.length;
    const planning = expeditions.filter(e => e.status === 'Planning' || (e.status as any) === 'Planned').length;
    const active = expeditions.filter(e => e.status === 'Active').length;
    const completed = expeditions.filter(e => e.status === 'Completed').length;
    return { total, planning, active, completed };
  }, [expeditions]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-4"
    >
      {/* Toast Feedback Notification */}
      <AnimatePresence>
        {actionFeedback && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-6 z-50 px-4 py-2.5 rounded-xl bg-[#24313A] text-[#FFFDF9] border border-[#F29A3D]/40 text-xs font-bold flex items-center gap-2 shadow-xl"
          >
            <CheckCircle2 className="w-4 h-4 text-[#39A96B]" />
            <span>{actionFeedback}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Banner & KPI Stat Summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-[#FFFCF8] border border-[#EAE3D5] warm-card-shadow">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#FFE5C7] border border-[#F29A3D]/40 flex items-center justify-center text-[#C96A20] shadow-xs">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-[#24313A] font-display">
                EXPEDITION PLANNING & OPERATIONS
              </h1>
              <span className="px-2 py-0.5 rounded-md bg-[#FFE5C7] text-[#C96A20] font-mono text-xs font-extrabold border border-[#F29A3D]/30">
                Svalbard GIS
              </span>
            </div>
            <p className="text-xs text-[#71808A] mt-0.5">
              Arctic Traverses, Mission Roster & Field Waypoint Tracking
            </p>
          </div>
        </div>

        {/* Action + KPI chips */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="grid grid-cols-4 gap-2">
            <div className="p-2 rounded-xl bg-[#F7F4EF] border border-[#EAE3D5] text-center min-w-[70px]">
              <span className="text-[9px] uppercase font-bold text-[#71808A] block">Total</span>
              <span className="text-base font-black text-[#24313A] font-mono">{stats.total}</span>
            </div>
            <div className="p-2 rounded-xl bg-[#FFF8EF] border border-[#F29A3D]/40 text-center min-w-[70px]">
              <span className="text-[9px] uppercase font-bold text-[#C96A20] block">Planning</span>
              <span className="text-base font-black text-[#C96A20] font-mono">{stats.planning}</span>
            </div>
            <div className="p-2 rounded-xl bg-[#E8F7EE] border border-[#A5D6A7] text-center min-w-[70px]">
              <span className="text-[9px] uppercase font-bold text-[#2E7D32] block">Active</span>
              <span className="text-base font-black text-[#2E7D32] font-mono">{stats.active}</span>
            </div>
            <div className="p-2 rounded-xl bg-[#F0F4F8] border border-[#CBD5E1] text-center min-w-[70px]">
              <span className="text-[9px] uppercase font-bold text-[#5A6872] block">Done</span>
              <span className="text-base font-black text-[#5A6872] font-mono">{stats.completed}</span>
            </div>
          </div>

          <button
            id="plan-new-expedition-top-btn"
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#F29A3D] hover:bg-[#FFB45A] text-[#24313A] text-xs font-black transition-all shadow-xs cursor-pointer ml-auto sm:ml-0"
          >
            <Plus className="w-4 h-4" />
            <span>Plan Expedition</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3 rounded-2xl bg-[#FFFCF8] border border-[#EAE3D5] warm-card-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Status filter pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-bold text-[#71808A] uppercase tracking-wider mr-1">Status:</span>
          {(['All', 'Planning', 'Active', 'Completed'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusFilter === tab
                  ? 'bg-[#24313A] text-[#FFFDF9] shadow-xs'
                  : 'bg-[#F7F4EF] text-[#71808A] hover:bg-[#EAE3D5] hover:text-[#24313A]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-[#71808A] absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search code, title, lead, region..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#F7F4EF] border border-[#EAE3D5] text-xs font-bold text-[#24313A] placeholder-[#71808A] focus:outline-none focus:border-[#F29A3D]"
          />
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Expedition Cards (5 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-[#71808A] uppercase tracking-wider">
              Expedition Roster ({filteredExpeditions.length})
            </span>
            <span className="text-[11px] text-[#71808A]">
              Click card to select route
            </span>
          </div>

          {filteredExpeditions.length > 0 ? (
            filteredExpeditions.map(exp => {
              const isSelected = selectedExpedition?.id === exp.id;
              const normalizedStatus: ExpeditionStatus = exp.status === 'Planned' ? 'Planning' : exp.status;
              const teamCount = exp.teamMemberNames?.length || exp.assignedTeamCount || 3;

              return (
                <div
                  key={exp.id}
                  id={`expedition-card-${exp.id}`}
                  onClick={() => handleSelectExpedition(exp)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer warm-card-shadow space-y-3 ${
                    isSelected
                      ? 'bg-[#FFFCF8] border-[#F29A3D] ring-2 ring-[#F29A3D]/40'
                      : 'bg-[#FFFCF8] border-[#EAE3D5] hover:border-[#F29A3D]/50'
                  }`}
                >
                  {/* Card Header: ID + Name + Status */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black text-[#C96A20] bg-[#FFE5C7] px-2 py-0.5 rounded-md border border-[#F29A3D]/30">
                          {exp.code}
                        </span>
                        <h3 className="text-sm font-extrabold text-[#24313A] group-hover:text-[#C96A20] transition-colors leading-tight">
                          {exp.title}
                        </h3>
                      </div>
                      <span className="text-[11px] text-[#71808A] mt-0.5 block">
                        {exp.region}
                      </span>
                    </div>

                    <span className={`text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-md border shrink-0 ${getStatusBadgeStyle(normalizedStatus)}`}>
                      ● {normalizedStatus}
                    </span>
                  </div>

                  {/* Leader & Start/End Dates */}
                  <div className="grid grid-cols-2 gap-2 text-xs text-[#71808A] pt-1 border-t border-[#EAE3D5]/60">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#71808A] block">
                        Leader
                      </span>
                      <strong className="text-xs text-[#24313A] block font-semibold truncate">
                        {exp.lead}
                      </strong>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#71808A] block">
                        Dates
                      </span>
                      <strong className="text-xs font-mono text-[#24313A] block truncate">
                        {exp.startDate} → {exp.endDate || 'TBD'}
                      </strong>
                    </div>
                  </div>

                  {/* Progress % + Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#71808A] font-semibold">Traverse Progress</span>
                      <span className="font-mono font-bold text-[#24313A]">{exp.progress}%</span>
                    </div>
                    <div className="w-full bg-[#EAE3D5] rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${
                          normalizedStatus === 'Completed'
                            ? 'bg-[#39A96B]'
                            : normalizedStatus === 'Active'
                            ? 'bg-[#F29A3D]'
                            : 'bg-[#71808A]'
                        }`}
                        style={{ width: `${exp.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Checkpoints snippet & Team count */}
                  <div className="flex items-center justify-between text-xs text-[#71808A] pt-1">
                    <div className="flex items-center gap-1.5 overflow-hidden">
                      <MapPin className="w-3.5 h-3.5 text-[#F29A3D] shrink-0" />
                      <span className="text-[11px] text-[#24313A] font-medium truncate">
                        {exp.currentCheckpoint || exp.camps[0]} ➔ {exp.nextCheckpoint || exp.camps[1] || 'Goal'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 font-bold text-[#24313A] text-[11px]">
                      <Users className="w-3 h-3 text-[#4AA9D8]" />
                      <span>{teamCount} Specialists</span>
                    </div>
                  </div>

                  {/* Action Buttons on Card */}
                  <div className="flex items-center gap-1.5 pt-2 border-t border-[#EAE3D5]">
                    {normalizedStatus === 'Planning' && (
                      <button
                        onClick={(e) => handleStartExpedition(exp.id, e)}
                        className="flex-1 py-1.5 px-2 rounded-lg bg-[#F29A3D] hover:bg-[#FFB45A] text-[#24313A] text-xs font-black transition-all flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                        title="Start this expedition and deploy personnel"
                      >
                        <Play className="w-3 h-3" />
                        <span>Start</span>
                      </button>
                    )}

                    <button
                      onClick={(e) => handleTrackOnMap(exp, e)}
                      className="flex-1 py-1.5 px-2 rounded-lg bg-[#F7F4EF] hover:bg-[#FFE5C7] border border-[#EAE3D5] text-[#24313A] text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                      title="Focus on GIS Route Map"
                    >
                      <NavigationIcon className="w-3 h-3 text-[#4AA9D8]" />
                      <span>Track</span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setInspectingExpedition(exp);
                      }}
                      className="py-1.5 px-3 rounded-lg bg-[#F7F4EF] hover:bg-[#EAE3D5] text-[#24313A] text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                      title="View complete expedition details"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Details</span>
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center rounded-2xl bg-[#FFFCF8] border border-[#EAE3D5] text-xs text-[#71808A]">
              No expeditions match the current filter or search criteria.
            </div>
          )}
        </div>

        {/* Right Column: GIS Route Map & Selected Details (7 Cols) */}
        <div id="expedition-route-map-panel" className="lg:col-span-7 space-y-4">
          {selectedExpedition && (
            <div className="p-4 sm:p-5 rounded-2xl bg-[#FFFCF8] border border-[#EAE3D5] warm-card-shadow space-y-4">
              {/* Selected Expedition Top Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#EAE3D5]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[#C96A20] uppercase tracking-widest font-extrabold">
                      GIS ROUTE THEATER
                    </span>
                    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.2 rounded border ${getStatusBadgeStyle(selectedExpedition.status)}`}>
                      {selectedExpedition.status}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-[#24313A] font-display">
                    {selectedExpedition.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  {selectedExpedition.status === 'Planning' && (
                    <button
                      onClick={() => handleStartExpedition(selectedExpedition.id)}
                      className="px-3 py-1.5 rounded-xl bg-[#F29A3D] hover:bg-[#FFB45A] text-[#24313A] text-xs font-black transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Start Expedition</span>
                    </button>
                  )}
                  <button
                    onClick={() => setInspectingExpedition(selectedExpedition)}
                    className="px-3 py-1.5 rounded-xl bg-[#F7F4EF] hover:bg-[#FFE5C7] border border-[#EAE3D5] text-[#24313A] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Expedition Details</span>
                  </button>
                </div>
              </div>

              {/* Real GIS Route Map */}
              <PolarMap
                personnel={personnel}
                vehicles={vehicles}
                cargo={cargo}
                camps={camps}
                emergencies={emergencies}
                selectedExpedition={selectedExpedition}
                activeFilter={activeFilter}
                onFilterChange={onFilterChange}
                heightClass="h-[360px] sm:h-[400px]"
              />

              {/* Waypoints & Current/Next Checkpoint summary */}
              <div className="p-3.5 rounded-xl bg-[#FFF8EF] border border-[#F29A3D]/25 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#24313A] uppercase tracking-wider flex items-center gap-1.5">
                    <Flag className="w-3.5 h-3.5 text-[#C96A20]" />
                    Checkpoints Sequence
                  </span>
                  <span className="text-[11px] font-mono font-bold text-[#C96A20]">
                    {selectedExpedition.camps.length} Camps
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  {selectedExpedition.camps.map((campName, idx) => {
                    const isCurrent = campName === selectedExpedition.currentCheckpoint;
                    const isNext = campName === selectedExpedition.nextCheckpoint;

                    return (
                      <React.Fragment key={campName}>
                        <div className={`px-2 py-1 rounded-lg border text-xs font-bold flex items-center gap-1 ${
                          isCurrent
                            ? 'bg-[#E8F7EE] text-[#2E7D32] border-[#A5D6A7]'
                            : isNext
                            ? 'bg-[#FFE5C7] text-[#C96A20] border-[#F29A3D]/50'
                            : 'bg-[#FFFCF8] text-[#24313A] border-[#EAE3D5]'
                        }`}>
                          <span>{campName}</span>
                          {isCurrent && <span className="text-[9px] uppercase font-black text-[#2E7D32]">●</span>}
                          {isNext && <span className="text-[9px] uppercase font-black text-[#C96A20]">▶</span>}
                        </div>
                        {idx < selectedExpedition.camps.length - 1 && (
                          <span className="text-[#71808A] font-bold">➔</span>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>

              {/* Route Metrics Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                <div className="p-2.5 rounded-xl bg-[#F7F4EF] border border-[#EAE3D5]">
                  <span className="text-[10px] text-[#71808A] uppercase font-bold block">
                    Leader
                  </span>
                  <strong className="text-xs font-bold text-[#24313A] block truncate mt-0.5">
                    {selectedExpedition.lead}
                  </strong>
                </div>

                <div className="p-2.5 rounded-xl bg-[#F7F4EF] border border-[#EAE3D5]">
                  <span className="text-[10px] text-[#71808A] uppercase font-bold block">
                    Dates
                  </span>
                  <strong className="text-xs font-mono text-[#24313A] block truncate mt-0.5">
                    {selectedExpedition.startDate} → {selectedExpedition.endDate || 'TBD'}
                  </strong>
                </div>

                <div className="p-2.5 rounded-xl bg-[#F7F4EF] border border-[#EAE3D5]">
                  <span className="text-[10px] text-[#71808A] uppercase font-bold block">
                    Distance & Time
                  </span>
                  <strong className="text-xs font-mono text-[#24313A] block truncate mt-0.5">
                    {selectedExpedition.distanceKm || 84} km • {selectedExpedition.estimatedDurationDays || 6}d
                  </strong>
                </div>

                <div className="p-2.5 rounded-xl bg-[#F7F4EF] border border-[#EAE3D5]">
                  <span className="text-[10px] text-[#71808A] uppercase font-bold block">
                    Specialists
                  </span>
                  <strong className="text-xs font-bold text-[#24313A] block truncate mt-0.5">
                    {selectedExpedition.teamMemberNames?.length || selectedExpedition.assignedTeamCount || 3} Personnel
                  </strong>
                </div>
              </div>

              {/* Action Buttons Toolbar */}
              <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#EAE3D5]">
                {selectedExpedition.status === 'Planning' && (
                  <button
                    onClick={() => handleStartExpedition(selectedExpedition.id)}
                    className="flex-1 py-2 px-3 rounded-xl bg-[#F29A3D] hover:bg-[#FFB45A] text-[#24313A] text-xs font-black flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Start Expedition</span>
                  </button>
                )}

                <button
                  onClick={() => handleTrackOnMap(selectedExpedition)}
                  className="flex-1 py-2 px-3 rounded-xl bg-[#F7F4EF] hover:bg-[#FFE5C7] border border-[#EAE3D5] text-[#24313A] text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <NavigationIcon className="w-3.5 h-3.5 text-[#4AA9D8]" />
                  <span>Center GIS Map</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Expedition Details Modal */}
      <ExpeditionDetailModal
        expedition={inspectingExpedition}
        personnel={personnel}
        isOpen={!!inspectingExpedition}
        onClose={() => setInspectingExpedition(null)}
        onStartExpedition={(id) => {
          handleStartExpedition(id);
          // Refresh inspecting expedition object
          const updated = dataService.getExpeditions().find(e => e.id === id);
          if (updated) setInspectingExpedition(updated);
        }}
        onTrackOnMap={(exp) => {
          handleTrackOnMap(exp);
        }}
      />

      {/* Create Expedition Modal */}
      <CreateExpeditionModal
        personnel={personnel}
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateExpedition={handleCreateExpedition}
      />
    </motion.div>
  );
};
