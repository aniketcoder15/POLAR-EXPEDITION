import React from 'react';
import { 
  X, 
  Package, 
  MapPin, 
  Truck, 
  Clock, 
  ThermometerSnowflake, 
  Compass, 
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Calendar,
  Layers,
  Weight,
  Boxes
} from 'lucide-react';
import { CargoItem, CargoStatus } from '../types';
import { useTranslation } from '../i18n';

interface CargoDetailModalProps {
  cargo: CargoItem | null;
  onClose: () => void;
  onUpdateStatus: (id: string, status: CargoStatus) => void;
  onTrackOnMap: (cargo: CargoItem) => void;
}

const STATUS_ORDER: CargoStatus[] = ['Pending', 'In Transit', 'Delivered', 'Delayed'];

export const CargoDetailModal: React.FC<CargoDetailModalProps> = ({
  cargo,
  onClose,
  onUpdateStatus,
  onTrackOnMap
}) => {
  const { t, translateStatus } = useTranslation();

  if (!cargo) return null;

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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-[#24313A]/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        id="cargo-detail-modal"
        className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-[#FFFCF8] border border-[#EAE3D5] warm-card-shadow overflow-hidden text-[#24313A]"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#FFFCF8] to-[#FFF9F2] border-b border-[#EAE3D5] flex items-start justify-between shrink-0">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#FFE5C7] border border-[#F29A3D]/40 flex items-center justify-center text-[#C96A20] shrink-0 mt-0.5">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs font-extrabold text-[#C96A20] bg-[#FFE5C7] px-2.5 py-0.5 rounded-md">
                  {cargo.code}
                </span>
                <span className="text-[11px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-[#F7F4EF] text-[#71808A] border border-[#EAE3D5]">
                  {cargo.cargoType || 'General Cargo'}
                </span>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md border ${getStatusBadgeClass(cargo.status)}`}>
                  ● {translateStatus(cargo.status)}
                </span>
                {cargo.temperatureSensitive && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-[#4AA9D8] bg-[#DFF3FA] px-2 py-0.5 rounded-md border border-[#4AA9D8]/30">
                    <ThermometerSnowflake className="w-3 h-3" />
                    Temp Controlled
                  </span>
                )}
              </div>
              <h2 className="text-base sm:text-lg font-extrabold text-[#24313A] mt-1 font-display">
                {cargo.title}
              </h2>
              {cargo.contents && (
                <p className="text-xs text-[#71808A] mt-0.5">
                  {cargo.contents}
                </p>
              )}
            </div>
          </div>

          <button 
            id="close-cargo-detail-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#71808A] hover:text-[#24313A] hover:bg-[#F7F4EF] transition-colors cursor-pointer shrink-0"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* Quick Status Bar */}
          <div className="p-3 sm:p-3.5 rounded-xl bg-[#F7F4EF]/80 border border-[#EAE3D5] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#71808A] uppercase tracking-wider">
                Logistics Status Workflow (Click to change status)
              </span>
              <span className="text-xs text-[#71808A]">
                Last updated: <strong className="text-[#24313A]">{cargo.lastUpdated || 'Recently'}</strong>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-0.5">
              {STATUS_ORDER.map((st) => {
                const isCurrent = cargo.status === st;
                return (
                  <button
                    key={st}
                    onClick={() => onUpdateStatus(cargo.id, st)}
                    className={`px-2.5 py-1.5 rounded-xl text-left border text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
                      isCurrent
                        ? st === 'Delivered'
                          ? 'bg-[#39A96B] text-white border-[#39A96B] shadow-xs'
                          : st === 'Delayed'
                          ? 'bg-[#E84D4D] text-white border-[#E84D4D] shadow-xs'
                          : 'bg-[#F29A3D] text-[#24313A] border-[#F29A3D] shadow-xs'
                        : 'bg-[#FFFCF8] text-[#71808A] border-[#EAE3D5] hover:border-[#F29A3D] hover:text-[#24313A]'
                    }`}
                  >
                    <span>{st}</span>
                    {isCurrent && <span className="text-xs">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Key Logistics Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            {/* Cargo ID & Type */}
            <div className="p-3 rounded-xl bg-[#F7F4EF] border border-[#EAE3D5]">
              <span className="text-[10px] text-[#71808A] uppercase font-bold flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-[#F29A3D]" />
                Cargo ID & Type
              </span>
              <strong className="text-sm font-extrabold text-[#24313A] block mt-1 font-mono">
                {cargo.code} <span className="text-xs text-[#71808A] font-normal">({cargo.id})</span>
              </strong>
              <span className="text-[11px] text-[#71808A] block mt-0.5">
                Type: <strong className="text-[#24313A]">{cargo.cargoType || 'Standard'}</strong>
              </span>
            </div>

            {/* Quantity / Weight */}
            <div className="p-3 rounded-xl bg-[#F7F4EF] border border-[#EAE3D5]">
              <span className="text-[10px] text-[#71808A] uppercase font-bold flex items-center gap-1">
                <Weight className="w-3.5 h-3.5 text-[#39A96B]" />
                Quantity & Weight
              </span>
              <strong className="text-sm font-extrabold text-[#24313A] block mt-1">
                {cargo.quantity || `${cargo.weightKg} kg`}
              </strong>
              <span className="text-[11px] text-[#71808A] block mt-0.5">
                Gross weight: <strong className="text-[#24313A]">{cargo.weightKg} kg</strong>
              </span>
            </div>

            {/* Assigned Vehicle */}
            <div className="p-3 rounded-xl bg-[#F7F4EF] border border-[#EAE3D5]">
              <span className="text-[10px] text-[#71808A] uppercase font-bold flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-[#4AA9D8]" />
                Assigned Vehicle
              </span>
              <strong className="text-sm font-extrabold text-[#24313A] block mt-1 truncate">
                {cargo.vehicleName || 'Awaiting Transport'}
              </strong>
              <span className="text-[11px] text-[#71808A] block mt-0.5">
                Telemetry link: <strong className="text-[#39A96B]">Active GPS Fix</strong>
              </span>
            </div>

            {/* Current Location */}
            <div className="p-3 rounded-xl bg-[#F7F4EF] border border-[#EAE3D5]">
              <span className="text-[10px] text-[#71808A] uppercase font-bold flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#F29A3D]" />
                Current Location
              </span>
              <strong className="text-sm font-extrabold text-[#24313A] block mt-1 truncate">
                {cargo.currentLocationName || 'En route'}
              </strong>
              <span className="text-[11px] font-mono text-[#71808A] block mt-0.5">
                {cargo.lat.toFixed(4)}°N, {cargo.lng.toFixed(4)}°E
              </span>
            </div>

            {/* Route & Destination */}
            <div className="p-3 rounded-xl bg-[#F7F4EF] border border-[#EAE3D5]">
              <span className="text-[10px] text-[#71808A] uppercase font-bold flex items-center gap-1">
                <ArrowRight className="w-3.5 h-3.5 text-[#C96A20]" />
                Route & Destination
              </span>
              <div className="mt-1 space-y-0.5">
                <div className="text-[11px] text-[#71808A]">
                  Origin: <strong className="text-[#24313A]">{cargo.origin || 'Base Camp'}</strong>
                </div>
                <div className="text-[11px] text-[#71808A]">
                  Dest: <strong className="text-[#24313A]">{cargo.destination}</strong>
                </div>
              </div>
            </div>

            {/* Status & ETA */}
            <div className="p-3 rounded-xl bg-[#F7F4EF] border border-[#EAE3D5]">
              <span className="text-[10px] text-[#71808A] uppercase font-bold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#C96A20]" />
                Status & ETA
              </span>
              <strong className="text-sm font-extrabold text-[#C96A20] block mt-1">
                {cargo.eta}
              </strong>
              <span className="text-[11px] text-[#71808A] block mt-0.5">
                Status: <strong className="text-[#24313A]">{cargo.status}</strong>
              </span>
            </div>
          </div>

          {/* Synchronized Depot Inventory Integration Card */}
          {cargo.relatedInventoryId && (
            <div className="p-3.5 rounded-xl bg-[#FFF8EF] border border-[#F29A3D]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#FFE5C7] border border-[#F29A3D]/30 flex items-center justify-center text-[#C96A20] shrink-0 mt-0.5">
                  <Boxes className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-extrabold text-[#24313A] flex items-center gap-1.5">
                    <span>Synchronized Depot Stock:</span>
                    <span className="font-mono text-[#C96A20] bg-[#FFE5C7] px-2 py-0.2 rounded font-bold">
                      {cargo.relatedInventoryId}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#71808A] mt-0.5">
                    {cargo.status === 'Delivered' ? (
                      <span className="text-[#39A96B] font-bold">
                        ✓ Delivered! {cargo.deliveredQuantityValue || 10} units credited into depot inventory with logged movement audit.
                      </span>
                    ) : (
                      <span>
                        ★ Marking as &quot;Delivered&quot; auto-transfers {cargo.deliveredQuantityValue || 10} units directly into inventory stock.
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {cargo.status !== 'Delivered' && (
                <button
                  onClick={() => onUpdateStatus(cargo.id, 'Delivered')}
                  className="px-3 py-1.5 rounded-lg bg-[#39A96B] hover:bg-[#2d8755] text-white text-xs font-bold transition-all cursor-pointer shrink-0 shadow-xs"
                >
                  Mark Delivered &amp; Sync
                </button>
              )}
            </div>
          )}

          {/* Movement & History Timeline */}
          <div className="p-4 rounded-xl bg-[#F7F4EF]/60 border border-[#EAE3D5] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#24313A] uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#F29A3D]" />
                Movement & History Timeline
              </span>
              <span className="text-[11px] text-[#71808A]">
                {cargo.timeline?.length || 0} event milestones
              </span>
            </div>

            {cargo.timeline && cargo.timeline.length > 0 ? (
              <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#EAE3D5] pl-1">
                {cargo.timeline.map((evt, idx) => {
                  const isLatest = idx === cargo.timeline!.length - 1;
                  return (
                    <div key={evt.id || idx} className="relative flex items-start gap-3 text-xs pl-6">
                      <div className={`absolute left-1.5 top-1.5 -translate-x-1/2 w-3 h-3 rounded-full border-2 border-[#FFFCF8] ${
                        isLatest ? 'bg-[#F29A3D] ring-2 ring-[#F29A3D]/30' : 'bg-[#71808A]'
                      }`} />
                      <div className="flex-1 bg-[#FFFCF8] p-2.5 rounded-xl border border-[#EAE3D5]">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-[#24313A] text-xs">
                            {evt.location}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${getStatusBadgeClass(evt.status)}`}>
                              {evt.status}
                            </span>
                            <span className="text-[10px] text-[#71808A] font-mono">
                              {evt.time}
                            </span>
                          </div>
                        </div>
                        {evt.note && (
                          <p className="text-[11px] text-[#71808A] mt-1">
                            {evt.note}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-4 text-xs text-[#71808A]">
                No movement history recorded yet for this manifest.
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#FFFCF8] border-t border-[#EAE3D5] flex items-center justify-between gap-3 shrink-0">
          <button
            id="track-cargo-on-gis-modal-btn"
            onClick={() => {
              onTrackOnMap(cargo);
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-[#F29A3D] hover:bg-[#FFB45A] text-[#24313A] text-xs font-extrabold flex items-center gap-2 transition-all shadow-xs cursor-pointer"
          >
            <Compass className="w-4 h-4 text-[#24313A]" />
            <span>Track on GIS Map</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#24313A] hover:bg-[#344450] text-white text-xs font-bold transition-all cursor-pointer"
          >
            {t('common.close')}
          </button>
        </div>
      </div>
    </div>
  );
};
