import { 
  Personnel, 
  Expedition, 
  Vehicle, 
  CargoItem, 
  InventoryItem, 
  Emergency, 
  Camp 
} from '../types';

export interface AssistantDataSources {
  personnel: Personnel[];
  expeditions: Expedition[];
  vehicles: Vehicle[];
  cargo: CargoItem[];
  inventory: InventoryItem[];
  emergencies: Emergency[];
  camps?: Camp[];
}

const UNSUPPORTED_RESPONSE = "I can help with expedition, personnel, vehicle, cargo, inventory and emergency information.";

function findPerson(q: string, personnel: Personnel[]): Personnel | undefined {
  const norm = q.toLowerCase();

  // 1. Direct code or ID match
  const byCode = personnel.find(p => 
    p.code.toLowerCase() === norm || 
    p.id.toLowerCase() === norm ||
    (p.callsign && p.callsign.toLowerCase() === norm)
  );
  if (byCode) return byCode;

  // 2. Word boundary match on code or callsign
  for (const p of personnel) {
    if (new RegExp(`\\b${p.code}\\b`, 'i').test(norm)) return p;
    if (p.callsign && new RegExp(`\\b${p.callsign}\\b`, 'i').test(norm)) return p;
  }

  // 3. Full name match
  for (const p of personnel) {
    if (norm.includes(p.name.toLowerCase())) return p;
  }

  // 4. Word boundary match on first or last name
  for (const p of personnel) {
    const rawName = p.name.replace(/^(dr\.|commander|capt\.|prof\.)\s+/i, '');
    const parts = rawName.split(' ');
    for (const part of parts) {
      if (part.length >= 3 && new RegExp(`\\b${part}\\b`, 'i').test(norm)) {
        return p;
      }
    }
  }

  return undefined;
}

export function generateAssistantResponse(query: string, data: AssistantDataSources): string {
  const trimmed = query.trim();
  if (!trimmed) {
    return UNSUPPORTED_RESPONSE;
  }

  const cleanQ = trimmed.toLowerCase().replace(/[?!.,]/g, ' ').replace(/\s+/g, ' ').trim();
  if (!cleanQ) {
    return UNSUPPORTED_RESPONSE;
  }

  // Greetings
  if (cleanQ === 'hello' || cleanQ === 'hi' || cleanQ === 'hey' || cleanQ === 'help') {
    return "Hello. I can help with expedition, personnel, vehicle, cargo, inventory and emergency information.";
  }

  // 1. EMERGENCIES (Active, SOS, Alert, Incident)
  if (
    cleanQ.includes('emergency') || 
    cleanQ.includes('emergencies') || 
    cleanQ.includes('sos') || 
    cleanQ.includes('incident') ||
    cleanQ.includes('distress')
  ) {
    const activeEmergencies = (data.emergencies || []).filter(e => e.status !== 'Resolved');

    if (activeEmergencies.length === 0) {
      return "No active emergencies are currently reported.";
    }

    if (cleanQ.includes('any') || cleanQ.includes('are there') || cleanQ.includes('is there')) {
      if (activeEmergencies.length === 1) {
        return "Yes. 1 active emergency is currently reported.";
      }
      return `Yes. ${activeEmergencies.length} active emergencies are currently reported.`;
    }

    if (activeEmergencies.length === 1) {
      const em = activeEmergencies[0];
      return `1 active emergency reported:\n• ${em.type} at ${em.locationName} (${em.severity}).`;
    }

    return `${activeEmergencies.length} active emergencies reported:\n` +
      activeEmergencies.map(e => `• ${e.type} at ${e.locationName} (${e.severity})`).join('\n');
  }

  // 2. SPECIFIC VEHICLE LOOKUP
  const matchedVehicle = (data.vehicles || []).find(v => {
    const vName = v.name.toLowerCase();
    const vCode = v.code.toLowerCase();
    return cleanQ.includes(vName) || cleanQ.includes(vCode);
  });

  if (matchedVehicle && (
    cleanQ.includes('where') || 
    cleanQ.includes('status') || 
    cleanQ.includes('fuel') || 
    cleanQ.includes('vehicle') ||
    cleanQ.includes('speed')
  )) {
    return `${matchedVehicle.name} (${matchedVehicle.code}) is currently ${matchedVehicle.status.toLowerCase()} with ${matchedVehicle.fuelPercentage}% fuel.`;
  }

  // 3. ACTIVE / IN-TRANSIT VEHICLES
  if (
    cleanQ.includes('vehicle') || 
    cleanQ.includes('vehicles') || 
    cleanQ.includes('snowcat') || 
    cleanQ.includes('rover') || 
    cleanQ.includes('fleet')
  ) {
    const activeVehicles = (data.vehicles || []).filter(v => 
      v.status === 'In Transit' || v.status === 'Emergency Response'
    );

    if (cleanQ.includes('how many')) {
      return `${activeVehicles.length} vehicle${activeVehicles.length === 1 ? ' is' : 's are'} currently active.`;
    }

    if (activeVehicles.length === 0) {
      return "No vehicles are currently active.";
    }

    if (activeVehicles.length === 1) {
      return `1 vehicle is active:\n• ${activeVehicles[0].name}`;
    }

    return `${activeVehicles.length} vehicles are active:\n` + 
      activeVehicles.map(v => `• ${v.name}`).join('\n');
  }

  // 4. SPECIFIC PERSON LOOKUP
  const matchedPerson = findPerson(cleanQ, data.personnel || []);
  if (matchedPerson && (
    cleanQ.includes('where') || 
    cleanQ.includes('status') || 
    cleanQ.includes('who') || 
    cleanQ.includes('locate') || 
    cleanQ.includes('find') || 
    cleanQ.includes('is ') ||
    cleanQ.startsWith('is')
  )) {
    return `${matchedPerson.name} is currently at ${matchedPerson.location}.`;
  }

  // 5. WHERE IS [NAME] - UNMATCHED PERSON CHECK
  const whereMatch = cleanQ.match(/^where\s+is\s+([a-z0-9\s.]+)/i);
  if (whereMatch) {
    const target = whereMatch[1].trim();
    // Check if target is a camp
    const matchedCamp = (data.camps || []).find(c => cleanQ.includes(c.name.toLowerCase()));
    if (matchedCamp) {
      return `${matchedCamp.name} (${matchedCamp.code}) currently hosts ${matchedCamp.personnelCount} personnel.`;
    }
    // Check if target is a cargo item
    const matchedCargo = (data.cargo || []).find(c => cleanQ.includes(c.title.toLowerCase()) || cleanQ.includes(c.code.toLowerCase()));
    if (matchedCargo) {
      if (matchedCargo.status === 'Delivered') {
        return `${matchedCargo.title} (${matchedCargo.code}) is delivered at ${matchedCargo.destination}.`;
      }
      return `${matchedCargo.title} (${matchedCargo.code}) is currently ${matchedCargo.status.toLowerCase()} en route to ${matchedCargo.destination}.`;
    }
    // Capitalize target name for clean sentence
    const formattedName = target.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    return `No personnel named ${formattedName} was found in current records.`;
  }

  // 6. PERSONNEL ACTIVE / DEPLOYED / COUNT / STATUS
  if (
    cleanQ.includes('personnel') || 
    cleanQ.includes('people') || 
    cleanQ.includes('crew') || 
    cleanQ.includes('staff') ||
    cleanQ.includes('team member')
  ) {
    const active = (data.personnel || []).filter(p => ['Active', 'Moving', 'In Transit'].includes(p.status));

    if (cleanQ.includes('which') || cleanQ.includes('who')) {
      if (active.length === 0) return "No personnel are currently active.";
      return `${active.length} personnel are active:\n` + active.map(p => `• ${p.name}`).join('\n');
    }

    return `${active.length} personnel are currently active.`;
  }

  // 7. SPECIFIC EXPEDITION LOOKUP
  const matchedExpedition = (data.expeditions || []).find(e => {
    const code = e.code.toLowerCase();
    const title = e.title.toLowerCase();
    return cleanQ.includes(code) || cleanQ.includes(title);
  });

  if (matchedExpedition) {
    return `Expedition ${matchedExpedition.title} (${matchedExpedition.code}) is currently ${matchedExpedition.status.toLowerCase()} at ${matchedExpedition.progress}% progress.`;
  }

  // 8. GENERAL EXPEDITIONS STATUS
  if (cleanQ.includes('expedition') || cleanQ.includes('expeditions') || cleanQ.includes('mission')) {
    const activeExpeditions = (data.expeditions || []).filter(e => e.status === 'Active');

    if (activeExpeditions.length === 0) {
      return "No expeditions are currently active.";
    }

    if (activeExpeditions.length === 1) {
      return `Expedition ${activeExpeditions[0].title} is currently active.`;
    }

    return `${activeExpeditions.length} expeditions are currently active:\n` +
      activeExpeditions.map(e => `• ${e.title} (${e.status})`).join('\n');
  }

  // 9. SPECIFIC CARGO LOOKUP
  const matchedCargo = (data.cargo || []).find(c => {
    const code = c.code.toLowerCase();
    const title = c.title.toLowerCase();
    return cleanQ.includes(code) || cleanQ.includes(title);
  });

  if (matchedCargo) {
    if (matchedCargo.status === 'Delivered') {
      return `${matchedCargo.title} (${matchedCargo.code}) is delivered at ${matchedCargo.destination}.`;
    }
    return `${matchedCargo.title} (${matchedCargo.code}) is currently ${matchedCargo.status.toLowerCase()} en route to ${matchedCargo.destination}.`;
  }

  // 10. GENERAL CARGO STATUS
  if (
    cleanQ.includes('cargo') || 
    cleanQ.includes('shipment') || 
    cleanQ.includes('freight')
  ) {
    const inTransit = (data.cargo || []).filter(c => c.status === 'In Transit');

    if (cleanQ.includes('how many')) {
      return `${inTransit.length} cargo shipment${inTransit.length === 1 ? ' is' : 's are'} currently in transit.`;
    }

    if (inTransit.length === 0) {
      return "No cargo shipments are currently in transit.";
    }

    if (inTransit.length === 1) {
      return `1 cargo shipment is in transit:\n• ${inTransit[0].title} → ${inTransit[0].destination}`;
    }

    return `${inTransit.length} cargo shipments are in transit:\n` +
      inTransit.map(c => `• ${c.title} → ${c.destination}`).join('\n');
  }

  // 11. INVENTORY LOW / CRITICAL / STOCK
  if (
    cleanQ.includes('inventory') || 
    cleanQ.includes('stock') || 
    cleanQ.includes('supplies') || 
    cleanQ.includes('low') || 
    cleanQ.includes('critical')
  ) {
    const lowOrCritical = (data.inventory || []).filter(item => 
      item.status === 'Critical' || 
      item.status === 'Low Stock' || 
      item.quantity <= item.minThreshold
    );

    // Specific inventory item search
    const matchedItem = (data.inventory || []).find(i => cleanQ.includes(i.name.toLowerCase()));
    if (matchedItem) {
      return `${matchedItem.name}: ${matchedItem.quantity} ${matchedItem.unit} remaining (${matchedItem.status}).`;
    }

    if (cleanQ.includes('low') || cleanQ.includes('critical') || cleanQ.includes('shortage')) {
      if (lowOrCritical.length === 0) {
        return "No inventory items are currently low or critical.";
      }
      return `${lowOrCritical.length} inventory items are low or critical:\n` +
        lowOrCritical.map(i => `• ${i.name}: ${i.quantity} ${i.unit} (${i.status})`).join('\n');
    }

    if (lowOrCritical.length === 0) {
      return `All ${(data.inventory || []).length} inventory items are at nominal stock levels.`;
    }

    return `${lowOrCritical.length} of ${(data.inventory || []).length} inventory items are currently low or critical.`;
  }

  // 12. UNSUPPORTED QUESTIONS (EXACT MATCH REQUIRED)
  return UNSUPPORTED_RESPONSE;
}
