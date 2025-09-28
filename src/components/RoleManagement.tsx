import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Settings, Shield, User, Crown, Plus, Edit } from 'lucide-react';

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface RolePermission {
  role: string;
  permissions: Permission[];
}

const RoleManagement = () => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const roles = [
    { value: 'admin', label: 'Admin', icon: Crown },
    { value: 'manager', label: 'Manager', icon: Shield },
    { value: 'supervisor', label: 'Supervisor', icon: Settings },
    { value: 'clerk', label: 'Clerk', icon: User },
  ];

  useEffect(() => {
    fetchPermissions();
    fetchRolePermissions();
  }, []);

  const fetchPermissions = async () => {
    try {
      const { data, error } = await supabase
        .from('permissions')
        .select('*')
        .order('category', { ascending: true });

      if (error) throw error;
      setPermissions(data || []);
    } catch (error) {
      console.error('Error fetching permissions:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch permissions',
        variant: 'destructive',
      });
    }
  };

  const fetchRolePermissions = async () => {
    try {
      const { data, error } = await supabase
        .from('role_permissions')
        .select(`
          role,
          permissions:permission_id (
            id,
            name,
            description,
            category
          )
        `);

      if (error) throw error;

      const grouped = data?.reduce((acc: { [key: string]: Permission[] }, item) => {
        const role = item.role;
        if (!acc[role]) acc[role] = [];
        if (item.permissions) acc[role].push(item.permissions as unknown as Permission);
        return acc;
      }, {});

      const rolePermissionsList = Object.entries(grouped || {}).map(([role, permissions]) => ({
        role,
        permissions: permissions as Permission[]
      }));

      setRolePermissions(rolePermissionsList);
    } catch (error) {
      console.error('Error fetching role permissions:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch role permissions',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSelect = (role: string) => {
    setSelectedRole(role);
    const rolePerms = rolePermissions.find(rp => rp.role === role);
    setSelectedPermissions(rolePerms?.permissions.map(p => p.id) || []);
  };

  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    setSelectedPermissions(prev => 
      checked 
        ? [...prev, permissionId]
        : prev.filter(id => id !== permissionId)
    );
  };

  const saveRolePermissions = async () => {
    try {
      // Delete existing permissions for this role
      const { error: deleteError } = await supabase
        .from('role_permissions')
        .delete()
        .eq('role', selectedRole as 'admin' | 'manager' | 'supervisor' | 'clerk');

      if (deleteError) throw deleteError;

      // Insert new permissions
      if (selectedPermissions.length > 0) {
        const { error: insertError } = await supabase
          .from('role_permissions')
          .insert(
            selectedPermissions.map(permissionId => ({
              role: selectedRole as 'admin' | 'manager' | 'supervisor' | 'clerk',
              permission_id: permissionId
            }))
          );

        if (insertError) throw insertError;
      }

      toast({
        title: 'Success',
        description: 'Role permissions updated successfully',
      });

      fetchRolePermissions();
      setSelectedRole('');
      setSelectedPermissions([]);
    } catch (error) {
      console.error('Error saving role permissions:', error);
      toast({
        title: 'Error',
        description: 'Failed to update role permissions',
        variant: 'destructive',
      });
    }
  };

  const getRoleIcon = (role: string) => {
    const roleData = roles.find(r => r.value === role);
    const IconComponent = roleData?.icon || User;
    return <IconComponent className="h-4 w-4" />;
  };

  const getRoleLabel = (role: string) => {
    return roles.find(r => r.value === role)?.label || role;
  };

  const groupedPermissions = permissions.reduce((acc: { [key: string]: Permission[] }, permission) => {
    if (!acc[permission.category]) acc[permission.category] = [];
    acc[permission.category].push(permission);
    return acc;
  }, {});

  if (loading) {
    return <div>Loading role management...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Role & Permission Management</h2>
          <p className="text-muted-foreground">
            Configure role-based access control and permissions
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Edit className="h-4 w-4 mr-2" />
              Edit Role Permissions
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Edit Role Permissions</DialogTitle>
              <DialogDescription>
                Select a role and configure its permissions
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Select value={selectedRole} onValueChange={handleRoleSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role to edit" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      <div className="flex items-center gap-2">
                        <role.icon className="h-4 w-4" />
                        {role.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedRole && (
                <div className="space-y-4">
                  {Object.entries(groupedPermissions).map(([category, perms]) => (
                    <div key={category} className="space-y-2">
                      <h4 className="font-medium capitalize">{category} Permissions</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {perms.map((permission) => (
                          <div key={permission.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={permission.id}
                              checked={selectedPermissions.includes(permission.id)}
                              onCheckedChange={(checked) => 
                                handlePermissionChange(permission.id, !!checked)
                              }
                            />
                            <label 
                              htmlFor={permission.id} 
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {permission.description}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-end">
                    <Button onClick={saveRolePermissions}>
                      Save Permissions
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Current Role Permissions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {roles.map((role) => {
          const rolePerms = rolePermissions.find(rp => rp.role === role.value);
          return (
            <Card key={role.value}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <role.icon className="h-5 w-5" />
                  {role.label}
                </CardTitle>
                <CardDescription>
                  {rolePerms?.permissions.length || 0} permissions assigned
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {rolePerms?.permissions.map((permission) => (
                    <Badge key={permission.id} variant="outline" className="text-xs">
                      {permission.description}
                    </Badge>
                  ))}
                  {!rolePerms?.permissions.length && (
                    <p className="text-sm text-muted-foreground">No permissions assigned</p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default RoleManagement;