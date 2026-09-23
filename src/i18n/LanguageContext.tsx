import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

import en from '../locales/en.json';
import hi from '../locales/hi.json';
import bn from '../locales/bn.json';
import ta from '../locales/ta.json';
import te from '../locales/te.json';
import mr from '../locales/mr.json';
import gu from '../locales/gu.json';
import kn from '../locales/kn.json';
import ml from '../locales/ml.json';
import pa from '../locales/pa.json';
import es from '../locales/es.json';
import fr from '../locales/fr.json';
import de from '../locales/de.json';
import ja from '../locales/ja.json';

export type SupportedLanguage =
  | 'en'
  | 'hi'
  | 'bn'
  | 'ta'
  | 'te'
  | 'mr'
  | 'gu'
  | 'kn'
  | 'ml'
  | 'pa'
  | 'es'
  | 'fr'
  | 'de'
  | 'ja';

export interface LanguageInfo {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
  dir: 'ltr' | 'rtl';
}

export const LANGUAGES: LanguageInfo[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧', dir: 'ltr' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', dir: 'ltr' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇮🇳', dir: 'ltr' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳', dir: 'ltr' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳', dir: 'ltr' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳', dir: 'ltr' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳', dir: 'ltr' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳', dir: 'ltr' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', flag: '🇮🇳', dir: 'ltr' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', flag: '🇮🇳', dir: 'ltr' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', dir: 'ltr' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', dir: 'ltr' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', dir: 'ltr' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', dir: 'ltr' },
];

const TRANSLATIONS: Record<SupportedLanguage, any> = {
  en,
  hi,
  bn,
  ta,
  te,
  mr,
  gu,
  kn,
  ml,
  pa,
  es,
  fr,
  de,
  ja,
};

const STORAGE_KEY = 'polar_expedition_lang';

// Complete dictionary of human-readable fallback phrases for all UI keys
export const KNOWN_FALLBACKS: Record<string, string> = {
  // Cargo
  'cargo.title': 'CARGO TRACKING',
  'cargo.desc': 'Visual Manifests, Temperature Cold-Chain & Field Delivery',
  'cargo.trackOnMap': 'Track on Map',
  'cargo.updateStatus': 'Update Status',
  'cargo.activeManifests': 'Active Manifests',
  'cargo.lots': 'Lots',
  'cargo.totalLots': 'Total Lots',
  'cargo.tempSensitive': 'Cold-Chain Monitored',
  'cargo.contents': 'Contents',
  'cargo.weight': 'Weight',
  'cargo.destination': 'Destination',
  'cargo.eta': 'ETA',
  'cargo.selectNewStatus': 'Select New Status',
  'cargo.gisTracking': 'GIS Cargo Tracking',
  'cargo.consignmentLocations': 'Consignment Waypoints',
  'cargo.liveTelemetry': 'Live Telemetry Active',
  'cargo.trackingToastPrefix': 'Tracking centered on',
  'cargo.trackingToastSuffix': 'on GIS map.',
  'cargo.statusUpdatedToast': 'Status updated to',

  // Expeditions
  'expeditions.title': 'EXPEDITION OPERATIONS',
  'expeditions.planning': 'Expedition Planning',
  'expeditions.planningDesc': 'Plan routes, personnel, cargo and expedition resources',
  'expeditions.roster': 'Expedition Roster',
  'expeditions.routeMap': 'Route Map',
  'expeditions.checkpoints': 'Checkpoints',
  'expeditions.startExpedition': 'Start Expedition',
  'expeditions.modifyRoute': 'Modify Route',
  'expeditions.downloadReport': 'Download Route Report',
  'expeditions.newExpedition': 'New Expedition',
  'expeditions.newInitiated': 'New expedition planning initiated.',
  'expeditions.leader': 'Expedition Lead',
  'expeditions.route': 'Route Path',
  'expeditions.progress': 'Progress',
  'expeditions.supplies': 'Supplies',
  'expeditions.team': 'Assigned Team',
  'expeditions.specialists': 'specialists',
  'expeditions.start': 'Start',
  'expeditions.cp1': 'Checkpoint 1',
  'expeditions.cp2': 'Checkpoint 2',
  'expeditions.station': 'Station',
  'expeditions.destination': 'Destination',
  'expeditions.routeDetails': 'Route Details',
  'expeditions.totalDistance': 'Total Distance',
  'expeditions.estDuration': 'Est. Duration',
  'expeditions.days': 'days',
  'expeditions.terrainZone': 'Terrain Zone',
  'expeditions.glacialCrevasse': 'Glacial Crevasse Zone',
  'expeditions.routeWeather': 'Route Weather',
  'expeditions.statusConfirmedPrefix': 'Expedition',
  'expeditions.statusConfirmedSuffix': 'deployment initiated.',
  'expeditions.routeOptimized': 'Route optimized with real-time waypoint telemetry.',
  'expeditions.reportDownloaded': 'Route manifest report downloaded.',
  'expeditions.overallProgress': 'Overall Progress',

  // Dashboard
  'dashboard.title': 'POLAR EXPEDITION',
  'dashboard.subtitle': 'Expedition Control • Svalbard Operations',
  'dashboard.liveTelemetry': 'Live Telemetry Active',
  'dashboard.liveStatus': 'Live Status',
  'dashboard.activeMovingUnit': 'Active Moving Unit',
  'dashboard.quickActions': 'Quick Actions',
  'dashboard.quickActionsDesc': 'Direct operational controls & shortcuts',
  'dashboard.actionTrack': 'Track Cargo',
  'dashboard.actionCargo': 'View Cargo',
  'dashboard.actionEmergency': 'Report Emergency',
  'dashboard.activeFieldMissions': 'active field missions',
  'dashboard.inField': 'deployed',
  'dashboard.base': 'at base',
  'dashboard.unitsInTransit': 'units in transit',
  'dashboard.activeSosResponse': 'Active SOS Response',
  'dashboard.allTeamsNominal': 'No active emergencies',
  'dashboard.liveGisTheater': 'Svalbard GIS Map Operations',
  'dashboard.sector': 'Sector',
  'dashboard.online': 'Online',
  'dashboard.followingUnit': 'Following Unit',
  'dashboard.followUnit': 'Follow Unit',
  'dashboard.openTrackingTerminal': 'Open Tracking Terminal',
  'dashboard.recentAlerts': 'Recent System Alerts',
  'dashboard.latest3Events': 'Latest 3 Events',
  'dashboard.wind': 'Wind',
  'dashboard.vis': 'Vis',
  'dashboard.distanceAway': 'away',
  'dashboard.personnel': 'Personnel',
  'dashboard.vehicles': 'Vehicles',
  'dashboard.cargo': 'Cargo',
  'dashboard.emergency': 'Emergency',
  'dashboard.expeditions': 'Expeditions',
  'dashboard.camps': 'Camps',
  'dashboard.active': 'Active',
  'dashboard.activeEmergencies': 'Active Emergencies',

  // Emergency
  'emergency.title': 'EMERGENCY RESPONSE',
  'emergency.subtitle': 'SOS Distress Beacon Uplink & Automated Rescue Vectors',
  'emergency.reportSosBtn': 'REPORT SOS EMERGENCY',
  'emergency.activeSos': 'ACTIVE SOS',
  'emergency.nearestTeam': 'Nearest Response Team',
  'emergency.nearestUnit': 'Nearest Unit',
  'emergency.dispatchedSuccess': 'Response team dispatched on priority rescue vector.',
  'emergency.broadcastSuccess': 'Emergency SOS broadcast transmitted on satellite distress channel.',
  'emergency.resolvedSuccess': 'Emergency marked as Resolved. Moved to log.',
  'emergency.dispatchTeam': 'Dispatch Response Unit',
  'emergency.broadcastSos': 'Broadcast 406 MHz SOS',
  'emergency.resolveEmergency': 'Resolve Emergency',
  'emergency.noDistress': 'No active emergencies. All expedition sectors nominal.',
  'emergency.resolvedLog': 'Resolved Incidents Log',
  'emergency.activeIncidentsTitle': 'ACTIVE EMERGENCY INCIDENT',

  // Emergency Modal
  'emergencyModal.title': 'REPORT EMERGENCY SOS',
  'emergencyModal.subtitle': 'Immediate Protocol Priority',
  'emergencyModal.incidentType': 'Incident Type',
  'emergencyModal.severity': 'Severity Level',
  'emergencyModal.incidentLocation': 'Incident Location / Sector',
  'emergencyModal.details': 'Incident Details / Observations',
  'emergencyModal.placeholder': 'Describe situation, injuries, vehicle damage, or weather hazards...',
  'emergencyModal.submitSos': 'TRANSMIT SOS DISTRESS BEACON',

  // Tracking
  'tracking.selectedUnit': 'Selected Unit',
  'tracking.driver': 'Operator',
  'tracking.speed': 'Speed',
  'tracking.batteryFuel': 'Battery & Fuel',
  'tracking.gpsLocation': 'GPS Location',
  'tracking.lastUpdate': 'Last Update',
  'tracking.satelliteTransponder': 'Satellite Transponder',
  'tracking.follow': 'Follow Unit',
  'tracking.followingUnit': 'Following...',
  'tracking.contact': 'Radio Uplink',
  'tracking.fleetTransponders': 'Fleet Transponders',
  'tracking.searchMatches': 'Search Matches',
  'tracking.searchPlaceholder': 'Search personnel, vehicles, cargo, callsigns...',
  'tracking.noMatches': 'No matching assets found.',
  'tracking.radioSuccessPrefix': 'Radio contact confirmed with',
  'tracking.radioSuccessSuffix': 'Telemetry synchronized.',
  'tracking.fuelStatus': 'Fuel Level',
  'tracking.coordinates': 'Coordinates',
  'tracking.radioUplink': 'Radio Uplink',

  // Inventory
  'inventory.title': 'DEPOT INVENTORY',
  'inventory.subtitle': 'Svalbard Central Stores & Emergency Rations',
  'inventory.trackedCategories': 'Tracked Categories',
  'inventory.currentLevel': 'Current Level',
  'inventory.minRequired': 'Min Required',
  'inventory.storageLocation': 'Storage Location',
  'inventory.requestReorder': 'Request Reorder',
  'inventory.adjustStock': 'Adjust Stock',
  'inventory.foodRations': 'Food Rations',
  'inventory.fuel': 'Fuel',
  'inventory.medicalKits': 'Medical Kits',
  'inventory.tents': 'Shelter & Tents',
  'inventory.reorderTransmitted': 'Reorder Request Transmitted',

  // Personnel Modal
  'personnelModal.location': 'Location',
  'personnelModal.currentTask': 'Current Task',
  'personnelModal.lastCheckIn': 'Last Check-In',
  'personnelModal.status': 'Status',
  'personnelModal.viewOnMap': 'View on Map',

  // Reports
  'reports.title': 'REPORTS & EXPEDITION LOGS',
  'reports.subtitle': 'Consolidated Telemetry, Field Logs & System Diagnostics',
  'reports.exportBtn': 'EXPORT EXPEDITION REPORT',
  'reports.downloadComplete': 'DOWNLOAD COMPLETE',
  'reports.recordLog': 'Record Field Observation Log',
  'reports.logPlaceholder': 'Type log entry (e.g., Ice condition survey, fuel reading)...',
  'reports.submitLog': 'Submit Log',

  // Navigation
  'nav.title': 'POLAR EXPEDITION',
  'nav.tagline': 'Expedition • Track • Respond',
  'nav.dashboard': 'Dashboard',
  'nav.expeditions': 'Expedition',
  'nav.tracking': 'Tracking',
  'nav.cargo': 'Cargo',
  'nav.inventory': 'Inventory',
  'nav.emergency': 'Emergency',
  'nav.reports': 'Reports',
  'nav.reportEmergency': 'REPORT EMERGENCY',
  'nav.menu': 'Menu',
  'nav.baseOperations': 'Base Operations',
  'nav.sos': 'SOS',
  'nav.liveTelemetry': 'LIVE TELEMETRY ACTIVE • SVALBARD SECTOR',

  // Map
  'map.worldView': 'WORLD VIEW',
  'map.expeditionView': 'EXPEDITION VIEW',
  'map.recenterView': 'RE-CENTER',
  'map.world': 'WORLD',
  'map.expedition': 'EXPEDITION',
  'map.recenter': 'RESET',
  'map.fol': 'FOL',
  'map.followTarget': 'Follow Target',
  'map.stopFollowing': 'Stop Following',
  'map.zoomIn': 'Zoom In (+)',
  'map.zoomOut': 'Zoom Out (-)',
  'map.elev': 'Elev',
  'map.capacity': 'Capacity',
  'map.gps': 'GPS',
  'map.fuel': 'Fuel',
  'map.speed': 'Speed',
  'map.vehiclePrefix': 'VEHICLE',
  'map.cargoPrefix': 'CARGO',
  'map.emergencyPrefix': 'EMERGENCY',
  'map.destination': 'Destination',
  'map.lastCheckIn': 'Last Check-In',
  'map.status': 'Status',
  'map.reported': 'Reported',
  'map.nearestTeam': 'Nearest Team',
  'map.tilesUnavailable': 'Carto Tiles Temporarily Unavailable',
  'map.tilesErrorDesc': 'Network or tile server issue. Reconnecting...',
  'map.retryConnection': 'Retry Connection',
  'map.legendPeople': 'People',
  'map.legendVehicles': 'Vehicles',
  'map.legendCargo': 'Cargo',
  'map.legendCamps': 'Camps',
  'map.legendSos': 'SOS',

  // Common
  'common.all': 'All',
  'common.people': 'Personnel',
  'common.vehicles': 'Vehicles',
  'common.cargo': 'Cargo',
  'common.emergency': 'Emergency',
  'common.filterAll': 'All',
  'common.filterPeople': 'Personnel',
  'common.filterVehicles': 'Vehicles',
  'common.filterCargo': 'Cargo',
  'common.filterEmergency': 'Emergency',
  'common.active': 'Active',
  'common.planned': 'Planned',
  'common.completed': 'Completed',
  'common.moving': 'Moving',
  'common.atBase': 'At Base',
  'common.offline': 'Offline',
  'common.resting': 'Resting',
  'common.inTransit': 'In Transit',
  'common.pending': 'Pending',
  'common.delayed': 'Delayed',
  'common.stationary': 'Stationary',
  'common.standby': 'Standby',
  'common.prepared': 'Prepared',
  'common.dispatched': 'Dispatched',
  'common.delivered': 'Delivered',
  'common.emergencyResponse': 'Emergency Response',
  'common.acknowledged': 'Acknowledged',
  'common.responseDispatched': 'Response Dispatched',
  'common.responseEnRoute': 'Response En Route',
  'common.resolved': 'Resolved',
  'common.inProgress': 'Response In Progress',
  'common.lowStock': 'Low Stock',
  'common.normal': 'Normal',
  'common.reorderPending': 'Reorder Pending',
  'common.medical': 'Medical',
  'common.vehicle': 'Vehicle',
  'common.weather': 'Weather',
  'common.missingPerson': 'Missing Person',
  'common.other': 'Other',
  'common.high': 'High',
  'common.critical': 'Critical',
  'common.total': 'Total',
  'common.viewOnMap': 'View on Map',
  'common.updated': 'Updated',
  'common.ago': 'ago',
  'common.secAgo': 's ago',
  'common.dismiss': 'Dismiss',
  'common.cancel': 'Cancel',
  'common.food': 'Food',
  'common.fuel': 'Fuel',
  'common.equipment': 'Equipment',
  'common.eta': 'ETA',
  'common.details': 'Details',
  'common.away': 'away',
  'common.resolve': 'Resolve',

  // Status & simulation
  'status.active': 'Active',
  'status.inTransit': 'In Transit',
  'status.resolved': 'Resolved',
  'simulation.telemetryActive': 'Telemetry Active'
};

/**
 * Converts any unknown key into clean, human-readable Title Case text.
 * Never exposes raw developer keys or dot-notation in the UI.
 */
function humanizeKey(key: string): string {
  if (!key) return '';
  if (KNOWN_FALLBACKS[key]) {
    return KNOWN_FALLBACKS[key];
  }

  // Strip namespaces: "dashboard.activeFieldMissions" -> "activeFieldMissions"
  const segments = key.split('.');
  const lastSegment = segments[segments.length - 1];

  // Split camelCase, snake_case, and kebab-case
  const words = lastSegment
    .replace(/([A-Z])/g, ' $1')
    .replace(/[_\-]+/g, ' ')
    .trim()
    .split(/\s+/);

  const formatted = words
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');

  return formatted || 'Information';
}

interface LanguageContextType {
  locale: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  currentLanguage: LanguageInfo;
  languages: LanguageInfo[];
  t: (key: string, paramsOrFallback?: Record<string, string | number> | string) => string;
  translateStatus: (status: string) => string;
  translateSeverity: (severity: string) => string;
  translateCategory: (category: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

function getNestedValue(obj: any, path: string): string | undefined {
  if (!obj || typeof obj !== 'object') return undefined;
  const parts = path.split('.');
  let curr = obj;
  for (const p of parts) {
    if (curr && typeof curr === 'object' && p in curr) {
      curr = curr[p];
    } else {
      return undefined;
    }
  }
  return typeof curr === 'string' ? curr : undefined;
}

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<SupportedLanguage>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && LANGUAGES.some((l) => l.code === saved)) {
        return saved as SupportedLanguage;
      }
    } catch {
      // localStorage may fail in restricted sandboxes
    }
    return 'en';
  });

  const setLanguage = useCallback((lang: SupportedLanguage) => {
    setLocaleState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // Ignore
    }
  }, []);

  const currentLanguage = useMemo(() => {
    return LANGUAGES.find((l) => l.code === locale) || LANGUAGES[0];
  }, [locale]);

  useEffect(() => {
    document.documentElement.lang = currentLanguage.code;
    document.documentElement.dir = currentLanguage.dir;
  }, [currentLanguage]);

  const t = useCallback(
    (key: string, paramsOrFallback?: Record<string, string | number> | string): string => {
      if (!key) return '';

      const currentDict = TRANSLATIONS[locale] || TRANSLATIONS.en;
      const fallbackDict = TRANSLATIONS.en;

      // 1. Try currently selected language dictionary
      let text = getNestedValue(currentDict, key);

      // 2. If missing, try English translation dictionary
      if (!text) {
        text = getNestedValue(fallbackDict, key);
      }

      // 3. If still missing, check comprehensive fallback dictionary
      if (!text && KNOWN_FALLBACKS[key]) {
        text = KNOWN_FALLBACKS[key];
      }

      // 4. If explicit string fallback was provided as argument, use it
      if (!text && typeof paramsOrFallback === 'string') {
        text = paramsOrFallback;
      }

      // 5. Ultimate safety: generate human-readable label (NEVER return raw developer key)
      if (!text) {
        text = humanizeKey(key);
      }

      // Handle parameter interpolation if params object provided
      if (paramsOrFallback && typeof paramsOrFallback === 'object') {
        Object.entries(paramsOrFallback).forEach(([paramKey, paramVal]) => {
          text = text!.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramVal));
        });
      }

      return text;
    },
    [locale]
  );

  const translateStatus = useCallback(
    (status: string): string => {
      if (!status) return status;
      const normalized = status.trim().toLowerCase();
      switch (normalized) {
        case 'active':
          return t('common.active');
        case 'moving':
          return t('common.moving');
        case 'at base':
          return t('common.atBase');
        case 'offline':
          return t('common.offline');
        case 'emergency':
          return t('common.emergency');
        case 'planned':
          return t('common.planned');
        case 'completed':
          return t('common.completed');
        case 'resting':
          return t('common.resting');
        case 'in transit':
          return t('common.inTransit');
        case 'pending':
          return t('common.pending');
        case 'delayed':
          return t('common.delayed');
        case 'stationary':
          return t('common.stationary');
        case 'standby':
          return t('common.standby');
        case 'prepared':
          return t('common.prepared');
        case 'dispatched':
          return t('common.dispatched');
        case 'delivered':
          return t('common.delivered');
        case 'emergency response':
          return t('common.emergencyResponse');
        case 'acknowledged':
          return t('common.acknowledged');
        case 'response dispatched':
          return t('common.responseDispatched');
        case 'resolved':
          return t('common.resolved');
        case 'low stock':
          return t('common.lowStock');
        case 'normal':
          return t('common.normal');
        case 'reorder pending':
          return t('common.reorderPending');
        case 'medical':
          return t('common.medical');
        case 'vehicle':
          return t('common.vehicle');
        case 'weather':
          return t('common.weather');
        case 'missing person':
          return t('common.missingPerson');
        case 'other':
          return t('common.other');
        default:
          return status;
      }
    },
    [t]
  );

  const translateSeverity = useCallback(
    (severity: string): string => {
      if (!severity) return severity;
      const normalized = severity.trim().toLowerCase();
      if (normalized === 'critical') return t('common.critical');
      if (normalized === 'high') return t('common.high');
      return severity;
    },
    [t]
  );

  const translateCategory = useCallback(
    (category: string): string => {
      if (!category) return category;
      const normalized = category.trim().toLowerCase();
      if (normalized === 'food') return t('common.food');
      if (normalized === 'fuel') return t('common.fuel');
      if (normalized === 'equipment') return t('common.equipment');
      return category;
    },
    [t]
  );

  const value = useMemo(
    () => ({
      locale,
      setLanguage,
      currentLanguage,
      languages: LANGUAGES,
      t,
      translateStatus,
      translateSeverity,
      translateCategory,
    }),
    [locale, setLanguage, currentLanguage, t, translateStatus, translateSeverity, translateCategory]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useTranslation = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
