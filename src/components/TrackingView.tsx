import { useState, useMemo, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Crosshair, 
  MapPin, 
  Search, 
  Gauge, 
  Fuel, 
  PhoneCall, 
  Clock, 
  Radio, 
  Users, 
  Car, 
  ShieldAlert, 
  CheckCircle2, 
  Compass, 
  Filter,
  Eye,
  Layers
} from 'lucide-react';
import { 
  Personnel, 
  Vehicle, 
  CargoItem, 
  Camp, 
  Emergency, 
  MarkerFilter,
  PersonnelStatus
} from '../types';
import { PolarMap } from './PolarMap';
import { useTranslation } from '../i18n';

interface TrackingViewProps {
  personnel: Personnel[];
  vehicles: Vehicle[];
  cargo: CargoItem[];
  camps: Camp[];
  emergencies: Emergency[];
  activeFilter: MarkerFilter;
  onFilterChange: (filter: MarkerFilter) => void;
  selectedEntity: { type: 'vehicle' | 'personnel' | 'cargo' | 'camp' | 'emergency'; id: string } | null;
  onSelectEntity: (type: 'vehicle' | 'personnel' | 'cargo' | 'camp' | 'emergency', id: string) => void;
  isFollowing: boolean;
  onToggleFollow: () => void;
  onFocusCoordinates: (coords: [number, number]) => void;
  onOpenPersonnelModal?: (p: Personnel) => void;
  onOpenCargoDetails?: (id: string) => void;
}

export const TrackingView: React.FC<TrackingViewProps> = ({
  personnel,
  vehicles,
  cargo,
  camps,
  emergencies,
  activeFilter,
  onFilterChange,
  selectedEntity,
  onSelectEntity,
  isFollowing,
  onToggleFollow,
  onFocusCoordinates,
  onOpenPersonnelModal,
  onOpenCargoDetails
}) => {
  const { t, translateStatus } = useTranslation();
  
  // Default to 'all' so both Vehicles and Personnel are visible simultaneously on open
  const [subView, setSubView] = useState<'all' | 'vehicles' | 'people'>(
    activeFilter === 'people' ? 'people' : activeFilter === 'vehicles' ? 'vehicles' : 'all'
  );

  // Sync subView if parent activeFilter changes externally
  useEffect(() => {
    if (activeFilter === 'people') {
      setSubView('people');
    } else if (activeFilter === 'vehicles') {
      setSubView('vehicles');
    }
  }, [activeFilter]);

  // Search & Filters for Personnel
  const [personnelSearch, setPersonnelSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [expeditionFilter, setExpeditionFilter] = useState<string>('All');

  // General search for vehicles / all
  const [searchQuery, setSearchQuery] = useState('');
  const [radioContactSuccess, setRadioContactSuccess] = useState<string | null>(null);

  // Default to first vehicle if nothing selected
  const activeVehicle = useMemo(() => {
    if (selectedEntity?.type === 'vehicle') {
      return vehicles.find(v => v.id === selectedEntity.id) || vehicles[0];
    }
    return vehicles[0];
  }, [selectedEntity, vehicles]);

  // Filtered Personnel List
  const filteredPersonnel = useMemo(() => {
    return personnel.filter(p => {
      // Search query
      if (personnelSearch.trim()) {
        const q = personnelSearch.toLowerCase().trim();
        const matchName = p.name.toLowerCase().includes(q);
        const matchCode = (p.code || '').toLowerCase().includes(q);
        const matchRole = p.role.toLowerCase().includes(q);
        const matchLoc = p.location.toLowerCase().includes(q);
        const matchVehicle = (p.assignedVehicle || '').toLowerCase().includes(q);
        const matchExpedition = (p.expedition || '').toLowerCase().includes(q);
        if (!matchName && !matchCode && !matchRole && !matchLoc && !matchVehicle && !matchExpedition) {
          return false;
        }
      }

      // Status filter
      if (statusFilter !== 'All') {
        if (statusFilter === 'Emergency') {
          const isEmg = p.status === 'Emergency' || p.emergencyStatus === 'Emergency';
          if (!isEmg) return false;
        } else if (p.status !== statusFilter) {
          return false;
        }
      }

      // Expedition filter
      if (expeditionFilter !== 'All') {
        if (p.expedition !== expeditionFilter) return false;
      }

      return true;
    });
  }, [personnel, personnelSearch, statusFilter, expeditionFilter]);

  const handleRadioContact = (targetName: string) => {
    setRadioContactSuccess(`${t('tracking.radioSuccessPrefix')} ${targetName}. ${t('tracking.radioSuccessSuffix')}`);
    setTimeout(() => {
      setRadioContactSuccess(null);
    }, 3500);
  };

  const handlePersonCardClick = (p: Personnel) => {
    onSelectEntity('personnel', p.id);
    if (onOpenPersonnelModal) {
      onOpenPersonnelModal(p);
    }
  };

  const handleViewPersonOnMap = (p: Personnel, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    onFocusCoordinates([p.lat, p.lng]);
    onSelectEntity('personnel', p.id);
    const mapEl = document.getElementById('tracking-gis-map-container');
    if (mapEl) {
      mapEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  // Render Vehicles & Telemetry Section
  const renderVehiclesSection = (fullHeight: boolean = false) => (
    <div id="tracking-gis-map-container" className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Main Map Area (2 Cols) */}
      <div className="lg:col-span-2 rounded-2xl overflow-hidden border border-[#EAE3D5] warm-card-shadow bg-[#FFFCF8]">
        <PolarMap
          camps={camps}
          vehicles={vehicles}
          personnel={personnel}
          cargo={cargo}
          emergencies={emergencies}
          activeFilter={activeFilter}
          onFilterChange={onFilterChange}
          selectedEntity={selectedEntity}
          onSelectEntity={onSelectEntity}
          onOpenCargoDetails={onOpenCargoDetails}
          isFollowing={isFollowing}
          onToggleFollow={onToggleFollow}
          heightClass={fullHeight ? 'h-[580px]' : 'h-[460px]'}
        />
      </div>

      {/* Right Sidebar: Selected Unit Telemetry */}
      <div className="space-y-4">
        {activeVehicle && (
          <div 
            id="tracking-vehicle-card"
            className="p-4 rounded-2xl bg-[#FFFCF8] border border-[#EAE3D5] warm-card-shadow space-y-3"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#FFE5C7] text-[#C96A20]">
                    {activeVehicle.code}
                  </span>
                  <h3 className="text-base font-extrabold text-[#24313A] font-display">{activeVehicle.name}</h3>
                </div>
                <p className="text-xs text-[#71808A]">{activeVehicle.type}</p>
              </div>

              <span className="px-2.5 py-0.8 text-[10px] font-bold rounded-full bg-[#E3F6EB] text-[#39A96B]">
                ● {translateStatus(activeVehicle.status)}
              </span>
            </div>

            {/* Telemetry Gauge Grid */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="p-2.5 rounded-xl bg-[#F7F4EF] border border-[#EAE3D5]">
                <div className="flex items-center gap-1 text-[11px] text-[#71808A]">
                  <Gauge className="w-3.5 h-3.5 text-[#4AA9D8]" />
                  <span>{t('tracking.speed')}</span>
                </div>
                <div className="text-base font-bold text-[#24313A] mt-1">{activeVehicle.speedKmH} km/h</div>
              </div>

              <div className="p-2.5 rounded-xl bg-[#F7F4EF] border border-[#EAE3D5]">
                <div className="flex items-center gap-1 text-[11px] text-[#71808A]">
                  <Fuel className="w-3.5 h-3.5 text-[#F29A3D]" />
                  <span>{t('tracking.batteryFuel')}</span>
                </div>
                <div className="text-base font-bold text-[#24313A] mt-1">{activeVehicle.fuelPercentage}%</div>
              </div>
            </div>

            {/* Location & Last Update */}
            <div className="p-3 rounded-xl bg-[#FFF8EF] border border-[#F29A3D]/20 text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 text-[#24313A]">
                <MapPin className="w-3.5 h-3.5 text-[#C96A20]" />
                <span className="font-semibold">{t('tracking.gpsLocation')}:</span>
                <span className="font-mono text-[#71808A]">{activeVehicle.lat.toFixed(4)}°N, {activeVehicle.lng.toFixed(4)}°E</span>
              </div>
              <div className="flex items-center gap-1.5 text-[#71808A]">
                <Clock className="w-3.5 h-3.5 text-[#71808A]" />
                <span>{t('tracking.lastUpdate')}: <strong>{activeVehicle.lastSeenSecAgo}s {t('common.ago')}</strong></span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center gap-2">
                <button
                  id="tracking-follow-btn"
                  onClick={onToggleFollow}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    isFollowing
                      ? 'bg-[#F29A3D] text-[#24313A] shadow-xs'
                      : 'bg-[#F7F4EF] hover:bg-[#FFE5C7] text-[#24313A] border border-[#EAE3D5]'
                  }`}
                >
                  <Crosshair className="w-3.5 h-3.5" />
                  <span>{isFollowing ? t('tracking.followingUnit') : t('tracking.follow')}</span>
                </button>

                <button
                  id="tracking-contact-btn"
                  onClick={() => handleRadioContact(activeVehicle.name)}
                  className="flex-1 py-2 px-3 rounded-xl bg-[#F7F4EF] hover:bg-[#FFE5C7] border border-[#EAE3D5] text-[#24313A] text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-[#4AA9D8]" />
                  <span>{t('tracking.contact')}</span>
                </button>
              </div>

              <button
                id="tracking-view-route-btn"
                onClick={() => onFocusCoordinates([activeVehicle.lat, activeVehicle.lng])}
                className="w-full py-2 px-3 rounded-xl bg-[#F7F4EF] hover:bg-[#EAE3D5] text-[#24313A] text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Compass className="w-3.5 h-3.5 text-[#C96A20]" />
                <span>View on Map</span>
              </button>
            </div>
          </div>
        )}

        {/* Quick Fleet Transponders Picker */}
        <div className="p-4 rounded-2xl bg-[#FFFCF8] border border-[#EAE3D5] warm-card-shadow">
          <div className="flex items-center justify-between mb-2.5">
            <h4 className="text-xs font-bold text-[#24313A] uppercase tracking-wider">{t('tracking.fleetTransponders')}</h4>
            <span className="text-[10px] font-semibold text-[#39A96B]">{vehicles.length} {t('dashboard.online')}</span>
          </div>

          <div className="space-y-2">
            {vehicles.map(v => {
              const isSelected = activeVehicle?.id === v.id;
              return (
                <button
                  key={v.id}
                  onClick={() => {
                    onSelectEntity('vehicle', v.id);
                    onFocusCoordinates([v.lat, v.lng]);
                  }}
                  className={`w-full p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-[#FFF8EF] border-[#F29A3D]'
                      : 'bg-[#F7F4EF] border-[#EAE3D5] hover:border-[#F29A3D]/40'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold text-[#24313A]">{v.code} • {v.name}</div>
                    <div className="text-[10px] text-[#71808A]">{v.type} • {v.speedKmH} km/h</div>
                  </div>
                  <span className="text-[10px] font-semibold text-[#39A96B]">● {translateStatus(v.status)}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  // Render Personnel Section with 8 Core Fields Visible by Default
  const renderPersonnelSection = (includeMap: boolean = false) => (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between px-1 gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#FFE5C7] border border-[#F29A3D]/40 flex items-center justify-center text-[#C96A20] shrink-0">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-[#24313A] uppercase tracking-wider font-display">
              Field Personnel Roster ({filteredPersonnel.length} of {personnel.length})
            </h3>
            <p className="text-[11px] text-[#71808A]">Live expedition members, assignments & telemetry status</p>
          </div>
        </div>
      </div>

      {/* Personnel Search and Filtering Bar */}
      <div className="p-4 rounded-2xl bg-[#FFFCF8] border border-[#EAE3D5] warm-card-shadow space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Personnel */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#71808A] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="personnel-search-input"
              type="text"
              placeholder="Search personnel by name, ID (e.g. PER-001), role, vehicle..."
              value={personnelSearch}
              onChange={e => setPersonnelSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl bg-[#F7F4EF] border border-[#EAE3D5] text-[#24313A] placeholder-[#71808A] focus:outline-none focus:border-[#F29A3D] transition-colors"
            />
          </div>

          {/* Expedition Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#71808A] uppercase tracking-wider whitespace-nowrap">
              Expedition:
            </span>
            <select
              id="personnel-expedition-filter"
              value={expeditionFilter}
              onChange={e => setExpeditionFilter(e.target.value)}
              className="px-3 py-2 text-xs font-semibold rounded-xl bg-[#F7F4EF] border border-[#EAE3D5] text-[#24313A] focus:outline-none focus:border-[#F29A3D]"
            >
              <option value="All">All Expeditions</option>
              <option value="Arctic Research">Arctic Research</option>
              <option value="Ice Camp Survey">Ice Camp Survey</option>
              <option value="Polar Logistics">Polar Logistics</option>
            </select>
          </div>
        </div>

        {/* Status Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[#EAE3D5]">
          <span className="text-xs font-bold text-[#71808A] uppercase tracking-wider mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            Status:
          </span>
          {['All', 'Active', 'Moving', 'At Base', 'In Transit', 'Emergency'].map(status => {
            const isSelected = statusFilter === status;
            return (
              <button
                key={status}
                id={`personnel-status-filter-${status.toLowerCase().replace(' ', '-')}`}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? status === 'Emergency'
                      ? 'bg-[#E84D4D] text-white shadow-xs'
                      : 'bg-[#F29A3D] text-[#24313A] shadow-xs'
                    : 'bg-[#F7F4EF] text-[#71808A] hover:text-[#24313A] hover:bg-[#EAE3D5]'
                }`}
              >
                {status === 'Emergency' && <span className="inline-block w-1.5 h-1.5 rounded-full bg-white mr-1.5 animate-pulse" />}
                {status}
              </button>
            );
          })}
          <span className="text-[11px] text-[#71808A] ml-auto font-medium">
            Showing {filteredPersonnel.length} of {personnel.length} Personnel
          </span>
        </div>
      </div>

      {/* Interactive GIS Map for Personnel (when only people tab is chosen) */}
      {includeMap && (
        <div className="rounded-2xl overflow-hidden border border-[#EAE3D5] warm-card-shadow bg-[#FFFCF8]">
          <div className="px-4 py-3 border-b border-[#EAE3D5] flex items-center justify-between bg-[#FFFDF9]">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#4AA9D8]" />
              <span className="text-xs font-bold text-[#24313A] uppercase tracking-wider">
                Personnel GIS Map & Geolocation
              </span>
            </div>
            <span className="text-[11px] text-[#71808A]">
              Click any marker to inspect movement history
            </span>
          </div>
          <div className="h-[360px] w-full">
            <PolarMap
              camps={camps}
              vehicles={vehicles}
              personnel={filteredPersonnel}
              cargo={cargo}
              emergencies={emergencies}
              activeFilter={activeFilter}
              onFilterChange={onFilterChange}
              selectedEntity={selectedEntity}
              onSelectEntity={onSelectEntity}
              onOpenCargoDetails={onOpenCargoDetails}
              isFollowing={isFollowing}
              onToggleFollow={onToggleFollow}
              heightClass="h-[360px]"
            />
          </div>
        </div>
      )}

      {/* Personnel Cards Grid - All 8 Essential Fields Visible by Default */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPersonnel.map(person => {
          const isSelected = selectedEntity?.type === 'personnel' && selectedEntity.id === person.id;
          const isEmg = person.status === 'Emergency' || person.emergencyStatus === 'Emergency';

          return (
            <div
              key={person.id}
              id={`personnel-card-${person.code || person.id}`}
              onClick={() => handlePersonCardClick(person)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer bg-[#FFFCF8] warm-card-shadow hover:shadow-md flex flex-col justify-between space-y-3 ${
                isSelected
                  ? 'border-[#F29A3D] ring-2 ring-[#F29A3D]/20 bg-[#FFFDF9]'
                  : isEmg
                  ? 'border-[#E84D4D]/50 bg-[#FFF8F8]'
                  : 'border-[#EAE3D5] hover:border-[#F29A3D]/50'
              }`}
            >
              {/* Top Header: Avatar, Name, ID, Role & Status */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-sm border shadow-2xs ${
                    isEmg
                      ? 'bg-[#FDE8E8] text-[#E84D4D] border-[#E84D4D]/30'
                      : 'bg-[#FFE5C7] text-[#C96A20] border-[#F29A3D]/30'
                  }`}>
                    {person.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-extrabold text-[#24313A] font-display leading-tight">{person.name}</h4>
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#F7F4EF] border border-[#EAE3D5] text-[#71808A]">
                        {person.code || person.id}
                      </span>
                    </div>
                    <p className="text-xs text-[#71808A] font-medium">{person.role}</p>
                  </div>
                </div>

                {/* Status Badge */}
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase flex items-center gap-1 shrink-0 ${
                  isEmg
                    ? 'bg-[#E84D4D] text-white animate-pulse'
                    : person.status === 'Moving'
                    ? 'bg-[#F29A3D] text-[#24313A]'
                    : person.status === 'In Transit'
                    ? 'bg-[#DFF3FA] text-[#4AA9D8]'
                    : person.status === 'Active'
                    ? 'bg-[#E3F6EB] text-[#39A96B]'
                    : 'bg-[#F7F4EF] text-[#71808A]'
                }`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  {person.status}
                </span>
              </div>

              {/* Core Details Grid: Current Location, Expedition, Assigned Vehicle, Last Updated */}
              <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-[#EAE3D5]">
                {/* 1. Current Location */}
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-[#71808A] uppercase tracking-wider">Current Location</span>
                  <div className="flex items-center gap-1 text-[#24313A] font-semibold">
                    <MapPin className="w-3.5 h-3.5 text-[#C96A20] shrink-0" />
                    <span className="truncate">{person.location}</span>
                  </div>
                </div>

                {/* 2. Expedition */}
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-[#71808A] uppercase tracking-wider">Expedition</span>
                  <div className="flex items-center gap-1 text-[#24313A] font-semibold">
                    <Compass className="w-3.5 h-3.5 text-[#4AA9D8] shrink-0" />
                    <span className="truncate">{person.expedition || 'Arctic Research'}</span>
                  </div>
                </div>

                {/* 3. Assigned Vehicle */}
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-[#71808A] uppercase tracking-wider">Assigned Vehicle</span>
                  <div className="flex items-center gap-1 text-[#24313A] font-semibold">
                    <Car className="w-3.5 h-3.5 text-[#39A96B] shrink-0" />
                    <span className="truncate">{person.assignedVehicle || 'None'}</span>
                  </div>
                </div>

                {/* 4. Last Updated */}
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-[#71808A] uppercase tracking-wider">Last Updated</span>
                  <div className="flex items-center gap-1 text-[#71808A] font-medium">
                    <Clock className="w-3.5 h-3.5 text-[#71808A] shrink-0" />
                    <span className="truncate">{person.lastUpdated || person.lastCheckIn || 'Recently'}</span>
                  </div>
                </div>
              </div>

              {/* Status / Emergency Health Line */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  {isEmg ? (
                    <>
                      <ShieldAlert className="w-3.5 h-3.5 text-[#E84D4D] animate-pulse" />
                      <span className="text-[11px] font-bold text-[#E84D4D]">Emergency Distress</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#39A96B]" />
                      <span className="text-[11px] font-medium text-[#71808A]">Status: Nominal</span>
                    </>
                  )}
                </div>
              </div>

              {/* Actions: View on Map & Details */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  id={`personnel-map-btn-${person.code || person.id}`}
                  onClick={e => handleViewPersonOnMap(person, e)}
                  className="flex-1 py-1.5 px-2.5 rounded-xl bg-[#F7F4EF] hover:bg-[#FFE5C7] text-[#24313A] text-xs font-bold transition-all flex items-center justify-center gap-1 border border-[#EAE3D5] cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#C96A20]" />
                  <span>View on Map</span>
                </button>

                <button
                  type="button"
                  id={`personnel-details-btn-${person.code || person.id}`}
                  onClick={() => handlePersonCardClick(person)}
                  className="flex-1 py-1.5 px-2.5 rounded-xl bg-[#F29A3D] hover:bg-[#E28828] text-[#24313A] text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer shadow-2xs"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Details</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredPersonnel.length === 0 && (
        <div className="p-8 rounded-2xl bg-[#FFFCF8] border border-[#EAE3D5] text-center text-xs text-[#71808A]">
          No personnel found matching current search and filter criteria.
        </div>
      )}
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-5"
    >
      {/* Top Header & Sub-View Switcher */}
      <div className="p-4 rounded-2xl bg-[#FFFCF8] border border-[#EAE3D5] warm-card-shadow flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Left: View Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Tab: All Units (Default) */}
          <button
            id="tracking-tab-all"
            onClick={() => {
              setSubView('all');
              onFilterChange('all');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              subView === 'all'
                ? 'bg-[#F29A3D] text-[#24313A] shadow-xs'
                : 'bg-[#F7F4EF] text-[#71808A] hover:text-[#24313A] hover:bg-[#FFE5C7]/50'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>All Units ({vehicles.length + personnel.length})</span>
          </button>

          {/* Tab: Fleet Vehicles */}
          <button
            id="tracking-tab-vehicles"
            onClick={() => {
              setSubView('vehicles');
              onFilterChange('vehicles');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              subView === 'vehicles'
                ? 'bg-[#F29A3D] text-[#24313A] shadow-xs'
                : 'bg-[#F7F4EF] text-[#71808A] hover:text-[#24313A] hover:bg-[#FFE5C7]/50'
            }`}
          >
            <Car className="w-4 h-4" />
            <span>Fleet Vehicles ({vehicles.length})</span>
          </button>

          {/* Tab: Personnel */}
          <button
            id="tracking-tab-personnel"
            onClick={() => {
              setSubView('people');
              onFilterChange('people');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              subView === 'people'
                ? 'bg-[#F29A3D] text-[#24313A] shadow-xs'
                : 'bg-[#F7F4EF] text-[#71808A] hover:text-[#24313A] hover:bg-[#FFE5C7]/50'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Personnel ({personnel.length})</span>
          </button>
        </div>

        {/* Right: Map Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            id="tracking-filter-all"
            onClick={() => {
              onFilterChange('all');
              setSubView('all');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-[#24313A] text-white shadow-xs'
                : 'text-[#71808A] hover:text-[#24313A] hover:bg-[#F7F4EF]'
            }`}
          >
            {t('common.all')}
          </button>
          <button
            id="tracking-filter-people"
            onClick={() => {
              onFilterChange('people');
              setSubView('people');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeFilter === 'people'
                ? 'bg-[#4AA9D8] text-white shadow-xs'
                : 'text-[#71808A] hover:text-[#4AA9D8] hover:bg-[#F7F4EF]'
            }`}
          >
            {t('common.people')}
          </button>
          <button
            id="tracking-filter-vehicles"
            onClick={() => {
              onFilterChange('vehicles');
              setSubView('vehicles');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeFilter === 'vehicles'
                ? 'bg-[#39A96B] text-white shadow-xs'
                : 'text-[#71808A] hover:text-[#39A96B] hover:bg-[#F7F4EF]'
            }`}
          >
            {t('common.vehicles')}
          </button>
          <button
            id="tracking-filter-emergency"
            onClick={() => onFilterChange('emergency')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeFilter === 'emergency'
                ? 'bg-[#E84D4D] text-white shadow-xs'
                : 'text-[#71808A] hover:text-[#E84D4D] hover:bg-[#F7F4EF]'
            }`}
          >
            {t('common.emergency')}
          </button>
        </div>
      </div>

      {/* Radio Contact Toast Notification */}
      {radioContactSuccess && (
        <div className="p-3 rounded-xl bg-[#DFF3FA] border border-[#4AA9D8]/30 text-xs text-[#24313A] flex items-center gap-2 animate-in fade-in duration-200">
          <PhoneCall className="w-4 h-4 text-[#4AA9D8]" />
          <span className="font-semibold">{radioContactSuccess}</span>
        </div>
      )}

      {/* Main View Area: Shows Both Vehicles and Personnel by Default */}
      {subView === 'all' && (
        <div className="space-y-6">
          {renderVehiclesSection(false)}
          {renderPersonnelSection(false)}
        </div>
      )}

      {/* Vehicles Only View */}
      {subView === 'vehicles' && (
        <div className="space-y-4">
          {renderVehiclesSection(true)}
        </div>
      )}

      {/* Personnel Only View */}
      {subView === 'people' && (
        <div className="space-y-4">
          {renderPersonnelSection(true)}
        </div>
      )}
    </motion.div>
  );
};
