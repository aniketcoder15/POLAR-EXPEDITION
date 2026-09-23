import { 
  Expedition, 
  ExpeditionStatus,
  Personnel, 
  Vehicle, 
  CargoItem, 
  Camp, 
  Emergency, 
  InventoryItem, 
  StockMovement,
  SystemAlert, 
  WeatherData,
  CargoStatus,
  CargoTimelineEvent,
  EmergencyType,
  EmergencySeverity,
  EmergencyStatus
} from '../types';

// Storage keys for local persistence
const STORAGE_KEYS = {
  EXPEDITIONS: 'polar_expeditions_v3',
  PERSONNEL: 'polar_personnel_v3',
  VEHICLES: 'polar_vehicles_v2',
  CARGO: 'polar_cargo_v2',
  INVENTORY: 'polar_inventory_v5',
  EMERGENCIES: 'polar_emergencies_v3',
  ALERTS: 'polar_alerts_v2'
};

// Predefined expedition traverse routes
export interface PredefinedRoute {
  id: string;
  name: string;
  region: string;
  distanceKm: number;
  durationDays: number;
  camps: string[];
  routeCoordinates: [number, number][];
}

// Exact Camps & Checkpoints for Polar Expedition
const INITIAL_CAMPS: Camp[] = [
  { id: 'c-base', code: 'BASE', name: 'Base Camp', lat: 78.2232, lng: 15.6267, elevationM: 20, capacity: 60, personnelCount: 18 },
  { id: 'c-cp1', code: 'CP-1', name: 'Checkpoint 1', lat: 78.3400, lng: 16.0800, elevationM: 65, capacity: 10, personnelCount: 4 },
  { id: 'c-research', code: 'RES', name: 'Research Camp', lat: 78.4350, lng: 16.7120, elevationM: 80, capacity: 25, personnelCount: 12 },
  { id: 'c-cp2', code: 'CP-2', name: 'Checkpoint 2', lat: 78.5400, lng: 16.8200, elevationM: 110, capacity: 10, personnelCount: 3 },
  { id: 'c-ice', code: 'ICE', name: 'Ice Camp', lat: 78.6500, lng: 16.9000, elevationM: 145, capacity: 20, personnelCount: 8 },
  { id: 'c-cp3', code: 'CP-3', name: 'Checkpoint 3', lat: 78.7300, lng: 16.4500, elevationM: 190, capacity: 8, personnelCount: 2 }
];

// Main Polar Route: Base Camp -> Checkpoint 1 -> Research Camp -> Checkpoint 2 -> Ice Camp
export const PRIMARY_EXPEDITION_ROUTE: [number, number][] = [
  [78.2232, 15.6267], // Base Camp
  [78.3400, 16.0800], // Checkpoint 1
  [78.4350, 16.7120], // Research Camp
  [78.5400, 16.8200], // Checkpoint 2
  [78.6500, 16.9000]  // Ice Camp
];

export const PREDEFINED_ROUTES: PredefinedRoute[] = [
  {
    id: 'route-glacier',
    name: 'Glacier Route (Base Camp ➔ Checkpoint 1 ➔ Research Camp ➔ Ice Camp)',
    region: 'Nordenskiöld Glacier',
    distanceKm: 84,
    durationDays: 6,
    camps: ['Base Camp', 'Checkpoint 1', 'Research Camp', 'Ice Camp'],
    routeCoordinates: PRIMARY_EXPEDITION_ROUTE
  },
  {
    id: 'route-plateau',
    name: 'Plateau Traverse (Research Camp ➔ Checkpoint 2 ➔ Ice Camp ➔ Checkpoint 3)',
    region: 'Tempelfjorden Plateau',
    distanceKm: 96,
    durationDays: 8,
    camps: ['Research Camp', 'Checkpoint 2', 'Ice Camp', 'Checkpoint 3'],
    routeCoordinates: [
      [78.4350, 16.7120],
      [78.5400, 16.8200],
      [78.6500, 16.9000],
      [78.7300, 16.4500]
    ]
  },
  {
    id: 'route-shelf',
    name: 'Coastal Shelf Route (Base Camp ➔ Checkpoint 1 ➔ Research Camp)',
    region: 'Adventdalen & Shelf Route',
    distanceKm: 45,
    durationDays: 4,
    camps: ['Base Camp', 'Checkpoint 1', 'Research Camp'],
    routeCoordinates: [
      [78.2232, 15.6267],
      [78.3400, 16.0800],
      [78.4350, 16.7120]
    ]
  },
  {
    id: 'route-ridge',
    name: 'High Arctic Ridge (Checkpoint 1 ➔ Checkpoint 2 ➔ Ice Camp)',
    region: 'Billefjorden Ridge',
    distanceKm: 62,
    durationDays: 5,
    camps: ['Checkpoint 1', 'Checkpoint 2', 'Ice Camp'],
    routeCoordinates: [
      [78.3400, 16.0800],
      [78.5400, 16.8200],
      [78.6500, 16.9000]
    ]
  }
];

const INITIAL_EXPEDITIONS: Expedition[] = [
  {
    id: 'exp-1',
    code: 'EXP-ARC-01',
    title: 'ARCTIC RESEARCH',
    region: 'Nordenskiöld Glacier',
    status: 'Active',
    progress: 72,
    assignedTeamCount: 4,
    teamMemberIds: ['p1', 'p3', 'p5', 'p7'],
    teamMemberNames: ['Dr. Evelyn Vance', 'Dr. Maya Lin', 'Dr. Sonya Lind', 'Elena Rostova'],
    camps: ['Base Camp', 'Checkpoint 1', 'Research Camp', 'Ice Camp'],
    lead: 'Dr. Evelyn Vance',
    startDate: '2026-03-01',
    endDate: '2026-03-25',
    currentCheckpoint: 'Research Camp',
    nextCheckpoint: 'Ice Camp',
    routeName: 'Glacier Route (Base Camp ➔ Checkpoint 1 ➔ Research Camp ➔ Ice Camp)',
    distanceKm: 84,
    estimatedDurationDays: 6,
    routeCoordinates: PRIMARY_EXPEDITION_ROUTE
  },
  {
    id: 'exp-2',
    code: 'EXP-GLC-02',
    title: 'ICE CAMP SURVEY',
    region: 'Tempelfjorden Plateau',
    status: 'Planning',
    progress: 0,
    assignedTeamCount: 3,
    teamMemberIds: ['p2', 'p6', 'p8'],
    teamMemberNames: ['Commander Rostov', 'Henrik Vang', 'Tariq Al-Mansoor'],
    camps: ['Research Camp', 'Checkpoint 2', 'Ice Camp', 'Checkpoint 3'],
    lead: 'Commander Rostov',
    startDate: '2026-04-10',
    endDate: '2026-04-28',
    currentCheckpoint: 'Research Camp',
    nextCheckpoint: 'Checkpoint 2',
    routeName: 'Plateau Traverse (Research Camp ➔ Checkpoint 2 ➔ Ice Camp ➔ Checkpoint 3)',
    distanceKm: 96,
    estimatedDurationDays: 8,
    routeCoordinates: [
      [78.4350, 16.7120],
      [78.5400, 16.8200],
      [78.6500, 16.9000],
      [78.7300, 16.4500]
    ]
  },
  {
    id: 'exp-3',
    code: 'EXP-LOG-03',
    title: 'POLAR LOGISTICS',
    region: 'Adventdalen & Shelf Route',
    status: 'Active',
    progress: 48,
    assignedTeamCount: 3,
    teamMemberIds: ['p4', 'p8', 'p1'],
    teamMemberNames: ['Lars Nygård', 'Tariq Al-Mansoor', 'Dr. Evelyn Vance'],
    camps: ['Base Camp', 'Checkpoint 1', 'Research Camp'],
    lead: 'Dr. Evelyn Vance',
    startDate: '2026-02-14',
    endDate: '2026-03-15',
    currentCheckpoint: 'Checkpoint 1',
    nextCheckpoint: 'Research Camp',
    routeName: 'Coastal Shelf Route (Base Camp ➔ Checkpoint 1 ➔ Research Camp)',
    distanceKm: 45,
    estimatedDurationDays: 4,
    routeCoordinates: [
      [78.2232, 15.6267],
      [78.3400, 16.0800],
      [78.4350, 16.7120]
    ]
  },
  {
    id: 'exp-4',
    code: 'EXP-GEO-04',
    title: 'SEDIMENT MAPPING',
    region: 'Sassendalen Basin',
    status: 'Completed',
    progress: 100,
    assignedTeamCount: 2,
    teamMemberIds: ['p3', 'p6'],
    teamMemberNames: ['Dr. Maya Lin', 'Henrik Vang'],
    camps: ['Base Camp', 'Checkpoint 1'],
    lead: 'Dr. Maya Lin',
    startDate: '2026-01-10',
    endDate: '2026-02-05',
    currentCheckpoint: 'Checkpoint 1',
    nextCheckpoint: 'Traverse Completed',
    routeName: 'Coastal Shelf Route (Base Camp ➔ Checkpoint 1)',
    distanceKm: 28,
    estimatedDurationDays: 3,
    routeCoordinates: [
      [78.2232, 15.6267],
      [78.3400, 16.0800]
    ]
  }
];

const INITIAL_PERSONNEL: Personnel[] = [
  {
    id: 'p1',
    code: 'PER-001',
    name: 'Dr. Evelyn Vance',
    role: 'Expedition Lead',
    location: 'Base Camp',
    status: 'Active',
    lat: 78.2250,
    lng: 15.6300,
    currentTask: 'Mission command & oversight',
    lastCheckIn: 'Just now',
    lastUpdated: 'Just now',
    callsign: 'LEADER',
    expedition: 'Arctic Research',
    assignedVehicle: 'Snowcat V-03',
    emergencyStatus: 'Nominal',
    movementHistory: [
      { time: '08:30', event: 'Shift briefing at Base Operations' },
      { time: '09:15', event: 'Coordinated Snowcat V-03 departure' },
      { time: '10:45', event: 'Telemetry uplink confirmed with Station North' },
      { time: '11:20', event: 'Active command watch at Svalbard Base' }
    ]
  },
  {
    id: 'p2',
    code: 'PER-002',
    name: 'Commander Rostov',
    role: 'Commander',
    location: 'Ice Camp',
    status: 'Moving',
    lat: 78.6480,
    lng: 16.8920,
    currentTask: 'Ice plateau navigation survey',
    lastCheckIn: '2m ago',
    lastUpdated: '2m ago',
    callsign: 'COMMANDER',
    expedition: 'Ice Camp Survey',
    assignedVehicle: 'Snowcat V-07',
    emergencyStatus: 'Nominal',
    movementHistory: [
      { time: '09:42', event: 'Departed Base Camp' },
      { time: '10:15', event: 'Reached Checkpoint 1' },
      { time: '11:05', event: 'Moving toward Research Camp' },
      { time: '11:40', event: 'Arrival at Ice Camp perimeter' }
    ]
  },
  {
    id: 'p3',
    code: 'PER-003',
    name: 'Dr. Maya Lin',
    role: 'Lead Glaciologist',
    location: 'Research Camp',
    status: 'Moving',
    lat: 78.4350,
    lng: 16.7120,
    currentTask: 'Sub-glacial core extraction',
    lastCheckIn: '5m ago',
    lastUpdated: '5m ago',
    callsign: 'GLACIER-1',
    expedition: 'Arctic Research',
    assignedVehicle: 'Snowcat V-03',
    emergencyStatus: 'Nominal',
    movementHistory: [
      { time: '07:45', event: 'Departed Research Camp station' },
      { time: '09:10', event: 'Ice core drill site Alpha reached' },
      { time: '10:30', event: 'Cryo-sample extraction completed' },
      { time: '11:15', event: 'Traversing ridge line toward camp' }
    ]
  },
  {
    id: 'p4',
    code: 'PER-004',
    name: 'Lars Nygård',
    role: 'Chief Vehicle Operator',
    location: 'En Route',
    status: 'In Transit',
    lat: 78.3800,
    lng: 16.3200,
    currentTask: 'Heavy cargo convoy transport',
    lastCheckIn: '1m ago',
    lastUpdated: '1m ago',
    callsign: 'HAUL-3',
    expedition: 'Polar Logistics',
    assignedVehicle: 'Heavy Hauler V-01',
    emergencyStatus: 'Nominal',
    movementHistory: [
      { time: '08:00', event: 'Vehicle pre-trip checklist completed' },
      { time: '09:30', event: 'Departed Base Camp with Lot LT-201' },
      { time: '10:45', event: 'Passed Checkpoint 1 waymarker' },
      { time: '11:10', event: 'In transit along Glacier Shelf Route' }
    ]
  },
  {
    id: 'p5',
    code: 'PER-005',
    name: 'Elena Rostova',
    role: 'Medical Officer',
    location: 'Base Camp',
    status: 'At Base',
    lat: 78.2240,
    lng: 15.6280,
    currentTask: 'Medical triage standby & health check',
    lastCheckIn: '4m ago',
    lastUpdated: '4m ago',
    callsign: 'MEDIC-1',
    expedition: 'Arctic Research',
    assignedVehicle: 'None',
    emergencyStatus: 'Nominal',
    movementHistory: [
      { time: '07:00', event: 'Depot medical supplies inventory audit' },
      { time: '09:00', event: 'Hypothermia rapid response unit verified' },
      { time: '10:15', event: 'Scheduled vitals check-in with field units' },
      { time: '11:00', event: 'On active medical watch at Base Camp' }
    ]
  },
  {
    id: 'p6',
    code: 'PER-006',
    name: 'Tariq Al-Mansoor',
    role: 'Senior Mechanic',
    location: 'Checkpoint 1',
    status: 'Standby',
    lat: 78.3410,
    lng: 16.0820,
    currentTask: 'Engine & track assembly overhaul',
    lastCheckIn: '12m ago',
    lastUpdated: '12m ago',
    callsign: 'TECH-4',
    expedition: 'Polar Logistics',
    assignedVehicle: 'Rapid Scout V-07',
    emergencyStatus: 'Nominal',
    movementHistory: [
      { time: '08:15', event: 'Dispatched from Base to Checkpoint 1' },
      { time: '09:40', event: 'Track tensioning completed on V-07' },
      { time: '10:50', event: 'Emergency parts depot staged' },
      { time: '11:25', event: 'On standby at Checkpoint 1 maintenance hut' }
    ]
  },
  {
    id: 'p7',
    code: 'PER-007',
    name: 'Astrid Dahl',
    role: 'Polar Meteorologist',
    location: 'Ice Camp',
    status: 'Active',
    lat: 78.6520,
    lng: 16.9050,
    currentTask: 'Sub-zero pressure & blizzard tracking',
    lastCheckIn: '8m ago',
    lastUpdated: '8m ago',
    callsign: 'CLIMA-3',
    expedition: 'Ice Camp Survey',
    assignedVehicle: 'None',
    emergencyStatus: 'Nominal',
    movementHistory: [
      { time: '06:30', event: 'Atmospheric sounding balloon deployed' },
      { time: '08:20', event: 'Surface temperature -34°C recorded' },
      { time: '10:00', event: 'Blizzard trajectory warning transmitted' },
      { time: '11:15', event: 'Active radar weather observation' }
    ]
  },
  {
    id: 'p8',
    code: 'PER-008',
    name: 'Marcus Chen',
    role: 'Survival Specialist & SAR',
    location: 'Glacial Ridge',
    status: 'Emergency',
    lat: 78.5800,
    lng: 16.8500,
    currentTask: 'Crevasse zone inspection',
    lastCheckIn: '30s ago',
    lastUpdated: '30s ago',
    callsign: 'RESCUE-A',
    expedition: 'Ice Camp Survey',
    assignedVehicle: 'Snowcat V-07',
    emergencyStatus: 'Emergency',
    movementHistory: [
      { time: '09:00', event: 'Route safety scout along northern ridge' },
      { time: '10:20', event: 'Snow bridge stability check underway' },
      { time: '10:55', event: 'Unstable snow shelf collapse detected' },
      { time: '11:05', event: '406 MHz emergency distress beacon activated' }
    ]
  },
  {
    id: 'p9',
    code: 'PER-009',
    name: 'Solveig Berg',
    role: 'Satellite Communications Tech',
    location: 'Base Camp',
    status: 'At Base',
    lat: 78.2235,
    lng: 15.6270,
    currentTask: 'HF Radio & Iridium transponder sync',
    lastCheckIn: 'Just now',
    lastUpdated: 'Just now',
    callsign: 'DISPATCH',
    expedition: 'Arctic Research',
    assignedVehicle: 'None',
    emergencyStatus: 'Nominal',
    movementHistory: [
      { time: '08:00', event: 'Iridium satellite uplink calibrated' },
      { time: '09:30', event: 'VHF Emergency Channel 16 test successful' },
      { time: '10:40', event: 'Real-time telemetry feeds synchronized' },
      { time: '11:30', event: 'Base communications station nominal' }
    ]
  },
  {
    id: 'p10',
    code: 'PER-010',
    name: 'Henrik Vang',
    role: 'Core Drill Lead',
    location: 'Checkpoint 2',
    status: 'Standby',
    lat: 78.5410,
    lng: 16.8220,
    currentTask: 'Glacial depth sensor calibration',
    lastCheckIn: '15m ago',
    lastUpdated: '15m ago',
    callsign: 'BORE-1',
    expedition: 'Arctic Research',
    assignedVehicle: 'None',
    emergencyStatus: 'Nominal',
    movementHistory: [
      { time: '07:30', event: 'Thermal drill rig assembled at CP-2' },
      { time: '09:15', event: 'Borehole casing reached 45m depth' },
      { time: '10:35', event: 'Generator fuel tank refilled' },
      { time: '11:00', event: 'Standby for ice core transport' }
    ]
  },
  {
    id: 'p11',
    code: 'PER-011',
    name: 'Freja Møller',
    role: 'Logistics Coordinator',
    location: 'Base Camp',
    status: 'At Base',
    lat: 78.2225,
    lng: 15.6250,
    currentTask: 'Cold-chain cargo lots verification',
    lastCheckIn: '7m ago',
    lastUpdated: '7m ago',
    callsign: 'CARGO-SUP',
    expedition: 'Polar Logistics',
    assignedVehicle: 'None',
    emergencyStatus: 'Nominal',
    movementHistory: [
      { time: '08:30', event: 'Cold-chain sensor battery verification' },
      { time: '09:45', event: 'Manifest manifest #LT-204 logged' },
      { time: '10:50', event: 'High-calorie ration requisition dispatched' },
      { time: '11:20', event: 'Depot staging area operations' }
    ]
  },
  {
    id: 'p12',
    code: 'PER-012',
    name: 'Nils Lindqvist',
    role: 'Autonomous Drone Pilot',
    location: 'Checkpoint 3',
    status: 'Offline',
    lat: 78.7290,
    lng: 16.4480,
    currentTask: 'Battery recharging & sensor maintenance',
    lastCheckIn: '45m ago',
    lastUpdated: '45m ago',
    callsign: 'HAWK-1',
    expedition: 'Ice Camp Survey',
    assignedVehicle: 'None',
    emergencyStatus: 'Nominal',
    movementHistory: [
      { time: '08:00', event: 'Drone FLIR thermal camera test' },
      { time: '09:00', event: 'Aerial crevasse mapping flight #4 complete' },
      { time: '10:15', event: 'Telemetry log dump to field terminal' },
      { time: '10:30', event: 'Unit powered down for charging cycle' }
    ]
  }
];

const INITIAL_VEHICLES: Vehicle[] = [
  {
    id: 'v1',
    code: 'V-03',
    name: 'Snowcat V-03',
    type: 'Snowcat Arctic Transporter',
    driver: 'Lars Nygård',
    fuelPercentage: 82,
    status: 'In Transit',
    lat: 78.3650,
    lng: 16.2100,
    speedKmH: 24,
    lastSeenSecAgo: 2,
    assignedExpedition: 'ARCTIC RESEARCH'
  },
  {
    id: 'v2',
    code: 'V-01',
    name: 'Heavy Hauler V-01',
    type: 'PistenBully Heavy Cargo',
    driver: 'Kari Johannsen',
    fuelPercentage: 42,
    status: 'In Transit',
    lat: 78.4800,
    lng: 16.7600,
    speedKmH: 18,
    lastSeenSecAgo: 4,
    assignedExpedition: 'POLAR LOGISTICS'
  },
  {
    id: 'v3',
    code: 'V-07',
    name: 'Rapid Scout V-07',
    type: 'Polar Snowmobile Quad',
    driver: 'Tariq Al-Mansoor',
    fuelPercentage: 88,
    status: 'Stationary',
    lat: 78.4350,
    lng: 16.7120,
    speedKmH: 0,
    lastSeenSecAgo: 1,
    assignedExpedition: 'ICE CAMP SURVEY'
  },
  {
    id: 'v4',
    code: 'V-09',
    name: 'Rescue Snowcat V-09',
    type: 'Emergency Response Carrier',
    driver: 'Marcus Chen',
    fuelPercentage: 94,
    status: 'Emergency Response',
    lat: 78.4100,
    lng: 16.6500,
    speedKmH: 34,
    lastSeenSecAgo: 1,
    assignedExpedition: 'ICE CAMP SURVEY'
  }
];

const INITIAL_CARGO: CargoItem[] = [
  { 
    id: 'c-01', 
    code: 'CRG-101', 
    title: 'Medical Supplies & Plasma Units', 
    cargoType: 'Medical',
    contents: 'Blood plasma units, trauma dressings, hypothermia kits', 
    quantity: '14 Cryo-Cases',
    vehicleName: 'Snowcat V-03', 
    assignedVehicleId: 'v-3',
    temperatureSensitive: true, 
    weightKg: 140, 
    origin: 'Base Camp Longyearbyen',
    originCoords: [78.2232, 15.6267],
    currentLocationName: 'Sassendalen Valley Mid-Pass',
    lat: 78.3800, 
    lng: 16.4200,
    destination: 'Ice Camp Alpha', 
    destinationCoords: [78.6500, 16.9000],
    routeCoords: [
      [78.2232, 15.6267],
      [78.3100, 15.9500],
      [78.3800, 16.4200],
      [78.5200, 16.5000],
      [78.6500, 16.9000]
    ],
    status: 'In Transit', 
    eta: '3 hours (14:30 UTC)', 
    lastUpdated: '4m ago',
    priority: 'Critical',
    relatedInventoryId: 'INV-MED-01',
    deliveredQuantityValue: 14,
    timeline: [
      { id: 'tl-101', time: '08:00 UTC', status: 'Pending', location: 'Base Camp Logistics Bay', note: 'Manifest verified, cryo-cases charged to -25°C' },
      { id: 'tl-102', time: '09:15 UTC', status: 'In Transit', location: 'Base Camp North Gate', note: 'Dispatched with Snowcat V-03' },
      { id: 'tl-103', time: '10:45 UTC', status: 'In Transit', location: 'Sassendalen Valley Mid-Pass', note: 'In transit along ridge traverse, temperature stable' }
    ]
  },
  { 
    id: 'c-02', 
    code: 'CRG-102', 
    title: 'Arctic Jet-A1 Fuel Pods', 
    cargoType: 'Fuel',
    contents: 'Specialized low-freezing aviation kerosene canisters', 
    quantity: '8 Pressurized Pods',
    vehicleName: 'Heavy Hauler V-01', 
    assignedVehicleId: 'v-1',
    temperatureSensitive: false, 
    weightKg: 1200, 
    origin: 'Base Camp Longyearbyen',
    originCoords: [78.2232, 15.6267],
    currentLocationName: 'Glacier Pass Sector 4',
    lat: 78.4900, 
    lng: 16.6900,
    destination: 'Research Camp Bravo', 
    destinationCoords: [78.4350, 16.7120],
    routeCoords: [
      [78.2232, 15.6267],
      [78.3500, 16.2000],
      [78.4900, 16.6900],
      [78.4350, 16.7120]
    ],
    status: 'In Transit', 
    eta: '5 hours (16:45 UTC)', 
    lastUpdated: '11m ago',
    priority: 'High',
    relatedInventoryId: 'INV-FUEL-01',
    deliveredQuantityValue: 800,
    timeline: [
      { id: 'tl-201', time: '07:30 UTC', status: 'Pending', location: 'Base Camp Fuel Depot', note: 'Pressure valves inspected and locked' },
      { id: 'tl-202', time: '08:45 UTC', status: 'In Transit', location: 'Base Camp Exit', note: 'Heavy Hauler V-01 convoy departure' },
      { id: 'tl-203', time: '11:10 UTC', status: 'In Transit', location: 'Glacier Pass Sector 4', note: 'Cruising at 22 km/h across firm ice pack' }
    ]
  },
  { 
    id: 'c-03', 
    code: 'CRG-103', 
    title: '40-Day High-Calorie Field Rations', 
    cargoType: 'Provisions',
    contents: 'Vacuum-sealed freeze-dried expedition nutrient rations', 
    quantity: '40 Crates',
    vehicleName: 'Snowcat V-03', 
    assignedVehicleId: 'v-3',
    temperatureSensitive: false, 
    weightKg: 850, 
    origin: 'Base Camp Longyearbyen',
    originCoords: [78.2232, 15.6267],
    currentLocationName: 'Checkpoint 1 Staging Yard',
    lat: 78.3100, 
    lng: 15.9500,
    destination: 'Ice Camp Alpha', 
    destinationCoords: [78.6500, 16.9000],
    routeCoords: [
      [78.2232, 15.6267],
      [78.3100, 15.9500],
      [78.5000, 16.4000],
      [78.6500, 16.9000]
    ],
    status: 'Delayed', 
    eta: 'Delayed (Blizzard hold ~8h)', 
    lastUpdated: '18m ago',
    priority: 'High',
    relatedInventoryId: 'INV-PRV-01',
    deliveredQuantityValue: 400,
    timeline: [
      { id: 'tl-301', time: '06:00 UTC', status: 'Pending', location: 'Base Camp Provisions Bay', note: 'Inventory packed and weather-sealed' },
      { id: 'tl-302', time: '07:15 UTC', status: 'In Transit', location: 'Base Camp Dispatch', note: 'Dispatched via Southern Trail' },
      { id: 'tl-303', time: '09:00 UTC', status: 'Delayed', location: 'Checkpoint 1 Staging Yard', note: 'Halted due to severe whiteout and wind gusts > 65 km/h' }
    ]
  },
  { 
    id: 'c-04', 
    code: 'CRG-104', 
    title: 'Deep Ice Core Cryo Barrels', 
    cargoType: 'Scientific',
    contents: 'Specimen preservation cryo-cases from core sample site', 
    quantity: '6 Cryo-Barrels',
    vehicleName: 'Rescue Snowcat V-09', 
    assignedVehicleId: 'v-9',
    temperatureSensitive: true, 
    weightKg: 320, 
    origin: 'Ice Camp Alpha',
    originCoords: [78.6500, 16.9000],
    currentLocationName: 'Ice Camp Alpha Lab Staging',
    lat: 78.6500, 
    lng: 16.9000,
    destination: 'Base Camp Longyearbyen', 
    destinationCoords: [78.2232, 15.6267],
    routeCoords: [
      [78.6500, 16.9000],
      [78.5200, 16.5000],
      [78.3100, 15.9500],
      [78.2232, 15.6267]
    ],
    status: 'Pending', 
    eta: 'Pending Departure (Awaiting Convoy)', 
    lastUpdated: '25m ago',
    priority: 'Critical',
    relatedInventoryId: 'INV-SCI-01',
    deliveredQuantityValue: 6,
    timeline: [
      { id: 'tl-401', time: 'Yesterday 18:00', status: 'Pending', location: 'Drill Hole Bore 3', note: 'Core extraction completed from 310m sub-surface' },
      { id: 'tl-402', time: 'Today 06:30', status: 'Pending', location: 'Ice Camp Alpha Lab Staging', note: 'Hermetic seals pressurized and logged for pickup' }
    ]
  },
  { 
    id: 'c-05', 
    code: 'CRG-105', 
    title: 'Satellite Uplink Relays & Antennas', 
    cargoType: 'Equipment',
    contents: 'Iridium antenna transceivers & high-gain dish brackets', 
    quantity: '4 Assemblies',
    vehicleName: 'Rapid Scout V-07', 
    assignedVehicleId: 'v-7',
    temperatureSensitive: false, 
    weightKg: 180, 
    origin: 'Base Camp Longyearbyen',
    originCoords: [78.2232, 15.6267],
    currentLocationName: 'Research Camp Bravo Comms Tower',
    lat: 78.4350, 
    lng: 16.7120,
    destination: 'Research Camp Bravo', 
    destinationCoords: [78.4350, 16.7120],
    routeCoords: [
      [78.2232, 15.6267],
      [78.3500, 16.2000],
      [78.4350, 16.7120]
    ],
    status: 'Delivered', 
    eta: 'Delivered (Verified 08:15 UTC)', 
    lastUpdated: '45m ago',
    priority: 'Standard',
    relatedInventoryId: 'INV-EQP-02',
    deliveredQuantityValue: 4,
    deliveredProcessed: true,
    timeline: [
      { id: 'tl-501', time: 'Yesterday 14:00', status: 'Pending', location: 'Base Camp Electronics Workshop', note: 'Bench diagnostics verified' },
      { id: 'tl-502', time: 'Yesterday 17:00', status: 'In Transit', location: 'Glacier East Spur', note: 'Rapid transit on Scout V-07' },
      { id: 'tl-503', time: 'Today 08:15', status: 'Delivered', location: 'Research Camp Bravo Comms Tower', note: 'Received and signed for by Dr. Sonya Lind' }
    ]
  },
  { 
    id: 'c-06', 
    code: 'CRG-106', 
    title: '8kW Cold-Weather Auxiliary Generator', 
    cargoType: 'Equipment',
    contents: 'Diesel auxiliary power unit with Arctic cold-start manifold', 
    quantity: '1 Unit (Power Plant)',
    vehicleName: 'Heavy Hauler V-01', 
    assignedVehicleId: 'v-1',
    temperatureSensitive: false, 
    weightKg: 640, 
    origin: 'Base Camp Longyearbyen',
    originCoords: [78.2232, 15.6267],
    currentLocationName: 'Checkpoint 2 Power Shelter',
    lat: 78.5200, 
    lng: 16.5000,
    destination: 'Checkpoint 2', 
    destinationCoords: [78.5200, 16.5000],
    routeCoords: [
      [78.2232, 15.6267],
      [78.3100, 15.9500],
      [78.5200, 16.5000]
    ],
    status: 'Pending', 
    eta: 'Scheduled 16:00 UTC', 
    lastUpdated: '1h ago',
    priority: 'Standard',
    relatedInventoryId: 'INV-EQP-01',
    deliveredQuantityValue: 1,
    timeline: [
      { id: 'tl-601', time: 'Yesterday 19:00', status: 'Pending', location: 'Base Camp Heavy Workshop', note: 'Pre-heating circuit and starter fluid test passed' },
      { id: 'tl-602', time: 'Today 07:00', status: 'Pending', location: 'Base Camp Transport Deck', note: 'Waiting for secondary convoy escort' }
    ]
  }
];

const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: 'INV-MED-01',
    name: 'Hypothermia & Trauma Emergency Kits',
    category: 'Medical',
    quantity: 28,
    unit: 'kits',
    storageLocation: 'Base Camp Medical Bay - Locker 2',
    minThreshold: 15,
    criticalThreshold: 6,
    maxCapacity: 50,
    status: 'Available',
    lastUpdated: '10m ago',
    incomingQuantity: 14,
    usedQuantity: 6,
    relatedCargoId: 'c-01',
    relatedCargoCode: 'CRG-101',
    relatedCargoTitle: 'Medical Supplies & Plasma Units',
    lotNumber: 'LOT-MED-2026-A',
    expiryDate: '2027-10-31',
    temperatureControlled: true,
    history: [
      {
        id: 'mvt-1',
        timestamp: '08:30 UTC',
        type: 'Stock Intake',
        quantityChange: 10,
        resultingQuantity: 34,
        location: 'Base Camp Medical Bay',
        performedBy: 'Elena Rostova (Medical Officer)',
        notes: 'Monthly resupply intake from Longyearbyen depot'
      },
      {
        id: 'mvt-2',
        timestamp: '10:15 UTC',
        type: 'Consumption',
        quantityChange: -6,
        resultingQuantity: 28,
        location: 'Base Camp Medical Bay',
        performedBy: 'Elena Rostova (Medical Officer)',
        notes: 'Loaded into Snowcat V-09 emergency rescue pack'
      }
    ]
  },
  {
    id: 'INV-MED-02',
    name: 'Lyophilized Blood Plasma Units',
    category: 'Medical',
    quantity: 4,
    unit: 'units',
    storageLocation: 'Base Camp Cryo-Vault Rack 1 (-20°C)',
    minThreshold: 8,
    criticalThreshold: 2,
    maxCapacity: 25,
    status: 'Low Stock',
    lastUpdated: '25m ago',
    incomingQuantity: 10,
    usedQuantity: 16,
    relatedCargoId: 'c-01',
    relatedCargoCode: 'CRG-101',
    relatedCargoTitle: 'Medical Supplies & Plasma Units',
    lotNumber: 'LOT-PLS-882',
    expiryDate: '2026-12-15',
    temperatureControlled: true,
    history: [
      {
        id: 'mvt-3',
        timestamp: 'Yesterday 16:00 UTC',
        type: 'Consumption',
        quantityChange: -2,
        resultingQuantity: 4,
        location: 'Base Camp Cryo-Vault',
        performedBy: 'Elena Rostova (Medical Officer)',
        notes: 'Pre-positioned in mobile triage canister'
      }
    ]
  },
  {
    id: 'INV-FUEL-01',
    name: 'Polar Diesel Blend (Grade A-40)',
    category: 'Fuel',
    quantity: 1850,
    unit: 'L',
    storageLocation: 'Exterior Fuel Bladder Depot #3',
    minThreshold: 1200,
    criticalThreshold: 500,
    maxCapacity: 4000,
    status: 'Available',
    lastUpdated: '14m ago',
    incomingQuantity: 800,
    usedQuantity: 950,
    relatedCargoId: 'c-02',
    relatedCargoCode: 'CRG-102',
    relatedCargoTitle: 'Arctic Jet-A1 Fuel Pods',
    lotNumber: 'DSL-POLAR-40A',
    history: [
      {
        id: 'mvt-4',
        timestamp: '07:30 UTC',
        type: 'Consumption',
        quantityChange: -150,
        resultingQuantity: 1850,
        location: 'Fuel Depot #3',
        performedBy: 'Lars Nygård (Vehicle Operator)',
        notes: 'Snowcat V-03 pre-trip tank top-up'
      }
    ]
  },
  {
    id: 'INV-FUEL-02',
    name: 'Aviation Kerosene & Aux Generator Fuel',
    category: 'Fuel',
    quantity: 120,
    unit: 'L',
    storageLocation: 'Checkpoint 2 Aux Fuel Bunker',
    minThreshold: 300,
    criticalThreshold: 150,
    maxCapacity: 1000,
    status: 'Critical',
    lastUpdated: '1h ago',
    incomingQuantity: 400,
    usedQuantity: 680,
    relatedCargoId: 'c-02',
    relatedCargoCode: 'CRG-102',
    relatedCargoTitle: 'Arctic Jet-A1 Fuel Pods',
    lotNumber: 'AV-KER-2026',
    history: [
      {
        id: 'mvt-5',
        timestamp: 'Yesterday 21:00 UTC',
        type: 'Consumption',
        quantityChange: -180,
        resultingQuantity: 120,
        location: 'Checkpoint 2',
        performedBy: 'Henrik Vang (Drill Lead)',
        notes: 'Thermal ice drill generator continuous overnight run'
      }
    ]
  },
  {
    id: 'INV-PRV-01',
    name: 'Vacuum-Sealed High-Calorie Field Rations',
    category: 'Provisions',
    quantity: 850,
    unit: 'kg',
    storageLocation: 'Base Camp Shelter A - Provisions Depot',
    minThreshold: 400,
    criticalThreshold: 200,
    maxCapacity: 2000,
    status: 'Available',
    lastUpdated: '32m ago',
    incomingQuantity: 400,
    usedQuantity: 320,
    relatedCargoId: 'c-03',
    relatedCargoCode: 'CRG-103',
    relatedCargoTitle: '40-Day High-Calorie Field Rations',
    lotNumber: 'RAT-2026-N4',
    expiryDate: '2028-06-30',
    history: [
      {
        id: 'mvt-6',
        timestamp: '09:00 UTC',
        type: 'Outbound',
        quantityChange: -50,
        resultingQuantity: 850,
        location: 'Base Camp Shelter A',
        performedBy: 'Freja Møller (Logistics)',
        notes: 'Allocated for Ice Camp expedition field crews'
      }
    ]
  },
  {
    id: 'INV-PRV-02',
    name: 'Thermal Hydration & Electrolyte Packs',
    category: 'Provisions',
    quantity: 0,
    unit: 'packs',
    storageLocation: 'Checkpoint 1 Staging Yard',
    minThreshold: 60,
    criticalThreshold: 25,
    maxCapacity: 300,
    status: 'Used',
    lastUpdated: '2h ago',
    incomingQuantity: 150,
    usedQuantity: 300,
    relatedCargoId: 'c-03',
    relatedCargoCode: 'CRG-103',
    relatedCargoTitle: '40-Day High-Calorie Field Rations',
    lotNumber: 'ELY-2026-B',
    expiryDate: '2027-04-15',
    history: [
      {
        id: 'mvt-7',
        timestamp: '06:30 UTC',
        type: 'Consumption',
        quantityChange: -40,
        resultingQuantity: 0,
        location: 'Checkpoint 1 Staging Yard',
        performedBy: 'Tariq Al-Mansoor',
        notes: 'Depleted during blizzard halt waiting for convoy escort'
      }
    ]
  },
  {
    id: 'INV-EQP-01',
    name: '8kW Cold-Weather Auxiliary Diesel Generator',
    category: 'Equipment',
    quantity: 2,
    unit: 'units',
    storageLocation: 'Mechanical Workshop - Heavy Bay 1',
    minThreshold: 2,
    criticalThreshold: 1,
    maxCapacity: 5,
    status: 'Available',
    lastUpdated: '45m ago',
    incomingQuantity: 1,
    usedQuantity: 1,
    relatedCargoId: 'c-06',
    relatedCargoCode: 'CRG-106',
    relatedCargoTitle: '8kW Cold-Weather Auxiliary Generator',
    lotNumber: 'GEN-8KW-02',
    history: [
      {
        id: 'mvt-8',
        timestamp: 'Yesterday 14:00 UTC',
        type: 'Stock Intake',
        quantityChange: 1,
        resultingQuantity: 2,
        location: 'Mechanical Workshop',
        performedBy: 'Tariq Al-Mansoor',
        notes: 'Overhauled auxiliary unit returned to active storage'
      }
    ]
  },
  {
    id: 'INV-EQP-02',
    name: 'Satellite Uplink Relays & Antennas',
    category: 'Equipment',
    quantity: 6,
    unit: 'assemblies',
    storageLocation: 'Research Camp Bravo - Comms Tower Depot',
    minThreshold: 3,
    criticalThreshold: 1,
    maxCapacity: 10,
    status: 'Available',
    lastUpdated: '45m ago',
    incomingQuantity: 0,
    usedQuantity: 2,
    relatedCargoId: 'c-05',
    relatedCargoCode: 'CRG-105',
    relatedCargoTitle: 'Satellite Uplink Relays & Antennas',
    lotNumber: 'SAT-RELAY-09',
    history: [
      {
        id: 'mvt-9',
        timestamp: 'Today 08:15 UTC',
        type: 'Delivered Cargo',
        quantityChange: 4,
        resultingQuantity: 6,
        location: 'Research Camp Bravo Comms Tower',
        performedBy: 'Dr. Sonya Lind',
        notes: 'Received and inspected from CRG-105 delivered by Scout V-07',
        relatedCargoCode: 'CRG-105',
        relatedCargoId: 'c-05'
      }
    ]
  },
  {
    id: 'INV-SCI-01',
    name: 'Deep Ice Core Cryo Barrels',
    category: 'Scientific',
    quantity: 3,
    unit: 'barrels',
    storageLocation: 'Ice Camp Alpha - Sub-Surface Vault',
    minThreshold: 5,
    criticalThreshold: 2,
    maxCapacity: 20,
    status: 'Low Stock',
    lastUpdated: '18m ago',
    incomingQuantity: 6,
    usedQuantity: 12,
    relatedCargoId: 'c-04',
    relatedCargoCode: 'CRG-104',
    relatedCargoTitle: 'Deep Ice Core Cryo Barrels',
    lotNumber: 'CRYO-B310',
    temperatureControlled: true,
    history: [
      {
        id: 'mvt-10',
        timestamp: '10:30 UTC',
        type: 'Stock Intake',
        quantityChange: 1,
        resultingQuantity: 3,
        location: 'Ice Camp Alpha Vault',
        performedBy: 'Dr. Maya Lin',
        notes: 'Glacier core extracted from 310m borehole sealed in barrel'
      }
    ]
  },
  {
    id: 'INV-SCI-02',
    name: 'Glaciological Crevasse Radar Nodes',
    category: 'Scientific',
    quantity: 0,
    unit: 'nodes',
    storageLocation: 'Checkpoint 3 Drone Ground Staging',
    minThreshold: 4,
    criticalThreshold: 2,
    maxCapacity: 16,
    status: 'Incoming',
    lastUpdated: '3h ago',
    incomingQuantity: 8,
    usedQuantity: 10,
    lotNumber: 'GPR-RADAR-V3',
    history: [
      {
        id: 'mvt-11',
        timestamp: 'Yesterday 18:00 UTC',
        type: 'Outbound',
        quantityChange: -4,
        resultingQuantity: 0,
        location: 'Checkpoint 3',
        performedBy: 'Nils Lindqvist',
        notes: 'Mounted on autonomous drone survey flight #4'
      }
    ]
  }
];

const INITIAL_EMERGENCIES: Emergency[] = [
  {
    id: 'emg-01',
    type: 'Medical',
    severity: 'Critical',
    locationName: 'Ice Camp',
    lat: 78.6500,
    lng: 16.9000,
    affectedPerson: 'Dr. Marcus Vance (Field Biologist)',
    description: 'Researcher frostbite & acute altitude shock during ridge traverse.',
    reportedAt: '12m ago',
    status: 'Active',
    nearestTeamName: 'Rescue Team A (Snowcat V-09)',
    distanceKm: 8.4,
    etaMinutes: 18,
    lastUpdated: '2m ago',
    responseRoute: [
      [78.4100, 16.6500],
      [78.5300, 16.7800],
      [78.6500, 16.9000]
    ]
  }
];

// Exactly 3 initial alerts as requested in Requirement 5
const INITIAL_ALERTS: SystemAlert[] = [
  { id: 'alt-1', type: 'fuel', title: 'Low Fuel', detail: 'Polar Fuel stockpile at 680L (below 800L threshold)', time: '24m ago', active: true },
  { id: 'alt-2', type: 'cargo', title: 'Cargo Delayed', detail: 'Cargo C-018 delayed by crevasse avoidance route', time: '42m ago', active: true },
  { id: 'alt-3', type: 'weather', title: 'Weather Warning', detail: 'Blizzard advisory (-28°C windchill) for Tempelfjorden', time: '1h ago', active: true }
];

const INITIAL_WEATHER: WeatherData = {
  tempC: -18,
  condition: 'Light Snow',
  windSpeedKmH: 18,
  visibilityKm: 8,
  location: 'Svalbard Arctic Sector'
};

class DataService {
  private subscribers: Set<() => void> = new Set();
  private movementTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.initStorage();
    this.startLiveMovement();
  }

  private initStorage() {
    if (typeof window === 'undefined') return;
    if (!localStorage.getItem(STORAGE_KEYS.EXPEDITIONS)) {
      localStorage.setItem(STORAGE_KEYS.EXPEDITIONS, JSON.stringify(INITIAL_EXPEDITIONS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.PERSONNEL)) {
      localStorage.setItem(STORAGE_KEYS.PERSONNEL, JSON.stringify(INITIAL_PERSONNEL));
    }
    if (!localStorage.getItem(STORAGE_KEYS.VEHICLES)) {
      localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(INITIAL_VEHICLES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CARGO)) {
      localStorage.setItem(STORAGE_KEYS.CARGO, JSON.stringify(INITIAL_CARGO));
    }
    if (!localStorage.getItem(STORAGE_KEYS.INVENTORY)) {
      localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(INITIAL_INVENTORY));
    } else {
      try {
        const storedInv = JSON.parse(localStorage.getItem(STORAGE_KEYS.INVENTORY) || '[]');
        if (!Array.isArray(storedInv) || storedInv.length === 0 || !storedInv[0].history || !storedInv[0].storageLocation) {
          localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(INITIAL_INVENTORY));
        }
      } catch {
        localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(INITIAL_INVENTORY));
      }
    }
    if (!localStorage.getItem(STORAGE_KEYS.EMERGENCIES)) {
      localStorage.setItem(STORAGE_KEYS.EMERGENCIES, JSON.stringify(INITIAL_EMERGENCIES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ALERTS)) {
      localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(INITIAL_ALERTS));
    }
  }

  public subscribe(callback: () => void): () => void {
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  private notify() {
    this.subscribers.forEach(cb => cb());
  }

  private get<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private set<T>(key: string, value: T) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      this.notify();
    } catch (err) {
      console.error('Failed to save to localStorage:', err);
    }
  }

  // --- Expeditions ---
  public getExpeditions(): Expedition[] {
    const raw = this.get<Expedition[]>(STORAGE_KEYS.EXPEDITIONS, INITIAL_EXPEDITIONS);
    return raw.map(exp => {
      let status: ExpeditionStatus = exp.status;
      if ((status as any) === 'Planned') {
        status = 'Planning';
      }
      return {
        ...exp,
        status,
        endDate: exp.endDate || '2026-04-15',
        teamMemberNames: exp.teamMemberNames || (exp.lead ? [exp.lead] : []),
        currentCheckpoint: exp.currentCheckpoint || (exp.camps && exp.camps[0]) || 'Base Camp',
        nextCheckpoint: exp.nextCheckpoint || (exp.camps && exp.camps[1]) || 'Checkpoint 1',
        assignedTeamCount: (exp.teamMemberNames && exp.teamMemberNames.length) || exp.assignedTeamCount || 3
      };
    });
  }

  public updateExpedition(expedition: Expedition) {
    const list = this.getExpeditions();
    const idx = list.findIndex(e => e.id === expedition.id);
    if (idx !== -1) {
      list[idx] = expedition;
      this.set(STORAGE_KEYS.EXPEDITIONS, list);
    }
  }

  public createExpedition(params: {
    title: string;
    lead: string;
    startDate: string;
    endDate: string;
    teamMemberIds: string[];
    routeId: string;
  }): Expedition {
    const list = this.getExpeditions();
    const route = PREDEFINED_ROUTES.find(r => r.id === params.routeId) || PREDEFINED_ROUTES[0];
    const personnelList = this.getPersonnel();
    const selectedMembers = personnelList.filter(p => params.teamMemberIds.includes(p.id));
    const memberNames = selectedMembers.map(p => p.name);
    if (params.lead && !memberNames.includes(params.lead)) {
      memberNames.unshift(params.lead);
    }

    const nextIndex = list.length + 1;
    const newExpedition: Expedition = {
      id: `exp-${Date.now()}`,
      code: `EXP-ARC-${String(nextIndex).padStart(2, '0')}`,
      title: params.title.trim().toUpperCase(),
      region: route.region,
      status: 'Planning',
      progress: 0,
      assignedTeamCount: memberNames.length,
      teamMemberIds: params.teamMemberIds,
      teamMemberNames: memberNames,
      camps: route.camps,
      routeCoordinates: route.routeCoordinates,
      lead: params.lead,
      startDate: params.startDate,
      endDate: params.endDate,
      currentCheckpoint: route.camps[0] || 'Base Camp',
      nextCheckpoint: route.camps[1] || route.camps[0] || 'Checkpoint 1',
      routeName: route.name,
      distanceKm: route.distanceKm,
      estimatedDurationDays: route.durationDays
    };

    list.unshift(newExpedition);
    this.set(STORAGE_KEYS.EXPEDITIONS, list);

    // Synchronize assigned personnel with expedition title
    selectedMembers.forEach(person => {
      person.expedition = newExpedition.title;
      this.updatePersonnel(person);
    });

    this.notify();
    return newExpedition;
  }

  public startExpedition(id: string): Expedition | null {
    const list = this.getExpeditions();
    const exp = list.find(e => e.id === id);
    if (!exp) return null;

    exp.status = 'Active';
    if (exp.progress === 0) {
      exp.progress = 10;
    }
    this.set(STORAGE_KEYS.EXPEDITIONS, list);

    // Synchronize with existing Personnel data
    const personnelList = this.getPersonnel();
    let personnelUpdated = false;

    personnelList.forEach(p => {
      const isAssigned = 
        (exp.teamMemberIds && exp.teamMemberIds.includes(p.id)) ||
        (exp.teamMemberNames && exp.teamMemberNames.includes(p.name)) ||
        p.name === exp.lead;

      if (isAssigned) {
        p.expedition = exp.title;
        if (p.status === 'Standby' || p.status === 'At Base' || p.status === 'Resting') {
          p.status = 'Active';
        }
        p.currentTask = `Deployed to ${exp.title} traverse`;
        p.lastCheckIn = 'Just now';
        p.lastUpdated = 'Just now';

        const history = p.movementHistory || [];
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        history.unshift({
          time: timeStr,
          event: `Traverse started: Deployed to ${exp.title} (${exp.code})`
        });
        p.movementHistory = history.slice(0, 15);
        personnelUpdated = true;
      }
    });

    if (personnelUpdated) {
      this.set(STORAGE_KEYS.PERSONNEL, personnelList);
    }

    // Synchronize with GIS / Alert data
    const alerts = this.getAlerts();
    alerts.unshift({
      id: `alt-${Date.now()}`,
      type: 'cargo',
      title: `EXPEDITION DEPLOYED: ${exp.code}`,
      detail: `${exp.title} departed ${exp.currentCheckpoint || 'Base Camp'}. Lead: ${exp.lead}. GIS route active.`,
      time: 'Just now',
      active: true
    });
    this.set(STORAGE_KEYS.ALERTS, alerts.slice(0, 20));

    this.notify();
    return exp;
  }

  // --- Personnel ---
  public getPersonnel(): Personnel[] {
    return this.get<Personnel[]>(STORAGE_KEYS.PERSONNEL, INITIAL_PERSONNEL);
  }

  public updatePersonnel(personnel: Personnel) {
    const list = this.getPersonnel();
    const idx = list.findIndex(p => p.id === personnel.id);
    if (idx !== -1) {
      list[idx] = personnel;
      this.set(STORAGE_KEYS.PERSONNEL, list);
    }
  }

  // --- Vehicles ---
  public getVehicles(): Vehicle[] {
    return this.get<Vehicle[]>(STORAGE_KEYS.VEHICLES, INITIAL_VEHICLES);
  }

  public updateVehicle(vehicle: Vehicle) {
    const list = this.getVehicles();
    const idx = list.findIndex(v => v.id === vehicle.id);
    if (idx !== -1) {
      list[idx] = vehicle;
      this.set(STORAGE_KEYS.VEHICLES, list);
    }
  }

  // --- Cargo ---
  public getCargo(): CargoItem[] {
    const rawList = this.get<CargoItem[]>(STORAGE_KEYS.CARGO, INITIAL_CARGO);
    
    // Normalize and enrich any legacy items
    return rawList.map(item => {
      let status = item.status;
      if (status === ('Prepared' as CargoStatus)) status = 'Pending';
      if (status === ('Dispatched' as CargoStatus)) status = 'In Transit';

      const defaultItem = INITIAL_CARGO.find(init => init.id === item.id) || INITIAL_CARGO[0];

      return {
        ...item,
        status,
        code: item.code || defaultItem.code,
        cargoType: item.cargoType || defaultItem.cargoType || 'Equipment',
        quantity: item.quantity || `${item.weightKg} kg`,
        origin: item.origin || defaultItem.origin || 'Base Camp Longyearbyen',
        originCoords: item.originCoords || defaultItem.originCoords || [78.2232, 15.6267],
        currentLocationName: item.currentLocationName || defaultItem.currentLocationName || 'Field Transit Sector',
        destinationCoords: item.destinationCoords || defaultItem.destinationCoords,
        routeCoords: item.routeCoords || defaultItem.routeCoords,
        vehicleName: item.vehicleName || defaultItem.vehicleName || 'Snowcat V-03',
        lastUpdated: item.lastUpdated || '5m ago',
        timeline: (item.timeline && item.timeline.length > 0) ? item.timeline : (defaultItem.timeline || [
          {
            id: `tl-${item.id}-1`,
            time: '08:00 UTC',
            status: 'Pending',
            location: item.origin || 'Base Camp Logistics Bay',
            note: 'Manifest verified and registered in system'
          },
          {
            id: `tl-${item.id}-2`,
            time: '10:00 UTC',
            status: status,
            location: item.currentLocationName || 'Field Sector',
            note: `Status currently ${status}`
          }
        ])
      };
    });
  }

  public updateCargoStatus(id: string, status: CargoStatus) {
    const list = this.getCargo();
    const idx = list.findIndex(c => c.id === id);
    if (idx !== -1) {
      const item = list[idx];
      const prevStatus = item.status;
      item.status = status;
      item.lastUpdated = 'Just now';

      if (status === 'Delivered') {
        item.eta = 'Delivered (Verified)';
        item.currentLocationName = `${item.destination} (Receiving Bay)`;
      } else if (status === 'Delayed') {
        item.eta = 'Delayed (Weather hold)';
      } else if (status === 'In Transit') {
        item.eta = 'In Transit (~3h)';
      }

      const timelineEvent: CargoTimelineEvent = {
        id: `tl-evt-${Date.now()}`,
        time: 'Just now',
        status,
        location: item.currentLocationName || item.destination,
        note: `Logistics status updated to "${status}" by Logistics Coordinator`
      };

      item.timeline = [...(item.timeline || []), timelineEvent];

      if (status === 'Delivered') {
        this.addAlert({
          type: 'cargo',
          title: `Cargo Delivered: ${item.code}`,
          detail: `${item.title} arrived safely at ${item.destination}.`,
          time: 'Just now'
        });

        // Cargo → Inventory synchronization
        if (prevStatus !== 'Delivered') {
          this.deliverCargoToInventory(item);
          item.deliveredProcessed = true;
        }
      } else if (status === 'Delayed') {
        this.addAlert({
          type: 'cargo',
          title: `Cargo Delayed: ${item.code}`,
          detail: `${item.title} delayed at ${item.currentLocationName}.`,
          time: 'Just now'
        });
      }

      this.set(STORAGE_KEYS.CARGO, list);
    }
  }

  public deliverCargoToInventory(cargoItem: CargoItem): boolean {
    const invList = this.getInventory();
    // Match by direct relatedInventoryId, or relatedCargoId/Code
    let item = invList.find(i => 
      (cargoItem.relatedInventoryId && i.id === cargoItem.relatedInventoryId) || 
      i.relatedCargoId === cargoItem.id ||
      i.relatedCargoCode === cargoItem.code
    );

    // Secondary fallback: match by category if available
    if (!item && cargoItem.cargoType) {
      item = invList.find(i => i.category.toLowerCase() === cargoItem.cargoType?.toLowerCase());
    }

    if (!item) return false;

    const deliveredAmount = cargoItem.deliveredQuantityValue || 
      (cargoItem.weightKg > 0 ? (cargoItem.weightKg > 100 ? 50 : 10) : 10);

    item.quantity = item.quantity + deliveredAmount;
    if (item.incomingQuantity > 0) {
      item.incomingQuantity = Math.max(0, item.incomingQuantity - deliveredAmount);
    }
    item.lastUpdated = 'Just now';

    // Recalculate stock status: Available, Incoming, Used, Low Stock, Critical
    if (item.quantity === 0) {
      item.status = 'Used';
    } else if (item.quantity <= item.criticalThreshold) {
      item.status = 'Critical';
    } else if (item.quantity <= item.minThreshold) {
      item.status = 'Low Stock';
    } else {
      item.status = 'Available';
    }

    // Record the change in inventory history
    const movement: StockMovement = {
      id: `mvt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: 'Just now',
      type: 'Delivered Cargo',
      quantityChange: deliveredAmount,
      resultingQuantity: item.quantity,
      location: cargoItem.destination || item.storageLocation,
      performedBy: 'Logistics Receiving Bay',
      notes: `Consignment ${cargoItem.code} (${cargoItem.title}) arrived via ${cargoItem.vehicleName || 'convoy'}. Stock verified & transferred to storage.`,
      relatedCargoCode: cargoItem.code,
      relatedCargoId: cargoItem.id
    };

    item.history = [movement, ...(item.history || [])];

    this.set(STORAGE_KEYS.INVENTORY, invList);

    this.addAlert({
      type: 'cargo',
      title: `Stock Received: ${item.id}`,
      detail: `+${deliveredAmount} ${item.unit} of "${item.name}" received from delivered cargo ${cargoItem.code}.`,
      time: 'Just now'
    });

    return true;
  }

  public addCargo(cargo: Omit<CargoItem, 'id'>) {
    const list = this.getCargo();
    const newItem: CargoItem = {
      ...cargo,
      id: `c-${Date.now().toString().slice(-4)}`
    };
    list.unshift(newItem);
    this.set(STORAGE_KEYS.CARGO, list);
  }

  // --- Inventory Management & Stock Control ---
  public getInventory(): InventoryItem[] {
    const raw = this.get<InventoryItem[]>(STORAGE_KEYS.INVENTORY, INITIAL_INVENTORY);
    return raw.map(item => {
      // Ensure category and status validity, and omit long marketing/explanatory descriptions
      const cleanItem = { ...item };
      delete cleanItem.description;
      let status = cleanItem.status;
      if (status === ('Normal' as any)) {
        status = cleanItem.quantity <= cleanItem.minThreshold ? 'Low Stock' : 'Available';
      }
      return {
        ...cleanItem,
        status: status || 'Available',
        history: cleanItem.history || []
      };
    });
  }

  public receiveStock(id: string, amount: number, notes?: string, performedBy: string = 'Logistics Officer') {
    const list = this.getInventory();
    const item = list.find(i => i.id === id);
    if (!item || amount <= 0) return;

    item.quantity += amount;
    if (item.incomingQuantity > 0) {
      item.incomingQuantity = Math.max(0, item.incomingQuantity - amount);
    }
    item.lastUpdated = 'Just now';

    if (item.quantity === 0) {
      item.status = 'Used';
    } else if (item.quantity <= item.criticalThreshold) {
      item.status = 'Critical';
    } else if (item.quantity <= item.minThreshold) {
      item.status = 'Low Stock';
    } else {
      item.status = 'Available';
    }

    const movement: StockMovement = {
      id: `mvt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: 'Just now',
      type: 'Stock Intake',
      quantityChange: amount,
      resultingQuantity: item.quantity,
      location: item.storageLocation,
      performedBy,
      notes: notes || `Manual stock intake of +${amount} ${item.unit}`
    };

    item.history = [movement, ...(item.history || [])];
    this.set(STORAGE_KEYS.INVENTORY, list);
  }

  public consumeStock(id: string, amount: number, notes?: string, performedBy: string = 'Field Operator') {
    const list = this.getInventory();
    const item = list.find(i => i.id === id);
    if (!item || amount <= 0) return;

    const actualAmount = Math.min(item.quantity, amount);
    item.quantity = Math.max(0, item.quantity - actualAmount);
    item.usedQuantity = (item.usedQuantity || 0) + actualAmount;
    item.lastUpdated = 'Just now';

    if (item.quantity === 0) {
      item.status = 'Used';
    } else if (item.quantity <= item.criticalThreshold) {
      item.status = 'Critical';
    } else if (item.quantity <= item.minThreshold) {
      item.status = 'Low Stock';
    } else {
      item.status = 'Available';
    }

    const movement: StockMovement = {
      id: `mvt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: 'Just now',
      type: 'Consumption',
      quantityChange: -actualAmount,
      resultingQuantity: item.quantity,
      location: item.storageLocation,
      performedBy,
      notes: notes || `Consumption / outbound dispatch of ${actualAmount} ${item.unit}`
    };

    item.history = [movement, ...(item.history || [])];

    if (item.status === 'Low Stock' || item.status === 'Critical') {
      this.addAlert({
        type: 'fuel',
        title: `${item.status}: ${item.name}`,
        detail: `${item.id} is down to ${item.quantity} ${item.unit} (Min: ${item.minThreshold} ${item.unit})`,
        time: 'Just now'
      });
    }

    this.set(STORAGE_KEYS.INVENTORY, list);
  }

  public updateInventoryQuantity(id: string, delta: number, reason?: string) {
    if (delta > 0) {
      this.receiveStock(id, delta, reason);
    } else if (delta < 0) {
      this.consumeStock(id, Math.abs(delta), reason);
    }
  }

  public setInventoryItem(updatedItem: InventoryItem) {
    const list = this.getInventory();
    const idx = list.findIndex(i => i.id === updatedItem.id);
    if (idx !== -1) {
      list[idx] = updatedItem;
      this.set(STORAGE_KEYS.INVENTORY, list);
    }
  }

  // --- Emergencies ---
  public getEmergencies(): Emergency[] {
    const list = this.get<Emergency[]>(STORAGE_KEYS.EMERGENCIES, INITIAL_EMERGENCIES);
    return list.map(emg => {
      let status: EmergencyStatus = emg.status;
      if ((status as string) === 'Response') status = 'Response Assigned';
      return {
        ...emg,
        status: status || 'Active',
        affectedPerson: emg.affectedPerson || 'Dr. Marcus Vance (Field Biologist)',
        etaMinutes: emg.etaMinutes !== undefined ? emg.etaMinutes : (Math.round((emg.distanceKm || 8) * 2.2) || 18),
        lastUpdated: emg.lastUpdated || 'Just now'
      };
    });
  }

  public getActiveEmergencies(): Emergency[] {
    return this.getEmergencies().filter(e => e.status !== 'Resolved');
  }

  public createEmergency(params: {
    type: EmergencyType;
    severity: EmergencySeverity;
    locationName: string;
    lat: number;
    lng: number;
    description?: string;
    affectedPerson?: string;
  }): Emergency {
    const emergencies = this.getEmergencies();
    const vehicles = this.getVehicles();

    // Find nearest vehicle or response team based on Euclidean lat/lng distance
    let nearestVehicle = vehicles[0];
    let minDistance = 9999;
    vehicles.forEach(v => {
      const d = Math.sqrt(Math.pow(v.lat - params.lat, 2) + Math.pow(v.lng - params.lng, 2)) * 111;
      if (d < minDistance) {
        minDistance = d;
        nearestVehicle = v;
      }
    });

    const calculatedDist = parseFloat((minDistance * 1.3).toFixed(1)); // realistic ground winding factor
    const etaMinutes = Math.max(5, Math.round(calculatedDist * 2.2));

    // Create realistic response route
    const midLat = (nearestVehicle.lat + params.lat) / 2 + (Math.random() * 0.01 - 0.005);
    const midLng = (nearestVehicle.lng + params.lng) / 2 + (Math.random() * 0.02 - 0.01);

    const newEmergency: Emergency = {
      id: `emg-${Date.now().toString().slice(-4)}`,
      type: params.type,
      severity: params.severity,
      locationName: params.locationName,
      lat: params.lat,
      lng: params.lng,
      affectedPerson: params.affectedPerson || 'Field Research Specialist',
      description: params.description || `${params.type} crisis reported at ${params.locationName}`,
      reportedAt: 'Just now',
      status: 'Active',
      nearestTeamName: `Rescue Team (${nearestVehicle.code})`,
      distanceKm: calculatedDist,
      etaMinutes: etaMinutes,
      lastUpdated: 'Just now',
      responseRoute: [
        [nearestVehicle.lat, nearestVehicle.lng],
        [midLat, midLng],
        [params.lat, params.lng]
      ]
    };

    emergencies.unshift(newEmergency);
    this.set(STORAGE_KEYS.EMERGENCIES, emergencies);

    // Add immediate system alert
    this.addAlert({
      type: 'emergency',
      title: `🚨 EMERGENCY: ${params.type}`,
      detail: `${params.locationName} (${params.severity}) - Affected: ${newEmergency.affectedPerson}`,
      time: 'Just now'
    });

    return newEmergency;
  }

  public updateEmergencyStatus(id: string, status: EmergencyStatus) {
    const list = this.getEmergencies();
    const emg = list.find(e => e.id === id);
    if (emg) {
      emg.status = status;
      emg.lastUpdated = 'Just now';

      // Dynamically adjust ETA based on status progression
      if (status === 'Team En Route') {
        emg.etaMinutes = Math.max(2, Math.round((emg.distanceKm || 8) * 1.2));
      } else if (status === 'Resolved') {
        emg.etaMinutes = 0;
      }

      this.set(STORAGE_KEYS.EMERGENCIES, list);

      let alertTitle = `Emergency Update: ${status}`;
      if (status === 'Resolved') alertTitle = 'Emergency Resolved';
      else if (status === 'Team En Route') alertTitle = 'Rescue Team En Route';
      else if (status === 'Response Assigned') alertTitle = 'Response Team Assigned';

      this.addAlert({
        type: 'emergency',
        title: alertTitle,
        detail: `${emg.type} incident at ${emg.locationName}: Status updated to ${status}.`,
        time: 'Just now'
      });
      this.notify();
    }
  }

  public advanceEmergencyStatus(id: string): EmergencyStatus | null {
    const list = this.getEmergencies();
    const emg = list.find(e => e.id === id);
    if (!emg) return null;

    const sequence: EmergencyStatus[] = ['Active', 'Response Assigned', 'Team En Route', 'Resolved'];
    const currentIndex = sequence.indexOf(emg.status);
    const nextStatus = currentIndex < sequence.length - 1 ? sequence[currentIndex + 1] : 'Resolved';
    this.updateEmergencyStatus(id, nextStatus);
    return nextStatus;
  }

  public resolveEmergency(id: string) {
    this.updateEmergencyStatus(id, 'Resolved');
  }

  // --- Alerts ---
  public getAlerts(): SystemAlert[] {
    return this.get<SystemAlert[]>(STORAGE_KEYS.ALERTS, INITIAL_ALERTS);
  }

  public addAlert(alert: Omit<SystemAlert, 'id' | 'active'>) {
    const list = this.getAlerts();
    list.unshift({
      id: `alt-${Date.now()}`,
      active: true,
      ...alert
    });
    // Keep max 10 alerts
    this.set(STORAGE_KEYS.ALERTS, list.slice(0, 10));
  }

  public dismissAlert(id: string) {
    const list = this.getAlerts().filter(a => a.id !== id);
    this.set(STORAGE_KEYS.ALERTS, list);
  }

  // --- Weather & Camps ---
  public getWeather(): WeatherData {
    return INITIAL_WEATHER;
  }

  public getCamps(): Camp[] {
    return INITIAL_CAMPS;
  }

  // --- Live Movement Simulator along predefined route ---
  private startLiveMovement() {
    if (typeof window === 'undefined') return;
    if (this.movementTimer) clearInterval(this.movementTimer);

    // Predefined smooth waypoints between Base Camp and Ice Camp
    const v03RouteWaypoints: [number, number][] = [
      [78.2232, 15.6267],
      [78.2500, 15.7400],
      [78.2800, 15.8600],
      [78.3100, 15.9800],
      [78.3400, 16.0800], // Checkpoint 1
      [78.3650, 16.2200],
      [78.3900, 16.4100],
      [78.4120, 16.5800],
      [78.4350, 16.7120], // Research Camp
      [78.4700, 16.7500],
      [78.5100, 16.7900],
      [78.5400, 16.8200], // Checkpoint 2
      [78.5800, 16.8500],
      [78.6150, 16.8800],
      [78.6500, 16.9000]  // Ice Camp
    ];

    let v03WaypointIdx = 4; // Start near Checkpoint 1
    let v03Direction = 1;
    let secondsCounter = 0;

    // Run every 2.5 seconds for visible, responsive tracking
    this.movementTimer = setInterval(() => {
      secondsCounter += 2;

      // 1. Move vehicle V-03 along route
      const vehicles = this.getVehicles();
      const v03 = vehicles.find(v => v.code === 'V-03');
      if (v03 && v03.status === 'In Transit') {
        v03WaypointIdx += v03Direction;
        if (v03WaypointIdx >= v03RouteWaypoints.length - 1) {
          v03WaypointIdx = v03RouteWaypoints.length - 1;
          v03Direction = -1;
        } else if (v03WaypointIdx <= 0) {
          v03WaypointIdx = 0;
          v03Direction = 1;
        }

        const targetCoord = v03RouteWaypoints[v03WaypointIdx];
        v03.lat = targetCoord[0];
        v03.lng = targetCoord[1];
        v03.lastSeenSecAgo = (secondsCounter % 5) + 1;
        v03.speedKmH = 22 + Math.floor(Math.sin(v03WaypointIdx) * 6);
        this.set(STORAGE_KEYS.VEHICLES, [...vehicles]);
      }

      // 2. Also move cargo in transit (C-014) along same supply route
      const cargoList = this.getCargo();
      const c014 = cargoList.find(c => c.code === 'C-014');
      if (c014 && c014.status === 'In Transit') {
        const cargoWpIdx = Math.max(0, (v03WaypointIdx - 2 + v03RouteWaypoints.length) % v03RouteWaypoints.length);
        const cTarget = v03RouteWaypoints[cargoWpIdx];
        c014.lat = cTarget[0];
        c014.lng = cTarget[1];
        this.set(STORAGE_KEYS.CARGO, [...cargoList]);
      }
    }, 2500);
  }

  // --- Generate Downloadable Report ---
  public generateMissionReport(): string {
    const expeditions = this.getExpeditions();
    const personnel = this.getPersonnel();
    const vehicles = this.getVehicles();
    const cargo = this.getCargo();
    const inventory = this.getInventory();
    const emergencies = this.getEmergencies();

    const timestamp = new Date().toISOString();
    return `===============================================================
POLAR EXPEDITION — INTEGRATED LOGISTICS & ASSET REPORT
Expedition • Track • Respond
Generated: ${timestamp}
Sector: Svalbard Arctic Operations Base
===============================================================

[1] EXECUTIVE MISSION SUMMARY
- Active Expeditions: ${expeditions.filter(e => e.status === 'Active').length} / ${expeditions.length}
- Tracked Personnel: ${personnel.length} Operatives
- Fleet Vehicles: ${vehicles.length} Active Units
- Tracked Cargo Shipments: ${cargo.length} Lots
- Active Emergencies: ${emergencies.filter(e => e.status !== 'Resolved').length}
- Weather Condition: -18°C, Light Snow, Wind 18 km/h, Vis 8 km

[2] EXPEDITIONS
${expeditions.map(e => `• [${e.code}] ${e.title} — ${e.status.toUpperCase()} (${e.progress}% complete)
  Region: ${e.region} | Lead: ${e.lead} | Team: ${e.assignedTeamCount} operatives`).join('\n')}

[3] CARGO MANIFEST
${cargo.map(c => `• [${c.code}] ${c.title} — ${c.status} (${c.weightKg} kg) -> ${c.destination} (ETA: ${c.eta})`).join('\n')}

[4] CRITICAL INVENTORY STATUS
${inventory.map(i => `• ${i.category}: ${i.name} — ${i.quantity} ${i.unit} [${i.status}] (Min: ${i.minThreshold} ${i.unit})`).join('\n')}

[5] ACTIVE ASSETS & FLEET
${vehicles.map(v => `• [${v.code}] ${v.name} — ${v.status} | Fuel: ${v.fuelPercentage}% | GPS: ${v.lat}, ${v.lng}`).join('\n')}

[6] EMERGENCY LOGS
${emergencies.map(em => `• [${em.type.toUpperCase()}] ${em.locationName} (${em.severity}) — Status: ${em.status}
  Responder: ${em.nearestTeamName} (${em.distanceKm} km away)
  Notes: ${em.description}`).join('\n')}

===============================================================
POLAR EXPEDITION COMMAND ARCHIVE — END OF TRANSMISSION
===============================================================`;
  }
}

export const dataService = new DataService();
