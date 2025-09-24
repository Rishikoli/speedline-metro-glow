import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  FileText, 
  Download, 
  Calendar as CalendarIcon, 
  Filter, 
  Search,
  BarChart3,
  PieChart,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  Users,
  Train,
  Settings,
  Eye,
  Share
} from 'lucide-react';
import { format } from 'date-fns';
import Navbar from '@/components/Navbar';

const Reports = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined
  });

  // Mock reports data
  const reports = [
    {
      id: 1,
      title: 'Daily Operations Summary',
      type: 'operational',
      description: 'Comprehensive daily operations report including KPIs and performance metrics',
      generatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      generatedBy: 'System Auto-Generate',
      status: 'completed',
      size: '2.4 MB',
      format: 'PDF',
      downloads: 23,
      category: 'Daily Reports'
    },
    {
      id: 2,
      title: 'Weekly Maintenance Analysis',
      type: 'maintenance',
      description: 'Detailed analysis of maintenance activities, work orders, and component health',
      generatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      generatedBy: 'Priya Nair',
      status: 'completed',
      size: '5.7 MB',
      format: 'PDF',
      downloads: 15,
      category: 'Maintenance Reports'
    },
    {
      id: 3,
      title: 'Fleet Performance Dashboard',
      type: 'analytics',
      description: 'Interactive dashboard showing fleet performance trends and analytics',
      generatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
      generatedBy: 'Arjun Menon',
      status: 'completed',
      size: '1.2 MB',
      format: 'HTML',
      downloads: 45,
      category: 'Analytics Reports'
    },
    {
      id: 4,
      title: 'Monthly KPI Report',
      type: 'kpi',
      description: 'Monthly key performance indicators and trend analysis',
      generatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
      generatedBy: 'System Auto-Generate',
      status: 'generating',
      size: '-',
      format: 'PDF',
      downloads: 0,
      category: 'KPI Reports'
    },
    {
      id: 5,
      title: 'Safety Compliance Audit',
      type: 'safety',
      description: 'Comprehensive safety audit report with compliance status',
      generatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      generatedBy: 'Lakshmi Pillai',
      status: 'completed',
      size: '3.8 MB',
      format: 'PDF',
      downloads: 8,
      category: 'Safety Reports'
    },
    {
      id: 6,
      title: 'Energy Efficiency Analysis',
      type: 'energy',
      description: 'Analysis of energy consumption patterns and efficiency metrics',
      generatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      generatedBy: 'System Auto-Generate',
      status: 'completed',
      size: '1.9 MB',
      format: 'Excel',
      downloads: 12,
      category: 'Energy Reports'
    },
    {
      id: 7,
      title: 'Passenger Flow Report',
      type: 'passenger',
      description: 'Passenger flow patterns and capacity utilization analysis',
      generatedAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
      generatedBy: 'System Auto-Generate',
      status: 'failed',
      size: '-',
      format: 'PDF',
      downloads: 0,
      category: 'Passenger Reports'
    },
    {
      id: 8,
      title: 'Financial Performance Summary',
      type: 'financial',
      description: 'Revenue, costs, and financial performance indicators',
      generatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
      generatedBy: 'Finance Team',
      status: 'completed',
      size: '4.2 MB',
      format: 'Excel',
      downloads: 31,
      category: 'Financial Reports'
    }
  ];

  const reportTemplates = [
    {
      id: 1,
      name: 'Operations Summary',
      description: 'Daily/Weekly/Monthly operations overview',
      icon: <BarChart3 className="h-6 w-6" />,
      category: 'Operational',
      frequency: 'Daily, Weekly, Monthly'
    },
    {
      id: 2,
      name: 'Maintenance Report',
      description: 'Maintenance activities and component health',
      icon: <Settings className="h-6 w-6" />,
      category: 'Maintenance',
      frequency: 'Weekly, Monthly'
    },
    {
      id: 3,
      name: 'KPI Dashboard',
      description: 'Key performance indicators and trends',
      icon: <TrendingUp className="h-6 w-6" />,
      category: 'Analytics',
      frequency: 'Daily, Weekly, Monthly'
    },
    {
      id: 4,
      name: 'Safety Audit',
      description: 'Safety compliance and incident reports',
      icon: <AlertTriangle className="h-6 w-6" />,
      category: 'Safety',
      frequency: 'Monthly, Quarterly'
    },
    {
      id: 5,
      name: 'Fleet Analysis',
      description: 'Fleet performance and utilization',
      icon: <Train className="h-6 w-6" />,
      category: 'Fleet',
      frequency: 'Weekly, Monthly'
    },
    {
      id: 6,
      name: 'Team Performance',
      description: 'Staff performance and productivity metrics',
      icon: <Users className="h-6 w-6" />,
      category: 'HR',
      frequency: 'Monthly, Quarterly'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'generating': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'generating': return <Clock className="h-4 w-4 text-blue-600 animate-spin" />;
      case 'failed': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'operational': return <BarChart3 className="h-4 w-4" />;
      case 'maintenance': return <Settings className="h-4 w-4" />;
      case 'analytics': return <TrendingUp className="h-4 w-4" />;
      case 'safety': return <AlertTriangle className="h-4 w-4" />;
      case 'energy': return <PieChart className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || report.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background p-6 pt-20">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Reports & Analytics</h1>
            <p className="text-muted-foreground">Generate, view, and manage operational reports</p>
          </div>
          <Button>
            <FileText className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reports.length}</div>
              <p className="text-xs text-muted-foreground">Generated reports</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {reports.filter(r => r.status === 'completed').length}
              </div>
              <p className="text-xs text-muted-foreground">Ready for download</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Clock className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {reports.filter(r => r.status === 'generating').length}
              </div>
              <p className="text-xs text-muted-foreground">Currently generating</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Downloads</CardTitle>
              <Download className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {reports.reduce((sum, r) => sum + r.downloads, 0)}
              </div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="reports" className="space-y-6">
          <TabsList>
            <TabsTrigger value="reports">Generated Reports</TabsTrigger>
            <TabsTrigger value="templates">Report Templates</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled Reports</TabsTrigger>
            <TabsTrigger value="analytics">Report Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="reports" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search reports..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-48">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="operational">Operational</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="analytics">Analytics</SelectItem>
                      <SelectItem value="safety">Safety</SelectItem>
                      <SelectItem value="financial">Financial</SelectItem>
                    </SelectContent>
                  </Select>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-48">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        Date Range
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="range"
                        selected={dateRange}
                        onSelect={(range) => setDateRange({ from: range?.from, to: range?.to })}
                        numberOfMonths={2}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </CardContent>
            </Card>

            {/* Reports List */}
            <div className="space-y-4">
              {filteredReports.map((report) => (
                <Card key={report.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          {getTypeIcon(report.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg">{report.title}</h3>
                            <Badge className={getStatusColor(report.status)}>
                              {report.status}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground mb-3">{report.description}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>Generated by {report.generatedBy}</span>
                            <span>•</span>
                            <span>{formatDate(report.generatedAt)}</span>
                            <span>•</span>
                            <span>{report.format}</span>
                            {report.size !== '-' && (
                              <>
                                <span>•</span>
                                <span>{report.size}</span>
                              </>
                            )}
                            <span>•</span>
                            <span>{report.downloads} downloads</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(report.status)}
                        {report.status === 'completed' && (
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Button>
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                            <Button variant="outline" size="sm">
                              <Share className="h-4 w-4 mr-2" />
                              Share
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Report Templates</CardTitle>
                <CardDescription>Pre-configured report templates for quick generation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {reportTemplates.map((template) => (
                    <Card key={template.id} className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            {template.icon}
                          </div>
                          <div>
                            <CardTitle className="text-lg">{template.name}</CardTitle>
                            <Badge variant="outline">{template.category}</Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground mb-4">{template.description}</p>
                        <div className="text-sm text-muted-foreground mb-4">
                          <strong>Frequency:</strong> {template.frequency}
                        </div>
                        <Button className="w-full">
                          <FileText className="h-4 w-4 mr-2" />
                          Generate Report
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="scheduled" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  Scheduled Reports
                </CardTitle>
                <CardDescription>Automated report generation schedules</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Scheduled Reports Coming Soon</h3>
                  <p className="text-muted-foreground">
                    Automated report scheduling will be available here
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Report Analytics
                </CardTitle>
                <CardDescription>Usage statistics and report performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Report Analytics Coming Soon</h3>
                  <p className="text-muted-foreground">
                    Detailed report usage analytics will be available here
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

export default Reports;
