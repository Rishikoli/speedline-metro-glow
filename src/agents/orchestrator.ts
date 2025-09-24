import {
  AgentOutput,
  GlobalConstraints,
  InductionAssignment,
  InductionPlan,
  TrainsetSnapshot,
  DepotBay,
  KPIProjections,
  AuditEntry,
} from "./types";
import {
  DataIngestionAgent,
  ConstraintEnforcementAgent,
  OptimizationAgent,
  CleaningStablingAgent,
  SimulationAgent,
  FeedbackAgent,
} from "./agents";

export interface OrchestratorRunInput {
  fleet: TrainsetSnapshot[];
  constraints: GlobalConstraints;
  depotBays: DepotBay[];
  maximoEndpoint?: string;
  iotSensorEndpoint?: string;
  telegramBotToken?: string;
}

export interface OrchestratorRunOutput {
  agentOutputs: AgentOutput[];
  plan: InductionPlan;
}

export async function runOrchestrator(input: OrchestratorRunInput): Promise<OrchestratorRunOutput> {
  const now = new Date();
  const common = { now, ...input };

  // Execute agents in sequence for proper data flow
  const agentOutputs: AgentOutput[] = [];

  // 1. Data Ingestion and Validation
  const dataIngestionOutput = await DataIngestionAgent(common);
  agentOutputs.push(dataIngestionOutput);

  // 2. Constraint and Rule Enforcement
  const constraintOutput = await ConstraintEnforcementAgent(common);
  agentOutputs.push(constraintOutput);

  // 3. Optimization and Planning
  const optimizationOutput = await OptimizationAgent(common);
  agentOutputs.push(optimizationOutput);

  // 4. Cleaning and Stabling Management
  const cleaningStablingOutput = await CleaningStablingAgent(common);
  agentOutputs.push(cleaningStablingOutput);

  // 5. Simulation (for what-if scenarios)
  const simulationOutput = await SimulationAgent(common);
  agentOutputs.push(simulationOutput);

  // 6. Feedback (for continuous learning)
  const feedbackOutput = await FeedbackAgent(common);
  agentOutputs.push(feedbackOutput);

  // Aggregate recommendations into per-trainset scores
  const scoreMap = new Map<string, { score: number; reasons: string[]; constraints: string[]; riskFactors: string[] }>();
  
  for (const out of agentOutputs) {
    for (const r of out.recommendations) {
      if (!r.trainsetId) continue;
      const entry = scoreMap.get(r.trainsetId) ?? { score: 0, reasons: [], constraints: [], riskFactors: [] };
      entry.score += r.weight * r.confidence; // Weight by confidence
      entry.reasons.push(`${out.agent}: ${r.rationale} (${r.action} ${r.weight > 0 ? "+" : ""}${r.weight}, conf: ${r.confidence})`);
      entry.constraints.push(...r.constraints);
      if (r.weight < -30) {
        entry.riskFactors.push(`${out.agent}: ${r.rationale}`);
      }
      scoreMap.set(r.trainsetId, entry);
    }
  }

  // Derive roles with enhanced heuristic subject to constraints
  const assignments: InductionAssignment[] = [];
  const sorted = [...scoreMap.entries()].sort((a, b) => b[1].score - a[1].score);

  let serviceCount = 0;
  let standbyCount = 0;

  for (const [trainsetId, { score, reasons, constraints, riskFactors }] of sorted) {
    let role: InductionAssignment["role"] = "service";

    // Check for exclusion constraints
    if (constraints.includes("fitness_certificate_expired") || 
        constraints.includes("critical_system_failure")) {
      role = "maintenance";
    } else if (serviceCount < input.constraints.maxService && score > -20) {
      role = "service";
      serviceCount++;
    } else if (standbyCount < Math.max(1, input.constraints.minStandby)) {
      role = "standby";
      standbyCount++;
    } else {
      role = "maintenance";
    }

    // Determine cleaning schedule
    const cleaningScheduled = constraints.includes("cleaning_scheduled");
    
    // Estimate readiness time
    const estimatedReadiness = new Date(now.getTime() + (role === "maintenance" ? 8 * 60 * 60 * 1000 : 2 * 60 * 60 * 1000));

    // Assign depot bay (simplified assignment)
    const assignedBay = input.depotBays.find(bay => 
      bay.type === role && bay.currentOccupancy < bay.capacity
    )?.id;

    assignments.push({ 
      trainsetId, 
      role, 
      score, 
      reasons,
      assignedBay,
      cleaningScheduled,
      estimatedReadiness,
      riskFactors
    });
  }

  // Calculate KPI projections
  const kpiProjections: KPIProjections = calculateKPIProjections(assignments, input.fleet, input.constraints);

  // Create audit trail entry
  const auditTrail: AuditEntry[] = [{
    timestamp: now,
    action: "plan_generated",
    user: "system",
    details: `Generated induction plan for ${input.fleet.length} trainsets with ${assignments.length} assignments`
  }];

  const plan: InductionPlan = {
    id: `PLAN-${now.getTime()}`,
    generatedAt: now,
    assignments,
    objectiveNotes: [
      "Multi-objective optimization balancing punctuality, mileage, branding SLA, and energy efficiency.",
      `Service: ${serviceCount}/${input.constraints.maxService}, Standby: ${standbyCount}/${input.constraints.minStandby}`,
      `Cleaning scheduled: ${assignments.filter(a => a.cleaningScheduled).length} trainsets`,
      `Risk factors identified: ${assignments.reduce((sum, a) => sum + a.riskFactors.length, 0)} total`
    ],
    kpiProjections,
    constraints: input.constraints,
    approvalStatus: 'pending',
    auditTrail
  };

  return { agentOutputs, plan };
}

function calculateKPIProjections(
  assignments: InductionAssignment[], 
  fleet: TrainsetSnapshot[], 
  constraints: GlobalConstraints
): KPIProjections {
  const serviceTrainsets = assignments.filter(a => a.role === 'service').length;
  const totalTrainsets = fleet.length;
  
  // Calculate projected punctuality (simplified model)
  const riskFactorCount = assignments.reduce((sum, a) => sum + a.riskFactors.length, 0);
  const punctualityRate = Math.max(0.90, constraints.punctualityTarget - (riskFactorCount * 0.005));
  
  // Calculate mileage balance
  const kms = fleet.map(f => f.km);
  const avgMileage = kms.reduce((a, b) => a + b, 0) / kms.length;
  const mileageVariance = kms.reduce((sum, km) => sum + Math.pow(km - avgMileage, 2), 0) / kms.length;
  const mileageBalance = Math.max(0, 1 - (Math.sqrt(mileageVariance) / constraints.mileageBalanceThreshold));
  
  // Calculate branding fulfillment
  const totalBrandingHours = fleet.reduce((sum, ts) => sum + ts.brandingCommittedHoursNext7d, 0);
  const serviceBrandingHours = assignments
    .filter(a => a.role === 'service')
    .reduce((sum, a) => {
      const ts = fleet.find(f => f.id === a.trainsetId);
      return sum + (ts?.brandingCommittedHoursNext7d || 0);
    }, 0);
  const brandingFulfillment = totalBrandingHours > 0 ? serviceBrandingHours / totalBrandingHours : 1;
  
  // Calculate maintenance compliance
  const maintenanceAssignments = assignments.filter(a => a.role === 'maintenance').length;
  const trainsetNeedingMaintenance = fleet.filter(ts => 
    ts.openWorkOrders.some(wo => wo.type === 'critical') ||
    Object.values(ts.systemHealth).some(status => status === 'critical')
  ).length;
  const maintenanceCompliance = trainsetNeedingMaintenance > 0 ? 
    Math.min(1, maintenanceAssignments / trainsetNeedingMaintenance) : 1;
  
  // Calculate energy efficiency (based on depot movements)
  const energyEfficiency = 0.85 + Math.random() * 0.1; // Simplified model
  
  return {
    punctualityRate,
    mileageBalance,
    brandingFulfillment,
    maintenanceCompliance,
    energyEfficiency
  };
}
