import { AlertTriangle, X } from 'lucide-react';
import { Emergency } from '../types';
import { useTranslation } from '../i18n';

interface EmergencyToastProps {
  emergency: Emergency | null;
  onDismiss: () => void;
  onView: () => void;
}

export const EmergencyToast: React.FC<EmergencyToastProps> = ({
  emergency,
  onDismiss,
  onView
}) => {
  const { t, translateCategory } = useTranslation();

  if (!emergency) return null;

  return (
    <div 
      id="emergency-toast-notification"
      className="fixed bottom-6 right-6 z-50 max-w-sm w-full animate-in slide-in-from-bottom-5 fade-in duration-300"
    >
      <div className="p-4 rounded-2xl bg-[#FFFCF8] border-2 border-[#E84D4D] warm-card-shadow flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-[#FDE8E8] border border-[#E84D4D]/40 flex items-center justify-center text-[#E84D4D] shrink-0 mt-0.5">
          <AlertTriangle className="w-5 h-5 emergency-marker-pulse" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-[#E84D4D] tracking-wider uppercase">
              🚨 {t('emergency.activeIncidentsTitle')}
            </span>
            <button onClick={onDismiss} className="text-[#71808A] hover:text-[#24313A] p-0.5 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="text-sm font-extrabold text-[#24313A] mt-0.5 truncate">
            {translateCategory(emergency.type)} - {emergency.locationName}
          </div>

          <div className="text-xs text-[#71808A] mt-1">
            {t('emergency.nearestUnit')}: <strong className="text-[#24313A]">{emergency.nearestTeamName}</strong> ({emergency.distanceKm} km {t('dashboard.distanceAway')})
          </div>

          <div className="mt-2.5 flex items-center gap-2">
            <button
              onClick={onView}
              className="px-3 py-1.5 rounded-xl bg-[#E84D4D] hover:bg-[#D43F3F] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              {t('common.viewOnMap')}
            </button>
            <button
              onClick={onDismiss}
              className="px-3 py-1.5 rounded-xl bg-[#F7F4EF] hover:bg-[#EAE3D5] text-xs font-semibold text-[#71808A] transition-all cursor-pointer"
            >
              {t('common.dismiss')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
