import React, { useState, useMemo } from 'react';
import { InventoryItem, CargoItem, InventoryCategory, InventoryStatus } from '../types';
import { 
  Boxes, 
  Search, 
  Filter, 
  MapPin, 
  Clock, 
  BriefcaseMedical, 
  Fuel, 
  Utensils, 
  Wrench, 
  FlaskConical, 
  Plus, 
  Minus, 
  ChevronRight, 
  Truck, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Layers,
  Sparkles,
  RotateCw,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from '../i18n';
import { InventoryDetailModal } from './InventoryDetailModal';

interface InventoryViewProps {
  inventory: InventoryItem[];
  cargo?: CargoItem[];
  onUpdateQuantity?: (id: string, delta: number, reason?: string) => void;
  onReceiveStock?: (id: string, amount: number, notes?: string, performedBy?: string) => void;
  onConsumeStock?: (id: string, amount: number, notes?: string, performedBy?: string) => void;
  onDeliverCargo?: (cargoId: string) => void;
  onOpenCargoDetails?: (cargoId: string) => void;
}

const CATEGORIES: { id: string; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'ALL', label: 'All Categories', icon: Boxes },
  { id: 'Medical', label: 'Medical', icon: BriefcaseMedical },
  { id: 'Fuel', label: 'Fuel', icon: Fuel },
  { id: 'Provisions', label: 'Provisions', icon: Utensils },
  { id: 'Equipment', label: 'Equipment', icon: Wrench },
  { id: 'Scientific', label: 'Scientific', icon: FlaskConical },
];

const STATUSES: { id: string; label: string; color: string }[] = [
  { id: 'ALL', label: 'All Statuses', color: 'text-[#24313A]' },
  { id: 'Available', label: 'Available', color: 'text-[#39A96B]' },
  { id: 'Incoming', label: 'Incoming', color: 'text-[#0284C7]' },
  { id: 'Used', label: 'Used', color: 'text-[#71808A]' },
  { id: 'Low Stock', label: 'Low Stock', color: 'text-[#C96A20]' },
  { id: 'Critical', label: 'Critical', color: 'text-[#E84D4D]' },
];

export const InventoryView: React.FC<InventoryViewProps> = ({
  inventory = [],
  cargo = [],
  onUpdateQuantity,
  onReceiveStock,
  onConsumeStock,
  onDeliverCargo,
  onOpenCargoDetails
}) => {
  const { t, translateStatus } = useTranslation();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Keep selected modal item synchronized with live inventory state
  const liveSelectedItem = useMemo(() => {
    if (!selectedItem) return null;
    return inventory.find(i => i.id === selectedItem.id) || selectedItem;
  }, [inventory, selectedItem]);

  // Statistics counters
  const stats = useMemo(() => {
    const total = inventory.length;
    const available = inventory.filter(i => i.status === 'Available').length;
    const lowStock = inventory.filter(i => i.status === 'Low Stock' || i.status === 'Critical').length;
    const incoming = inventory.filter(i => (i.incomingQuantity && i.incomingQuantity > 0) || i.status === 'Incoming').length;
    return { total, available, lowStock, incoming };
  }, [inventory]);

  // Filtered inventory list
  const filteredItems = useMemo(() => {
    return inventory.filter(item => {
      // Category filter
      if (selectedCategory !== 'ALL') {
        const itemCat = item.category === 'Food' ? 'Provisions' : item.category;
        if (itemCat !== selectedCategory) return false;
      }

      // Status filter
      if (selectedStatus !== 'ALL') {
        if (item.status !== selectedStatus) return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesId = item.id.toLowerCase().includes(query);
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesLoc = item.storageLocation.toLowerCase().includes(query);
        const matchesCargo = (item.relatedCargoCode && item.relatedCargoCode.toLowerCase().includes(query)) ||
                             (item.relatedCargoTitle && item.relatedCargoTitle.toLowerCase().includes(query));
        if (!matchesId && !matchesName && !matchesLoc && !matchesCargo) {
          return false;
        }
      }

      return true;
    });
  }, [inventory, selectedCategory, selectedStatus, searchQuery]);

  const handleQuickIntake = (item: InventoryItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const amount = 1;
    if (onReceiveStock) {
      onReceiveStock(item.id, amount, `Quick intake of +${amount} ${item.unit}`, 'Logistics Officer');
    } else if (onUpdateQuantity) {
      onUpdateQuantity(item.id, amount, `Quick intake (+${amount})`);
    }
    showToast(`Stock added: +${amount} ${item.unit} to ${item.name}`);
  };

  const handleQuickConsume = (item: InventoryItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (item.quantity <= 0) return;
    const amount = 1;
    if (onConsumeStock) {
      onConsumeStock(item.id, amount, `Quick outbound consumption of -${amount} ${item.unit}`, 'Field Operator');
    } else if (onUpdateQuantity) {
      onUpdateQuantity(item.id, -amount, `Quick consumption (-${amount})`);
    }
    showToast(`Stock consumed: -${amount} ${item.unit} from ${item.name}`);
  };

  const handleDeliverCargo = (cargoId: string, item: InventoryItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (onDeliverCargo) {
      onDeliverCargo(cargoId);
      showToast(`Delivered consignment! Inventory stock for ${item.id} updated.`);
    }
  };

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

  const getCategoryIcon = (cat: InventoryCategory) => {
    switch (cat) {
      case 'Medical':
        return BriefcaseMedical;
      case 'Fuel':
        return Fuel;
      case 'Provisions':
      case 'Food':
        return Utensils;
      case 'Equipment':
        return Wrench;
      case 'Scientific':
        return FlaskConical;
      default:
        return Boxes;
    }
  };

  const hasActiveFilters = searchQuery !== '' || selectedCategory !== 'ALL' || selectedStatus !== 'ALL';

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Toast feedback */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-6 z-50 px-4 py-2.5 rounded-xl bg-[#24313A] text-[#FFFDF9] border border-[#F29A3D]/40 text-xs font-bold flex items-center gap-2 shadow-xl"
          >
            <CheckCircle2 className="w-4 h-4 text-[#39A96B]" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Banner & KPI Stat Summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-[#FFFCF8] border border-[#EAE3D5] warm-card-shadow">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#FFE5C7] border border-[#F29A3D]/40 flex items-center justify-center text-[#C96A20] shadow-xs">
            <Boxes className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-[#24313A] font-display">
                {t('inventory.title') || 'DEPOT INVENTORY & STOCK CONTROL'}
              </h1>
              <span className="px-2 py-0.5 rounded-md bg-[#FFE5C7] text-[#C96A20] font-mono text-xs font-extrabold border border-[#F29A3D]/30">
                Svalbard Base
              </span>
            </div>
            <p className="text-xs text-[#71808A] mt-0.5">
              {t('inventory.subtitle') || 'Central Stores, Emergency Consignments & Autonomous Stock Intake Workflow'}
            </p>
          </div>
        </div>

        {/* KPI stat chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="p-2.5 rounded-xl bg-[#F7F4EF] border border-[#EAE3D5] text-center min-w-[90px]">
            <span className="text-[10px] uppercase font-bold text-[#71808A] block">Total Items</span>
            <span className="text-lg font-black text-[#24313A] font-mono">{stats.total}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-[#E8F7EE] border border-[#A5D6A7] text-center min-w-[90px]">
            <span className="text-[10px] uppercase font-bold text-[#2E7D32] block">Available</span>
            <span className="text-lg font-black text-[#2E7D32] font-mono">{stats.available}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-[#FFF8EF] border border-[#F29A3D]/40 text-center min-w-[90px]">
            <span className="text-[10px] uppercase font-bold text-[#C96A20] block">Low / Critical</span>
            <span className="text-lg font-black text-[#C96A20] font-mono">{stats.lowStock}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-[#DFF3FA] border border-[#93C5FD] text-center min-w-[90px]">
            <span className="text-[10px] uppercase font-bold text-[#0284C7] block">Inbound</span>
            <span className="text-lg font-black text-[#0284C7] font-mono">{stats.incoming}</span>
          </div>
        </div>
      </div>

      {/* Control Bar: Search & Category / Status Filters */}
      <div className="p-4 rounded-2xl bg-[#FFFCF8] border border-[#EAE3D5] warm-card-shadow space-y-3">
        {/* Search row */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#71808A] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search items by ID (e.g. INV-MED-01), name, location, or related cargo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-[#F7F4EF] border border-[#EAE3D5] text-[#24313A] text-xs placeholder:text-[#71808A] focus:outline-none focus:border-[#F29A3D] font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#71808A] hover:text-[#24313A] cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {hasActiveFilters && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('ALL');
                setSelectedStatus('ALL');
              }}
              className="px-3 py-2 rounded-xl border border-[#EAE3D5] bg-[#F7F4EF] hover:bg-[#FFE5C7] text-[#71808A] hover:text-[#C96A20] text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        {/* Filter Rows: Category & Status */}
        <div className="flex flex-col lg:flex-row gap-3 pt-1 border-t border-[#EAE3D5]/60">
          {/* Category tabs */}
          <div className="space-y-1 flex-1">
            <span className="text-[10px] font-extrabold uppercase text-[#71808A] tracking-wider block">
              Category Filter:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((cat) => {
                const IconComponent = cat.icon;
                const isSelected = selectedCategory === cat.id;
                const count = cat.id === 'ALL' 
                  ? inventory.length 
                  : inventory.filter(i => (i.category === 'Food' ? 'Provisions' : i.category) === cat.id).length;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-[#FFE5C7] text-[#C96A20] border border-[#F29A3D]/50 shadow-xs'
                        : 'bg-[#F7F4EF] text-[#71808A] border border-[#EAE3D5] hover:bg-[#FFE5C7]/50 hover:text-[#24313A]'
                    }`}
                  >
                    <IconComponent className="w-3 h-3" />
                    <span>{cat.label}</span>
                    <span className={`text-[10px] px-1 rounded-full ${isSelected ? 'bg-[#F29A3D]/30 text-[#C96A20]' : 'bg-[#EAE3D5] text-[#71808A]'}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Status tabs */}
          <div className="space-y-1 lg:w-auto">
            <span className="text-[10px] font-extrabold uppercase text-[#71808A] tracking-wider block">
              Stock Status Filter:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {STATUSES.map((st) => {
                const isSelected = selectedStatus === st.id;
                const count = st.id === 'ALL'
                  ? inventory.length
                  : inventory.filter(i => i.status === st.id).length;
                return (
                  <button
                    key={st.id}
                    onClick={() => setSelectedStatus(st.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-[#24313A] text-[#FFFDF9] border border-[#24313A] shadow-xs'
                        : 'bg-[#F7F4EF] text-[#71808A] border border-[#EAE3D5] hover:bg-[#EAE3D5]/80 hover:text-[#24313A]'
                    }`}
                  >
                    <span className={st.color}>●</span>
                    <span>{st.label}</span>
                    <span className={`text-[10px] px-1 rounded-full ${isSelected ? 'bg-white/20 text-[#FFFDF9]' : 'bg-[#EAE3D5] text-[#71808A]'}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between px-1 text-xs text-[#71808A]">
        <div>
          Showing <strong className="text-[#24313A]">{filteredItems.length}</strong> of{' '}
          <strong className="text-[#24313A]">{inventory.length}</strong> items
          {hasActiveFilters && ' (filtered)'}
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#39A96B] animate-pulse" />
          <span>Live Local Demo State Synchronized</span>
        </div>
      </div>

      {/* Inventory Items Grid */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredItems.map((item) => {
            const CatIcon = getCategoryIcon(item.category);
            const percentage = item.maxCapacity
              ? Math.min(100, Math.round((item.quantity / item.maxCapacity) * 100))
              : 100;

            const linkedCargo = cargo.find(
              c =>
                c.id === item.relatedCargoId ||
                c.code === item.relatedCargoCode ||
                c.relatedInventoryId === item.id
            );

            return (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className="p-4 rounded-2xl bg-[#FFFCF8] border border-[#EAE3D5] hover:border-[#F29A3D] warm-card-shadow transition-all duration-200 flex flex-col justify-between cursor-pointer hover:shadow-md group"
              >
                {/* Card Top: Item ID, Category, Status */}
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {/* 1. Item ID */}
                      <span className="font-mono text-xs font-black text-[#C96A20] bg-[#FFE5C7] px-2 py-0.5 rounded-md border border-[#F29A3D]/30">
                        {item.id}
                      </span>

                      {/* 2. Category */}
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border flex items-center gap-1 ${getCategoryBadgeStyle(item.category)}`}>
                        <CatIcon className="w-2.5 h-2.5" />
                        <span>{item.category}</span>
                      </span>
                    </div>

                    {/* 5. Status: Available, Incoming, Used, Low Stock, Critical */}
                    <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-md border shrink-0 ${getStatusBadgeStyle(item.status)}`}>
                      ● {item.status}
                    </span>
                  </div>

                  {/* Item Name */}
                  <div>
                    <h3 className="text-sm font-extrabold text-[#24313A] group-hover:text-[#C96A20] transition-colors leading-snug">
                      {item.name}
                    </h3>
                  </div>

                  {/* 3. Quantity + Unit Hero Card Display */}
                  <div className="p-3 rounded-xl bg-[#F7F4EF]/80 border border-[#EAE3D5] flex items-baseline justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#71808A] block">
                        Quantity In Stock
                      </span>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="text-2xl font-black font-mono text-[#24313A]">
                          {item.quantity.toLocaleString()}
                        </span>
                        <span className="text-xs font-bold text-[#71808A]">
                          {item.unit}
                        </span>
                      </div>
                    </div>

                    {/* Stock level mini gauge */}
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-[#71808A]">
                        Min: {item.minThreshold} {item.unit}
                      </span>
                      <div className="w-20 bg-[#EAE3D5] rounded-full h-1.5 mt-1 overflow-hidden">
                        <div
                          className={`h-full ${
                            item.status === 'Critical'
                              ? 'bg-[#E84D4D]'
                              : item.status === 'Low Stock'
                              ? 'bg-[#F29A3D]'
                              : item.status === 'Used'
                              ? 'bg-[#71808A]'
                              : 'bg-[#39A96B]'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* 4. Storage location & 6. Last updated */}
                  <div className="space-y-1.5 text-xs text-[#71808A]">
                    {/* Storage Location */}
                    <div className="flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#F29A3D] shrink-0 mt-0.5" />
                      <span className="text-[11px] text-[#24313A] font-semibold line-clamp-1">
                        {item.storageLocation}
                      </span>
                    </div>

                    {/* Last Updated */}
                    <div className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-1 text-[#71808A]">
                        <Clock className="w-3 h-3" />
                        <span>Updated: <strong className="text-[#24313A]">{item.lastUpdated}</strong></span>
                      </div>

                      {item.incomingQuantity > 0 && (
                        <span className="text-[10px] font-bold text-[#0284C7] bg-[#DFF3FA] px-1.5 py-0.5 rounded border border-[#93C5FD]">
                          +{item.incomingQuantity} {item.unit} incoming
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Related Cargo Sync Pill (if any) */}
                  {linkedCargo && (
                    <div className="p-2 rounded-lg bg-[#FFF8EF] border border-[#F29A3D]/30 flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-1.5 overflow-hidden">
                        <Truck className="w-3.5 h-3.5 text-[#C96A20] shrink-0" />
                        <span className="font-mono text-[#C96A20] font-bold shrink-0">{linkedCargo.code}</span>
                        <span className="text-[#71808A] truncate">({linkedCargo.status})</span>
                      </div>

                      {linkedCargo.status !== 'Delivered' && onDeliverCargo && (
                        <button
                          onClick={(e) => handleDeliverCargo(linkedCargo.id, item, e)}
                          className="px-2 py-0.5 rounded bg-[#39A96B] hover:bg-[#2d8755] text-white text-[10px] font-bold transition-colors cursor-pointer shrink-0 shadow-xs"
                          title="Simulate cargo delivery and stock update"
                        >
                          Deliver &amp; Sync
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Bottom: Simple Stock Update Controls & Details Button */}
                <div className="pt-3 mt-3 border-t border-[#EAE3D5] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] uppercase font-bold text-[#71808A] mr-1">Adjust:</span>
                    <button
                      onClick={(e) => handleQuickConsume(item, e)}
                      disabled={item.quantity <= 0}
                      className="w-7 h-7 rounded-lg border border-[#EAE3D5] bg-[#FFFCF8] hover:bg-[#FDE8E8] text-[#E84D4D] flex items-center justify-center transition-colors cursor-pointer disabled:opacity-40"
                      title="Consume 1 unit (-1)"
                      aria-label={`Consume 1 unit of ${item.name}`}
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => handleQuickIntake(item, e)}
                      className="w-7 h-7 rounded-lg border border-[#F29A3D]/40 bg-[#FFE5C7] hover:bg-[#F29A3D]/30 text-[#C96A20] flex items-center justify-center transition-colors cursor-pointer"
                      title="Intake 1 unit (+1)"
                      aria-label={`Intake 1 unit of ${item.name}`}
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <button
                    onClick={() => setSelectedItem(item)}
                    className="px-2.5 py-1 rounded-lg border border-[#EAE3D5] hover:border-[#F29A3D] bg-[#F7F4EF] hover:bg-[#FFE5C7]/50 text-xs font-bold text-[#24313A] flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>Details</span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#71808A]" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="p-12 text-center rounded-2xl bg-[#FFFCF8] border border-[#EAE3D5] space-y-3">
          <div className="w-12 h-12 rounded-xl bg-[#F7F4EF] border border-[#EAE3D5] flex items-center justify-center text-[#71808A] mx-auto">
            <Boxes className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#24313A]">
            No matching inventory items found
          </h3>
          <p className="text-xs text-[#71808A] max-w-sm mx-auto">
            Try adjusting your search terms or clearing the active category and status filters.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('ALL');
              setSelectedStatus('ALL');
            }}
            className="px-4 py-2 rounded-xl bg-[#FFE5C7] border border-[#F29A3D]/40 text-[#C96A20] text-xs font-bold transition-all cursor-pointer hover:bg-[#F29A3D]/30"
          >
            Clear All Filters
          </button>
        </div>
      )}

      {/* Inventory Details Modal */}
      {liveSelectedItem && (
        <InventoryDetailModal
          item={liveSelectedItem}
          cargoList={cargo}
          onClose={() => setSelectedItem(null)}
          onReceiveStock={(id, amount, notes, performedBy) => {
            if (onReceiveStock) {
              onReceiveStock(id, amount, notes, performedBy);
            } else if (onUpdateQuantity) {
              onUpdateQuantity(id, amount, notes);
            }
            showToast(`Received +${amount} ${liveSelectedItem.unit} into stock`);
          }}
          onConsumeStock={(id, amount, notes, performedBy) => {
            if (onConsumeStock) {
              onConsumeStock(id, amount, notes, performedBy);
            } else if (onUpdateQuantity) {
              onUpdateQuantity(id, -amount, notes);
            }
            showToast(`Consumed -${amount} ${liveSelectedItem.unit} from stock`);
          }}
          onDeliverCargo={(cargoId) => {
            if (onDeliverCargo) {
              onDeliverCargo(cargoId);
              showToast(`Cargo delivered! Stock balance synchronized.`);
            }
          }}
          onOpenCargoDetails={onOpenCargoDetails}
        />
      )}
    </div>
  );
};
