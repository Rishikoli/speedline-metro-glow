import { GlobalConstraints, TrainsetSnapshot, DepotBay, WorkOrderDetails, BrandingContract, SystemHealthStatus, ComponentWearStatus } from "./types";

// Generate comprehensive mock fleet of 30 trainsets (scaling to 40)
export const mockFleet: TrainsetSnapshot[] = Array.from({ length: 30 }, (_, i) => {
  const trainsetNum = 101 + i;
  const id = `TS-${trainsetNum}`;
  
  // Randomize but realistic data
  const baseKm = 50_000 + Math.random() * 150_000;
  const daysSinceFitness = Math.random() * 365;
  const fitnessValidUntil = new Date(Date.now() + (90 - daysSinceFitness) * 24 * 60 * 60 * 1000);
  
  // Generate work orders
  const workOrderCount = Math.floor(Math.random() * 4);
  const openWorkOrders: WorkOrderDetails[] = Array.from({ length: workOrderCount }, (_, j) => ({
    id: `WO-${trainsetNum}-${j + 1}`,
    type: Math.random() < 0.2 ? 'critical' : Math.random() < 0.5 ? 'preventive' : 'corrective',
    system: ['rolling_stock', 'signaling', 'telecom', 'hvac', 'brakes', 'bogies'][Math.floor(Math.random() * 6)] as any,
    priority: Math.floor(Math.random() * 10) + 1,
    estimatedHours: Math.floor(Math.random() * 12) + 2,
    dueDate: new Date(Date.now() + Math.random() * 14 * 24 * 60 * 60 * 1000),
    description: `Maintenance required for ${id}`
  }));

  // Generate branding contracts
  const contractCount = Math.floor(Math.random() * 3);
  const brandingContracts: BrandingContract[] = Array.from({ length: contractCount }, (_, j) => ({
    id: `BC-${trainsetNum}-${j + 1}`,
    advertiser: ['Metro Bank', 'Kerala Tourism', 'Technopark', 'Lulu Mall', 'Cochin Shipyard'][Math.floor(Math.random() * 5)],
    committedHours: Math.floor(Math.random() * 40) + 10,
    remainingHours: Math.floor(Math.random() * 30) + 5,
    penaltyRate: 1000 + Math.random() * 4000,
    expiryDate: new Date(Date.now() + Math.random() * 180 * 24 * 60 * 60 * 1000)
  }));

  const systemHealth: SystemHealthStatus = {
    rolling_stock: Math.random() < 0.1 ? 'critical' : Math.random() < 0.2 ? 'warn' : 'ok',
    signaling: Math.random() < 0.05 ? 'critical' : Math.random() < 0.15 ? 'warn' : 'ok',
    telecom: Math.random() < 0.05 ? 'critical' : Math.random() < 0.1 ? 'warn' : 'ok',
    lastUpdated: new Date(Date.now() - Math.random() * 60 * 60 * 1000)
  };

  const componentWear: ComponentWearStatus = {
    brakePads: Math.random() * 100,
    hvacSystem: Math.random() * 100,
    bogies: Math.random() * 100,
    doors: Math.random() * 100,
    lastInspection: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
  };

  return {
    id,
    km: Math.round(baseKm),
    fitnessValidUntil,
    openWorkOrders,
    brandingCommittedHoursNext7d: brandingContracts.reduce((sum, contract) => 
      sum + Math.min(contract.remainingHours, 24), 0),
    brandingContracts,
    cleaningRequired: Math.random() < 0.3,
    lastCleaningDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
    currentLocation: Math.random() < 0.8 ? `BAY-${Math.floor(Math.random() * 20) + 1}` : null,
    systemHealth,
    componentWear
  };
});

// Mock depot bays
export const mockDepotBays: DepotBay[] = Array.from({ length: 25 }, (_, i) => {
  const bayNum = i + 1;
  const types = ['service', 'maintenance', 'cleaning', 'storage'] as const;
  const type = types[Math.floor(Math.random() * types.length)];
  
  return {
    id: `BAY-${bayNum}`,
    type,
    capacity: type === 'storage' ? 2 : 1,
    currentOccupancy: Math.random() < 0.7 ? 1 : 0,
    cleaningCapable: type === 'cleaning' || (type === 'service' && Math.random() < 0.5),
    maintenanceCapable: type === 'maintenance' || (type === 'service' && Math.random() < 0.3),
    geometry: {
      trackNumber: Math.floor(i / 5) + 1,
      position: (i % 5) + 1,
      accessDifficulty: Math.floor(Math.random() * 10) + 1
    }
  };
});

export const defaultConstraints: GlobalConstraints = {
  minStandby: 3,
  maxService: 18,
  cleaningBayCapacity: 4,
  cleaningCrewCapacity: 6,
  maxShuntingMoves: 15,
  punctualityTarget: 0.995, // 99.5%
  mileageBalanceThreshold: 25_000 // 25k km difference threshold
};
