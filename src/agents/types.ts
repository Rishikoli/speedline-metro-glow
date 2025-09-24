// Core types for Speedline multi-agent induction planning

export type TrainsetId = string;

export interface BaseAgentInput {
  now: Date;
}

export interface DataGatheringInput extends BaseAgentInput {}
export interface FitnessCertInput extends BaseAgentInput {}
export interface MaintenanceInput extends BaseAgentInput {}
export interface BrandingInput extends BaseAgentInput {}
export interface MileageInput extends BaseAgentInput {}
export interface CleaningInput extends BaseAgentInput {}
export interface StablingInput extends BaseAgentInput {}
export interface SimulationInput extends BaseAgentInput {
  overrides?: Partial<GlobalConstraints>;
}
export interface FeedbackInput extends BaseAgentInput {
  lastPlans?: InductionPlan[];
}

export interface TrainsetSnapshot {
  id: TrainsetId;
  km: number;
  fitnessValidUntil: Date;
  openWorkOrders: number;
  brandingCommittedHoursNext7d: number;
  cleaningRequired: boolean;
}

export interface GlobalConstraints {
  minStandby: number;
  maxService: number;
  cleaningBayCapacity: number;
}

export type AgentName =
  | "data-gathering"
  | "fitness-cert"
  | "maintenance"
  | "branding"
  | "mileage"
  | "cleaning"
  | "stabling"
  | "optimization"
  | "simulation"
  | "feedback"
  | "ui";

export interface AgentFinding {
  title: string;
  message: string;
  severity: "info" | "warn" | "critical";
}

export interface AgentRecommendation {
  trainsetId?: TrainsetId;
  action: "include" | "exclude" | "service" | "standby" | "maintenance" | "cleaning" | "brand";
  weight: number; // +ve encourages, -ve discourages
  rationale: string;
}

export interface AgentOutput {
  agent: AgentName;
  findings: AgentFinding[];
  recommendations: AgentRecommendation[];
  constraints?: Partial<GlobalConstraints>;
}

export type HealthStatus = "ok" | "warn" | "critical";

export interface AgentHealth {
  agent: AgentName;
  status: HealthStatus;
  findingCounts: { info: number; warn: number; critical: number };
  lastRun: Date;
  summary: string;
}

export type AgentFn<I = BaseAgentInput> = (
  input: I & {
    fleet: TrainsetSnapshot[];
    constraints: GlobalConstraints;
  }
) => Promise<AgentOutput>;

export interface InductionAssignment {
  trainsetId: TrainsetId;
  role: "service" | "standby" | "maintenance";
  score: number;
  reasons: string[];
}

export interface InductionPlan {
  generatedAt: Date;
  assignments: InductionAssignment[];
  objectiveNotes: string[];
}
