import React, { useState } from 'react';
import {
  X,
  Boxes,
  MapPin,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  Truck,
  Plus,
  Minus,
  CheckCircle2,
  Calendar,
  Layers,
  ThermometerSnowflake,
  Activity,
  History,
  Info,
  ChevronRight
} from 'lucide-react';
import { InventoryItem, CargoItem, InventoryStatus, InventoryCategory } from '../types';
import { useTranslation } from '../i18n';

interface InventoryDetailModalProps {
  item: InventoryItem | null;
  cargoList: CargoItem[];
  onClose: () => void;
  onReceiveStock: (id: string, amount: number, notes?: string, performedBy?: string) => void;
  onConsumeStock: (id: string, amount: number, notes?: string, performedBy?: string) => void;
  onDeliverCargo?: (cargoId: string) => void;
  onOpenCargoDetails?: (cargoId: string) => void;
}

export const InventoryDetailModal: React.FC<InventoryDetailModalProps> = ({
  item,
  cargoList,
  onClose,
  onReceiveStock,
  onConsumeStock,
  onDeliverCargo,
  onOpenCargoDetails
}) => {
  const { t, translateStatus } = useTranslation();
  const [customAmount, setCustomAmount] = useState<number>(1);
  const [actionNote, setActionNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'controls'>('overview');

  if (!item) return null;

  // Find linked cargo if any
  const relatedCargo = cargoList.find(
    c =>
      c.id === item.relatedCargoId ||
      c.code === item.relatedCargoCode ||
      c.relatedInventoryId === item.id
  );

  const getStatusBadgeStyle = (status: InventoryStatus) => {
    switch (status) {
      case 'Available':
        return 'bg-[#E8F7EE] text-[#2E7D32] border-[#A5D6A7]';
      case 'Incoming':
        return 'bg-[#DFF3FA] text-[#0284C7] border-[#93C5FD]';
      case 'Used':
        return 'bg-[#F1F3F5] text-[#5A6872] border-[#D1D5DB]';
      case 'Low Stock':
        return 'bg-[#FFF8EF] text-[#C96A20] border-[#F29A3D]/50';
      case 'Critical':
        return 'bg-[#FDE8E8] text-[#D32F2F] border-[#EF9A9A] animate-pulse';
      default:
        return 'bg-[#F7F4EF] text-[#71808A] border-[#EAE3D5]';
    }
  };

  const getCategoryBadgeStyle = (cat: InventoryCategory) => {
    switch (cat) {
      case 'Medical':
        return 'bg-[#FFEBEB] text-[#D32F2F] border-[#FFCDD2]';
      case 'Fuel':
        return 'bg-[#FFF3E0] text-[#E65100] border-[#FFE0B2]';
      case 'Provisions':
      case 'Food':
        return 'bg-[#E8F5E9] text-[#2E7D32] border-[#C8E6C9]';
      case 'Equipment':
        return 'bg-[#E8EAF6] text-[#283593] border-[#C5CAE9]';
      case 'Scientific':
        return 'bg-[#E0F7FA] text-[#006064] border-[#B2EBF2]';
      default:
        return 'bg-[#F7F4EF] text-[#71808A] border-[#EAE3D5]';
    }
  };

  const handleQuickIntake = (amount: number) => {
    setIsSubmitting(true);
    onReceiveStock(item.id, amount, `Quick stock intake (+${amount} ${item.unit})`, 'Logistics Officer');
    setTimeout(() => setIsSubmitting(false), 200);
  };

  const handleQuickConsume = (amount: number) => {
    setIsSubmitting(true);
    onConsumeStock(item.id, amount, `Quick consumption (-${amount} ${item.unit})`, 'Field Operator');
    setTimeout(() => setIsSubmitting(false), 200);
  };

  const handleCustomAction = (type: 'receive' | 'consume') => {
    const val = Number(customAmount);
    if (!val || val <= 0) return;
    setIsSubmitting(true);
    if (type === 'receive') {
      onReceiveStock(
        item.id,
        val,
        actionNote.trim() || `Manual stock intake of +${val} ${item.unit}`,
        'Logistics Officer'
      );
    } else {
      onConsumeStock(
        item.id,
        val,
        actionNote.trim() || `Manual outbound dispatch of ${val} ${item.unit}`,
        'Field Operator'
      );
    }
    setActionNote('');
    setTimeout(() => setIsSubmitting(false), 200);
  };

  const percentage = item.maxCapacity
    ? Math.min(100, Math.round((item.quantity / item.maxCapacity) * 100))
    : 100;

  const getBarColor = (status: InventoryStatus) => {
    if (status === 'Critical') return 'bg-[#E84D4D]';
    if (status === 'Low Stock') return 'bg-[#F29A3D]';
    if (status === 'Used') return 'bg-[#71808A]';
    return 'bg-[#39A96B]';
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-[#24313A]/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        id="inventory-detail-modal"
        className="w-full max-w-3xl max-h-[92vh] flex flex-col rounded-2xl bg-[#FFFCF8] border border-[#EAE3D5] warm-card-shadow overflow-hidden text-[#24313A]"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#FFFCF8] to-[#FFF9F2] border-b border-[#EAE3D5] flex items-start justify-between shrink-0">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#FFE5C7] border border-[#F29A3D]/40 flex items-center justify-center text-[#C96A20] shrink-0 mt-0.5 shadow-xs">
              <Boxes className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs font-extrabold text-[#C96A20] bg-[#FFE5C7] px-2.5 py-0.5 rounded-md border border-[#F29A3D]/30">
                  {item.id}
                </span>
                <span className={`text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-md border ${getCategoryBadgeStyle(item.category)}`}>
                  {item.category}
                </span>
                <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-md border ${getStatusBadgeStyle(item.status)}`}>
                  ● {item.status}
                </span>
                {item.temperatureControlled && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-[#4AA9D8] bg-[#DFF3FA] px-2 py-0.5 rounded-md border border-[#4AA9D8]/30">
                    <ThermometerSnowflake className="w-3 h-3" />
                    Cold Chain
                  </span>
                )}
              </div>
              <h2 className="text-base sm:text-lg font-extrabold text-[#24313A] mt-1 font-display">
                {item.name}
              </h2>
            </div>
          </div>

          <button 
            id="close-inventory-detail-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#71808A] hover:text-[#24313A] hover:bg-[#F7F4EF] transition-colors cursor-pointer shrink-0 ml-2"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex border-b border-[#EAE3D5] bg-[#F7F4EF]/50 px-4 sm:px-5 shrink-0 gap-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2.5 px-3 text-xs font-extrabold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'overview'
                ? 'border-[#F29A3D] text-[#C96A20]'
                : 'border-transparent text-[#71808A] hover:text-[#24313A]'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            Stock Information
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-2.5 px-3 text-xs font-extrabold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'border-[#F29A3D] text-[#C96A20]'
                : 'border-transparent text-[#71808A] hover:text-[#24313A]'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            Movement History ({item.history?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('controls')}
            className={`py-2.5 px-3 text-xs font-extrabold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'controls'
                ? 'border-[#F29A3D] text-[#C96A20]'
                : 'border-transparent text-[#71808A] hover:text-[#24313A]'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            Stock Controls
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'overview' && (
            <>
              {/* Primary Stock Status Hero Card */}
              <div className="p-4 rounded-xl bg-[#FFFBF5] border border-[#EAE3D5] space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#71808A] tracking-wider block">
                      Current Available Inventory
                    </span>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-3xl sm:text-4xl font-black text-[#24313A] font-mono">
                        {item.quantity.toLocaleString()}
                      </span>
                      <span className="text-base font-bold text-[#71808A]">
                        {item.unit}
                      </span>
                      <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full border ml-2 ${getStatusBadgeStyle(item.status)}`}>
                        {item.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      disabled={isSubmitting}
                      onClick={() => handleQuickConsume(1)}
                      className="px-3 py-1.5 rounded-lg border border-[#EAE3D5] bg-[#FFFCF8] hover:bg-[#F7F4EF] text-[#24313A] text-xs font-bold transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                      title="Quick consume 1 unit"
                    >
                      <Minus className="w-3.5 h-3.5 text-[#E84D4D]" />
                      <span>Use 1</span>
                    </button>
                    <button
                      disabled={isSubmitting}
                      onClick={() => handleQuickIntake(1)}
                      className="px-3 py-1.5 rounded-lg border border-[#F29A3D]/40 bg-[#FFE5C7] hover:bg-[#F29A3D]/30 text-[#C96A20] text-xs font-extrabold transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                      title="Quick intake 1 unit"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add 1</span>
                    </button>
                  </div>
                </div>

                {/* Stock Level Progress Bar */}
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-xs text-[#71808A]">
                    <span>Depot Capacity Fill</span>
                    <span className="font-bold text-[#24313A]">{percentage}% ({item.quantity} / {item.maxCapacity} {item.unit})</span>
                  </div>
                  <div className="w-full bg-[#EAE3D5] rounded-full h-2.5 overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${getBarColor(item.status)}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Complete Item Information Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                {/* Storage Location */}
                <div className="p-3 rounded-xl bg-[#F7F4EF] border border-[#EAE3D5]">
                  <span className="text-[10px] text-[#71808A] uppercase font-bold flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#F29A3D]" />
                    Storage Location
                  </span>
                  <strong className="text-xs font-bold text-[#24313A] block mt-1">
                    {item.storageLocation}
                  </strong>
                </div>

                {/* Incoming Quantity */}
                <div className="p-3 rounded-xl bg-[#F7F4EF] border border-[#EAE3D5]">
                  <span className="text-[10px] text-[#71808A] uppercase font-bold flex items-center gap-1">
                    <ArrowDownLeft className="w-3.5 h-3.5 text-[#0284C7]" />
                    Incoming Quantity
                  </span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <strong className="text-sm font-black text-[#0284C7] font-mono">
                      {item.incomingQuantity || 0}
                    </strong>
                    <span className="text-[#71808A] font-bold">{item.unit}</span>
                  </div>
                  <span className="text-[10px] text-[#71808A] block mt-0.5">
                    {item.incomingQuantity > 0 ? 'En route via cargo' : 'No shipments pending'}
                  </span>
                </div>

                {/* Used / Consumed */}
                <div className="p-3 rounded-xl bg-[#F7F4EF] border border-[#EAE3D5]">
                  <span className="text-[10px] text-[#71808A] uppercase font-bold flex items-center gap-1">
                    <ArrowUpRight className="w-3.5 h-3.5 text-[#E84D4D]" />
                    Used / Consumed
                  </span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <strong className="text-sm font-black text-[#5A6872] font-mono">
                      {item.usedQuantity || 0}
                    </strong>
                    <span className="text-[#71808A] font-bold">{item.unit}</span>
                  </div>
                  <span className="text-[10px] text-[#71808A] block mt-0.5">
                    Logged outbound usage
                  </span>
                </div>

                {/* Threshold Limits */}
                <div className="p-3 rounded-xl bg-[#F7F4EF] border border-[#EAE3D5]">
                  <span className="text-[10px] text-[#71808A] uppercase font-bold flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-[#F29A3D]" />
                    Stock Thresholds
                  </span>
                  <div className="mt-1 space-y-0.5">
                    <div className="text-[11px] text-[#71808A]">
                      Min Threshold: <strong className="text-[#24313A]">{item.minThreshold} {item.unit}</strong>
                    </div>
                    <div className="text-[11px] text-[#71808A]">
                      Critical: <strong className="text-[#E84D4D]">{item.criticalThreshold} {item.unit}</strong>
                    </div>
                  </div>
                </div>

                {/* Last Updated */}
                <div className="p-3 rounded-xl bg-[#F7F4EF] border border-[#EAE3D5]">
                  <span className="text-[10px] text-[#71808A] uppercase font-bold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#C96A20]" />
                    Last Updated
                  </span>
                  <strong className="text-xs font-bold text-[#24313A] block mt-1">
                    {item.lastUpdated}
                  </strong>
                  <span className="text-[10px] text-[#71808A] block mt-0.5">
                    Real-time telemetry sync
                  </span>
                </div>

                {/* Batch / Lot */}
                <div className="p-3 rounded-xl bg-[#F7F4EF] border border-[#EAE3D5]">
                  <span className="text-[10px] text-[#71808A] uppercase font-bold flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#39A96B]" />
                    Batch & Spec
                  </span>
                  <strong className="text-xs font-mono text-[#24313A] block mt-1">
                    {item.lotNumber || 'N/A'}
                  </strong>
                  {item.expiryDate && (
                    <span className="text-[10px] text-[#71808A] block mt-0.5">
                      Exp: <strong className="text-[#24313A]">{item.expiryDate}</strong>
                    </span>
                  )}
                </div>
              </div>

              {/* Related Cargo Section */}
              <div className="p-3.5 sm:p-4 rounded-xl bg-[#FFF8EF] border border-[#F29A3D]/40 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#24313A] uppercase tracking-wider flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-[#C96A20]" />
                    Related Cargo Consignment
                  </span>
                  {relatedCargo && (
                    <span className="font-mono text-xs font-extrabold text-[#C96A20] bg-[#FFE5C7] px-2 py-0.5 rounded">
                      {relatedCargo.code}
                    </span>
                  )}
                </div>

                {relatedCargo ? (
                  <div className="space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-lg bg-[#FFFCF8] border border-[#EAE3D5]">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold text-[#24313A]">
                            {relatedCargo.title}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            relatedCargo.status === 'Delivered'
                              ? 'bg-[#E8F7EE] text-[#39A96B]'
                              : relatedCargo.status === 'Delayed'
                              ? 'bg-[#FDE8E8] text-[#E84D4D]'
                              : 'bg-[#FFF8EF] text-[#C96A20]'
                          }`}>
                            ● {relatedCargo.status}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#71808A] mt-0.5">
                          Carrier: <strong className="text-[#24313A]">{relatedCargo.vehicleName || 'Arctic Convoy'}</strong> • ETA: <strong className="text-[#24313A]">{relatedCargo.eta}</strong>
                        </div>
                        <div className="text-[11px] text-[#71808A]">
                          Route: <span>{relatedCargo.origin || 'Base Camp'}</span> ➔ <span>{relatedCargo.destination}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {relatedCargo.status !== 'Delivered' && onDeliverCargo && (
                          <button
                            onClick={() => onDeliverCargo(relatedCargo.id)}
                            className="px-3 py-1.5 rounded-lg bg-[#39A96B] hover:bg-[#2d8755] text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-xs"
                            title="Deliver consignment and auto-update this inventory stock"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Receive / Deliver Cargo</span>
                          </button>
                        )}
                        {onOpenCargoDetails && (
                          <button
                            onClick={() => {
                              onClose();
                              onOpenCargoDetails(relatedCargo.id);
                            }}
                            className="p-1.5 rounded-lg border border-[#EAE3D5] hover:bg-[#F7F4EF] text-[#71808A] hover:text-[#24313A] transition-colors cursor-pointer"
                            title="Inspect full cargo consignment"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="text-[11px] text-[#71808A]">
                      {relatedCargo.status === 'Delivered' ? (
                        <span className="text-[#39A96B] font-bold">
                          ✓ Delivered and credited (+{relatedCargo.deliveredQuantityValue || 10} {item.unit}).
                        </span>
                      ) : (
                        <span>
                          Delivering {relatedCargo.code} will credit +{relatedCargo.deliveredQuantityValue || 10} {item.unit} to stock.
                        </span>
                      )}
                    </p>
                  </div>
                ) : (
                  <div className="p-3 rounded-lg bg-[#FFFCF8] border border-[#EAE3D5] text-xs text-[#71808A]">
                    No active cargo consignment linked to this item.
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === 'history' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase text-[#24313A] tracking-wider">
                    Stock Movement & Audit Log
                  </h3>
                  <p className="text-[11px] text-[#71808A]">
                    Chronological audit log of movements and deliveries.
                  </p>
                </div>
                <span className="text-xs font-extrabold text-[#C96A20] bg-[#FFE5C7] px-2.5 py-0.5 rounded-md">
                  {item.history?.length || 0} entries
                </span>
              </div>

              {item.history && item.history.length > 0 ? (
                <div className="space-y-2">
                  {item.history.map((mvt) => {
                    const isPositive = mvt.quantityChange > 0;
                    return (
                      <div
                        key={mvt.id}
                        className="p-3 rounded-xl bg-[#F7F4EF]/80 border border-[#EAE3D5] hover:border-[#F29A3D]/40 transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-2"
                      >
                        <div className="space-y-1 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                              mvt.type === 'Delivered Cargo'
                                ? 'bg-[#DFF3FA] text-[#0284C7] border border-[#0284C7]/30'
                                : mvt.type === 'Stock Intake' || mvt.type === 'Inbound'
                                ? 'bg-[#E8F7EE] text-[#39A96B] border border-[#39A96B]/30'
                                : 'bg-[#FFF8EF] text-[#C96A20] border border-[#F29A3D]/30'
                            }`}>
                              {mvt.type}
                            </span>
                            <span className="text-[11px] text-[#71808A] flex items-center gap-1">
                              <Clock className="w-3 h-3 text-[#71808A]" />
                              {mvt.timestamp}
                            </span>
                            {mvt.relatedCargoCode && (
                              <span className="font-mono text-[10px] font-bold text-[#C96A20] bg-[#FFE5C7] px-1.5 py-0.2 rounded">
                                {mvt.relatedCargoCode}
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-[#24313A] font-medium">
                            {mvt.notes}
                          </p>

                          <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#71808A]">
                            <span>Location: <strong className="text-[#24313A]">{mvt.location}</strong></span>
                            <span>By: <strong className="text-[#24313A]">{mvt.performedBy}</strong></span>
                          </div>
                        </div>

                        <div className="text-right sm:text-right shrink-0 border-t sm:border-t-0 pt-1.5 sm:pt-0 border-[#EAE3D5]">
                          <div className={`text-sm font-black font-mono ${isPositive ? 'text-[#39A96B]' : 'text-[#E84D4D]'}`}>
                            {isPositive ? `+${mvt.quantityChange}` : mvt.quantityChange} {item.unit}
                          </div>
                          <div className="text-[11px] text-[#71808A] font-bold">
                            Balance: <span className="font-mono text-[#24313A]">{mvt.resultingQuantity} {item.unit}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center rounded-xl bg-[#F7F4EF] border border-[#EAE3D5] text-xs text-[#71808A]">
                  No historical stock movements logged yet.
                </div>
              )}
            </div>
          )}

          {activeTab === 'controls' && (
            <div className="space-y-4">
              {/* Quick Preset Buttons */}
              <div className="p-4 rounded-xl bg-[#F7F4EF]/80 border border-[#EAE3D5] space-y-3">
                <span className="text-xs font-bold uppercase text-[#24313A] tracking-wider block">
                  Stock Adjustments
                </span>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  {/* Quick Intake Presets */}
                  <div className="space-y-2 p-3 rounded-lg bg-[#FFFCF8] border border-[#EAE3D5]">
                    <span className="text-[11px] font-bold text-[#39A96B] uppercase flex items-center gap-1">
                      <Plus className="w-3.5 h-3.5" />
                      Quick Inbound / Receive
                    </span>
                    <div className="flex gap-2">
                      {[1, 5, 20].map((num) => (
                        <button
                          key={`in-${num}`}
                          onClick={() => handleQuickIntake(num)}
                          disabled={isSubmitting}
                          className="flex-1 py-1.5 rounded-lg border border-[#39A96B]/40 bg-[#E8F7EE] hover:bg-[#39A96B]/20 text-[#39A96B] text-xs font-extrabold transition-all cursor-pointer disabled:opacity-50"
                        >
                          +{num}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quick Outbound Presets */}
                  <div className="space-y-2 p-3 rounded-lg bg-[#FFFCF8] border border-[#EAE3D5]">
                    <span className="text-[11px] font-bold text-[#E84D4D] uppercase flex items-center gap-1">
                      <Minus className="w-3.5 h-3.5" />
                      Quick Consumption / Outbound
                    </span>
                    <div className="flex gap-2">
                      {[1, 5, 20].map((num) => (
                        <button
                          key={`out-${num}`}
                          onClick={() => handleQuickConsume(num)}
                          disabled={isSubmitting || item.quantity <= 0}
                          className="flex-1 py-1.5 rounded-lg border border-[#E84D4D]/40 bg-[#FDE8E8] hover:bg-[#E84D4D]/20 text-[#E84D4D] text-xs font-extrabold transition-all cursor-pointer disabled:opacity-50"
                        >
                          -{num}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Custom Quantity & Note Form */}
              <div className="p-4 rounded-xl bg-[#FFFBF5] border border-[#F29A3D]/40 space-y-3">
                <span className="text-xs font-bold uppercase text-[#24313A] tracking-wider block">
                  Log Custom Stock Movement
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-[#71808A] block mb-1">
                      Quantity ({item.unit})
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={5000}
                      value={customAmount}
                      onChange={(e) => setCustomAmount(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full px-3 py-2 rounded-lg bg-[#FFFCF8] border border-[#EAE3D5] text-[#24313A] text-xs font-bold focus:outline-none focus:border-[#F29A3D]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-[#71808A] block mb-1">
                      Movement Reason / Notes
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Field team restock, generator drain..."
                      value={actionNote}
                      onChange={(e) => setActionNote(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#FFFCF8] border border-[#EAE3D5] text-[#24313A] text-xs focus:outline-none focus:border-[#F29A3D]"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => handleCustomAction('receive')}
                    disabled={isSubmitting}
                    className="flex-1 py-2 px-3 rounded-lg bg-[#39A96B] hover:bg-[#2d8755] text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Receive +{customAmount} {item.unit}</span>
                  </button>

                  <button
                    onClick={() => handleCustomAction('consume')}
                    disabled={isSubmitting || item.quantity <= 0}
                    className="flex-1 py-2 px-3 rounded-lg bg-[#E84D4D] hover:bg-[#c93b3b] text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-xs"
                  >
                    <Minus className="w-4 h-4" />
                    <span>Consume -{customAmount} {item.unit}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-[#F7F4EF] border-t border-[#EAE3D5] flex items-center justify-between text-xs text-[#71808A] shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#39A96B] animate-pulse" />
            <span>Stock telemetry verified • Svalbard Depot</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-[#EAE3D5] bg-[#FFFCF8] hover:bg-[#F7F4EF] text-[#24313A] font-bold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
