import { X, MapPin, Compass, Navigation, Car, Clock, ShieldAlert, CheckCircle2, History } from 'lucide-react';
import { Personnel } from '../types';
import { useTranslation } from '../i18n';

interface PersonnelModalProps {
  personnel: Personnel | null;
  onClose: () => void;
  onViewOnMap: (lat: number, lng: number) => void;
}

export const PersonnelModal: React.FC<PersonnelModalProps> = ({
  personnel,
  onClose,
  onViewOnMap
}) => {
  const { t, translateStatus } = useTranslation();

  if (!personnel) return null;

  const isEmergency = personnel.status === 'Emergency' || personnel.emergencyStatus === 'Emergency';

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#24313A]/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        id="personnel-modal-card"
        className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl bg-[#FFFCF8] border border-[#EAE3D5] warm-card-shadow p-6 text-[#24313A] space-y-4"
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center text-base font-extrabold shadow-xs ${
              isEmergency 
                ? 'bg-[#FDE8E8] border-[#E84D4D]/40 text-[#E84D4D]'
                : 'bg-[#FFE5C7] border-[#F29A3D]/40 text-[#C96A20]'
            }`}>
              {personnel.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-[#24313A] font-display">{personnel.name}</h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#F7F4EF] border border-[#EAE3D5] text-[#71808A]">
                  {personnel.code || 'PER'}
                </span>
              </div>
              <p className="text-xs text-[#71808A] font-medium">{personnel.role}</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-xl text-[#71808A] hover:text-[#24313A] hover:bg-[#F7F4EF] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Highlights */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded-xl bg-[#F7F4EF] border border-[#EAE3D5]">
            <div className="text-[10px] uppercase font-bold text-[#71808A] tracking-wider mb-1">Status</div>
            <div className="flex items-center gap-1.5 font-bold">
              <span className={`w-2 h-2 rounded-full ${
                personnel.status === 'Emergency' 
                  ? 'bg-[#E84D4D] animate-pulse' 
                  : personnel.status === 'Moving'
                  ? 'bg-[#F29A3D]'
                  : personnel.status === 'In Transit'
                  ? 'bg-[#39A96B]'
                  : 'bg-[#4AA9D8]'
              }`} />
              <span className={isEmergency ? 'text-[#E84D4D]' : 'text-[#24313A]'}>
                {translateStatus(personnel.status)}
              </span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-[#F7F4EF] border border-[#EAE3D5]">
            <div className="text-[10px] uppercase font-bold text-[#71808A] tracking-wider mb-1">Emergency Status</div>
            <div className="flex items-center gap-1.5 font-bold">
              {isEmergency ? (
                <>
                  <ShieldAlert className="w-3.5 h-3.5 text-[#E84D4D] animate-pulse" />
                  <span className="text-[#E84D4D]">ACTIVE DISTRESS</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#39A96B]" />
                  <span className="text-[#39A96B]">Nominal</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Detailed Fields */}
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F7F4EF] border border-[#EAE3D5]">
            <span className="flex items-center gap-1.5 text-[#71808A] font-medium">
              <MapPin className="w-3.5 h-3.5 text-[#C96A20]" />
              Current Location
            </span>
            <span className="font-bold text-[#24313A]">{personnel.location}</span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F7F4EF] border border-[#EAE3D5]">
            <span className="flex items-center gap-1.5 text-[#71808A] font-medium">
              <Compass className="w-3.5 h-3.5 text-[#4AA9D8]" />
              Expedition
            </span>
            <span className="font-bold text-[#24313A]">{personnel.expedition || 'Arctic Research'}</span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F7F4EF] border border-[#EAE3D5]">
            <span className="flex items-center gap-1.5 text-[#71808A] font-medium">
              <Car className="w-3.5 h-3.5 text-[#39A96B]" />
              Assigned Vehicle
            </span>
            <span className="font-bold text-[#24313A]">{personnel.assignedVehicle || 'None'}</span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F7F4EF] border border-[#EAE3D5]">
            <span className="flex items-center gap-1.5 text-[#71808A] font-medium">
              <Clock className="w-3.5 h-3.5 text-[#71808A]" />
              Last Updated
            </span>
            <span className="font-semibold text-[#71808A]">{personnel.lastUpdated || personnel.lastCheckIn}</span>
          </div>
        </div>

        {/* Movement History */}
        <div className="p-3.5 rounded-2xl bg-[#FFFDF9] border border-[#EAE3D5] space-y-2.5">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#24313A] uppercase tracking-wider">
            <History className="w-3.5 h-3.5 text-[#C96A20]" />
            <span>Movement History</span>
          </div>

          {personnel.movementHistory && personnel.movementHistory.length > 0 ? (
            <div className="space-y-2 relative pl-2 border-l-2 border-[#FFE5C7] ml-2">
              {personnel.movementHistory.map((entry, idx) => (
                <div key={idx} className="relative pl-3 text-xs">
                  <div className="absolute -left-[13px] top-1.5 w-2 h-2 rounded-full bg-[#F29A3D]" />
                  <span className="font-mono font-bold text-[#C96A20] text-[11px] mr-1.5">{entry.time}</span>
                  <span className="text-[#24313A] text-xs font-medium">— {entry.event}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-[#71808A] italic">No recent movement records logged.</div>
          )}
        </div>

        {/* View on Map CTA */}
        <div className="pt-2">
          <button
            id="personnel-view-on-map-btn"
            onClick={() => {
              onViewOnMap(personnel.lat, personnel.lng);
              onClose();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-[#F29A3D] hover:bg-[#E28828] text-[#24313A] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
          >
            <Navigation className="w-4 h-4" />
            <span>VIEW ON MAP</span>
          </button>
        </div>
      </div>
    </div>
  );
};
