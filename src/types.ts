export type NavigationTab = 
  | 'dashboard' 
  | 'expeditions' 
  | 'tracking' 
  | 'cargo' 
  | 'inventory' 
  | 'emergency' 
  | 'reports';

export type MarkerFilter = 'all' | 'people' | 'vehicles' | 'cargo' | 'emergency';

export type ExpeditionStatus = 'Planning' | 'Active' | 'Completed' | 'Planned';

export interface Expedition {
  id: string;
  code: string;
  title: string;
  region: string;
  status: ExpeditionStatus;
  progress: number;
  assignedTeamCount: number;
  teamMemberIds?: string[];
  teamMemberNames?: string[];
  camps: string[];
  routeCoordinates: [number, number][];
  lead: string;
  startDate: string;
  endDate?: string;
  currentCheckpoint?: string;
  nextCheckpoint?: string;
  routeName?: string;
  estimatedDurationDays?: number;
  distanceKm?: number;
}

export type PersonnelStatus = 
  | 'Active' 
  | 'Moving' 
  | 'At Base' 
  | 'In Transit' 
  | 'Standby' 
  | 'Offline' 
  | 'Emergency'
  | 'Resting';

export interface MovementHistoryEntry {
  time: string;
  event: string;
}

export interface Personnel {
  id: string;
  code: string;
  name: string;
  role: string;
  location: string;
  status: PersonnelStatus;
  lat: number;
  lng: number;
  currentTask: string;
  lastCheckIn: string;
  lastUpdated?: string;
  callsign: string;
  expedition: string;
  assignedVehicle: string;
  emergencyStatus: 'Nominal' | 'Emergency' | 'Alert';
  movementHistory?: MovementHistoryEntry[];
}

export type UserRole = 
  | 'admin' 
  | 'expedition.manager' 
  | 'logistics.officer' 
  | 'field.operator' 
  | 'emergency.coordinator';

export interface AuthUser {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  roleTitle: string;
  allowedTabs: NavigationTab[];
}

export type VehicleStatus = 'In Transit' | 'Stationary' | 'Standby' | 'Emergency Response';

export interface Vehicle {
  id: string;
  code: string;
  name: string;
  type: string;
  fuelPercentage: number;
  status: VehicleStatus;
  lat: number;
  lng: number;
  speedKmH: number;
  lastSeenSecAgo: number;
  assignedExpedition: string;
  driver?: string;
  routeTrail?: [number, number][];
}

export type CargoStatus = 'Pending' | 'In Transit' | 'Delivered' | 'Delayed' | 'Prepared' | 'Dispatched';
export type CargoType = 'Medical' | 'Fuel' | 'Provisions' | 'Scientific' | 'Equipment' | 'Hardware';

export interface CargoTimelineEvent {
  id: string;
  time: string;
  status: CargoStatus;
  location: string;
  note: string;
}

export interface CargoItem {
  id: string;
  code: string;
  title: string;
  cargoType?: CargoType;
  contents?: string;
  quantity?: string;
  weightKg: number;
  origin?: string;
  originCoords?: [number, number];
  currentLocationName?: string;
  destination: string;
  destinationCoords?: [number, number];
  routeCoords?: [number, number][];
  status: CargoStatus;
  eta: string;
  vehicleName?: string;
  assignedVehicleId?: string;
  lastUpdated?: string;
  temperatureSensitive?: boolean;
  priority?: 'Standard' | 'High' | 'Critical';
  timeline?: CargoTimelineEvent[];
  lat: number;
  lng: number;
  relatedInventoryId?: string;
  deliveredQuantityValue?: number;
  deliveredProcessed?: boolean;
}

export interface Camp {
  id: string;
  code: string;
  name: string;
  lat: number;
  lng: number;
  elevationM: number;
  capacity: number;
  personnelCount: number;
}

export type EmergencyType = 'Medical' | 'Vehicle' | 'Weather' | 'Missing Person' | 'Other';
export type EmergencySeverity = 'High' | 'Critical';
export type EmergencyStatus = 'Active' | 'Response Assigned' | 'Team En Route' | 'Resolved';

export interface Emergency {
  id: string;
  type: EmergencyType;
  severity: EmergencySeverity;
  locationName: string;
  lat: number;
  lng: number;
  description?: string;
  reportedAt: string;
  status: EmergencyStatus;
  nearestTeamName: string;
  distanceKm: number;
  responseRoute: [number, number][];
  affectedPerson: string;
  etaMinutes: number;
  lastUpdated: string;
}

export type InventoryCategory = 'Medical' | 'Fuel' | 'Provisions' | 'Equipment' | 'Scientific' | 'Food';
export type InventoryStatus = 'Available' | 'Incoming' | 'Used' | 'Low Stock' | 'Critical' | 'Normal';

export interface StockMovement {
  id: string;
  timestamp: string;
  type: 'Inbound' | 'Outbound' | 'Adjustment' | 'Delivered Cargo' | 'Stock Intake' | 'Consumption';
  quantityChange: number;
  resultingQuantity: number;
  location: string;
  performedBy: string;
  notes: string;
  relatedCargoCode?: string;
  relatedCargoId?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: InventoryCategory;
  quantity: number;
  maxCapacity: number;
  unit: string;
  storageLocation: string;
  minThreshold: number;
  criticalThreshold: number;
  status: InventoryStatus;
  lastUpdated: string;
  incomingQuantity: number;
  usedQuantity: number;
  relatedCargoId?: string;
  relatedCargoCode?: string;
  relatedCargoTitle?: string;
  description?: string;
  lotNumber?: string;
  expiryDate?: string;
  temperatureControlled?: boolean;
  history: StockMovement[];
}

export interface SystemAlert {
  id: string;
  type: 'fuel' | 'cargo' | 'weather' | 'emergency';
  title: string;
  detail: string;
  time: string;
  active: boolean;
}

export interface WeatherData {
  tempC: number;
  condition: string;
  windSpeedKmH: number;
  visibilityKm: number;
  location: string;
}
