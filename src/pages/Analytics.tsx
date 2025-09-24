import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  LineChart, 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Clock,
  Target,
  Zap,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Download,
  RefreshCw
} from 'lucide-react';
import Navbar from '@/components/Navbar';

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [loading, setLoading] = useState(false);

  // Mock analytics data
  const kpiData = {
    punctuality: {
      current: 99.2,
      target: 99.5,
      trend: 0.3,
      history: [98.9, 99.1, 99.0, 99.2, 99.3, 99.2, 99.2]
    },
    mileageBalance: {
      current: 87.5,
      target: 90.0,
      trend: -2.1,
      variance: 18500
    },
    brandingFulfillment: {
      current: 94.8,
      target: 95.0,
      trend: 1.2,
      revenue: 2850000
    },
    maintenanceCompliance: {
      current: 96.7,
      target: 98.0,
      trend: -0.8,
      overdue: 3
    },
    energyEfficiency: {
      current: 88.3,
      target: 85.0,
      trend: 2.1,
      savings: 125000
    }
  };

  const operationalMetrics = {
    totalPlansGenerated: 247,
    avgPlanGenerationTime: 3.2,
    supervisorOverrides: 18,
    overrideRate: 7.3,
    systemUptime: 99.8,
    dataQualityScore: 96.2
  };

  const fleetMetrics = {
    totalTrainsets: 30,
    averageMileage: 89500,
    maintenanceHours: 1250,
    cleaningCycles: 180,
    criticalIssues: 2,
    warningIssues: 8
  };

  const refreshData = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => setLoading(false), 1000);
  };

  const exportReport = () => {
    // Simulate report generation
    console.log('Exporting analytics report...');
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (trend < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Activity className="h-4 w-4 text-gray-500" />;
  };

  const getTrendColor = (trend: number) => {
    if (trend > 0) return 'text-green-600';
    if (trend < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background p-6 pt-20">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
            <p className="text-muted-foreground">Performance metrics and operational insights</p>
          </div>
          <div className="flex gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1d">Last Day</SelectItem>
                <SelectItem value="7d">Last Week</SelectItem>
                <SelectItem value="30d">Last Month</SelectItem>
                <SelectItem value="90d">Last Quarter</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={refreshData} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={exportReport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        <Tabs defaultValue="kpis" className="space-y-6">
          <TabsList>
            <TabsTrigger value="kpis">KPI Dashboard</TabsTrigger>
            <TabsTrigger value="operational">Operational Metrics</TabsTrigger>
            <TabsTrigger value="fleet">Fleet Analytics</TabsTrigger>
            <TabsTrigger value="trends">Trends & Forecasting</TabsTrigger>
          </TabsList>

          <TabsContent value="kpis" className="space-y-6">
            {/* KPI Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Punctuality Rate</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{kpiData.punctuality.current}%</div>
                  <div className="flex items-center gap-2 mt-2">
                    {getTrendIcon(kpiData.punctuality.trend)}
                    <span className={`text-sm ${getTrendColor(kpiData.punctuality.trend)}`}>
                      {kpiData.punctuality.trend > 0 ? '+' : ''}{kpiData.punctuality.trend}%
                    </span>
                    <span className="text-xs text-muted-foreground">vs target {kpiData.punctuality.target}%</span>
                  </div>
                  <Progress 
                    value={(kpiData.punctuality.current / kpiData.punctuality.target) * 100} 
                    className="mt-3 h-2" 
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Mileage Balance</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{kpiData.mileageBalance.current}%</div>
                  <div className="flex items-center gap-2 mt-2">
                    {getTrendIcon(kpiData.mileageBalance.trend)}
                    <span className={`text-sm ${getTrendColor(kpiData.mileageBalance.trend)}`}>
                      {kpiData.mileageBalance.trend > 0 ? '+' : ''}{kpiData.mileageBalance.trend}%
                    </span>
                    <span className="text-xs text-muted-foreground">variance: {kpiData.mileageBalance.variance.toLocaleString()} km</span>
                  </div>
                  <Progress 
                    value={(kpiData.mileageBalance.current / kpiData.mileageBalance.target) * 100} 
                    className="mt-3 h-2" 
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Branding Fulfillment</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{kpiData.brandingFulfillment.current}%</div>
                  <div className="flex items-center gap-2 mt-2">
                    {getTrendIcon(kpiData.brandingFulfillment.trend)}
                    <span className={`text-sm ${getTrendColor(kpiData.brandingFulfillment.trend)}`}>
                      {kpiData.brandingFulfillment.trend > 0 ? '+' : ''}{kpiData.brandingFulfillment.trend}%
                    </span>
                    <span className="text-xs text-muted-foreground">₹{(kpiData.brandingFulfillment.revenue / 100000).toFixed(1)}L revenue</span>
                  </div>
                  <Progress 
                    value={(kpiData.brandingFulfillment.current / kpiData.brandingFulfillment.target) * 100} 
                    className="mt-3 h-2" 
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Maintenance Compliance</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{kpiData.maintenanceCompliance.current}%</div>
                  <div className="flex items-center gap-2 mt-2">
                    {getTrendIcon(kpiData.maintenanceCompliance.trend)}
                    <span className={`text-sm ${getTrendColor(kpiData.maintenanceCompliance.trend)}`}>
                      {kpiData.maintenanceCompliance.trend > 0 ? '+' : ''}{kpiData.maintenanceCompliance.trend}%
                    </span>
                    <span className="text-xs text-muted-foreground">{kpiData.maintenanceCompliance.overdue} overdue</span>
                  </div>
                  <Progress 
                    value={(kpiData.maintenanceCompliance.current / kpiData.maintenanceCompliance.target) * 100} 
                    className="mt-3 h-2" 
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Energy Efficiency</CardTitle>
                  <Zap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{kpiData.energyEfficiency.current}%</div>
                  <div className="flex items-center gap-2 mt-2">
                    {getTrendIcon(kpiData.energyEfficiency.trend)}
                    <span className={`text-sm ${getTrendColor(kpiData.energyEfficiency.trend)}`}>
                      {kpiData.energyEfficiency.trend > 0 ? '+' : ''}{kpiData.energyEfficiency.trend}%
                    </span>
                    <span className="text-xs text-muted-foreground">₹{(kpiData.energyEfficiency.savings / 1000).toFixed(0)}K saved</span>
                  </div>
                  <Progress 
                    value={(kpiData.energyEfficiency.current / kpiData.energyEfficiency.target) * 100} 
                    className="mt-3 h-2" 
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Overall Score</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">92.3%</div>
                  <div className="flex items-center gap-2 mt-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-600">+1.8%</span>
                    <span className="text-xs text-muted-foreground">composite score</span>
                  </div>
                  <Progress value={92.3} className="mt-3 h-2" />
                </CardContent>
              </Card>
            </div>

            {/* Detailed KPI Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5" />
                  KPI Trends
                </CardTitle>
                <CardDescription>Performance trends over the selected time period</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
                  <div className="text-center">
                    <LineChart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Interactive Charts Coming Soon</h3>
                    <p className="text-muted-foreground">
                      Advanced charting and visualization will be available here
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="operational" className="space-y-6">
            {/* Operational Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Plans Generated</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{operationalMetrics.totalPlansGenerated}</div>
                  <p className="text-xs text-muted-foreground">Total plans this period</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Generation Time</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{operationalMetrics.avgPlanGenerationTime}s</div>
                  <p className="text-xs text-muted-foreground">Per plan generation</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Override Rate</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{operationalMetrics.overrideRate}%</div>
                  <p className="text-xs text-muted-foreground">{operationalMetrics.supervisorOverrides} overrides</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{operationalMetrics.systemUptime}%</div>
                  <p className="text-xs text-muted-foreground">Availability this period</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Data Quality</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{operationalMetrics.dataQualityScore}%</div>
                  <p className="text-xs text-muted-foreground">Overall data quality</p>
                </CardContent>
              </Card>
            </div>

            {/* System Performance Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  System Performance
                </CardTitle>
                <CardDescription>Operational metrics and system health over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Performance Charts Coming Soon</h3>
                    <p className="text-muted-foreground">
                      Detailed performance analytics will be available here
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fleet" className="space-y-6">
            {/* Fleet Analytics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Fleet Size</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{fleetMetrics.totalTrainsets}</div>
                  <p className="text-xs text-muted-foreground">Active trainsets</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Mileage</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{fleetMetrics.averageMileage.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">km per trainset</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Maintenance Hours</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{fleetMetrics.maintenanceHours}</div>
                  <p className="text-xs text-muted-foreground">Total hours this period</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Cleaning Cycles</CardTitle>
                  <Zap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{fleetMetrics.cleaningCycles}</div>
                  <p className="text-xs text-muted-foreground">Completed this period</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{fleetMetrics.criticalIssues}</div>
                  <p className="text-xs text-muted-foreground">Require immediate attention</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Warning Issues</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">{fleetMetrics.warningIssues}</div>
                  <p className="text-xs text-muted-foreground">Need monitoring</p>
                </CardContent>
              </Card>
            </div>

            {/* Fleet Health Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Fleet Health Distribution
                </CardTitle>
                <CardDescription>Current status distribution across the fleet</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Healthy</span>
                    <div className="flex items-center gap-2">
                      <Progress value={70} className="w-32 h-2" />
                      <span className="text-sm">21 trainsets</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Warning</span>
                    <div className="flex items-center gap-2">
                      <Progress value={27} className="w-32 h-2" />
                      <span className="text-sm">8 trainsets</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Critical</span>
                    <div className="flex items-center gap-2">
                      <Progress value={7} className="w-32 h-2" />
                      <span className="text-sm">2 trainsets</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Trends & Forecasting
                </CardTitle>
                <CardDescription>Predictive analytics and trend analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <LineChart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Advanced Analytics Coming Soon</h3>
                  <p className="text-muted-foreground">
                    Predictive modeling and trend forecasting will be available here
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
    </>
  );
};

export default Analytics;
