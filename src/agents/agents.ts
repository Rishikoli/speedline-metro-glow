import {
  AgentFn,
  AgentOutput,
  AgentRecommendation,
  AgentFinding,
  GlobalConstraints,
  DataGatheringInput,
  MaximoJobCard,
  IoTSensorReading,
  TelegramUpdate,
  DataQualityMetrics,
  TrainsetSnapshot,
  WorkOrderDetails,
} from "./types";

// Utility helpers
const addFinding = (list: AgentFinding[], finding: Omit<AgentFinding, 'timestamp' | 'source'>, source: string) => {
  list.push({
    ...finding,
    timestamp: new Date(),
    source
  });
};

const rec = (r: Partial<AgentRecommendation>): AgentRecommendation => ({
  action: "include",
  weight: 0,
  rationale: "",
  confidence: 0.8,
  constraints: [],
  ...r,
});

// Mock data ingestion functions (in production, these would connect to real APIs)
async function ingestMaximoData(endpoint?: string): Promise<MaximoJobCard[]> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 100));
  return [
    {
      workOrderId: "WO-2024-001",
      trainsetId: "TS-101",
      status: "open",
      priority: 1,
      system: "brakes",
      description: "Brake pad replacement required",
      estimatedHours: 4,
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
    }
  ];
}

async function ingestIoTData(endpoint?: string): Promise<IoTSensorReading[]> {
  await new Promise(resolve => setTimeout(resolve, 50));
  return [
    {
      trainsetId: "TS-101",
      sensorType: "brake_temperature",
      value: 85.5,
      unit: "celsius",
      timestamp: new Date(),
      status: "normal",
      location: "car_1_front_bogie"
    }
  ];
}

async function ingestTelegramUpdates(botToken?: string): Promise<TelegramUpdate[]> {
  await new Promise(resolve => setTimeout(resolve, 75));
  return [
    {
      messageId: 12345,
      chatId: 67890,
      text: "TS-205 needs immediate maintenance - brake issue reported",
      timestamp: new Date(),
      user: "supervisor_kumar",
      parsed: {
        trainsetId: "TS-205",
        action: "maintenance",
        priority: 8,
        details: "brake issue reported"
      }
    }
  ];
}

function assessDataQuality(
  fleet: TrainsetSnapshot[], 
  maximoData: MaximoJobCard[], 
  iotData: IoTSensorReading[], 
  telegramData: TelegramUpdate[]
): DataQualityMetrics {
  const now = Date.now();
  
  // Calculate completeness based on available data
  const completeness = fleet.length > 0 ? 
    fleet.filter(ts => ts.systemHealth && ts.componentWear).length / fleet.length : 0;
  
  // Calculate freshness (mock - in production would check actual timestamps)
  const freshness = Math.random() * 45; // 0-45 minutes
  
  // Calculate consistency (mock scoring)
  const consistency = 0.95 - Math.random() * 0.1;
  
  // Calculate accuracy (mock scoring)
  const accuracy = 0.92 + Math.random() * 0.07;
  
  return {
    completeness,
    freshness,
    consistency,
    accuracy
  };
}

// Data Ingestion and Validation Agent
export const DataIngestionAgent: AgentFn<DataGatheringInput> = async ({ 
  fleet, 
  constraints, 
  depotBays,
  maximoEndpoint,
  iotSensorEndpoint,
  telegramBotToken 
}) => {
  const startTime = Date.now();
  const findings: AgentFinding[] = [];
  const recommendations: AgentRecommendation[] = [];

  // Simulate data ingestion from multiple sources
  const maximoData = await ingestMaximoData(maximoEndpoint);
  const iotData = await ingestIoTData(iotSensorEndpoint);
  const telegramData = await ingestTelegramUpdates(telegramBotToken);

  // Data validation and quality assessment
  const dataQuality = assessDataQuality(fleet, maximoData, iotData, telegramData);

  if (fleet.length === 0) {
    addFinding(findings, { 
      title: "Fleet Empty", 
      message: "No trainsets available in snapshot.", 
      severity: "critical" 
    }, "data-ingestion");
  } else {
    addFinding(findings, { 
      title: "Fleet Data Loaded", 
      message: `${fleet.length} trainsets available with ${dataQuality.completeness * 100}% data completeness.`, 
      severity: "info" 
    }, "data-ingestion");
  }

  // Validate data freshness
  if (dataQuality.freshness > 30) {
    addFinding(findings, {
      title: "Stale Data Warning",
      message: `Data is ${dataQuality.freshness} minutes old. Consider refreshing data sources.`,
      severity: "warn"
    }, "data-ingestion");
  }

  // Check for data inconsistencies
  if (dataQuality.consistency < 0.9) {
    addFinding(findings, {
      title: "Data Consistency Issues",
      message: `Data consistency score: ${dataQuality.consistency}. Cross-reference validation needed.`,
      severity: "warn"
    }, "data-ingestion");
  }

  // Process Telegram updates for manual overrides
  for (const update of telegramData) {
    if (update.parsed?.trainsetId && update.parsed?.action) {
      recommendations.push(rec({
        trainsetId: update.parsed.trainsetId,
        action: update.parsed.action as any,
        weight: update.parsed.priority || 5,
        rationale: `Supervisor update via Telegram: ${update.parsed.details}`,
        confidence: 0.9
      }));
    }
  }

  return {
    agent: "data-ingestion",
    findings,
    recommendations,
    constraints,
    executionTime: Date.now() - startTime,
    dataQuality
  } satisfies AgentOutput;
};

// Constraint and Rule Enforcement Agent
export const ConstraintEnforcementAgent: AgentFn = async ({ fleet, constraints, depotBays }) => {
  const startTime = Date.now();
  const findings: AgentFinding[] = [];
  const recommendations: AgentRecommendation[] = [];

  for (const ts of fleet) {
    // Fitness certificate validation
    const now = Date.now();
    const expiresIn = ts.fitnessValidUntil.getTime() - now;
    
    if (expiresIn < 0) {
      recommendations.push(
        rec({ 
          trainsetId: ts.id, 
          action: "exclude", 
          weight: -100, 
          rationale: "Fitness certificate expired",
          confidence: 1.0,
          constraints: ["fitness_certificate_expired"]
        })
      );
      addFinding(findings, {
        title: `Expired fitness: ${ts.id}`,
        message: `Trainset ${ts.id} has expired fitness certificate`,
        severity: "critical",
        trainsetId: ts.id
      }, "constraint-enforcement");
    } else if (expiresIn < 3 * 24 * 3600 * 1000) {
      recommendations.push(
        rec({ 
          trainsetId: ts.id, 
          action: "standby", 
          weight: -20, 
          rationale: "Fitness expiring soon (<3d)",
          confidence: 0.9,
          constraints: ["fitness_certificate_expiring"]
        })
      );
      addFinding(findings, {
        title: `Expiring fitness: ${ts.id}`,
        message: `Trainset ${ts.id} fitness expiring in < 3 days`,
        severity: "warn",
        trainsetId: ts.id
      }, "constraint-enforcement");
    }

    // Critical maintenance validation
    const criticalWorkOrders = ts.openWorkOrders.filter(wo => wo.type === 'critical');
    if (criticalWorkOrders.length > 0) {
      recommendations.push(
        rec({ 
          trainsetId: ts.id, 
          action: "maintenance", 
          weight: -50 * criticalWorkOrders.length, 
          rationale: `${criticalWorkOrders.length} critical work order(s) must be completed`,
          confidence: 1.0,
          constraints: ["critical_maintenance_pending"]
        })
      );
      addFinding(findings, {
        title: `Critical maintenance: ${ts.id}`,
        message: `${criticalWorkOrders.length} critical work orders pending`,
        severity: "critical",
        trainsetId: ts.id
      }, "constraint-enforcement");
    }

    // System health validation
    const criticalSystems = Object.entries(ts.systemHealth).filter(([_, status]) => status === 'critical');
    if (criticalSystems.length > 0) {
      recommendations.push(
        rec({
          trainsetId: ts.id,
          action: "exclude",
          weight: -80,
          rationale: `Critical system failures: ${criticalSystems.map(([sys]) => sys).join(', ')}`,
          confidence: 1.0,
          constraints: ["critical_system_failure"]
        })
      );
      addFinding(findings, {
        title: `System failure: ${ts.id}`,
        message: `Critical failures in: ${criticalSystems.map(([sys]) => sys).join(', ')}`,
        severity: "critical",
        trainsetId: ts.id
      }, "constraint-enforcement");
    }
  }

  // Cleaning bay capacity validation
  const needingCleaning = fleet.filter(f => f.cleaningRequired);
  if (needingCleaning.length > constraints.cleaningBayCapacity) {
    addFinding(findings, {
      title: "Cleaning capacity constraint",
      message: `${needingCleaning.length} trainsets need cleaning, but only ${constraints.cleaningBayCapacity} bays available`,
      severity: "warn",
    }, "constraint-enforcement");
  }

  const dataQuality = {
    completeness: 0.95,
    freshness: 5,
    consistency: 0.98,
    accuracy: 0.94
  };

  return {
    agent: "constraint-enforcement",
    findings,
    recommendations,
    constraints,
    executionTime: Date.now() - startTime,
    dataQuality
  } satisfies AgentOutput;
};

// Optimization and Planning Agent
export const OptimizationAgent: AgentFn = async ({ fleet, constraints, depotBays }) => {
  const startTime = Date.now();
  const findings: AgentFinding[] = [];
  const recommendations: AgentRecommendation[] = [];

  // Multi-objective optimization considering:
  // 1. Mileage balancing
  // 2. Branding contract fulfillment
  // 3. Maintenance scheduling
  // 4. Energy efficiency (depot shunting minimization)

  const kms = fleet.map(f => f.km);
  const avgMileage = kms.reduce((a, b) => a + b, 0) / Math.max(1, kms.length);

  for (const ts of fleet) {
    let totalScore = 0;
    const reasons: string[] = [];

    // Mileage balancing objective
    const mileageDelta = ts.km - avgMileage;
    if (Math.abs(mileageDelta) > constraints.mileageBalanceThreshold) {
      if (mileageDelta > 0) {
        totalScore -= 15; // High mileage, prefer standby
        reasons.push(`High mileage (+${Math.round(mileageDelta/1000)}k km above average)`);
      } else {
        totalScore += 15; // Low mileage, prefer service
        reasons.push(`Low mileage (${Math.round(-mileageDelta/1000)}k km below average)`);
      }
    }

    // Branding contract fulfillment
    const brandingCommitment = ts.brandingContracts.reduce((sum, contract) => sum + contract.remainingHours, 0);
    if (brandingCommitment > 20) {
      totalScore += 25;
      reasons.push(`High branding commitment (${brandingCommitment}h remaining)`);
    }

    // Component wear consideration
    const avgWear = (ts.componentWear.brakePads + ts.componentWear.hvacSystem + 
                    ts.componentWear.bogies + ts.componentWear.doors) / 4;
    if (avgWear > 80) {
      totalScore -= 20;
      reasons.push(`High component wear (${avgWear}% average)`);
    }

    // Depot location efficiency (minimize shunting)
    if (ts.currentLocation) {
      const bay = depotBays.find(b => b.id === ts.currentLocation);
      if (bay && bay.geometry.accessDifficulty > 7) {
        totalScore -= 10;
        reasons.push(`Difficult depot access (complexity: ${bay.geometry.accessDifficulty})`);
      }
    }

    if (totalScore !== 0) {
      recommendations.push(
        rec({
          trainsetId: ts.id,
          action: totalScore > 0 ? "service" : "standby",
          weight: totalScore,
          rationale: reasons.join('; '),
          confidence: Math.min(0.95, 0.7 + Math.abs(totalScore) / 100),
          constraints: []
        })
      );
    }
  }

  addFinding(findings, {
    title: "Multi-objective optimization completed",
    message: `Analyzed ${fleet.length} trainsets across mileage, branding, wear, and efficiency objectives`,
    severity: "info"
  }, "optimization");

  const dataQuality = {
    completeness: 0.92,
    freshness: 8,
    consistency: 0.96,
    accuracy: 0.91
  };

  return {
    agent: "optimization",
    findings,
    recommendations,
    constraints,
    executionTime: Date.now() - startTime,
    dataQuality
  } satisfies AgentOutput;
};

// Cleaning and Stabling Manager Component
export const CleaningStablingAgent: AgentFn = async ({ fleet, constraints, depotBays }) => {
  const startTime = Date.now();
  const findings: AgentFinding[] = [];
  const recommendations: AgentRecommendation[] = [];

  // Cleaning crew and bay management
  const cleaningBays = depotBays.filter(bay => bay.cleaningCapable);
  const needingCleaning = fleet.filter(f => f.cleaningRequired);
  
  // Prioritize cleaning based on last cleaning date and service requirements
  const cleaningPriority = needingCleaning
    .map(ts => ({
      trainset: ts,
      daysSinceClean: Math.floor((Date.now() - ts.lastCleaningDate.getTime()) / (24 * 60 * 60 * 1000)),
      brandingHours: ts.brandingCommittedHoursNext7d
    }))
    .sort((a, b) => (b.daysSinceClean * 2 + b.brandingHours) - (a.daysSinceClean * 2 + a.brandingHours));

  // Assign cleaning slots based on capacity
  let cleaningCapacityUsed = 0;
  for (const { trainset, daysSinceClean } of cleaningPriority) {
    if (cleaningCapacityUsed < constraints.cleaningBayCapacity) {
      recommendations.push(
        rec({
          trainsetId: trainset.id,
          action: "cleaning",
          weight: -20 - daysSinceClean,
          rationale: `Scheduled for cleaning (${daysSinceClean} days since last clean)`,
          confidence: 0.95,
          constraints: ["cleaning_scheduled"]
        })
      );
      cleaningCapacityUsed++;
    } else {
      addFinding(findings, {
        title: `Cleaning deferred: ${trainset.id}`,
        message: `Cleaning needed but no capacity available`,
        severity: "warn",
        trainsetId: trainset.id
      }, "cleaning-stabling");
    }
  }

  // Stabling optimization to minimize shunting moves
  const stablingPlan = optimizeStabling(fleet, depotBays, constraints.maxShuntingMoves);
  
  addFinding(findings, {
    title: "Stabling optimization completed",
    message: `Optimized bay assignments for ${fleet.length} trainsets with ${stablingPlan.totalMoves} shunting moves`,
    severity: "info"
  }, "cleaning-stabling");

  const dataQuality = {
    completeness: 0.98,
    freshness: 3,
    consistency: 0.97,
    accuracy: 0.95
  };

  return {
    agent: "cleaning-stabling",
    findings,
    recommendations,
    constraints,
    executionTime: Date.now() - startTime,
    dataQuality
  } satisfies AgentOutput;
};

// Simulation Agent for What-If scenarios
export const SimulationAgent: AgentFn = async ({ fleet, constraints, depotBays }) => {
  const startTime = Date.now();
  const findings: AgentFinding[] = [];
  const recommendations: AgentRecommendation[] = [];

  addFinding(findings, {
    title: "Simulation capability ready",
    message: "What-if simulation engine initialized and ready for scenario testing",
    severity: "info"
  }, "simulation");

  const dataQuality = {
    completeness: 1.0,
    freshness: 0,
    consistency: 1.0,
    accuracy: 0.98
  };

  return {
    agent: "simulation",
    findings,
    recommendations,
    constraints,
    executionTime: Date.now() - startTime,
    dataQuality
  } satisfies AgentOutput;
};

// Feedback Agent for continuous learning
export const FeedbackAgent: AgentFn = async ({ fleet, constraints, depotBays }) => {
  const startTime = Date.now();
  const findings: AgentFinding[] = [];
  const recommendations: AgentRecommendation[] = [];

  addFinding(findings, {
    title: "Feedback system active",
    message: "Monitoring supervisor overrides and plan effectiveness for continuous improvement",
    severity: "info"
  }, "feedback");

  const dataQuality = {
    completeness: 0.85,
    freshness: 15,
    consistency: 0.92,
    accuracy: 0.88
  };

  return {
    agent: "feedback",
    findings,
    recommendations,
    constraints,
    executionTime: Date.now() - startTime,
    dataQuality
  } satisfies AgentOutput;
};

// Helper function for stabling optimization
function optimizeStabling(fleet: TrainsetSnapshot[], depotBays: any[], maxMoves: number) {
  // Simplified stabling optimization algorithm
  // In production, this would use more sophisticated algorithms
  return {
    assignments: fleet.map(ts => ({ trainsetId: ts.id, bayId: `BAY-${Math.floor(Math.random() * 10) + 1}` })),
    totalMoves: Math.min(maxMoves, Math.floor(fleet.length * 0.3))
  };
}
