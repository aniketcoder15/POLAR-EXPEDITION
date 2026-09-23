import { useState, useMemo } from 'react';
import { CargoItem, Vehicle, Personnel, Camp, Emergency, CargoStatus, CargoType, MarkerFilter } from '../types';
import { PolarMap } from './PolarMap';
import { 
  Package, 
  MapPin, 
  Clock, 
  ThermometerSnowflake, 
  Truck, 
  Crosshair, 
  SlidersHorizontal,
  CheckCircle2,
  Search,
  ArrowRight,
  Filter,
  Info
} from 'lucide-react';
import { motion } from 'motion/react';
import { useTranslation } from '../i18n';

interface CargoViewProps {
  cargo: CargoItem[];
  vehicles: Vehicle[];
  personnel: Personnel[];
  camps: Camp[];
  emergencies: Emergency[];
  activeFilter: MarkerFilter;
  selectedEntity?: { type: 'vehicle' | 'personnel' | 'cargo' | 'camp' | 'emergency'; id: string } | null;
  onFilterChange: (filter: MarkerFilter) => void;
  onUpdateCargoStatus: (id: string, status: CargoStatus) => void;
  onFocusCoordinates: (coords: [number, number]) => void;
  onSelectEntity: (type: 'vehicle' | 'personnel' | 'cargo' | 'camp' | 'emergency', id: string) => void;
  onOpenCargoDetails: (id: string) => void;
}

const STATUS_FILTER_OPTIONS: ('All' | CargoStatus)[] = ['All', 'Pending', 'In Transit', 'Delivered', 'Delayed'];
const TYPE_FILTER_OPTIONS: ('All' | CargoType)[] = ['All', 'Medical', 'Fuel', 'Provisions', 'Scientific', 'Equipment', 'Hardware'];

export const CargoView: React.FC<CargoViewProps> = ({
  cargo,
  vehicles,
  personnel,
  camps,
  emergencies,
  activeFilter,
  selectedEntity,
  onFilterChange,
  onUpdateCargoStatus,
  onFocusCoordinates,
  onSelectEntity,
  onOpenCargoDetails
}) => {
  const { t, translateStatus } = useTranslation();
  const [editingCargoId, setEditingCargoId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'All' | CargoStatus>('All');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<'All' | CargoType>('All');

  const statusOptions: CargoStatus[] = ['Pending', 'In Transit', 'Delivered', 'Delayed'];

  const filteredCargo = useMemo(() => {
    return cargo.filter(item => {
      // Search match
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch = !q || (
        item.code.toLowerCase().includes(q) ||
        item.title.toLowerCase().includes(q) ||
        (item.contents && item.contents.toLowerCase().includes(q)) ||
        (item.vehicleName && item.vehicleName.toLowerCase().includes(q)) ||
        (item.destination && item.destination.toLowerCase().includes(q)) ||
        (item.currentLocationName && item.currentLocationName.toLowerCase().includes(q)) ||
        (item.cargoType && item.cargoType.toLowerCase().includes(q))
      );

      // Status match
      const matchesStatus = selectedStatusFilter === 'All' || item.status === selectedStatusFilter;

      // Type match
      const matchesType = selectedTypeFilter === 'All' || item.cargoType === selectedTypeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [cargo, searchQuery, selectedStatusFilter, selectedTypeFilter]);

  const handleTrackCargo = (item: CargoItem) => {
    onSelectEntity('cargo', item.id);
    onFocusCoordinates([item.lat, item.lng]);
    setToastMessage(`Tracking ${item.code} (${item.title}) - Route projected on GIS map`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleStatusChange = (id: string, newStatus: CargoStatus) => {
    onUpdateCargoStatus(id, newStatus);
    setEditingCargoId(null);
    setToastMessage(`Manifest status updated to "${translateStatus(newStatus)}".`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const getStatusBadgeClass = (status: CargoStatus) => {
    switch (status) {
      case 'Delivered':
        return 'bg-[#E8F7EE] text-[#39A96B] border-[#39A96B]/30';
      case 'In Transit':
        return 'bg-[#FFF8EF] text-[#C96A20] border-[#F29A3D]/40';
      case 'Delayed':
        return 'bg-[#FDE8E8] text-[#E84D4D] border-[#E84D4D]/40';
      case 'Pending':
      default:
        return 'bg-[#F7F4EF] text-[#71808A] border-[#EAE3D5]';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-4"
    >
      {/* Top Header Card */}
      <div className="p-4 rounded-2xl bg-[#FFFCF8] border border-[#EAE3D5] warm-card-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FFE5C7] border border-[#F29A3D]/40 flex items-center justify-center text-[#C96A20] shrink-0">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-[#24313A] font-display">
              {t('cargo.title')}
            </h1>
            <p className="text-xs text-[#71808A]">
              Polar expedition supply manifests, route telemetry & cargo tracking
            </p>
          </div>
        </div>

        {/* Live Counters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="px-3 py-1.5 rounded-xl bg-[#F7F4EF] border border-[#EAE3D5] font-semibold text-[#24313A]">
            Total: <strong>{cargo.length} Lots</strong>
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-[#FFF8EF] border border-[#F29A3D]/30 font-semibold text-[#C96A20]">
            In Transit: <strong>{cargo.filter(c => c.status === 'In Transit').length}</strong>
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-[#FDE8E8] border border-[#E84D4D]/30 font-semibold text-[#E84D4D]">
            Delayed: <strong>{cargo.filter(c => c.status === 'Delayed').length}</strong>
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-[#E8F7EE] border border-[#39A96B]/30 font-semibold text-[#39A96B]">
            Delivered: <strong>{cargo.filter(c => c.status === 'Delivered').length}</strong>
          </span>
        </div>
      </div>

      {/* Toast feedback */}
      {toastMessage && (
        <div className="p-3 rounded-xl bg-[#FFF8EF] border border-[#F29A3D]/40 text-[#24313A] text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#C96A20] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Search and Filters Toolbar */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-[#FFFCF8] border border-[#EAE3D5] warm-card-shadow space-y-3">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71808A]" />
          <input
            id="cargo-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search manifests by ID (e.g. CRG-101), cargo title, vehicle, location, destination..."
            className="w-full pl-9 pr-8 py-2 rounded-xl bg-[#F7F4EF] border border-[#EAE3D5] text-xs text-[#24313A] placeholder-[#71808A] focus:outline-none focus:border-[#F29A3D] transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#71808A] hover:text-[#24313A] px-1"
            >
              ×
            </button>
          )}
        </div>

        {/* Filter Rows: Status and Type */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs pt-1">
          {/* Status Filter */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-[#71808A] uppercase tracking-wider mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3 text-[#F29A3D]" />
              Status:
            </span>
            {STATUS_FILTER_OPTIONS.map((st) => {
              const count = st === 'All' ? cargo.length : cargo.filter(c => c.status === st).length;
              const isSelected = selectedStatusFilter === st;
              return (
                <button
                  key={st}
                  id={`filter-status-${st.toLowerCase().replace(' ', '-')}`}
                  onClick={() => setSelectedStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer flex items-center gap-1 border ${
                    isSelected
                      ? 'bg-[#F29A3D] text-[#24313A] border-[#F29A3D] shadow-xs'
                      : 'bg-[#F7F4EF] text-[#71808A] border-[#EAE3D5] hover:border-[#F29A3D] hover:text-[#24313A]'
                  }`}
                >
                  <span>{st}</span>
                  <span className={`text-[10px] px-1 rounded ${isSelected ? 'bg-black/15' : 'bg-[#EAE3D5]'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Cargo Type Filter */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-[#71808A] uppercase tracking-wider">
              Type:
            </span>
            <select
              id="cargo-type-select-filter"
              value={selectedTypeFilter}
              onChange={(e) => setSelectedTypeFilter(e.target.value as 'All' | CargoType)}
              className="py-1 px-2.5 rounded-lg bg-[#F7F4EF] border border-[#EAE3D5] text-xs font-bold text-[#24313A] focus:outline-none focus:border-[#F29A3D] cursor-pointer"
            >
              {TYPE_FILTER_OPTIONS.map((type) => (
                <option key={type} value={type}>
                  {type === 'All' ? 'All Types' : type}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Layout: Cargo Manifest Cards (Left) + GIS Projection Map (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Visual Cargo Manifest Cards */}
        <div className="lg:col-span-6 space-y-3.5">
          <div className="flex items-center justify-between text-xs font-bold text-[#71808A] uppercase tracking-wider px-1">
            <span>Cargo Manifests ({filteredCargo.length} {filteredCargo.length === 1 ? 'item' : 'items'})</span>
            {(searchQuery || selectedStatusFilter !== 'All' || selectedTypeFilter !== 'All') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedStatusFilter('All');
                  setSelectedTypeFilter('All');
                }}
                className="text-[11px] text-[#F29A3D] hover:underline cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>

          {filteredCargo.length === 0 ? (
            <div className="p-8 rounded-2xl bg-[#FFFCF8] border border-[#EAE3D5] text-center space-y-2">
              <Package className="w-8 h-8 text-[#71808A] mx-auto opacity-50" />
              <div className="text-sm font-bold text-[#24313A]">No cargo matches the selected criteria</div>
              <p className="text-xs text-[#71808A]">Try adjusting your search terms or filter selection.</p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {filteredCargo.map(item => {
                const isSelected = selectedEntity?.type === 'cargo' && selectedEntity.id === item.id;
                const isEditing = editingCargoId === item.id;

                return (
                  <div
                    key={item.id}
                    id={`cargo-card-${item.id}`}
                    className={`p-3.5 sm:p-4 rounded-2xl bg-[#FFFCF8] border transition-all space-y-3 ${
                      isSelected 
                        ? 'border-[#F29A3D] ring-2 ring-[#F29A3D]/20 shadow-md' 
                        : 'border-[#EAE3D5] warm-card-shadow hover:border-[#F29A3D]/50'
                    }`}
                  >
                    {/* Top Bar: Cargo ID, Type, Badges and Status */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-xs font-mono font-extrabold text-[#C96A20] bg-[#FFE5C7] px-2.5 py-0.5 rounded-md border border-[#F29A3D]/30">
                          {item.code}
                        </span>
                        <span className="text-[11px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-[#F7F4EF] text-[#71808A] border border-[#EAE3D5]">
                          {item.cargoType || 'Standard'}
                        </span>
                        {item.temperatureSensitive && (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-[#4AA9D8] bg-[#DFF3FA] px-2 py-0.5 rounded-md border border-[#4AA9D8]/30">
                            <ThermometerSnowflake className="w-3 h-3" />
                            Cold Chain
                          </span>
                        )}
                      </div>

                      {/* Status Badge */}
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md border shrink-0 ${getStatusBadgeClass(item.status)}`}>
                        ● {translateStatus(item.status)}
                      </span>
                    </div>

                    {/* Cargo Name */}
                    <div>
                      <h3 className="text-sm sm:text-base font-extrabold text-[#24313A] font-display leading-snug">
                        {item.title}
                      </h3>
                    </div>

                    {/* Essential Fields Grid: Quantity, Vehicle, ETA, Current Location, Destination */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-3 rounded-xl bg-[#F7F4EF] border border-[#EAE3D5] text-xs">
                      {/* Quantity */}
                      <div>
                        <span className="text-[10px] text-[#71808A] uppercase block font-semibold flex items-center gap-1">
                          <Package className="w-3 h-3 text-[#39A96B]" />
                          Quantity
                        </span>
                        <div className="font-bold text-[#24313A] truncate mt-0.5">
                          {item.quantity || `${item.weightKg} kg`}
                        </div>
                      </div>

                      {/* Assigned Vehicle */}
                      <div>
                        <span className="text-[10px] text-[#71808A] uppercase block font-semibold flex items-center gap-1">
                          <Truck className="w-3 h-3 text-[#4AA9D8]" />
                          Vehicle
                        </span>
                        <div className="font-bold text-[#24313A] truncate mt-0.5">
                          {item.vehicleName || 'Awaiting Convoy'}
                        </div>
                      </div>

                      {/* ETA */}
                      <div>
                        <span className="text-[10px] text-[#71808A] uppercase block font-semibold flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#C96A20]" />
                          ETA
                        </span>
                        <div className="font-bold font-mono text-[#C96A20] truncate mt-0.5">
                          {item.eta}
                        </div>
                      </div>

                      {/* Current Location */}
                      <div>
                        <span className="text-[10px] text-[#71808A] uppercase block font-semibold flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#F29A3D]" />
                          Current Location
                        </span>
                        <div className="font-semibold text-[#24313A] truncate mt-0.5">
                          {item.currentLocationName || 'Field Sector'}
                        </div>
                      </div>

                      {/* Destination */}
                      <div className="col-span-1 sm:col-span-2">
                        <span className="text-[10px] text-[#71808A] uppercase block font-semibold flex items-center gap-1">
                          <ArrowRight className="w-3 h-3 text-[#C96A20]" />
                          Destination
                        </span>
                        <div className="font-bold text-[#24313A] truncate mt-0.5">
                          {item.destination}
                        </div>
                      </div>
                    </div>

                    {/* Inline Status Modifier row if toggled */}
                    {isEditing && (
                      <div className="p-3 rounded-xl bg-[#FFF8EF] border border-[#F29A3D]/40 space-y-2 animate-in fade-in">
                        <div className="text-[11px] font-bold text-[#24313A]">
                          Quick Status Update for {item.code}:
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                          {statusOptions.map(st => (
                            <button
                              key={st}
                              onClick={() => handleStatusChange(item.id, st)}
                              className={`px-2.5 py-1.5 text-xs rounded-lg font-bold transition-all cursor-pointer text-center ${
                                item.status === st
                                  ? 'bg-[#F29A3D] text-[#24313A] shadow-xs'
                                  : 'bg-[#FFFCF8] text-[#71808A] hover:bg-[#F7F4EF] border border-[#EAE3D5]'
                              }`}
                            >
                              {st}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons: [Details & History] [Track on Map] [Change Status] */}
                    <div className="flex flex-wrap items-center justify-between pt-2 border-t border-[#EAE3D5] gap-2">
                      <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                        <button
                          id={`cargo-details-btn-${item.id}`}
                          onClick={() => onOpenCargoDetails(item.id)}
                          className="flex-1 py-1.5 px-3 rounded-xl bg-[#F7F4EF] hover:bg-[#FFE5C7] border border-[#EAE3D5] text-[#24313A] text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Info className="w-3.5 h-3.5 text-[#F29A3D]" />
                          <span>Details & History</span>
                        </button>

                        <button
                          id={`cargo-track-btn-${item.id}`}
                          onClick={() => handleTrackCargo(item)}
                          className="flex-1 py-1.5 px-3 rounded-xl bg-[#F7F4EF] hover:bg-[#FFE5C7] border border-[#EAE3D5] text-[#24313A] text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Crosshair className="w-3.5 h-3.5 text-[#C96A20]" />
                          <span>{t('cargo.trackOnMap')}</span>
                        </button>
                      </div>

                      <button
                        id={`cargo-update-status-btn-${item.id}`}
                        onClick={() => setEditingCargoId(isEditing ? null : item.id)}
                        className="py-1.5 px-3 rounded-xl bg-[#F7F4EF] hover:bg-[#EAE3D5] border border-[#EAE3D5] text-[#71808A] hover:text-[#24313A] text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                      >
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                        <span>{isEditing ? t('common.cancel') : 'Status'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Visual GIS Map Location */}
        <div className="lg:col-span-6 space-y-3 sticky top-4">
          <div className="p-4 rounded-2xl bg-[#FFFCF8] border border-[#EAE3D5] warm-card-shadow space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[#C96A20] font-bold uppercase tracking-wider">{t('cargo.gisTracking')}</span>
                <h4 className="text-sm font-bold text-[#24313A]">{t('cargo.consignmentLocations')}</h4>
              </div>
              <div className="flex items-center gap-1 text-xs text-[#39A96B] font-semibold">
                <span className="w-2 h-2 rounded-full bg-[#39A96B] live-indicator" />
                <span>GIS Live Overlay</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-[#FFF8EF] border border-[#F29A3D]/30 text-xs text-[#24313A] flex items-center justify-between">
              <span className="text-[11px]">
                Clicking any cargo marker opens its complete details & movement timeline.
              </span>
              {selectedEntity?.type === 'cargo' && (
                <span className="font-bold text-[#C96A20] shrink-0 text-[11px]">
                  Route Projected
                </span>
              )}
            </div>

            <PolarMap
              personnel={personnel}
              vehicles={vehicles}
              cargo={cargo}
              camps={camps}
              emergencies={emergencies}
              activeFilter="cargo"
              selectedEntity={selectedEntity}
              onFilterChange={onFilterChange}
              onSelectEntity={onSelectEntity}
              onOpenCargoDetails={onOpenCargoDetails}
              heightClass="h-[460px] sm:h-[540px]"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};
