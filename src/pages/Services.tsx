import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { DataTable } from '@/components/common/DataTable';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Search, Download, Filter } from 'lucide-react';
import { z } from 'zod';
import { getStatusBadgeVariant, getStatusDisplay } from '@/lib/status';

const serviceSchema = z.object({
  service_code: z.string().min(1, 'Service code is required').max(20),
  name: z.string().min(1, 'Service name is required').max(255),
  description: z.string().max(1000).optional(),
  category: z.string().min(1, 'Category is required').max(100),
  duration_minutes: z.number().min(1, 'Duration must be at least 1 minute'),
  member_price: z.number().min(0, 'Member price must be 0 or greater'),
  non_member_price: z.number().min(0, 'Non-member price must be 0 or greater'),
  valid_for_days: z.number().min(0, 'Valid for days must be 0 or greater'),
  status: z.string().min(1, 'Status is required'),
  is_active: z.boolean().default(true),
  department: z.string().optional(),
  room: z.string().optional(),
});

interface Service {
  id: string;
  service_code: string;
  name: string;
  description?: string;
  category: string;
  duration_minutes: number;
  member_price: number;
  non_member_price: number;
  valid_for_days: number;
  status: string;
  is_active: boolean;
  department?: string;
  room?: string;
  created_at: string;
  updated_at: string;
}

const Services = () => {
  const { user, userRole } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    service_code: '',
    name: '',
    description: '',
    category: '',
    duration_minutes: '60',
    member_price: '20',
    non_member_price: '30',
    valid_for_days: '0',
    status: 'active',
    is_active: true,
    department: '',
    room: '',
  });
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const serviceCategories = [
    'AUDIO',
    'DRUG AND ALCOHOL',
    'LAB',
    'MEQ',
    'MISC',
    'PHYSICAL FCE',
    'RESPIRATOR FIT',
    'VISION'
  ];

  const departmentOptions = [
    'Admin',
    'Drug&Alcohol',
    'Vitals',
    'Fit/PFT',
    'Audio',
    'Labs',
    'Physical/FCE',
    'Training'
  ];

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    filterServices();
  }, [services, searchTerm, statusFilter, categoryFilter]);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setServices(data || []);
      setFilteredServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch services',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filterServices = () => {
    let filtered = services;

    // Filter by search term (service code, name, or description)
    if (searchTerm) {
      filtered = filtered.filter(service =>
        service.service_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (service.description && service.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(service =>
        statusFilter === 'active' ? service.is_active : !service.is_active
      );
    }

    // Filter by category
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(service => service.category === categoryFilter);
    }

    setFilteredServices(filtered);
  };

  const resetForm = () => {
    setFormData({
      service_code: '',
      name: '',
      description: '',
      category: '',
      duration_minutes: '60',
      member_price: '20',
      non_member_price: '30',
      valid_for_days: '0',
      status: 'active',
      department: '',
      room: '',
      is_active: true,
    });
    setEditingService(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const processedData = {
        ...formData,
        duration_minutes: parseInt(formData.duration_minutes),
        member_price: parseFloat(formData.member_price),
        non_member_price: parseFloat(formData.non_member_price),
        valid_for_days: parseInt(formData.valid_for_days),
      };

      const validatedData = serviceSchema.parse(processedData);

      if (editingService) {
        const { error } = await supabase
          .from('services')
          .update(validatedData)
          .eq('id', editingService.id);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Service updated successfully',
        });
      } else {
        const { error } = await supabase
          .from('services')
          .insert([{
            service_code: validatedData.service_code,
            name: validatedData.name,
            description: validatedData.description,
            category: validatedData.category,
            duration_minutes: validatedData.duration_minutes,
            member_price: validatedData.member_price,
            non_member_price: validatedData.non_member_price,
            valid_for_days: validatedData.valid_for_days,
            status: validatedData.status,
            is_active: validatedData.is_active,
            created_by: user?.id,
          }]);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Service created successfully',
        });
      }

      setDialogOpen(false);
      resetForm();
      fetchServices();
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: 'Validation Error',
          description: error.errors[0].message,
          variant: 'destructive',
        });
      } else {
        console.error('Error saving service:', error);
        toast({
          title: 'Error',
          description: 'Failed to save service',
          variant: 'destructive',
        });
      }
    }
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      service_code: service.service_code,
      name: service.name,
      description: service.description || '',
      category: service.category,
      duration_minutes: service.duration_minutes.toString(),
      member_price: service.member_price?.toString() || '20',
      non_member_price: service.non_member_price?.toString() || '30',
      valid_for_days: service.valid_for_days?.toString() || '0',
      status: service.status || 'active',
      is_active: service.is_active,
      department: service.department || '',
      room: service.room || '',
    });
    setDialogOpen(true);
  };

  const handleExport = () => {
    const csvContent = [
      ['Code', 'Name', 'Description', 'Category', 'Duration (min)', 'Member Price', 'Non-Member Price', 'Valid Days', 'Status'].join(','),
      ...filteredServices.map(service => [
        service.service_code,
        `"${service.name}"`,
        `"${service.description || ''}"`,
        `"${service.category}"`,
        service.duration_minutes,
        service.member_price || 0,
        service.non_member_price || 0,
        service.valid_for_days || 0,
        service.status === 'active' ? 'Active' : 'Inactive'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'services.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleDelete = async (service: Service) => {
    setServiceToDelete(service);
    setDeleteError(null);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!serviceToDelete) return;

    try {
      // First check if service is used in any order_items
      const { data: orderItems, error: checkError } = await supabase
        .from('order_items')
        .select('id')
        .eq('service_id', serviceToDelete.id)
        .limit(1);

      if (checkError) throw checkError;

      if (orderItems && orderItems.length > 0) {
        setDeleteError('This service cannot be deleted because it is used in existing orders. You can deactivate it instead.');
        return;
      }

      // If not used, proceed with deletion
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceToDelete.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Service deleted successfully',
      });
      
      setDeleteDialogOpen(false);
      setServiceToDelete(null);
      fetchServices();
    } catch (error) {
      console.error('Error deleting service:', error);
      setDeleteError('Failed to delete service. Please try again.');
    }
  };

  const handleDeactivate = async () => {
    if (!serviceToDelete) return;

    try {
      const { error } = await supabase
        .from('services')
        .update({ is_active: false })
        .eq('id', serviceToDelete.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Service deactivated successfully',
      });
      
      setDeleteDialogOpen(false);
      setServiceToDelete(null);
      setDeleteError(null);
      fetchServices();
    } catch (error) {
      console.error('Error deactivating service:', error);
      toast({
        title: 'Error',
        description: 'Failed to deactivate service',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return <div>Loading services...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">SERVICE Manager</h1>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add New
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingService ? 'Edit Service' : 'Add New Service'}
              </DialogTitle>
              <DialogDescription>
                {editingService ? 'Update service information' : 'Enter the details for the new service'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="service_code">Service Code *</Label>
                <Input
                  id="service_code"
                  value={formData.service_code}
                  onChange={(e) => setFormData({ ...formData, service_code: e.target.value })}
                  placeholder="e.g., 03ACMGR"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Service Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration_minutes">Duration (minutes) *</Label>
                <Input
                  id="duration_minutes"
                  type="number"
                  min="1"
                  value={formData.duration_minutes}
                  onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="member_price">Member Price ($) *</Label>
                  <Input
                    id="member_price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.member_price}
                    onChange={(e) => setFormData({ ...formData, member_price: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="non_member_price">Non-Member Price ($) *</Label>
                  <Input
                    id="non_member_price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.non_member_price}
                    onChange={(e) => setFormData({ ...formData, non_member_price: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="valid_for_days">Valid For (days) *</Label>
                  <Input
                    id="valid_for_days"
                    type="number"
                    min="0"
                    value={formData.valid_for_days}
                    onChange={(e) => setFormData({ ...formData, valid_for_days: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status *</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select
                    value={formData.department}
                    onValueChange={(value) => setFormData({ ...formData, department: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover z-50">
                      {departmentOptions.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="room">Room</Label>
                  <Input
                    id="room"
                    value={formData.room}
                    onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                    placeholder="e.g., Room 101"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                />
                <Label htmlFor="is_active">Service is active</Label>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingService ? 'Update' : 'Create'} Service
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters Section */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <Label htmlFor="search">Course</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="min-w-[120px]">
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="min-w-[200px]">
              <Label htmlFor="category">Type</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">-- All Course Types --</SelectItem>
                  {serviceCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-2">
              <Button variant="default" onClick={() => filterServices()}>
                <Search className="mr-2 h-4 w-4" />
                Search
              </Button>
              <Button variant="outline" onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
            
            <Button variant="link" className="text-cyan-600">
              View Advanced Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Services Table */}
      <Card>
        <CardContent className="p-0">
          <DataTable 
            data={filteredServices}
            columns={[
              {
                header: 'Code',
                accessorKey: 'service_code'
              },
              {
                header: 'Description',
                cell: (service) => (
                  <div>
                    <div className="font-medium">{service.name}</div>
                    {service.description && (
                      <div className="text-sm text-muted-foreground mt-1">
                        {service.description}
                      </div>
                    )}
                    <div className="text-sm text-muted-foreground">
                      {service.category} • {service.duration_minutes} min
                    </div>
                  </div>
                )
              },
              {
                header: 'Member Price',
                cell: (service) => (
                  <span className="font-medium">${service.member_price || 0}</span>
                )
              },
              {
                header: 'Non-Member Price',
                cell: (service) => (
                  <span className="font-medium">${service.non_member_price || 0}</span>
                )
              },
              {
                header: 'Valid Days',
                cell: (service) => (
                  <span className="text-sm">{service.valid_for_days || 0} days</span>
                )
              },
              {
                header: 'Status',
                cell: (service) => (
                  <Badge variant={getStatusBadgeVariant(service.status)}>
                    {getStatusDisplay(service.status)}
                  </Badge>
                )
              },
              {
                header: 'Actions',
                cell: (service) => (
                  <div className="flex items-center justify-center space-x-1">
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => handleEdit(service)}
                      className="text-cyan-600 h-auto p-0"
                    >
                      Edit
                    </Button>
                    {userRole === 'admin' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(service)}
                        className="text-destructive h-auto p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                )
              }
            ]}
            pageSize={10}
          />
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Service?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteError ? (
                <div className="space-y-3">
                  <p className="text-destructive font-medium">{deleteError}</p>
                  <p>Would you like to deactivate this service instead? It will be hidden from new orders but preserved in existing order history.</p>
                </div>
              ) : (
                <p>Are you sure you want to delete "{serviceToDelete?.name}"? This action cannot be undone.</p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setDeleteDialogOpen(false);
              setServiceToDelete(null);
              setDeleteError(null);
            }}>
              Cancel
            </AlertDialogCancel>
            {deleteError ? (
              <AlertDialogAction onClick={handleDeactivate}>
                Deactivate Service
              </AlertDialogAction>
            ) : (
              <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete Service
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Services;