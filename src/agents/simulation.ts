import {
  WhatIfScenario,
  ScenarioModification,
  SimulationResult,
  InductionPlan,
  TrainsetSnapshot,
  GlobalConstraints,
  DepotBay,
  KPIProjections
} from "./types";
import { runOrchestrator, OrchestratorRunInput } from "./orchestrator";

export class WhatIfSimulationEngine {
  /**
   * Run a what-if simulation by applying scenario modifications and comparing results
   */
  async runSimulation(
    scenario: WhatIfScenario,
    baseInput: OrchestratorRunInput
  ): Promise<SimulationResult> {
    // Generate original plan
    const originalResult = await runOrchestrator(baseInput);
    const originalPlan = originalResult.plan;

    // Apply scenario modifications
    const modifiedInput = this.applyScenarioModifications(baseInput, scenario.modifications);

    // Generate modified plan
    const modifiedResult = await runOrchestrator(modifiedInput);
    const modifiedPlan = modifiedResult.plan;

    // Calculate impact analysis
    const impact = this.calculateImpact(originalPlan, modifiedPlan, scenario);

    return {
      scenarioId: scenario.id,
      originalPlan,
      modifiedPlan,
      impact
    };
  }

  /**
   * Apply scenario modifications to the base input
   */
  private applyScenarioModifications(
    baseInput: OrchestratorRunInput,
    modifications: ScenarioModification[]
  ): OrchestratorRunInput {
    let modifiedInput = { ...baseInput };

    for (const mod of modifications) {
      switch (mod.type) {
        case 'trainset_unavailable':
          modifiedInput = this.applyTrainsetUnavailable(modifiedInput, mod);
          break;
        case 'maintenance_delay':
          modifiedInput = this.applyMaintenanceDelay(modifiedInput, mod);
          break;
        case 'cleaning_outage':
          modifiedInput = this.applyCleaningOutage(modifiedInput, mod);
          break;
        case 'constraint_change':
          modifiedInput = this.applyConstraintChange(modifiedInput, mod);
          break;
      }
    }

    return modifiedInput;
  }

  private applyTrainsetUnavailable(
    input: OrchestratorRunInput,
    mod: ScenarioModification
  ): OrchestratorRunInput {
    const trainsetId = mod.target;
    return {
      ...input,
      fleet: input.fleet.filter(ts => ts.id !== trainsetId)
    };
  }

  private applyMaintenanceDelay(
    input: OrchestratorRunInput,
    mod: ScenarioModification
  ): OrchestratorRunInput {
    const trainsetId = mod.target;
    const delayHours = mod.value as number;
    
    return {
      ...input,
      fleet: input.fleet.map(ts => {
        if (ts.id === trainsetId) {
          // Add a critical work order to simulate maintenance delay
          const delayWorkOrder = {
            id: `WO-DELAY-${Date.now()}`,
            type: 'critical' as const,
            system: 'rolling_stock' as const,
            priority: 10,
            estimatedHours: delayHours,
            dueDate: new Date(Date.now() + 2 * 60 * 60 * 1000), // Due in 2 hours
            description: `Delayed maintenance: ${mod.description}`
          };
          
          return {
            ...ts,
            openWorkOrders: [...ts.openWorkOrders, delayWorkOrder]
          };
        }
        return ts;
      })
    };
  }

  private applyCleaningOutage(
    input: OrchestratorRunInput,
    mod: ScenarioModification
  ): OrchestratorRunInput {
    const outageCapacity = mod.value as number;
    
    return {
      ...input,
      constraints: {
        ...input.constraints,
        cleaningBayCapacity: Math.max(0, input.constraints.cleaningBayCapacity - outageCapacity),
        cleaningCrewCapacity: Math.max(0, input.constraints.cleaningCrewCapacity - outageCapacity)
      }
    };
  }

  private applyConstraintChange(
    input: OrchestratorRunInput,
    mod: ScenarioModification
  ): OrchestratorRunInput {
    const constraintChanges = mod.value as Partial<GlobalConstraints>;
    
    return {
      ...input,
      constraints: {
        ...input.constraints,
        ...constraintChanges
      }
    };
  }

  /**
   * Calculate the impact of scenario modifications
   */
  private calculateImpact(
    originalPlan: InductionPlan,
    modifiedPlan: InductionPlan,
    scenario: WhatIfScenario
  ) {
    // Calculate KPI deltas
    const kpiDeltas: Partial<KPIProjections> = {
      punctualityRate: modifiedPlan.kpiProjections.punctualityRate - originalPlan.kpiProjections.punctualityRate,
      mileageBalance: modifiedPlan.kpiProjections.mileageBalance - originalPlan.kpiProjections.mileageBalance,
      brandingFulfillment: modifiedPlan.kpiProjections.brandingFulfillment - originalPlan.kpiProjections.brandingFulfillment,
      maintenanceCompliance: modifiedPlan.kpiProjections.maintenanceCompliance - originalPlan.kpiProjections.maintenanceCompliance,
      energyEfficiency: modifiedPlan.kpiProjections.energyEfficiency - originalPlan.kpiProjections.energyEfficiency
    };

    // Assess risks
    const riskAssessment: string[] = [];
    
    if (kpiDeltas.punctualityRate && kpiDeltas.punctualityRate < -0.01) {
      riskAssessment.push(`Punctuality risk: ${(kpiDeltas.punctualityRate * 100).toFixed(2)}% decrease`);
    }
    
    if (kpiDeltas.brandingFulfillment && kpiDeltas.brandingFulfillment < -0.1) {
      riskAssessment.push(`Branding SLA risk: ${(kpiDeltas.brandingFulfillment * 100).toFixed(1)}% decrease in fulfillment`);
    }
    
    if (kpiDeltas.maintenanceCompliance && kpiDeltas.maintenanceCompliance < -0.05) {
      riskAssessment.push(`Maintenance compliance risk: ${(kpiDeltas.maintenanceCompliance * 100).toFixed(1)}% decrease`);
    }

    // Generate mitigation suggestions
    const mitigationSuggestions: string[] = [];
    
    if (modifiedPlan.assignments.filter(a => a.role === 'service').length < originalPlan.assignments.filter(a => a.role === 'service').length) {
      mitigationSuggestions.push("Consider reducing service intervals or deploying backup trainsets");
    }
    
    if (modifiedPlan.assignments.some(a => a.riskFactors.length > originalPlan.assignments.find(orig => orig.trainsetId === a.trainsetId)?.riskFactors.length || 0)) {
      mitigationSuggestions.push("Prioritize maintenance activities to reduce risk factors");
    }
    
    if (kpiDeltas.brandingFulfillment && kpiDeltas.brandingFulfillment < -0.1) {
      mitigationSuggestions.push("Negotiate branding contract extensions or deploy alternative advertising solutions");
    }

    return {
      kpiDeltas,
      riskAssessment,
      mitigationSuggestions
    };
  }

  /**
   * Generate common simulation scenarios for SpeedLine
   */
  static getCommonScenarios(): WhatIfScenario[] {
    return [
      {
        id: "SCENARIO-001",
        name: "Peak Hour Trainset Failure",
        description: "Simulate the impact of a critical trainset becoming unavailable during peak hours",
        modifications: [
          {
            type: 'trainset_unavailable',
            target: 'TS-101',
            value: null,
            description: 'TS-101 experiences critical system failure'
          }
        ]
      },
      {
        id: "SCENARIO-002", 
        name: "Cleaning Bay Outage",
        description: "Simulate the impact of 2 cleaning bays being out of service",
        modifications: [
          {
            type: 'cleaning_outage',
            target: 'cleaning_capacity',
            value: 2,
            description: '2 cleaning bays offline due to equipment failure'
          }
        ]
      },
      {
        id: "SCENARIO-003",
        name: "Extended Maintenance Window",
        description: "Simulate the impact of extended maintenance requiring additional trainsets",
        modifications: [
          {
            type: 'constraint_change',
            target: 'constraints',
            value: { minStandby: 5, maxService: 15 },
            description: 'Increased standby requirement for extended maintenance'
          }
        ]
      },
      {
        id: "SCENARIO-004",
        name: "Multiple Trainset Delays",
        description: "Simulate multiple trainsets experiencing maintenance delays",
        modifications: [
          {
            type: 'maintenance_delay',
            target: 'TS-105',
            value: 6,
            description: 'TS-105 brake system maintenance delay'
          },
          {
            type: 'maintenance_delay',
            target: 'TS-112',
            value: 4,
            description: 'TS-112 HVAC system maintenance delay'
          }
        ]
      },
      {
        id: "SCENARIO-005",
        name: "High Demand Service",
        description: "Simulate increased service demand requiring more trainsets",
        modifications: [
          {
            type: 'constraint_change',
            target: 'constraints',
            value: { maxService: 22, minStandby: 2 },
            description: 'Increased service requirement for special event'
          }
        ]
      }
    ];
  }
}

// Export singleton instance
export const simulationEngine = new WhatIfSimulationEngine();
