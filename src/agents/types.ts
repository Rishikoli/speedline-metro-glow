// Core types for Speedline multi-agent induction planning

export type TrainsetId = string;
export type DepotBayId = string;
export type WorkOrderId = string;
export type BrandingContractId = string;

export interface BaseAgentInput {
  now: Date;
}

export interface DataGatheringInput extends BaseAgentInput {
  maximoEndpoint?: string;
  iotSensorEndpoint?: string;
  telegramBotToken?: string;
}
export interface FitnessCertInput extends BaseAgentInput {}
export interface MaintenanceInput extends BaseAgentInput {}
export interface BrandingInput extends BaseAgentInput {}
export interface MileageInput extends BaseAgentInput {}
export interface CleaningInput extends BaseAgentInput {}
export interface StablingInput extends BaseAgentInput {}
export interface SimulationInput extends BaseAgentInput {
  overrides?: Partial<GlobalConstraints>;
  scenarios?: WhatIfScenario[];
}
export interface FeedbackInput extends BaseAgentInput {
  lastPlans?: InductionPlan[];
  supervisorOverrides?: SupervisorOverride[];
}

// Enhanced trainset data model
export interface TrainsetSnapshot {
  id: TrainsetId;
  km: number;
  fitnessValidUntil: Date;
  openWorkOrders: WorkOrderDetails[];
  brandingCommittedHoursNext7d: number;
  brandingContracts: BrandingContract[];
  cleaningRequired: boolean;
  lastCleaningDate: Date;
  currentLocation: DepotBayId | null;
  systemHealth: SystemHealthStatus;
  componentWear: ComponentWearStatus;
}

export interface WorkOrderDetails {
  id: WorkOrderId;
  type: 'critical' | 'preventive' | 'corrective';
  system: 'rolling_stock' | 'signaling' | 'telecom' | 'hvac' | 'brakes' | 'bogies';
  priority: number;
  estimatedHours: number;
  dueDate: Date;
  description: string;
}

export interface BrandingContract {
  id: BrandingContractId;
  advertiser: string;
  committedHours: number;
  remainingHours: number;
  penaltyRate: number;
  expiryDate: Date;
}

export interface SystemHealthStatus {
  rolling_stock: 'ok' | 'warn' | 'critical';
  signaling: 'ok' | 'warn' | 'critical';
  telecom: 'ok' | 'warn' | 'critical';
  lastUpdated: Date;
}

export interface ComponentWearStatus {
  brakePads: number; // percentage wear
  hvacSystem: number;
  bogies: number;
  doors: number;
  lastInspection: Date;
}

export interface DepotBay {
  id: DepotBayId;
  type: 'service' | 'maintenance' | 'cleaning' | 'storage';
  capacity: number;
  currentOccupancy: number;
  cleaningCapable: boolean;
  maintenanceCapable: boolean;
  geometry: {
    trackNumber: number;
    position: number;
    accessDifficulty: number; // 1-10 scale for shunting complexity
  };
}

export interface GlobalConstraints {
  minStandby: number;
  maxService: number;
  cleaningBayCapacity: number;
  cleaningCrewCapacity: number;
  maxShuntingMoves: number;
  punctualityTarget: number; // 99.5%
  mileageBalanceThreshold: number; // km difference threshold
}

export type AgentName =
  | "data-ingestion"
  | "constraint-enforcement"
  | "optimization"
  | "cleaning-stabling"
  | "simulation"
  | "feedback"
  | "ui";

export interface AgentFinding {
  title: string;
  message: string;
  severity: "info" | "warn" | "critical";
  timestamp: Date;
  source: string;
  trainsetId?: TrainsetId;
}

export interface AgentRecommendation {
  trainsetId?: TrainsetId;
  action: "include" | "exclude" | "service" | "standby" | "maintenance" | "cleaning" | "brand";
  weight: number; // +ve encourages, -ve discourages
  rationale: string;
  confidence: number; // 0-1 scale
  constraints: string[];
}

export interface AgentOutput {
  agent: AgentName;
  findings: AgentFinding[];
  recommendations: AgentRecommendation[];
  constraints?: Partial<GlobalConstraints>;
  executionTime: number;
  dataQuality: DataQualityMetrics;
}

export interface DataQualityMetrics {
  completeness: number; // 0-1 scale
  freshness: number; // minutes since last update
  consistency: number; // 0-1 scale
  accuracy: number; // 0-1 scale
}

export type HealthStatus = "ok" | "warn" | "critical";

export interface AgentHealth {
  agent: AgentName;
  status: HealthStatus;
  findingCounts: { info: number; warn: number; critical: number };
  lastRun: Date;
  summary: string;
  performance: {
    avgExecutionTime: number;
    successRate: number;
    lastError?: string;
  };
}

export type AgentFn<I = BaseAgentInput> = (
  input: I & {
    fleet: TrainsetSnapshot[];
    constraints: GlobalConstraints;
    depotBays: DepotBay[];
  }
) => Promise<AgentOutput>;

export interface InductionAssignment {
  trainsetId: TrainsetId;
  role: "service" | "standby" | "maintenance";
  score: number;
  reasons: string[];
  assignedBay?: DepotBayId;
  cleaningScheduled: boolean;
  estimatedReadiness: Date;
  riskFactors: string[];
}

export interface InductionPlan {
  id: string;
  generatedAt: Date;
  assignments: InductionAssignment[];
  objectiveNotes: string[];
  kpiProjections: KPIProjections;
  constraints: GlobalConstraints;
  approvalStatus: 'pending' | 'approved' | 'rejected' | 'modified';
  approvedBy?: string;
  approvedAt?: Date;
  auditTrail: AuditEntry[];
}

export interface KPIProjections {
  punctualityRate: number;
  mileageBalance: number;
  brandingFulfillment: number;
  maintenanceCompliance: number;
  energyEfficiency: number;
}

export interface AuditEntry {
  timestamp: Date;
  action: string;
  user: string;
  details: string;
  previousValue?: any;
  newValue?: any;
}

// What-If Simulation Types
export interface WhatIfScenario {
  id: string;
  name: string;
  description: string;
  modifications: ScenarioModification[];
}

export interface ScenarioModification {
  type: 'trainset_unavailable' | 'maintenance_delay' | 'cleaning_outage' | 'constraint_change';
  target: string;
  value: any;
  description: string;
}

export interface SimulationResult {
  scenarioId: string;
  originalPlan: InductionPlan;
  modifiedPlan: InductionPlan;
  impact: {
    kpiDeltas: Partial<KPIProjections>;
    riskAssessment: string[];
    mitigationSuggestions: string[];
  };
}

// Human-in-the-Loop Types
export interface SupervisorOverride {
  id: string;
  planId: string;
  trainsetId: TrainsetId;
  originalAssignment: InductionAssignment;
  overrideAssignment: InductionAssignment;
  reason: string;
  supervisor: string;
  timestamp: Date;
  approved: boolean;
}

// Data Source Integration Types
export interface MaximoJobCard {
  workOrderId: WorkOrderId;
  trainsetId: TrainsetId;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  priority: number;
  system: string;
  description: string;
  estimatedHours: number;
  actualHours?: number;
  dueDate: Date;
  assignedTechnician?: string;
}

export interface IoTSensorReading {
  trainsetId: TrainsetId;
  sensorType: string;
  value: number;
  unit: string;
  timestamp: Date;
  status: 'normal' | 'warning' | 'critical';
  location: string;
}

export interface TelegramUpdate {
  messageId: number;
  chatId: number;
  text: string;
  timestamp: Date;
  user: string;
  parsed?: {
    trainsetId?: TrainsetId;
    action?: string;
    priority?: number;
    details?: string;
  };
}
