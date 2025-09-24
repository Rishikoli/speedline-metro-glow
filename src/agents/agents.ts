import {
  AgentFn,
  AgentOutput,
  AgentRecommendation,
  AgentFinding,
  GlobalConstraints,
} from "./types";

// Utility helpers
const addFinding = (list: AgentFinding[], finding: AgentFinding) => list.push(finding);
const rec = (r: Partial<AgentRecommendation>): AgentRecommendation => ({
  action: "include",
  weight: 0,
  rationale: "",
  ...r,
});

export const DataGatheringAgent: AgentFn = async ({ fleet, constraints }) => {
  const findings: AgentFinding[] = [];
  if (fleet.length === 0) {
    addFinding(findings, { title: "Fleet Empty", message: "No trainsets available in snapshot.", severity: "critical" });
  } else {
    addFinding(findings, { title: "Fleet Loaded", message: `${fleet.length} trainsets available.`, severity: "info" });
  }

  return {
    agent: "data-gathering",
    findings,
    recommendations: [],
    constraints,
  } satisfies AgentOutput;
};

export const FitnessCertificationAgent: AgentFn = async ({ fleet, constraints }) => {
  const now = Date.now();
  const findings: AgentFinding[] = [];
  const recommendations: AgentRecommendation[] = [];

  for (const ts of fleet) {
    const expiresIn = ts.fitnessValidUntil.getTime() - now;
    if (expiresIn < 0) {
      recommendations.push(
        rec({ trainsetId: ts.id, action: "exclude", weight: -100, rationale: "Fitness certificate expired" })
      );
      addFinding(findings, {
        title: `Expired fitness: ${ts.id}`,
        message: `Trainset ${ts.id} has expired fitness certificate`,
        severity: "critical",
      });
    } else if (expiresIn < 3 * 24 * 3600 * 1000) {
      recommendations.push(
        rec({ trainsetId: ts.id, action: "standby", weight: -20, rationale: "Fitness expiring soon (<3d)" })
      );
      addFinding(findings, {
        title: `Expiring fitness: ${ts.id}`,
        message: `Trainset ${ts.id} fitness expiring in < 3 days`,
        severity: "warn",
      });
    }
  }

  return { agent: "fitness-cert", findings, recommendations, constraints } satisfies AgentOutput;
};

export const MaintenanceAgent: AgentFn = async ({ fleet, constraints }) => {
  const findings: AgentFinding[] = [];
  const recommendations: AgentRecommendation[] = [];

  for (const ts of fleet) {
    if (ts.openWorkOrders > 0) {
      recommendations.push(
        rec({ trainsetId: ts.id, action: "maintenance", weight: -30 * ts.openWorkOrders, rationale: `${ts.openWorkOrders} open work order(s)` })
      );
    } else {
      recommendations.push(
        rec({ trainsetId: ts.id, action: "service", weight: 10, rationale: "No open work orders" })
      );
    }
  }

  return { agent: "maintenance", findings, recommendations, constraints } satisfies AgentOutput;
};

export const BrandingAgent: AgentFn = async ({ fleet, constraints }) => {
  const findings: AgentFinding[] = [];
  const recommendations: AgentRecommendation[] = [];

  for (const ts of fleet) {
    if (ts.brandingCommittedHoursNext7d > 12) {
      recommendations.push(
        rec({ trainsetId: ts.id, action: "service", weight: 20, rationale: "High branding commitments to meet SLA" })
      );
    }
  }

  return { agent: "branding", findings, recommendations, constraints } satisfies AgentOutput;
};

export const MileageAgent: AgentFn = async ({ fleet, constraints }) => {
  const findings: AgentFinding[] = [];
  const recommendations: AgentRecommendation[] = [];
  // Target mid-range mileage
  const kms = fleet.map(f => f.km);
  const avg = kms.reduce((a, b) => a + b, 0) / Math.max(1, kms.length);

  for (const ts of fleet) {
    const delta = ts.km - avg;
    if (delta > 30_000) {
      recommendations.push(
        rec({ trainsetId: ts.id, action: "standby", weight: -10, rationale: "High mileage; rebalance down" })
      );
    } else if (delta < -30_000) {
      recommendations.push(
        rec({ trainsetId: ts.id, action: "service", weight: 10, rationale: "Low mileage; allocate more" })
      );
    }
  }

  return { agent: "mileage", findings, recommendations, constraints } satisfies AgentOutput;
};

export const CleaningAgent: AgentFn = async ({ fleet, constraints }) => {
  const findings: AgentFinding[] = [];
  const recommendations: AgentRecommendation[] = [];

  const needingCleaning = fleet.filter(f => f.cleaningRequired);
  if (needingCleaning.length > constraints.cleaningBayCapacity) {
    addFinding(findings, {
      title: "Cleaning capacity constraint",
      message: `${needingCleaning.length} need cleaning, capacity ${constraints.cleaningBayCapacity}`,
      severity: "warn",
    });
  }
  for (const ts of needingCleaning) {
    recommendations.push(rec({ trainsetId: ts.id, action: "cleaning", weight: -15, rationale: "Requires deep cleaning" }));
  }

  return { agent: "cleaning", findings, recommendations, constraints } satisfies AgentOutput;
};

export const StablingAgent: AgentFn = async ({ fleet, constraints }) => {
  const findings: AgentFinding[] = [];
  // For MVP, produce an informational note
  if (fleet.length) {
    findings.push({ title: "Stabling heuristic", message: "Assigned bays to minimize morning turnout (mock).", severity: "info" });
  }
  return { agent: "stabling", findings, recommendations: [], constraints } satisfies AgentOutput;
};

export const SimulationAgent: AgentFn = async ({ fleet, constraints }) => {
  return { agent: "simulation", findings: [], recommendations: [], constraints } satisfies AgentOutput;
};

export const FeedbackAgent: AgentFn = async ({ fleet, constraints }) => {
  return { agent: "feedback", findings: [], recommendations: [], constraints } satisfies AgentOutput;
};
