import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Train, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  Users, 
  Settings,
  Activity,
  Zap,
  Calendar
} from 'lucide-react';
import { kochiMetroAPI } from '@/agents/api';
import Navbar from '@/components/Navbar';

const Dashboard = () => {
  const [systemHealth, setSystemHealth] = useState<any>(null);
  const [fleetStatus, setFleetStatus] = useState<any>(null);
  const [currentPlan, setCurrentPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [health, fleet, plan] = await Promise.all([
          kochiMetroAPI.getSystemHealth(),
          kochiMetroAPI.getFleetStatus(),
          kochiMetroAPI.getCurrentPlan()
        ]);
        
        setSystemHealth(health);
        setFleetStatus(fleet);
        setCurrentPlan(plan);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const generateNewPlan = async () => {
    setLoading(true);
    try {
      const result = await kochiMetroAPI.generateInductionPlan();
      setCurrentPlan(result.plan);
    } catch (error) {
      console.error('Failed to generate plan:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'critical': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'critical': return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default: return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background p-6 pt-20">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Operations Dashboard</h1>
            <p className="text-muted-foreground">Real-time overview of Kochi Metro operations</p>
          </div>
          <Button onClick={generateNewPlan} className="gap-2">
            <Zap className="h-4 w-4" />
            Generate New Plan
          </Button>
        </div>

        {/* System Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Health</CardTitle>
              {systemHealth && getHealthIcon(systemHealth.overall)}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize">
                {systemHealth?.overall || 'Loading...'}
              </div>
              <p className="text-xs text-muted-foreground">
                {systemHealth?.agents?.filter((a: any) => a.status === 'ok').length || 0} agents healthy
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Fleet Status</CardTitle>
              <Train className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {fleetStatus?.available || 0}/{fleetStatus?.total || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Available trainsets
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Plan</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {currentPlan?.assignments?.length || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Assignments active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Punctuality</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {currentPlan?.kpiProjections ? 
                  `${(currentPlan.kpiProjections.punctualityRate * 100).toFixed(1)}%` : 
                  '99.5%'
                }
              </div>
              <p className="text-xs text-muted-foreground">
                Target: 99.5%
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Fleet Overview */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Train className="h-5 w-5" />
                Fleet Overview
              </CardTitle>
              <CardDescription>Current status of all trainsets</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {fleetStatus && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Available</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {fleetStatus.available} trainsets
                    </Badge>
                  </div>
                  <Progress value={(fleetStatus.available / fleetStatus.total) * 100} className="h-2" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">In Maintenance</span>
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      {fleetStatus.inMaintenance} trainsets
                    </Badge>
                  </div>
                  <Progress value={(fleetStatus.inMaintenance / fleetStatus.total) * 100} className="h-2" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Cleaning Required</span>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      {fleetStatus.cleaningRequired} trainsets
                    </Badge>
                  </div>
                  <Progress value={(fleetStatus.cleaningRequired / fleetStatus.total) * 100} className="h-2" />
                  
                  {fleetStatus.criticalIssues > 0 && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Critical Issues</span>
                        <Badge variant="destructive">
                          {fleetStatus.criticalIssues} trainsets
                        </Badge>
                      </div>
                      <Progress value={(fleetStatus.criticalIssues / fleetStatus.total) * 100} className="h-2" />
                    </>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Agent Health */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Agent Health
              </CardTitle>
              <CardDescription>System component status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {systemHealth?.agents?.map((agent: any, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getHealthIcon(agent.status)}
                    <span className="text-sm font-medium capitalize">
                      {agent.agent.replace('-', ' ')}
                    </span>
                  </div>
                  <Badge variant={agent.status === 'ok' ? 'secondary' : 'destructive'}>
                    {agent.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Current Plan Details */}
        {currentPlan && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Current Induction Plan
              </CardTitle>
              <CardDescription>
                Plan {currentPlan.id} - Generated {new Date(currentPlan.generatedAt).toLocaleString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <h4 className="font-semibold text-green-700">Service</h4>
                  <div className="text-2xl font-bold">
                    {currentPlan.assignments.filter((a: any) => a.role === 'service').length}
                  </div>
                  <p className="text-sm text-muted-foreground">trainsets</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-yellow-700">Standby</h4>
                  <div className="text-2xl font-bold">
                    {currentPlan.assignments.filter((a: any) => a.role === 'standby').length}
                  </div>
                  <p className="text-sm text-muted-foreground">trainsets</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-red-700">Maintenance</h4>
                  <div className="text-2xl font-bold">
                    {currentPlan.assignments.filter((a: any) => a.role === 'maintenance').length}
                  </div>
                  <p className="text-sm text-muted-foreground">trainsets</p>
                </div>
              </div>
              
              {currentPlan.kpiProjections && (
                <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="text-center">
                    <div className="text-lg font-semibold">
                      {(currentPlan.kpiProjections.punctualityRate * 100).toFixed(1)}%
                    </div>
                    <div className="text-xs text-muted-foreground">Punctuality</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold">
                      {(currentPlan.kpiProjections.mileageBalance * 100).toFixed(1)}%
                    </div>
                    <div className="text-xs text-muted-foreground">Mileage Balance</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold">
                      {(currentPlan.kpiProjections.brandingFulfillment * 100).toFixed(1)}%
                    </div>
                    <div className="text-xs text-muted-foreground">Branding</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold">
                      {(currentPlan.kpiProjections.maintenanceCompliance * 100).toFixed(1)}%
                    </div>
                    <div className="text-xs text-muted-foreground">Maintenance</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold">
                      {(currentPlan.kpiProjections.energyEfficiency * 100).toFixed(1)}%
                    </div>
                    <div className="text-xs text-muted-foreground">Energy</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
    </>
  );
};

export default Dashboard;
