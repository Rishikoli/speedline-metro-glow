import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Wrench, 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  Calendar,
  Search,
  Filter,
  TrendingUp,
  Activity,
  Settings,
  FileText,
  Zap
} from 'lucide-react';
import { mockFleet } from '@/agents/mockData';
import Navbar from '@/components/Navbar';

const Maintenance = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedTrainset, setSelectedTrainset] = useState<string | null>(null);

  // Process mock data for maintenance view
  const maintenanceData = mockFleet.map(trainset => {
    const criticalWorkOrders = trainset.openWorkOrders.filter(wo => wo.type === 'critical');
    const preventiveWorkOrders = trainset.openWorkOrders.filter(wo => wo.type === 'preventive');
    const correctiveWorkOrders = trainset.openWorkOrders.filter(wo => wo.type === 'corrective');
    
    const systemIssues = Object.entries(trainset.systemHealth)
      .filter(([key, value]) => key !== 'lastUpdated' && value !== 'ok')
      .map(([system, status]) => ({ system, status }));

    const componentIssues = Object.entries(trainset.componentWear)
      .filter(([key, value]) => key !== 'lastInspection' && (value as number) > 80)
      .map(([component, wear]) => ({ component, wear: wear as number }));

    return {
      ...trainset,
      criticalWorkOrders,
      preventiveWorkOrders,
      correctiveWorkOrders,
      systemIssues,
      componentIssues,
      maintenanceScore: Math.max(0, 100 - (criticalWorkOrders.length * 30 + systemIssues.length * 20 + componentIssues.length * 10))
    };
  });

  const filteredTrainsets = maintenanceData.filter(trainset => {
    const matchesSearch = trainset.id.toLowerCase().includes(searchTerm.toLowerCase());
    let matchesFilter = true;
    
    switch (filterStatus) {
      case 'critical':
        matchesFilter = trainset.criticalWorkOrders.length > 0 || trainset.systemIssues.some(issue => issue.status === 'critical');
        break;
      case 'warning':
        matchesFilter = trainset.systemIssues.some(issue => issue.status === 'warn') || trainset.componentIssues.length > 0;
        break;
      case 'healthy':
        matchesFilter = trainset.criticalWorkOrders.length === 0 && trainset.systemIssues.length === 0;
        break;
    }
    
    return matchesSearch && matchesFilter;
  });

  const getMaintenanceStatus = (trainset: any) => {
    if (trainset.criticalWorkOrders.length > 0 || trainset.systemIssues.some((issue: any) => issue.status === 'critical')) {
      return { status: 'critical', color: 'text-red-600', bgColor: 'bg-red-50' };
    }
    if (trainset.systemIssues.length > 0 || trainset.componentIssues.length > 0) {
      return { status: 'warning', color: 'text-yellow-600', bgColor: 'bg-yellow-50' };
    }
    return { status: 'healthy', color: 'text-green-600', bgColor: 'bg-green-50' };
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'warning': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-600" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  // Calculate summary statistics
  const totalTrainsets = maintenanceData.length;
  const criticalCount = maintenanceData.filter(t => getMaintenanceStatus(t).status === 'critical').length;
  const warningCount = maintenanceData.filter(t => getMaintenanceStatus(t).status === 'warning').length;
  const healthyCount = maintenanceData.filter(t => getMaintenanceStatus(t).status === 'healthy').length;
  const totalWorkOrders = maintenanceData.reduce((sum, t) => sum + t.openWorkOrders.length, 0);
  const avgMaintenanceScore = maintenanceData.reduce((sum, t) => sum + t.maintenanceScore, 0) / totalTrainsets;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background p-6 pt-20">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Maintenance Management</h1>
            <p className="text-muted-foreground">Monitor and manage trainset maintenance activities</p>
          </div>
          <Button>
            <FileText className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Trainsets</CardTitle>
              <Wrench className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTrainsets}</div>
              <p className="text-xs text-muted-foreground">Fleet size</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{criticalCount}</div>
              <p className="text-xs text-muted-foreground">Require immediate attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Warnings</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{warningCount}</div>
              <p className="text-xs text-muted-foreground">Need monitoring</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Healthy</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{healthyCount}</div>
              <p className="text-xs text-muted-foreground">Operating normally</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Work Orders</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalWorkOrders}</div>
              <p className="text-xs text-muted-foreground">Open items</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="workorders">Work Orders</TabsTrigger>
            <TabsTrigger value="components">Component Health</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Fleet Health Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Fleet Health Overview
                </CardTitle>
                <CardDescription>Overall maintenance status and trends</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Critical Issues</span>
                      <span>{criticalCount}/{totalTrainsets}</span>
                    </div>
                    <Progress value={(criticalCount / totalTrainsets) * 100} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Warnings</span>
                      <span>{warningCount}/{totalTrainsets}</span>
                    </div>
                    <Progress value={(warningCount / totalTrainsets) * 100} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Healthy</span>
                      <span>{healthyCount}/{totalTrainsets}</span>
                    </div>
                    <Progress value={(healthyCount / totalTrainsets) * 100} className="h-2" />
                  </div>
                </div>
                <div className="pt-4">
                  <div className="text-sm font-medium mb-2">Average Maintenance Score</div>
                  <div className="flex items-center gap-2">
                    <Progress value={avgMaintenanceScore} className="h-3 flex-1" />
                    <span className="text-sm font-bold">{avgMaintenanceScore.toFixed(1)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Search and Filter */}
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
                  <div className="flex gap-2">
                    <Button
                      variant={filterStatus === 'all' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilterStatus('all')}
                    >
                      All
                    </Button>
                    <Button
                      variant={filterStatus === 'critical' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilterStatus('critical')}
                    >
                      Critical
                    </Button>
                    <Button
                      variant={filterStatus === 'warning' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilterStatus('warning')}
                    >
                      Warning
                    </Button>
                    <Button
                      variant={filterStatus === 'healthy' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilterStatus('healthy')}
                    >
                      Healthy
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Trainset List */}
            <Card>
              <CardHeader>
                <CardTitle>Trainset Status</CardTitle>
                <CardDescription>
                  {filteredTrainsets.length} of {totalTrainsets} trainsets
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {filteredTrainsets.map((trainset) => {
                    const status = getMaintenanceStatus(trainset);
                    return (
                      <div
                        key={trainset.id}
                        className={`p-4 border rounded-lg hover:bg-accent/50 cursor-pointer ${status.bgColor}`}
                        onClick={() => setSelectedTrainset(
                          selectedTrainset === trainset.id ? null : trainset.id
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            {getStatusIcon(status.status)}
                            <div>
                              <div className="font-medium">{trainset.id}</div>
                              <div className="text-sm text-muted-foreground">
                                {trainset.km.toLocaleString()} km • Last cleaned: {new Date(trainset.lastCleaningDate).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-right">
                              <div className="text-sm font-medium">Score: {trainset.maintenanceScore.toFixed(0)}%</div>
                              <div className="text-xs text-muted-foreground">
                                {trainset.openWorkOrders.length} work orders
                              </div>
                            </div>
                            <Badge variant={status.status === 'critical' ? 'destructive' : status.status === 'warning' ? 'secondary' : 'default'}>
                              {status.status}
                            </Badge>
                          </div>
                        </div>
                        
                        {selectedTrainset === trainset.id && (
                          <div className="mt-4 pt-4 border-t space-y-3">
                            {trainset.criticalWorkOrders.length > 0 && (
                              <div>
                                <h4 className="font-medium text-red-700 mb-2">Critical Work Orders</h4>
                                {trainset.criticalWorkOrders.map((wo) => (
                                  <div key={wo.id} className="text-sm bg-red-100 p-2 rounded mb-1">
                                    <div className="font-medium">{wo.system} - Priority {wo.priority}</div>
                                    <div className="text-red-700">{wo.description}</div>
                                    <div className="text-xs text-red-600">Due: {new Date(wo.dueDate).toLocaleDateString()}</div>
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            {trainset.systemIssues.length > 0 && (
                              <div>
                                <h4 className="font-medium text-yellow-700 mb-2">System Issues</h4>
                                <div className="flex flex-wrap gap-2">
                                  {trainset.systemIssues.map((issue, index) => (
                                    <Badge key={index} variant={issue.status === 'critical' ? 'destructive' : 'secondary'}>
                                      {issue.system}: {issue.status}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {trainset.componentIssues.length > 0 && (
                              <div>
                                <h4 className="font-medium text-blue-700 mb-2">Component Wear</h4>
                                <div className="grid grid-cols-2 gap-2">
                                  {trainset.componentIssues.map((component, index) => (
                                    <div key={index} className="text-sm">
                                      <div className="flex justify-between">
                                        <span className="capitalize">{component.component.replace(/([A-Z])/g, ' $1').trim()}</span>
                                        <span className="font-medium">{component.wear.toFixed(1)}%</span>
                                      </div>
                                      <Progress value={component.wear} className="h-1 mt-1" />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="workorders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Work Orders Management</CardTitle>
                <CardDescription>View and manage all maintenance work orders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Work Orders Coming Soon</h3>
                  <p className="text-muted-foreground">
                    Detailed work order management will be available here
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="components" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Component Health Monitoring</CardTitle>
                <CardDescription>Track component wear and replacement schedules</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Component Monitoring Coming Soon</h3>
                  <p className="text-muted-foreground">
                    Advanced component health tracking will be available here
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Maintenance Schedule</CardTitle>
                <CardDescription>Plan and schedule maintenance activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="text-center py-6 bg-muted/50 rounded-lg border">
                    <Calendar className="h-12 w-12 text-primary mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Maintenance Schedule</h2>
                    <p className="text-lg text-muted-foreground mb-6">
                      Plan and schedule maintenance activities
                    </p>
                    
                    <div className="max-w-2xl mx-auto p-6 bg-background rounded-lg border">
                      <div className="flex items-center justify-center space-x-2 mb-6">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                        <h3 className="text-lg font-semibold">Scheduling Coming Soon</h3>
                      </div>
                      <p className="text-muted-foreground text-center">
                        Maintenance scheduling interface will be available here
                      </p>
                    </div>
                  </div>
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

export default Maintenance;
