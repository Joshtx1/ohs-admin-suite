import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { 
  UserCog, 
  Shield, 
  User, 
  Search, 
  Crown, 
  Settings,
  Eye,
  Plus,
  Filter
} from 'lucide-react';

interface UserProfile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  created_at: string;
  user_roles?: { role: string }[];
}

const Users = () => {
  const { userRole } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  // Map old roles to new Dash system roles for display
  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin': return 'Master';
      case 'staff': return 'Admin';
      case 'user': return 'Clerk';
      default: return role.charAt(0).toUpperCase() + role.slice(1);
    }
  };

  const getRoleValue = (displayName: string) => {
    switch (displayName) {
      case 'Master': return 'admin';
      case 'Admin': return 'staff';
      case 'Manager': return 'staff'; // Map Manager to staff for now
      case 'Clerk': return 'user';
      default: return 'user';
    }
  };

  useEffect(() => {
    if (userRole !== 'admin') {
      toast({
        title: 'Access Denied',
        description: 'You need master or admin privileges to view this page',
        variant: 'destructive',
      });
      return;
    }
    fetchUsers();
  }, [userRole]);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter]);

  const fetchUsers = async () => {
    try {
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      const usersWithRoles = profilesData?.map(profile => ({
        ...profile,
        user_roles: rolesData?.filter(role => role.user_id === profile.user_id) || []
      })) || [];

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch users',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user => 
        `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => {
        const currentRole = user.user_roles?.[0]?.role || 'user';
        const displayRole = getRoleDisplayName(currentRole);
        return displayRole.toLowerCase() === roleFilter.toLowerCase();
      });
    }

    setFilteredUsers(filtered);
  };

  const handleRoleChange = async (userId: string, newDisplayRole: string) => {
    try {
      const newRole = getRoleValue(newDisplayRole);
      
      // First, delete existing roles for this user
      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      if (deleteError) throw deleteError;

      // Then insert the new role
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert([{
          user_id: userId,
          role: newRole as 'admin' | 'staff' | 'user',
        }]);

      if (insertError) throw insertError;

      toast({
        title: 'Success',
        description: `User role updated to ${newDisplayRole}`,
      });
      
      fetchUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: 'Error',
        description: 'Failed to update user role',
        variant: 'destructive',
      });
    }
  };

  const getRoleIcon = (role: string) => {
    const displayRole = getRoleDisplayName(role);
    switch (displayRole) {
      case 'Master':
        return <Crown className="h-4 w-4" />;
      case 'Admin':
        return <Shield className="h-4 w-4" />;
      case 'Manager':
        return <Settings className="h-4 w-4" />;
      case 'Clerk':
        return <User className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    const displayRole = getRoleDisplayName(role);
    switch (displayRole) {
      case 'Master':
        return 'default';
      case 'Admin':
        return 'secondary';
      case 'Manager':
        return 'outline';
      case 'Clerk':
        return 'outline';
      default:
        return 'outline';
    }
  };

  if (userRole !== 'admin') {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Access Denied</h1>
          <p className="text-muted-foreground">
            You need Master or Admin privileges to access Dash System User Management.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div>Loading Dash System users...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dash System User Management</h1>
        <p className="text-muted-foreground">
          Manage internal Dash System users, roles, and permissions
        </p>
      </div>

      {/* Search and Filter Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="master">Master</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="clerk">Clerk</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserCog className="h-5 w-5" />
              Dash System Users
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Eye className="h-4 w-4" />
              Showing {filteredUsers.length} of {users.length} users
            </div>
          </CardTitle>
          <CardDescription>
            Internal system users with administrative and operational access
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Access Level</TableHead>
                <TableHead>Member Since</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => {
                const currentRole = user.user_roles?.[0]?.role || 'user';
                const displayRole = getRoleDisplayName(currentRole);
                return (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {`${user.first_name} ${user.last_name}`.trim() || 'Unnamed User'}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone || '-'}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={getRoleBadgeVariant(currentRole)}
                        className="flex items-center gap-1 w-fit"
                      >
                        {getRoleIcon(currentRole)}
                        {displayRole}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs text-muted-foreground">
                        {displayRole === 'Master' && 'Full System Control'}
                        {displayRole === 'Admin' && 'Administrative Access'}
                        {displayRole === 'Manager' && 'Supervisory Access'}
                        {displayRole === 'Clerk' && 'Operational Access'}
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={displayRole}
                        onValueChange={(newRole) => handleRoleChange(user.user_id, newRole)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Master">Master</SelectItem>
                          <SelectItem value="Admin">Admin</SelectItem>
                          <SelectItem value="Manager">Manager</SelectItem>
                          <SelectItem value="Clerk">Clerk</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Role Descriptions */}
      <Card>
        <CardHeader>
          <CardTitle>Dash System Role Hierarchy</CardTitle>
          <CardDescription>
            Internal user roles and their system permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-3 rounded-lg border">
              <Badge variant="default" className="flex items-center gap-1 mt-0.5">
                <Crown className="h-3 w-3" />
                MASTER
              </Badge>
              <div>
                <h4 className="font-medium">System Master</h4>
                <p className="text-sm text-muted-foreground">
                  Complete system control, user management, all administrative functions, system configuration
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 rounded-lg border">
              <Badge variant="secondary" className="flex items-center gap-1 mt-0.5">
                <Shield className="h-3 w-3" />
                ADMIN
              </Badge>
              <div>
                <h4 className="font-medium">Administrator</h4>
                <p className="text-sm text-muted-foreground">
                  Manage clients, trainees, services, assignments, and operational data
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 rounded-lg border">
              <Badge variant="outline" className="flex items-center gap-1 mt-0.5">
                <Settings className="h-3 w-3" />
                MANAGER
              </Badge>
              <div>
                <h4 className="font-medium">Manager</h4>
                <p className="text-sm text-muted-foreground">
                  Supervisory access to operations, can assign trainees and approve services
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 rounded-lg border">
              <Badge variant="outline" className="flex items-center gap-1 mt-0.5">
                <User className="h-3 w-3" />
                CLERK
              </Badge>
              <div>
                <h4 className="font-medium">Clerk</h4>
                <p className="text-sm text-muted-foreground">
                  Operational access to view and process daily tasks, data entry
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Users;