import {
  AgentOutput,
  GlobalConstraints,
  InductionAssignment,
  InductionPlan,
  TrainsetSnapshot,
} from "./types";
import {
  BrandingAgent,
  CleaningAgent,
  DataGatheringAgent,
  FeedbackAgent,
  FitnessCertificationAgent,
  MaintenanceAgent,
  MileageAgent,
  SimulationAgent,
  StablingAgent,
} from "./agents";

export interface OrchestratorRunInput {
  fleet: TrainsetSnapshot[];
  constraints: GlobalConstraints;
}

export interface OrchestratorRunOutput {
  agentOutputs: AgentOutput[];
  plan: InductionPlan;
}

export async function runOrchestrator(input: OrchestratorRunInput): Promise<OrchestratorRunOutput> {
  const now = new Date();
  const common = { now, ...input };

  // Execute agents in parallel (mock synchronous for now)
  const agentPromises = [
    DataGatheringAgent(common),
    FitnessCertificationAgent(common),
    MaintenanceAgent(common),
    BrandingAgent(common),
    MileageAgent(common),
    CleaningAgent(common),
    StablingAgent(common),
    SimulationAgent(common),
    FeedbackAgent(common),
  ];

  const agentOutputs = await Promise.all(agentPromises);

  // Aggregate recommendations into per-trainset scores
  const scoreMap = new Map<string, { score: number; reasons: string[] }>();
  for (const out of agentOutputs) {
    for (const r of out.recommendations) {
      if (!r.trainsetId) continue;
      const entry = scoreMap.get(r.trainsetId) ?? { score: 0, reasons: [] };
      entry.score += r.weight;
      entry.reasons.push(`${out.agent}: ${r.rationale} (${r.action} ${r.weight > 0 ? "+" : ""}${r.weight})`);
      scoreMap.set(r.trainsetId, entry);
    }
  }

  // Derive roles with simple heuristic subject to constraints
  const assignments: InductionAssignment[] = [];
  const sorted = [...scoreMap.entries()].sort((a, b) => b[1].score - a[1].score);

  let serviceCount = 0;
  let standbyCount = 0;

  for (const [trainsetId, { score, reasons }] of sorted) {
    let role: InductionAssignment["role"] = "service";

    if (serviceCount < input.constraints.maxService) {
      role = "service";
      serviceCount++;
    } else if (standbyCount < Math.max(1, input.constraints.minStandby)) {
      role = "standby";
      standbyCount++;
    } else {
      role = "maintenance";
    }

    assignments.push({ trainsetId, role, score, reasons });
  }

  const plan: InductionPlan = {
    generatedAt: now,
    assignments,
    objectiveNotes: [
      "Balanced readiness, cleanliness, branding SLA, and mileage using weighted heuristic.",
      `Targets: maxService=${input.constraints.maxService}, minStandby=${input.constraints.minStandby}, cleaningBayCapacity=${input.constraints.cleaningBayCapacity}`,
    ],
  };

  return { agentOutputs, plan };
}
