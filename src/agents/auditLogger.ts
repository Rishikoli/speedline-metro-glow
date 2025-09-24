import {
  AuditEntry,
  InductionPlan,
  SupervisorOverride,
  AgentOutput,
  TrainsetSnapshot
} from "./types";

export interface AuditLogEntry extends AuditEntry {
  id: string;
  planId?: string;
  severity: 'info' | 'warn' | 'error' | 'critical';
  category: 'plan_generation' | 'supervisor_override' | 'system_event' | 'data_quality' | 'performance';
  metadata?: Record<string, any>;
}

export class AuditLogger {
  private logs: AuditLogEntry[] = [];
  private maxLogs: number = 10000; // Keep last 10k logs in memory

  /**
   * Log a plan generation event
   */
  logPlanGeneration(
    plan: InductionPlan,
    agentOutputs: AgentOutput[],
    executionTimeMs: number,
    user: string = 'system'
  ): void {
    const entry: AuditLogEntry = {
      id: `AUDIT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      planId: plan.id,
      timestamp: new Date(),
      action: 'plan_generated',
      user,
      details: `Generated induction plan with ${plan.assignments.length} assignments`,
      severity: 'info',
      category: 'plan_generation',
      metadata: {
        executionTimeMs,
        serviceAssignments: plan.assignments.filter(a => a.role === 'service').length,
        standbyAssignments: plan.assignments.filter(a => a.role === 'standby').length,
        maintenanceAssignments: plan.assignments.filter(a => a.role === 'maintenance').length,
        cleaningScheduled: plan.assignments.filter(a => a.cleaningScheduled).length,
        totalRiskFactors: plan.assignments.reduce((sum, a) => sum + a.riskFactors.length, 0),
        kpiProjections: plan.kpiProjections,
        agentPerformance: agentOutputs.map(output => ({
          agent: output.agent,
          executionTime: output.executionTime,
          findingsCount: output.findings.length,
          recommendationsCount: output.recommendations.length,
          dataQuality: output.dataQuality
        }))
      }
    };

    this.addLog(entry);
  }

  /**
   * Log a supervisor override event
   */
  logSupervisorOverride(
    override: SupervisorOverride,
    plan: InductionPlan
  ): void {
    const entry: AuditLogEntry = {
      id: `AUDIT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      planId: plan.id,
      timestamp: override.timestamp,
      action: 'supervisor_override',
      user: override.supervisor,
      details: `Override for ${override.trainsetId}: ${override.originalAssignment.role} → ${override.overrideAssignment.role}`,
      severity: 'warn',
      category: 'supervisor_override',
      previousValue: override.originalAssignment,
      newValue: override.overrideAssignment,
      metadata: {
        overrideId: override.id,
        reason: override.reason,
        approved: override.approved,
        trainsetId: override.trainsetId
      }
    };

    this.addLog(entry);
  }

  /**
   * Log data quality issues
   */
  logDataQualityIssue(
    source: string,
    issue: string,
    severity: 'warn' | 'error' | 'critical',
    trainsetId?: string,
    metadata?: Record<string, any>
  ): void {
    const entry: AuditLogEntry = {
      id: `AUDIT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      action: 'data_quality_issue',
      user: 'system',
      details: `Data quality issue from ${source}: ${issue}`,
      severity,
      category: 'data_quality',
      metadata: {
        source,
        trainsetId,
        ...metadata
      }
    };

    this.addLog(entry);
  }

  /**
   * Log system performance metrics
   */
  logPerformanceMetrics(
    operation: string,
    executionTimeMs: number,
    success: boolean,
    details?: string,
    metadata?: Record<string, any>
  ): void {
    const entry: AuditLogEntry = {
      id: `AUDIT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      action: 'performance_metric',
      user: 'system',
      details: `${operation}: ${success ? 'SUCCESS' : 'FAILURE'} (${executionTimeMs}ms)${details ? ` - ${details}` : ''}`,
      severity: success ? 'info' : 'error',
      category: 'performance',
      metadata: {
        operation,
        executionTimeMs,
        success,
        ...metadata
      }
    };

    this.addLog(entry);
  }

  /**
   * Log system events
   */
  logSystemEvent(
    event: string,
    details: string,
    severity: 'info' | 'warn' | 'error' | 'critical' = 'info',
    metadata?: Record<string, any>
  ): void {
    const entry: AuditLogEntry = {
      id: `AUDIT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      action: event,
      user: 'system',
      details,
      severity,
      category: 'system_event',
      metadata
    };

    this.addLog(entry);
  }

  /**
   * Get audit logs with filtering options
   */
  getLogs(options?: {
    planId?: string;
    category?: AuditLogEntry['category'];
    severity?: AuditLogEntry['severity'];
    user?: string;
    fromDate?: Date;
    toDate?: Date;
    limit?: number;
  }): AuditLogEntry[] {
    let filteredLogs = [...this.logs];

    if (options?.planId) {
      filteredLogs = filteredLogs.filter(log => log.planId === options.planId);
    }

    if (options?.category) {
      filteredLogs = filteredLogs.filter(log => log.category === options.category);
    }

    if (options?.severity) {
      filteredLogs = filteredLogs.filter(log => log.severity === options.severity);
    }

    if (options?.user) {
      filteredLogs = filteredLogs.filter(log => log.user === options.user);
    }

    if (options?.fromDate) {
      filteredLogs = filteredLogs.filter(log => log.timestamp >= options.fromDate!);
    }

    if (options?.toDate) {
      filteredLogs = filteredLogs.filter(log => log.timestamp <= options.toDate!);
    }

    // Sort by timestamp (newest first)
    filteredLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    if (options?.limit) {
      filteredLogs = filteredLogs.slice(0, options.limit);
    }

    return filteredLogs;
  }

  /**
   * Get audit summary statistics
   */
  getAuditSummary(timeRange?: { from: Date; to: Date }): {
    totalLogs: number;
    byCategory: Record<string, number>;
    bySeverity: Record<string, number>;
    byUser: Record<string, number>;
    recentCriticalEvents: AuditLogEntry[];
    performanceMetrics: {
      avgPlanGenerationTime: number;
      planGenerationCount: number;
      overrideRate: number;
      dataQualityIssues: number;
    };
  } {
    let logs = this.logs;

    if (timeRange) {
      logs = logs.filter(log => 
        log.timestamp >= timeRange.from && log.timestamp <= timeRange.to
      );
    }

    const byCategory: Record<string, number> = {};
    const bySeverity: Record<string, number> = {};
    const byUser: Record<string, number> = {};

    logs.forEach(log => {
      byCategory[log.category] = (byCategory[log.category] || 0) + 1;
      bySeverity[log.severity] = (bySeverity[log.severity] || 0) + 1;
      byUser[log.user] = (byUser[log.user] || 0) + 1;
    });

    const recentCriticalEvents = logs
      .filter(log => log.severity === 'critical')
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10);

    // Calculate performance metrics
    const planGenerationLogs = logs.filter(log => log.action === 'plan_generated');
    const avgPlanGenerationTime = planGenerationLogs.length > 0 
      ? planGenerationLogs.reduce((sum, log) => sum + (log.metadata?.executionTimeMs || 0), 0) / planGenerationLogs.length
      : 0;

    const overrideLogs = logs.filter(log => log.action === 'supervisor_override');
    const overrideRate = planGenerationLogs.length > 0 
      ? overrideLogs.length / planGenerationLogs.length 
      : 0;

    const dataQualityIssues = logs.filter(log => log.category === 'data_quality').length;

    return {
      totalLogs: logs.length,
      byCategory,
      bySeverity,
      byUser,
      recentCriticalEvents,
      performanceMetrics: {
        avgPlanGenerationTime,
        planGenerationCount: planGenerationLogs.length,
        overrideRate,
        dataQualityIssues
      }
    };
  }

  /**
   * Export audit logs for compliance reporting
   */
  exportLogs(format: 'json' | 'csv' = 'json', options?: {
    planId?: string;
    fromDate?: Date;
    toDate?: Date;
  }): string {
    const logs = this.getLogs(options);

    if (format === 'json') {
      return JSON.stringify(logs, null, 2);
    } else {
      // CSV format
      const headers = ['id', 'timestamp', 'action', 'user', 'details', 'severity', 'category', 'planId'];
      const csvRows = [
        headers.join(','),
        ...logs.map(log => [
          log.id,
          log.timestamp.toISOString(),
          log.action,
          log.user,
          `"${log.details.replace(/"/g, '""')}"`,
          log.severity,
          log.category,
          log.planId || ''
        ].join(','))
      ];
      return csvRows.join('\n');
    }
  }

  /**
   * Clear old logs to manage memory
   */
  private addLog(entry: AuditLogEntry): void {
    this.logs.push(entry);

    // Keep only the most recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, this.maxLogs);
    }
  }

  /**
   * Clear all logs (use with caution)
   */
  clearLogs(): void {
    this.logs = [];
  }
}

// Export singleton instance
export const auditLogger = new AuditLogger();
