import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Train, 
  Play, 
  Pause, 
  RotateCcw, 
  Settings, 
  Filter,
  Search,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  Wrench,
  Sparkles,
  Zap,
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
  BarChart3,
  Download
} from 'lucide-react';
import { kochiMetroAPI } from '@/agents/api';
import Navbar from '@/components/Navbar';

const TrainsetPlanning = () => {
  const [currentPlan, setCurrentPlan] = useState<any>(null);
  const [planHistory, setPlanHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [selectedTrainset, setSelectedTrainset] = useState<string | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<string>('');
  const [simulationResult, setSimulationResult] = useState<any>(null);
  const [simulationLoading, setSimulationLoading] = useState(false);
  const [availableScenarios, setAvailableScenarios] = useState<any[]>([]);

  useEffect(() => {
    fetchPlanningData();
  }, []);

  const fetchPlanningData = async () => {
    setLoading(true);
    try {
      const [plan, history, scenarios] = await Promise.all([
        kochiMetroAPI.getCurrentPlan(),
        kochiMetroAPI.getPlanHistory(10),
        kochiMetroAPI.getAvailableScenarios()
      ]);
      setCurrentPlan(plan);
      setPlanHistory(history);
      setAvailableScenarios(scenarios);
    } catch (error) {
      console.error('Failed to fetch planning data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateNewPlan = async () => {
    setLoading(true);
    try {
      const result = await kochiMetroAPI.generateInductionPlan();
      setCurrentPlan(result.plan);
      await fetchPlanningData(); // Refresh history
    } catch (error) {
      console.error('Failed to generate plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const approvePlan = async (planId: string) => {
    try {
      const approvedPlan = await kochiMetroAPI.approvePlan(planId, 'supervisor_user');
      setCurrentPlan(approvedPlan);
    } catch (error) {
      console.error('Failed to approve plan:', error);
    }
  };

  const applyOverride = async (trainsetId: string, newRole: string, reason: string) => {
    if (!currentPlan) return;
    
    try {
      const updatedPlan = await kochiMetroAPI.applySupervisorOverride(
        currentPlan.id,
        trainsetId,
        newRole as any,
        reason,
        'supervisor_user'
      );
      setCurrentPlan(updatedPlan);
    } catch (error) {
      console.error('Failed to apply override:', error);
    }
  };

  const runSimulation = async (scenarioId: string) => {
    if (!scenarioId) return;
    
    setSimulationLoading(true);
    try {
      const result = await kochiMetroAPI.runWhatIfSimulation(scenarioId);
      setSimulationResult(result);
    } catch (error) {
      console.error('Failed to run simulation:', error);
    } finally {
      setSimulationLoading(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'service': return <Play className="h-4 w-4 text-green-600" />;
      case 'standby': return <Pause className="h-4 w-4 text-yellow-600" />;
      case 'maintenance': return <Wrench className="h-4 w-4 text-red-600" />;
      default: return <Train className="h-4 w-4" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'service': return 'default';
      case 'standby': return 'secondary';
      case 'maintenance': return 'destructive';
      default: return 'outline';
    }
  };

  const filteredAssignments = currentPlan?.assignments?.filter((assignment: any) => {
    const matchesSearch = assignment.trainsetId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterRole === 'all' || assignment.role === filterRole;
    return matchesSearch && matchesFilter;
  }) || [];

  if (loading && !currentPlan) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background p-6 pt-20">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Trainset Planning</h1>
            <p className="text-muted-foreground">Manage trainset assignments and induction plans</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchPlanningData} disabled={loading}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={generateNewPlan} disabled={loading}>
              <Sparkles className="h-4 w-4 mr-2" />
              {loading ? 'Generating...' : 'Generate Plan'}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="current" className="space-y-6">
          <TabsList>
            <TabsTrigger value="current">Current Plan</TabsTrigger>
            <TabsTrigger value="history">Plan History</TabsTrigger>
            <TabsTrigger value="simulation">What-If Simulation</TabsTrigger>
          </TabsList>

          <TabsContent value="current" className="space-y-6">
            {currentPlan ? (
              <>
                {/* Plan Overview */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Calendar className="h-5 w-5" />
                          Plan {currentPlan.id}
                        </CardTitle>
                        <CardDescription>
                          Generated {new Date(currentPlan.generatedAt).toLocaleString()}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={currentPlan.approvalStatus === 'approved' ? 'default' : 'secondary'}>
                          {currentPlan.approvalStatus}
                        </Badge>
                        {currentPlan.approvalStatus !== 'approved' && (
                          <Button onClick={() => approvePlan(currentPlan.id)}>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve Plan
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-700">
                          {currentPlan.assignments.filter((a: any) => a.role === 'service').length}
                        </div>
                        <div className="text-sm text-green-600">Service</div>
                      </div>
                      <div className="text-center p-4 bg-yellow-50 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-700">
                          {currentPlan.assignments.filter((a: any) => a.role === 'standby').length}
                        </div>
                        <div className="text-sm text-yellow-600">Standby</div>
                      </div>
                      <div className="text-center p-4 bg-red-50 rounded-lg">
                        <div className="text-2xl font-bold text-red-700">
                          {currentPlan.assignments.filter((a: any) => a.role === 'maintenance').length}
                        </div>
                        <div className="text-sm text-red-600">Maintenance</div>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-700">
                          {currentPlan.assignments.filter((a: any) => a.cleaningScheduled).length}
                        </div>
                        <div className="text-sm text-blue-600">Cleaning</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Filters and Search */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search trainsets..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>
                      <Select value={filterRole} onValueChange={setFilterRole}>
                        <SelectTrigger className="w-48">
                          <Filter className="h-4 w-4 mr-2" />
                          <SelectValue placeholder="Filter by role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Roles</SelectItem>
                          <SelectItem value="service">Service</SelectItem>
                          <SelectItem value="standby">Standby</SelectItem>
                          <SelectItem value="maintenance">Maintenance</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* Assignments Table */}
                <Card>
                  <CardHeader>
                    <CardTitle>Trainset Assignments</CardTitle>
                    <CardDescription>
                      {filteredAssignments.length} of {currentPlan.assignments.length} trainsets
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {filteredAssignments.map((assignment: any) => (
                        <div
                          key={assignment.trainsetId}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 cursor-pointer"
                          onClick={() => setSelectedTrainset(
                            selectedTrainset === assignment.trainsetId ? null : assignment.trainsetId
                          )}
                        >
                          <div className="flex items-center gap-4">
                            {getRoleIcon(assignment.role)}
                            <div>
                              <div className="font-medium">{assignment.trainsetId}</div>
                              <div className="text-sm text-muted-foreground">
                                Score: {assignment.score.toFixed(1)}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {assignment.cleaningScheduled && (
                              <Badge variant="outline" className="text-blue-600">
                                <Sparkles className="h-3 w-3 mr-1" />
                                Cleaning
                              </Badge>
                            )}
                            {assignment.riskFactors.length > 0 && (
                              <Badge variant="destructive">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                {assignment.riskFactors.length} risks
                              </Badge>
                            )}
                            <Badge variant={getRoleBadgeVariant(assignment.role)}>
                              {assignment.role}
                            </Badge>
                            {assignment.assignedBay && (
                              <Badge variant="secondary">
                                {assignment.assignedBay}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Train className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Current Plan</h3>
                  <p className="text-muted-foreground mb-4">Generate a new induction plan to get started</p>
                  <Button onClick={generateNewPlan} disabled={loading}>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Plan
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Plan History</CardTitle>
                <CardDescription>Previous induction plans and their status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {planHistory.map((plan) => (
                    <div key={plan.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-medium">{plan.id}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(plan.generatedAt).toLocaleString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={plan.approvalStatus === 'approved' ? 'default' : 'secondary'}>
                          {plan.approvalStatus}
                        </Badge>
                        <div className="text-sm text-muted-foreground">
                          {plan.assignments.length} assignments
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="simulation" className="space-y-6">
            {/* Scenario Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  What-If Simulation
                </CardTitle>
                <CardDescription>Test different scenarios and analyze their impact on operations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Select Scenario</label>
                    <Select value={selectedScenario} onValueChange={setSelectedScenario}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a scenario to simulate" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableScenarios.map((scenario) => (
                          <SelectItem key={scenario.id} value={scenario.id}>
                            {scenario.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button 
                      onClick={() => runSimulation(selectedScenario)}
                      disabled={!selectedScenario || simulationLoading}
                      className="w-full"
                    >
                      {simulationLoading ? (
                        <>
                          <Activity className="h-4 w-4 mr-2 animate-spin" />
                          Running Simulation...
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Run Simulation
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                
                {selectedScenario && (
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-medium mb-2">
                      {availableScenarios.find(s => s.id === selectedScenario)?.name}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {availableScenarios.find(s => s.id === selectedScenario)?.description}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Available Scenarios */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Available Scenarios
                </CardTitle>
                <CardDescription>Pre-configured scenarios for common operational situations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availableScenarios.map((scenario) => (
                    <Card 
                      key={scenario.id} 
                      className={`cursor-pointer transition-colors hover:bg-accent/50 ${
                        selectedScenario === scenario.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => setSelectedScenario(scenario.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <AlertTriangle className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-sm mb-1">{scenario.name}</h4>
                            <p className="text-xs text-muted-foreground">{scenario.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Simulation Results */}
            {simulationResult && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Simulation Results
                  </CardTitle>
                  <CardDescription>
                    Impact analysis for scenario: {availableScenarios.find(s => s.id === selectedScenario)?.name}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* KPI Impact Comparison */}
                  <div>
                    <h4 className="font-semibold mb-4">KPI Impact Analysis</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {simulationResult.impact.kpiDeltas && Object.entries(simulationResult.impact.kpiDeltas).map(([key, value]: [string, any]) => {
                        const isPositive = value > 0;
                        const isNegative = value < 0;
                        return (
                          <div key={key} className="p-4 border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium capitalize">
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                              </span>
                              {isPositive && <TrendingUp className="h-4 w-4 text-green-500" />}
                              {isNegative && <TrendingDown className="h-4 w-4 text-red-500" />}
                              {!isPositive && !isNegative && <Activity className="h-4 w-4 text-gray-500" />}
                            </div>
                            <div className={`text-lg font-bold ${
                              isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-600'
                            }`}>
                              {isPositive ? '+' : ''}{(value * 100).toFixed(2)}%
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {isPositive ? 'Improvement' : isNegative ? 'Degradation' : 'No change'}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Risk Assessment */}
                  {simulationResult.impact.riskAssessment && simulationResult.impact.riskAssessment.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-4 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        Risk Assessment
                      </h4>
                      <div className="space-y-2">
                        {simulationResult.impact.riskAssessment.map((risk: string, index: number) => (
                          <div key={index} className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
                            <span className="text-sm text-red-800">{risk}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Mitigation Suggestions */}
                  {simulationResult.impact.mitigationSuggestions && simulationResult.impact.mitigationSuggestions.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-4 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Mitigation Suggestions
                      </h4>
                      <div className="space-y-2">
                        {simulationResult.impact.mitigationSuggestions.map((suggestion: string, index: number) => (
                          <div key={index} className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                            <span className="text-sm text-green-800">{suggestion}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Plan Comparison */}
                  <div>
                    <h4 className="font-semibold mb-4">Plan Comparison</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h5 className="font-medium mb-3 text-green-700">Original Plan</h5>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Service:</span>
                            <span className="font-medium">
                              {simulationResult.originalPlan.assignments.filter((a: any) => a.role === 'service').length}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Standby:</span>
                            <span className="font-medium">
                              {simulationResult.originalPlan.assignments.filter((a: any) => a.role === 'standby').length}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Maintenance:</span>
                            <span className="font-medium">
                              {simulationResult.originalPlan.assignments.filter((a: any) => a.role === 'maintenance').length}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h5 className="font-medium mb-3 text-blue-700">Modified Plan</h5>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Service:</span>
                            <span className="font-medium">
                              {simulationResult.modifiedPlan.assignments.filter((a: any) => a.role === 'service').length}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Standby:</span>
                            <span className="font-medium">
                              {simulationResult.modifiedPlan.assignments.filter((a: any) => a.role === 'standby').length}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Maintenance:</span>
                            <span className="font-medium">
                              {simulationResult.modifiedPlan.assignments.filter((a: any) => a.role === 'maintenance').length}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button variant="outline" onClick={() => setSimulationResult(null)}>
                      Clear Results
                    </Button>
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Export Report
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
    </>
  );
};

export default TrainsetPlanning;
