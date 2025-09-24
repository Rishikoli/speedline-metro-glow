import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  UserPlus, 
  Search, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Clock,
  Shield,
  Settings,
  Activity,
  Award,
  AlertCircle
} from 'lucide-react';
import Navbar from '@/components/Navbar';

const Team = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Mock team data
  const teamMembers = [
    {
      id: 1,
      name: 'Rajesh Kumar',
      role: 'Operations Manager',
      department: 'Operations',
      email: 'rajesh.kumar@kochimetro.com',
      phone: '+91 98765 43210',
      location: 'Kochi Central',
      avatar: '',
      status: 'online',
      lastActive: new Date(),
      permissions: ['plan_approval', 'override_authority', 'system_admin'],
      joinDate: '2022-01-15',
      shiftsThisWeek: 5,
      overridesThisMonth: 12,
      performance: 95
    },
    {
      id: 2,
      name: 'Priya Nair',
      role: 'Maintenance Supervisor',
      department: 'Maintenance',
      email: 'priya.nair@kochimetro.com',
      phone: '+91 98765 43211',
      location: 'Depot Workshop',
      avatar: '',
      status: 'online',
      lastActive: new Date(Date.now() - 30 * 60 * 1000),
      permissions: ['maintenance_scheduling', 'work_order_management'],
      joinDate: '2021-08-20',
      shiftsThisWeek: 6,
      overridesThisMonth: 3,
      performance: 92
    },
    {
      id: 3,
      name: 'Arjun Menon',
      role: 'Data Analyst',
      department: 'Analytics',
      email: 'arjun.menon@kochimetro.com',
      phone: '+91 98765 43212',
      location: 'Control Center',
      avatar: '',
      status: 'away',
      lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000),
      permissions: ['analytics_access', 'report_generation'],
      joinDate: '2023-03-10',
      shiftsThisWeek: 5,
      overridesThisMonth: 0,
      performance: 88
    },
    {
      id: 4,
      name: 'Lakshmi Pillai',
      role: 'Safety Officer',
      department: 'Safety',
      email: 'lakshmi.pillai@kochimetro.com',
      phone: '+91 98765 43213',
      location: 'Safety Department',
      avatar: '',
      status: 'offline',
      lastActive: new Date(Date.now() - 8 * 60 * 60 * 1000),
      permissions: ['safety_audit', 'incident_management'],
      joinDate: '2021-11-05',
      shiftsThisWeek: 4,
      overridesThisMonth: 1,
      performance: 97
    },
    {
      id: 5,
      name: 'Suresh Babu',
      role: 'Cleaning Supervisor',
      department: 'Operations',
      email: 'suresh.babu@kochimetro.com',
      phone: '+91 98765 43214',
      location: 'Cleaning Bay',
      avatar: '',
      status: 'online',
      lastActive: new Date(Date.now() - 15 * 60 * 1000),
      permissions: ['cleaning_schedule', 'crew_management'],
      joinDate: '2022-06-12',
      shiftsThisWeek: 6,
      overridesThisMonth: 2,
      performance: 90
    },
    {
      id: 6,
      name: 'Deepa Thomas',
      role: 'System Administrator',
      department: 'IT',
      email: 'deepa.thomas@kochimetro.com',
      phone: '+91 98765 43215',
      location: 'IT Department',
      avatar: '',
      status: 'online',
      lastActive: new Date(Date.now() - 5 * 60 * 1000),
      permissions: ['system_admin', 'user_management', 'backup_management'],
      joinDate: '2020-09-18',
      shiftsThisWeek: 5,
      overridesThisMonth: 0,
      performance: 94
    }
  ];

  const departments = [
    { name: 'Operations', count: 2, color: 'bg-blue-100 text-blue-800' },
    { name: 'Maintenance', count: 1, color: 'bg-yellow-100 text-yellow-800' },
    { name: 'Analytics', count: 1, color: 'bg-green-100 text-green-800' },
    { name: 'Safety', count: 1, color: 'bg-red-100 text-red-800' },
    { name: 'IT', count: 1, color: 'bg-purple-100 text-purple-800' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online': return 'Online';
      case 'away': return 'Away';
      case 'offline': return 'Offline';
      default: return 'Unknown';
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatLastActive = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  const filteredMembers = teamMembers.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background p-6 pt-20">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Team Management</h1>
            <p className="text-muted-foreground">Manage team members, roles, and permissions</p>
          </div>
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Member
          </Button>
        </div>

        {/* Team Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teamMembers.length}</div>
              <p className="text-xs text-muted-foreground">Active team members</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Online Now</CardTitle>
              <Activity className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {teamMembers.filter(m => m.status === 'online').length}
              </div>
              <p className="text-xs text-muted-foreground">Currently active</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Departments</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{departments.length}</div>
              <p className="text-xs text-muted-foreground">Active departments</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Performance</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(teamMembers.reduce((sum, m) => sum + m.performance, 0) / teamMembers.length)}%
              </div>
              <p className="text-xs text-muted-foreground">Team performance</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="members" className="space-y-6">
          <TabsList>
            <TabsTrigger value="members">Team Members</TabsTrigger>
            <TabsTrigger value="departments">Departments</TabsTrigger>
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
            <TabsTrigger value="activity">Activity Log</TabsTrigger>
          </TabsList>

          <TabsContent value="members" className="space-y-6">
            {/* Search */}
            <Card>
              <CardContent className="pt-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search team members..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Team Members Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMembers.map((member) => (
                <Card key={member.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={member.avatar} alt={member.name} />
                          <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                        </Avatar>
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(member.status)}`}></div>
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{member.name}</CardTitle>
                        <CardDescription>{member.role}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge className={departments.find(d => d.name === member.department)?.color}>
                        {member.department}
                      </Badge>
                      <Badge variant="outline">
                        {getStatusText(member.status)}
                      </Badge>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="truncate">{member.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{member.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{member.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>Last active: {formatLastActive(member.lastActive)}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-sm">
                      <div>
                        <div className="font-semibold">{member.shiftsThisWeek}</div>
                        <div className="text-muted-foreground">Shifts</div>
                      </div>
                      <div>
                        <div className="font-semibold">{member.overridesThisMonth}</div>
                        <div className="text-muted-foreground">Overrides</div>
                      </div>
                      <div>
                        <div className="font-semibold">{member.performance}%</div>
                        <div className="text-muted-foreground">Score</div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Mail className="h-4 w-4 mr-2" />
                        Message
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="departments" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {departments.map((dept) => (
                <Card key={dept.name}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {dept.name}
                      <Badge className={dept.color}>{dept.count} members</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {teamMembers
                        .filter(member => member.department === dept.name)
                        .map(member => (
                          <div key={member.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs">{getInitials(member.name)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="font-medium text-sm">{member.name}</div>
                              <div className="text-xs text-muted-foreground">{member.role}</div>
                            </div>
                            <div className={`w-2 h-2 rounded-full ${getStatusColor(member.status)}`}></div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="permissions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Permission Management
                </CardTitle>
                <CardDescription>Manage user roles and system permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Permission Management Coming Soon</h3>
                  <p className="text-muted-foreground">
                    Advanced permission and role management will be available here
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Team Activity Log
                </CardTitle>
                <CardDescription>Recent team activities and system interactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Mock activity entries */}
                  <div className="flex items-start gap-3 p-3 border rounded-lg">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>RK</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="text-sm font-medium">Rajesh Kumar approved Plan PLAN-1732419622000</div>
                      <div className="text-xs text-muted-foreground">2 hours ago</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 border rounded-lg">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>PN</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="text-sm font-medium">Priya Nair updated maintenance schedule for TS-105</div>
                      <div className="text-xs text-muted-foreground">4 hours ago</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 border rounded-lg">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>AM</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="text-sm font-medium">Arjun Menon generated analytics report</div>
                      <div className="text-xs text-muted-foreground">6 hours ago</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 border rounded-lg">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>SB</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="text-sm font-medium">Suresh Babu scheduled cleaning for 4 trainsets</div>
                      <div className="text-xs text-muted-foreground">8 hours ago</div>
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

export default Team;
