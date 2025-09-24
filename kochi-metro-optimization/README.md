# SpeedLine Trainset Induction Optimization System

## Overview

This system automates and optimizes SpeedLine's nightly trainset induction decision-making process for 25-40 four-car trainsets. It addresses six critical and interdependent variables through a multi-agent architecture that balances fitness certificates, maintenance job-cards, branding exposure, mileage balancing, cleaning schedules, and depot stabling geometry.

## System Architecture

### Core Agents and Components

#### 1. Data Ingestion and Validation Agent (`DataIngestionAgent`)
- **Purpose**: Pulls heterogeneous inputs from multiple data sources
- **Data Sources**:
  - IBM Maximo (job-cards and work orders)
  - IoT sensor feeds (fitness certificates and system health)
  - Telegram group chats (manual supervisory updates with NLU)
- **Functions**:
  - Normalizes disparate data into coherent, timestamped operational snapshots
  - Flags inconsistencies, missing inputs, or delays
  - Provides data quality metrics (completeness, freshness, consistency, accuracy)

#### 2. Constraint and Rule Enforcement Agent (`ConstraintEnforcementAgent`)
- **Purpose**: Applies operational constraints digitally
- **Validations**:
  - Fitness certificate coverage for rolling stock, signaling, and telecom systems
  - Critical maintenance job-card closure requirements
  - Cleaning bay capacity and manpower availability
  - Branding contract exposure hours and SLA compliance
  - Depot bay compatibility and stabling geometry
- **Outputs**: Eligibility flags with detailed explanation reports and remediation hints

#### 3. Optimization and Planning Agent (`OptimizationAgent`)
- **Purpose**: Solves multi-objective constraint optimization
- **Objectives**:
  - Maximized trainset readiness (99.5%+ punctuality KPI)
  - Balanced mileage to equalize component wear
  - Branding exposure fulfillment to meet advertiser contracts
  - Minimized energy-intensive depot shunting
- **Features**: Explainability with confidence scores and violation traceability

#### 4. Cleaning and Stabling Manager (`CleaningStablingAgent`)
- **Purpose**: Manages cleaning crew schedules and bay occupancy
- **Functions**:
  - Detailed cleaning scheduling before service
  - Bay occupancy optimization
  - Trainset-to-bay allocation with minimal shunting moves
  - Resource availability and cost optimization

#### 5. What-If Simulation Component (`SimulationAgent` + `WhatIfSimulationEngine`)
- **Purpose**: Allows operations supervisors to model impact scenarios
- **Scenarios**:
  - Training certificate delays
  - Reopened maintenance jobs
  - Bay cleaning outages
  - Constraint modifications
- **Outputs**: Comparative analytics with KPI deltas and risk mitigation suggestions

#### 6. Feedback Agent (`FeedbackAgent`)
- **Purpose**: Continuous learning from supervisor overrides and plan effectiveness
- **Functions**: Monitors and learns from manual interventions for system improvement

## Human-in-the-Loop Integration

### Supervisor Interface
- Receives AI-generated ranked trainset induction plans
- Detailed constraint violation reports and decision rationales
- Real-time manual override capabilities with mandatory annotations
- Audit trail maintenance for regulatory compliance

### Override Management
- Manual overrides feed back into the ingestion pipeline
- Maintains consistency across all system components
- Supports continuous learning and policy refinement

## Data Flow and Integration

```
Data Sources → Data Ingestion → Constraint Validation → Optimization → Plan Generation
     ↓              ↓                    ↓                 ↓              ↓
IBM Maximo    Data Quality      Eligibility Flags    Multi-objective   Final Plan
IoT Sensors   Assessment        Violation Reports    Scoring System    with KPIs
Telegram      Normalization     Remediation Hints   Confidence Scores  Audit Trail
```

## Key Features

### 1. Multi-Objective Optimization
- **Punctuality**: Ensures 99.5%+ on-time performance
- **Mileage Balancing**: Equalizes wear across fleet (±25k km threshold)
- **Branding SLA**: Meets advertiser contract commitments
- **Energy Efficiency**: Minimizes depot shunting operations

### 2. Comprehensive Data Integration
- **IBM Maximo**: Work orders and maintenance schedules
- **IoT Sensors**: Real-time system health monitoring
- **Telegram NLU**: Natural language processing of supervisor updates
- **Data Quality Metrics**: Completeness, freshness, consistency, accuracy

### 3. Advanced Simulation Capabilities
- **Scenario Testing**: Pre-built and custom scenarios
- **Impact Analysis**: KPI deltas and risk assessment
- **Mitigation Strategies**: Automated suggestion generation

### 4. Audit and Compliance
- **Complete Audit Trail**: All decisions and overrides logged
- **Regulatory Compliance**: Detailed reporting and export capabilities
- **Performance Monitoring**: Agent health and system metrics

## API Endpoints

### Core Operations
- `generateInductionPlan()`: Generate optimized trainset assignments
- `getCurrentPlan()`: Get active induction plan
- `applySupervisorOverride()`: Apply manual overrides
- `approvePlan()`: Approve plan for execution

### Simulation and Analysis
- `runWhatIfSimulation()`: Execute scenario simulations
- `getAvailableScenarios()`: List pre-built scenarios
- `getSystemHealth()`: System status and agent health

### Monitoring and Audit
- `getAuditLogs()`: Retrieve audit trail
- `exportAuditLogs()`: Export compliance reports
- `getFleetStatus()`: Current fleet status overview

## Configuration

### Default Constraints
```typescript
{
  minStandby: 3,           // Minimum standby trainsets
  maxService: 18,          // Maximum service trainsets
  cleaningBayCapacity: 4,  // Available cleaning bays
  cleaningCrewCapacity: 6, // Available cleaning crew
  maxShuntingMoves: 15,    // Maximum depot movements
  punctualityTarget: 0.995, // 99.5% punctuality target
  mileageBalanceThreshold: 25000 // ±25k km mileage balance
}
```

### Fleet Scale
- **Current**: 30 trainsets (expandable to 40)
- **Depot Bays**: 25 bays with varied capabilities
- **Service Types**: Service, Standby, Maintenance assignments

## Performance Metrics

### KPI Projections
- **Punctuality Rate**: Target 99.5%
- **Mileage Balance**: Fleet-wide wear equalization
- **Branding Fulfillment**: Contract compliance percentage
- **Maintenance Compliance**: Critical work order completion
- **Energy Efficiency**: Depot operation optimization

### System Performance
- **Plan Generation**: < 5 seconds average
- **Data Quality**: 95%+ completeness target
- **Agent Reliability**: 99%+ success rate
- **Audit Completeness**: 100% decision traceability

## Usage Examples

### Basic Plan Generation
```typescript
import { kochiMetroAPI } from './agents/api';

const result = await kochiMetroAPI.generateInductionPlan();
console.log(`Generated plan ${result.plan.id} with ${result.plan.assignments.length} assignments`);
```

### What-If Simulation
```typescript
const simulation = await kochiMetroAPI.runWhatIfSimulation('SCENARIO-001');
console.log('Impact:', simulation.impact.kpiDeltas);
```

### Supervisor Override
```typescript
const updatedPlan = await kochiMetroAPI.applySupervisorOverride(
  'PLAN-123',
  'TS-101',
  'maintenance',
  'Brake system inspection required',
  'supervisor_kumar'
);
```

## Deployment Considerations

### Production Requirements
1. **Database Integration**: Replace mock data with actual database connections
2. **API Security**: Implement authentication and authorization
3. **Real-time Data**: Connect to actual IBM Maximo and IoT systems
4. **Telegram Bot**: Set up production Telegram bot integration
5. **Monitoring**: Implement comprehensive system monitoring
6. **Backup/Recovery**: Establish data backup and disaster recovery procedures

### Scalability
- Designed to scale from 25 to 40+ trainsets
- Modular agent architecture supports additional optimization objectives
- Configurable constraints allow operational flexibility
- Audit system designed for high-volume logging

## Regulatory Compliance

### Audit Trail Features
- Complete decision history with timestamps
- Supervisor override tracking with justifications
- Data quality metrics and issue tracking
- Performance monitoring and alerting
- Export capabilities for regulatory reporting

### Safety and Reliability
- Critical system failure detection and exclusion
- Fitness certificate validation and expiry tracking
- Maintenance compliance enforcement
- Risk factor identification and mitigation

This system represents a comprehensive solution for automated trainset induction planning, balancing operational efficiency with safety requirements while maintaining full transparency and auditability for regulatory compliance.
