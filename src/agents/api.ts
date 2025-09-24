import {
  InductionPlan,
  TrainsetSnapshot,
  GlobalConstraints,
  DepotBay,
  SupervisorOverride,
  WhatIfScenario,
  SimulationResult,
  AgentHealth,
  AuditEntry
} from "./types";
import { runOrchestrator, OrchestratorRunInput } from "./orchestrator";
import { simulationEngine } from "./simulation";
import { auditLogger, AuditLogEntry } from "./auditLogger";
import { mockFleet, mockDepotBays, defaultConstraints } from "./mockData";

export class KochiMetroAPI {
  private currentPlan: InductionPlan | null = null;
  private planHistory: InductionPlan[] = [];
  private supervisorOverrides: SupervisorOverride[] = [];

  /**
   * Generate a new induction plan
   */
  async generateInductionPlan(input?: Partial<OrchestratorRunInput>): Promise<{
    plan: InductionPlan;
    executionTimeMs: number;
    agentHealth: AgentHealth[];
  }> {
    const startTime = Date.now();

    try {
      const orchestratorInput: OrchestratorRunInput = {
        fleet: input?.fleet || mockFleet,
        constraints: input?.constraints || defaultConstraints,
        depotBays: input?.depotBays || mockDepotBays,
        maximoEndpoint: input?.maximoEndpoint,
        iotSensorEndpoint: input?.iotSensorEndpoint,
        telegramBotToken: input?.telegramBotToken
      };

      const result = await runOrchestrator(orchestratorInput);
      const executionTimeMs = Date.now() - startTime;

      // Store the plan
      this.currentPlan = result.plan;
      this.planHistory.push(result.plan);

      // Keep only last 50 plans in history
      if (this.planHistory.length > 50) {
        this.planHistory = this.planHistory.slice(-50);
      }

      // Log the plan generation
      auditLogger.logPlanGeneration(
        result.plan,
        result.agentOutputs,
        executionTimeMs,
        'api_user'
      );

      // Calculate agent health metrics
      const agentHealth = this.calculateAgentHealth(result.agentOutputs);

      auditLogger.logPerformanceMetrics(
        'generate_induction_plan',
        executionTimeMs,
        true,
        `Generated plan ${result.plan.id} with ${result.plan.assignments.length} assignments`
      );

      return {
        plan: result.plan,
        executionTimeMs,
        agentHealth
      };

    } catch (error) {
      const executionTimeMs = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      auditLogger.logPerformanceMetrics(
        'generate_induction_plan',
        executionTimeMs,
        false,
        errorMessage
      );

      throw new Error(`Failed to generate induction plan: ${errorMessage}`);
    }
  }

  /**
   * Get the current active plan
   */
  getCurrentPlan(): InductionPlan | null {
    return this.currentPlan;
  }

  /**
   * Get plan history
   */
  getPlanHistory(limit: number = 10): InductionPlan[] {
    return this.planHistory.slice(-limit).reverse();
  }

  /**
   * Apply supervisor override to a plan
   */
  async applySupervisorOverride(
    planId: string,
    trainsetId: string,
    newRole: 'service' | 'standby' | 'maintenance',
    reason: string,
    supervisor: string
  ): Promise<InductionPlan> {
    const plan = this.planHistory.find(p => p.id === planId) || this.currentPlan;
    
    if (!plan || plan.id !== planId) {
      throw new Error(`Plan ${planId} not found`);
    }

    const assignment = plan.assignments.find(a => a.trainsetId === trainsetId);
    if (!assignment) {
      throw new Error(`Assignment for trainset ${trainsetId} not found in plan ${planId}`);
    }

    // Create override record
    const override: SupervisorOverride = {
      id: `OVERRIDE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      planId,
      trainsetId,
      originalAssignment: { ...assignment },
      overrideAssignment: {
        ...assignment,
        role: newRole,
        reasons: [...assignment.reasons, `Supervisor override: ${reason}`]
      },
      reason,
      supervisor,
      timestamp: new Date(),
      approved: true
    };

    // Apply the override
    const updatedPlan: InductionPlan = {
      ...plan,
      assignments: plan.assignments.map(a => 
        a.trainsetId === trainsetId ? override.overrideAssignment : a
      ),
      approvalStatus: 'modified',
      auditTrail: [
        ...plan.auditTrail,
        {
          timestamp: new Date(),
          action: 'supervisor_override_applied',
          user: supervisor,
          details: `Override applied for ${trainsetId}: ${assignment.role} → ${newRole}`,
          previousValue: assignment,
          newValue: override.overrideAssignment
        }
      ]
    };

    // Store the override and updated plan
    this.supervisorOverrides.push(override);
    this.currentPlan = updatedPlan;
    
    // Update plan in history
    const historyIndex = this.planHistory.findIndex(p => p.id === planId);
    if (historyIndex !== -1) {
      this.planHistory[historyIndex] = updatedPlan;
    }

    // Log the override
    auditLogger.logSupervisorOverride(override, updatedPlan);

    return updatedPlan;
  }

  /**
   * Approve a plan
   */
  async approvePlan(planId: string, approver: string): Promise<InductionPlan> {
    const plan = this.planHistory.find(p => p.id === planId) || this.currentPlan;
    
    if (!plan || plan.id !== planId) {
      throw new Error(`Plan ${planId} not found`);
    }

    const approvedPlan: InductionPlan = {
      ...plan,
      approvalStatus: 'approved',
      approvedBy: approver,
      approvedAt: new Date(),
      auditTrail: [
        ...plan.auditTrail,
        {
          timestamp: new Date(),
          action: 'plan_approved',
          user: approver,
          details: `Plan ${planId} approved for execution`
        }
      ]
    };

    // Update current plan and history
    this.currentPlan = approvedPlan;
    const historyIndex = this.planHistory.findIndex(p => p.id === planId);
    if (historyIndex !== -1) {
      this.planHistory[historyIndex] = approvedPlan;
    }

    auditLogger.logSystemEvent(
      'plan_approved',
      `Plan ${planId} approved by ${approver}`,
      'info',
      { planId, approver }
    );

    return approvedPlan;
  }

  /**
   * Run what-if simulation
   */
  async runWhatIfSimulation(
    scenarioId: string,
    customModifications?: any[]
  ): Promise<SimulationResult> {
    const startTime = Date.now();

    try {
      // Get scenario or create custom one
      let scenario: WhatIfScenario;
      
      if (customModifications) {
        scenario = {
          id: `CUSTOM-${Date.now()}`,
          name: 'Custom Scenario',
          description: 'Custom what-if scenario',
          modifications: customModifications
        };
      } else {
        const commonScenarios = simulationEngine.constructor.getCommonScenarios();
        scenario = commonScenarios.find(s => s.id === scenarioId);
        
        if (!scenario) {
          throw new Error(`Scenario ${scenarioId} not found`);
        }
      }

      const baseInput: OrchestratorRunInput = {
        fleet: mockFleet,
        constraints: defaultConstraints,
        depotBays: mockDepotBays
      };

      const result = await simulationEngine.runSimulation(scenario, baseInput);
      const executionTimeMs = Date.now() - startTime;

      auditLogger.logPerformanceMetrics(
        'what_if_simulation',
        executionTimeMs,
        true,
        `Completed simulation for scenario ${scenario.id}`
      );

      return result;

    } catch (error) {
      const executionTimeMs = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      auditLogger.logPerformanceMetrics(
        'what_if_simulation',
        executionTimeMs,
        false,
        errorMessage
      );

      throw new Error(`Simulation failed: ${errorMessage}`);
    }
  }

  /**
   * Get available what-if scenarios
   */
  getAvailableScenarios(): WhatIfScenario[] {
    return simulationEngine.constructor.getCommonScenarios();
  }

  /**
   * Get system health status
   */
  getSystemHealth(): {
    overall: 'healthy' | 'warning' | 'critical';
    agents: AgentHealth[];
    dataQuality: {
      score: number;
      issues: string[];
    };
    performance: {
      avgPlanGenerationTime: number;
      successRate: number;
      lastError?: string;
    };
  } {
    const auditSummary = auditLogger.getAuditSummary({
      from: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
      to: new Date()
    });

    // Mock agent health (in production, this would come from actual agent monitoring)
    const agents: AgentHealth[] = [
      {
        agent: 'data-ingestion',
        status: 'ok',
        findingCounts: { info: 5, warn: 1, critical: 0 },
        lastRun: new Date(Date.now() - 5 * 60 * 1000),
        summary: 'Data ingestion operating normally',
        performance: {
          avgExecutionTime: 150,
          successRate: 0.99,
        }
      },
      {
        agent: 'constraint-enforcement',
        status: 'ok',
        findingCounts: { info: 3, warn: 2, critical: 1 },
        lastRun: new Date(Date.now() - 5 * 60 * 1000),
        summary: '1 critical constraint violation detected',
        performance: {
          avgExecutionTime: 75,
          successRate: 1.0,
        }
      },
      {
        agent: 'optimization',
        status: 'ok',
        findingCounts: { info: 8, warn: 0, critical: 0 },
        lastRun: new Date(Date.now() - 5 * 60 * 1000),
        summary: 'Optimization engine performing well',
        performance: {
          avgExecutionTime: 200,
          successRate: 0.98,
        }
      }
    ];

    const criticalAgents = agents.filter(a => a.status === 'critical').length;
    const warningAgents = agents.filter(a => a.status === 'warn').length;
    
    let overall: 'healthy' | 'warning' | 'critical' = 'healthy';
    if (criticalAgents > 0) {
      overall = 'critical';
    } else if (warningAgents > 0 || auditSummary.performanceMetrics.dataQualityIssues > 5) {
      overall = 'warning';
    }

    return {
      overall,
      agents,
      dataQuality: {
        score: Math.max(0, 1 - (auditSummary.performanceMetrics.dataQualityIssues / 20)),
        issues: auditSummary.recentCriticalEvents
          .filter(e => e.category === 'data_quality')
          .map(e => e.details)
      },
      performance: {
        avgPlanGenerationTime: auditSummary.performanceMetrics.avgPlanGenerationTime,
        successRate: Math.max(0, 1 - (auditSummary.bySeverity.error || 0) / auditSummary.totalLogs),
        lastError: auditSummary.recentCriticalEvents.find(e => e.severity === 'error')?.details
      }
    };
  }

  /**
   * Get audit logs
   */
  getAuditLogs(options?: {
    planId?: string;
    category?: string;
    severity?: string;
    limit?: number;
  }): AuditLogEntry[] {
    return auditLogger.getLogs(options as any);
  }

  /**
   * Export audit logs
   */
  exportAuditLogs(format: 'json' | 'csv' = 'json'): string {
    return auditLogger.exportLogs(format);
  }

  /**
   * Get fleet status
   */
  getFleetStatus(): {
    total: number;
    available: number;
    inMaintenance: number;
    cleaningRequired: number;
    criticalIssues: number;
    averageMileage: number;
  } {
    const fleet = mockFleet;
    
    return {
      total: fleet.length,
      available: fleet.filter(ts => 
        ts.openWorkOrders.every(wo => wo.type !== 'critical') &&
        Object.values(ts.systemHealth).every(status => status !== 'critical')
      ).length,
      inMaintenance: fleet.filter(ts => 
        ts.openWorkOrders.some(wo => wo.type === 'critical')
      ).length,
      cleaningRequired: fleet.filter(ts => ts.cleaningRequired).length,
      criticalIssues: fleet.filter(ts =>
        Object.values(ts.systemHealth).some(status => status === 'critical')
      ).length,
      averageMileage: Math.round(fleet.reduce((sum, ts) => sum + ts.km, 0) / fleet.length)
    };
  }

  private calculateAgentHealth(agentOutputs: any[]): AgentHealth[] {
    return agentOutputs.map(output => ({
      agent: output.agent,
      status: output.findings.some((f: any) => f.severity === 'critical') ? 'critical' :
              output.findings.some((f: any) => f.severity === 'warn') ? 'warn' : 'ok',
      findingCounts: {
        info: output.findings.filter((f: any) => f.severity === 'info').length,
        warn: output.findings.filter((f: any) => f.severity === 'warn').length,
        critical: output.findings.filter((f: any) => f.severity === 'critical').length
      },
      lastRun: new Date(),
      summary: `${output.findings.length} findings, ${output.recommendations.length} recommendations`,
      performance: {
        avgExecutionTime: output.executionTime,
        successRate: 1.0, // Simplified - in production would track actual success rates
      }
    }));
  }
}

// Export singleton instance
export const kochiMetroAPI = new KochiMetroAPI();
