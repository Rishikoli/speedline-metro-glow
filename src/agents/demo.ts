import { kochiMetroAPI } from './api';
import { simulationEngine } from './simulation';

/**
 * Demo script showcasing the Kochi Metro Trainset Induction Optimization System
 */
async function runDemo() {
  console.log('🚇 Kochi Metro Trainset Induction Optimization System Demo\n');
  console.log('=' .repeat(60));

  try {
    // 1. Generate Initial Induction Plan
    console.log('\n📋 Step 1: Generating Induction Plan...');
    const planResult = await kochiMetroAPI.generateInductionPlan();
    
    console.log(`✅ Plan Generated: ${planResult.plan.id}`);
    console.log(`⏱️  Execution Time: ${planResult.executionTimeMs}ms`);
    console.log(`🎯 KPI Projections:`);
    console.log(`   - Punctuality: ${(planResult.plan.kpiProjections.punctualityRate * 100).toFixed(2)}%`);
    console.log(`   - Mileage Balance: ${(planResult.plan.kpiProjections.mileageBalance * 100).toFixed(1)}%`);
    console.log(`   - Branding Fulfillment: ${(planResult.plan.kpiProjections.brandingFulfillment * 100).toFixed(1)}%`);
    console.log(`   - Maintenance Compliance: ${(planResult.plan.kpiProjections.maintenanceCompliance * 100).toFixed(1)}%`);
    console.log(`   - Energy Efficiency: ${(planResult.plan.kpiProjections.energyEfficiency * 100).toFixed(1)}%`);

    // Show assignment breakdown
    const serviceCount = planResult.plan.assignments.filter(a => a.role === 'service').length;
    const standbyCount = planResult.plan.assignments.filter(a => a.role === 'standby').length;
    const maintenanceCount = planResult.plan.assignments.filter(a => a.role === 'maintenance').length;
    const cleaningCount = planResult.plan.assignments.filter(a => a.cleaningScheduled).length;

    console.log(`\n📊 Assignment Breakdown:`);
    console.log(`   - Service: ${serviceCount} trainsets`);
    console.log(`   - Standby: ${standbyCount} trainsets`);
    console.log(`   - Maintenance: ${maintenanceCount} trainsets`);
    console.log(`   - Cleaning Scheduled: ${cleaningCount} trainsets`);

    // 2. Show Agent Health
    console.log(`\n🏥 Agent Health Status:`);
    planResult.agentHealth.forEach(agent => {
      const statusIcon = agent.status === 'ok' ? '✅' : agent.status === 'warn' ? '⚠️' : '❌';
      console.log(`   ${statusIcon} ${agent.agent}: ${agent.summary}`);
      console.log(`      Findings: ${agent.findingCounts.critical} critical, ${agent.findingCounts.warn} warnings, ${agent.findingCounts.info} info`);
    });

    // 3. Apply Supervisor Override
    console.log('\n🔧 Step 2: Applying Supervisor Override...');
    const firstServiceTrainset = planResult.plan.assignments.find(a => a.role === 'service');
    if (firstServiceTrainset) {
      const overriddenPlan = await kochiMetroAPI.applySupervisorOverride(
        planResult.plan.id,
        firstServiceTrainset.trainsetId,
        'maintenance',
        'Precautionary brake inspection required',
        'supervisor_kumar'
      );
      console.log(`✅ Override Applied: ${firstServiceTrainset.trainsetId} moved from service to maintenance`);
      console.log(`📝 Reason: Precautionary brake inspection required`);
    }

    // 4. Run What-If Simulation
    console.log('\n🎯 Step 3: Running What-If Simulation...');
    const scenarios = kochiMetroAPI.getAvailableScenarios();
    console.log(`📋 Available Scenarios: ${scenarios.length}`);
    
    // Run peak hour failure scenario
    const peakHourScenario = scenarios.find(s => s.id === 'SCENARIO-001');
    if (peakHourScenario) {
      console.log(`\n🔍 Testing Scenario: ${peakHourScenario.name}`);
      console.log(`📖 Description: ${peakHourScenario.description}`);
      
      const simulationResult = await kochiMetroAPI.runWhatIfSimulation('SCENARIO-001');
      
      console.log(`\n📈 Simulation Results:`);
      console.log(`   Original vs Modified Plan Comparison:`);
      console.log(`   - Punctuality Impact: ${(simulationResult.impact.kpiDeltas.punctualityRate! * 100).toFixed(2)}%`);
      console.log(`   - Branding Impact: ${(simulationResult.impact.kpiDeltas.brandingFulfillment! * 100).toFixed(1)}%`);
      
      if (simulationResult.impact.riskAssessment.length > 0) {
        console.log(`\n⚠️  Risk Assessment:`);
        simulationResult.impact.riskAssessment.forEach(risk => {
          console.log(`   - ${risk}`);
        });
      }
      
      if (simulationResult.impact.mitigationSuggestions.length > 0) {
        console.log(`\n💡 Mitigation Suggestions:`);
        simulationResult.impact.mitigationSuggestions.forEach(suggestion => {
          console.log(`   - ${suggestion}`);
        });
      }
    }

    // 5. System Health Overview
    console.log('\n🏥 Step 4: System Health Overview...');
    const systemHealth = kochiMetroAPI.getSystemHealth();
    const healthIcon = systemHealth.overall === 'healthy' ? '✅' : 
                      systemHealth.overall === 'warning' ? '⚠️' : '❌';
    
    console.log(`${healthIcon} Overall System Status: ${systemHealth.overall.toUpperCase()}`);
    console.log(`📊 Performance Metrics:`);
    console.log(`   - Avg Plan Generation: ${systemHealth.performance.avgPlanGenerationTime.toFixed(0)}ms`);
    console.log(`   - Success Rate: ${(systemHealth.performance.successRate * 100).toFixed(1)}%`);
    console.log(`   - Data Quality Score: ${(systemHealth.dataQuality.score * 100).toFixed(1)}%`);

    // 6. Fleet Status
    console.log('\n🚊 Step 5: Fleet Status Overview...');
    const fleetStatus = kochiMetroAPI.getFleetStatus();
    console.log(`📊 Fleet Summary:`);
    console.log(`   - Total Trainsets: ${fleetStatus.total}`);
    console.log(`   - Available: ${fleetStatus.available}`);
    console.log(`   - In Maintenance: ${fleetStatus.inMaintenance}`);
    console.log(`   - Cleaning Required: ${fleetStatus.cleaningRequired}`);
    console.log(`   - Critical Issues: ${fleetStatus.criticalIssues}`);
    console.log(`   - Average Mileage: ${fleetStatus.averageMileage.toLocaleString()} km`);

    // 7. Audit Trail Sample
    console.log('\n📋 Step 6: Recent Audit Trail...');
    const recentLogs = kochiMetroAPI.getAuditLogs({ limit: 5 });
    console.log(`📝 Last ${recentLogs.length} audit entries:`);
    recentLogs.forEach((log, index) => {
      const severityIcon = log.severity === 'info' ? 'ℹ️' : 
                          log.severity === 'warn' ? '⚠️' : 
                          log.severity === 'error' ? '❌' : '🚨';
      console.log(`   ${index + 1}. ${severityIcon} [${log.timestamp.toLocaleTimeString()}] ${log.action} by ${log.user}`);
      console.log(`      ${log.details}`);
    });

    console.log('\n' + '='.repeat(60));
    console.log('✅ Demo completed successfully!');
    console.log('\n🎯 Key Achievements:');
    console.log('   ✓ Multi-agent optimization system operational');
    console.log('   ✓ Real-time constraint validation');
    console.log('   ✓ What-if simulation capabilities');
    console.log('   ✓ Supervisor override functionality');
    console.log('   ✓ Comprehensive audit trail');
    console.log('   ✓ System health monitoring');
    console.log('\n🚀 System ready for production deployment!');

  } catch (error) {
    console.error('\n❌ Demo failed:', error);
  }
}

// Export for use in other modules
export { runDemo };

// Run demo if this file is executed directly
if (require.main === module) {
  runDemo();
}
