import { useState } from 'react';
import { X, AlertTriangle, ShieldAlert, MapPin, User } from 'lucide-react';
import { EmergencyType, EmergencySeverity, Camp } from '../types';
import { useTranslation } from '../i18n';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  camps: Camp[];
  onSubmit: (params: {
    type: EmergencyType;
    severity: EmergencySeverity;
    locationName: string;
    lat: number;
    lng: number;
    description?: string;
    affectedPerson?: string;
  }) => void;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({
  isOpen,
  onClose,
  camps,
  onSubmit
}) => {
  const { t, translateSeverity, translateCategory } = useTranslation();
  const [type, setType] = useState<EmergencyType>('Medical');
  const [severity, setSeverity] = useState<EmergencySeverity>('Critical');
  const [selectedLocationId, setSelectedLocationId] = useState<string>(camps[1]?.id || 'c2');
  const [affectedPerson, setAffectedPerson] = useState('Dr. Marcus Vance (Field Biologist)');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedCamp = camps.find(c => c.id === selectedLocationId) || camps[0];
    const lat = selectedCamp ? selectedCamp.lat + (Math.random() * 0.004 - 0.002) : 78.4350;
    const lng = selectedCamp ? selectedCamp.lng + (Math.random() * 0.008 - 0.004) : 16.7120;

    onSubmit({
      type,
      severity,
      locationName: selectedCamp ? selectedCamp.name : 'Ice Field Sector 3',
      lat: Number(lat.toFixed(4)),
      lng: Number(lng.toFixed(4)),
      description: description.trim() || undefined,
      affectedPerson: affectedPerson.trim() || 'Field Research Specialist'
    });

    onClose();
  };

  const types: EmergencyType[] = ['Medical', 'Vehicle', 'Weather', 'Missing Person', 'Other'];
  const severities: EmergencySeverity[] = ['High', 'Critical'];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#24313A]/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        id="emergency-modal-card"
        className="w-full max-w-md rounded-2xl bg-[#FFFCF8] border-2 border-[#E84D4D] warm-card-shadow overflow-hidden text-[#24313A]"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#EAE3D5] bg-[#FFF8EF] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FDE8E8] border border-[#E84D4D]/40 flex items-center justify-center text-[#E84D4D]">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold tracking-wider font-display text-[#24313A]">
                {t('emergencyModal.title')}
              </h2>
              <p className="text-[10px] text-[#E84D4D] font-bold tracking-widest uppercase">
                {t('emergencyModal.subtitle')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#71808A] hover:text-[#24313A] hover:bg-[#F7F4EF] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Incident Type */}
          <div>
            <label className="block text-xs font-bold text-[#71808A] uppercase tracking-wider mb-2">
              {t('emergencyModal.incidentType')}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {types.map(itemType => (
                <button
                  type="button"
                  key={itemType}
                  onClick={() => setType(itemType)}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold border text-center transition-all cursor-pointer ${
                    type === itemType
                      ? 'bg-[#E84D4D] text-white border-[#E84D4D] shadow-xs'
                      : 'bg-[#F7F4EF] text-[#71808A] border-[#EAE3D5] hover:border-[#E84D4D]/40 hover:text-[#24313A]'
                  }`}
                >
                  {translateCategory(itemType)}
                </button>
              ))}
            </div>
          </div>

          {/* Severity */}
          <div>
            <label className="block text-xs font-bold text-[#71808A] uppercase tracking-wider mb-2">
              {t('emergencyModal.severity')}
            </label>
            <div className="grid grid-cols-2 gap-3">
              {severities.map(s => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setSeverity(s)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    severity === s
                      ? s === 'Critical'
                        ? 'bg-[#E84D4D] text-white border-[#E84D4D] shadow-xs'
                        : 'bg-[#F29A3D] text-[#24313A] border-[#F29A3D] shadow-xs'
                      : 'bg-[#F7F4EF] text-[#71808A] border-[#EAE3D5] hover:text-[#24313A]'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${s === 'Critical' ? 'bg-white' : 'bg-[#24313A]'}`} />
                  <span>{translateSeverity(s)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Affected Person */}
          <div>
            <label className="block text-xs font-bold text-[#71808A] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#E84D4D]" />
              Affected Person / Unit
            </label>
            <input
              type="text"
              value={affectedPerson}
              onChange={e => setAffectedPerson(e.target.value)}
              placeholder="e.g. Dr. Marcus Vance (Field Biologist)"
              className="w-full py-2 px-3 rounded-xl bg-[#F7F4EF] border border-[#EAE3D5] text-xs font-bold text-[#24313A] focus:outline-none focus:border-[#E84D4D] transition-colors"
              required
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-bold text-[#71808A] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#F29A3D]" />
              {t('emergencyModal.incidentLocation')}
            </label>
            <select
              value={selectedLocationId}
              onChange={e => setSelectedLocationId(e.target.value)}
              className="w-full py-2 px-3 rounded-xl bg-[#F7F4EF] border border-[#EAE3D5] text-xs font-bold text-[#24313A] focus:outline-none focus:border-[#F29A3D] transition-colors"
            >
              {camps.map(camp => (
                <option key={camp.id} value={camp.id}>
                  {camp.name} ({camp.code})
                </option>
              ))}
            </select>
          </div>

          {/* Description (Optional) */}
          <div>
            <label className="block text-xs font-bold text-[#71808A] uppercase tracking-wider mb-2">
              {t('emergencyModal.details')}
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder={t('emergencyModal.placeholder')}
              rows={2}
              className="w-full p-2.5 rounded-xl bg-[#F7F4EF] border border-[#EAE3D5] text-xs text-[#24313A] placeholder-[#71808A] focus:outline-none focus:border-[#F29A3D] transition-colors resize-none"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              id="confirm-emergency-report-btn"
              className="w-full py-2.5 rounded-xl bg-[#E84D4D] hover:bg-[#D43F3F] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>{t('emergencyModal.submitSos')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
