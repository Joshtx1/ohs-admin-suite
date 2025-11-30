import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Package, Database, Edit, Save, X } from 'lucide-react';
import { getStatusBadgeVariant, getStatusDisplay } from '@/lib/status';
import { ServiceMetadata, MetadataFieldBuilder } from '@/components/MetadataFieldBuilder';
import { Checkbox } from '@/components/ui/checkbox';

interface Service {
  id: string;
  service_code: string;
  name: string;
  description?: string;
  category: string;
  service_group: string[];
  duration_minutes: number;
  member_price: number;
  non_member_price: number;
  valid_for_days: number;
  status: string;
  is_active: boolean;
  department?: string;
  room?: string;
  service_metadata?: ServiceMetadata;
  created_at: string;
  updated_at: string;
}

const ServiceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Service | null>(null);

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
    fetchService();
  }, [id]);

  const fetchService = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      const serviceData = {
        ...data,
        service_metadata: data.service_metadata as unknown as ServiceMetadata | undefined
      };
      setService(serviceData);
      setFormData(serviceData);
    } catch (error) {
      console.error('Error fetching service:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch service details',
        variant: 'destructive',
      });
      navigate('/dashboard/services');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setFormData(service);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!formData) return;

    try {
      const { error } = await supabase
        .from('services')
        .update({
          service_code: formData.service_code,
          name: formData.name,
          description: formData.description,
          category: formData.category,
          service_group: formData.service_group,
          duration_minutes: formData.duration_minutes,
          member_price: formData.member_price,
          non_member_price: formData.non_member_price,
          valid_for_days: formData.valid_for_days,
          status: formData.status,
          is_active: formData.is_active,
          department: formData.department,
          room: formData.room,
          service_metadata: formData.service_metadata as any
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Service updated successfully',
      });

      setService(formData);
      setIsEditing(false);
      fetchService();
    } catch (error) {
      console.error('Error updating service:', error);
      toast({
        title: 'Error',
        description: 'Failed to update service',
        variant: 'destructive',
      });
    }
  };

  const toggleServiceGroup = (group: string) => {
    if (!formData) return;
    
    const currentGroups = formData.service_group || [];
    const newGroups = currentGroups.includes(group)
      ? currentGroups.filter(g => g !== group)
      : [...currentGroups, group];
    
    setFormData({ ...formData, service_group: newGroups });
  };

  if (loading) {
    return <div>Loading service details...</div>;
  }

  if (!service || !formData) {
    return <div>Service not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard/services')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Services
          </Button>
        </div>
        <div className="flex items-center gap-2">
          {!isEditing ? (
            <Button onClick={handleEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Service
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={handleCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </>
          )}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">{service.name}</h1>
          <Badge variant={getStatusBadgeVariant(service.status)}>
            {getStatusDisplay(service.status)}
          </Badge>
          {!service.is_active && (
            <Badge variant="destructive">Inactive</Badge>
          )}
        </div>
        <p className="text-muted-foreground mt-1">
          Service Code: {service.service_code}
        </p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList>
          <TabsTrigger value="general">
            <Package className="h-4 w-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="metadata">
            <Database className="h-4 w-4 mr-2" />
            Metadata Fields
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Core Information</CardTitle>
              <CardDescription>
                Essential service details and configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Service Code</Label>
                  {isEditing ? (
                    <Input
                      value={formData.service_code}
                      onChange={(e) => setFormData({ ...formData, service_code: e.target.value })}
                    />
                  ) : (
                    <p className="text-base">{service.service_code}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Service Name</Label>
                  {isEditing ? (
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  ) : (
                    <p className="text-base">{service.name}</p>
                  )}
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Description</Label>
                  {isEditing ? (
                    <Textarea
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                    />
                  ) : (
                    <p className="text-base">{service.description || 'No description provided'}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  {isEditing ? (
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {serviceCategories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-base">{service.category}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Service Groups</Label>
                  {isEditing ? (
                    <div className="flex flex-wrap gap-2 p-3 border rounded-md">
                      {serviceCategories.map((group) => (
                        <div key={group} className="flex items-center space-x-2">
                          <Checkbox
                            id={group}
                            checked={formData.service_group?.includes(group)}
                            onCheckedChange={() => toggleServiceGroup(group)}
                          />
                          <label
                            htmlFor={group}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {group}
                          </label>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {service.service_group.map((group, index) => (
                        <Badge key={index} variant="secondary">
                          {group}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  {isEditing ? (
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="flex gap-2">
                      <Badge variant={getStatusBadgeVariant(service.status)}>
                        {getStatusDisplay(service.status)}
                      </Badge>
                      <Badge variant={service.is_active ? 'default' : 'destructive'}>
                        {service.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Is Active</Label>
                  {isEditing ? (
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={formData.is_active}
                        onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                      />
                      <span className="text-sm">{formData.is_active ? 'Active' : 'Inactive'}</span>
                    </div>
                  ) : (
                    <Badge variant={service.is_active ? 'default' : 'destructive'}>
                      {service.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Department</Label>
                  {isEditing ? (
                    <Select
                      value={formData.department || ''}
                      onValueChange={(value) => setFormData({ ...formData, department: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departmentOptions.map((dept) => (
                          <SelectItem key={dept} value={dept}>
                            {dept}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-base">{service.department || 'Not specified'}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Room</Label>
                  {isEditing ? (
                    <Input
                      value={formData.room || ''}
                      onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                    />
                  ) : (
                    <p className="text-base">{service.room || 'Not specified'}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pricing & Duration</CardTitle>
              <CardDescription>
                Service pricing and time allocation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <Label>Member Price</Label>
                  {isEditing ? (
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.member_price}
                      onChange={(e) => setFormData({ ...formData, member_price: parseFloat(e.target.value) })}
                    />
                  ) : (
                    <p className="text-2xl font-bold">${service.member_price.toFixed(2)}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Non-Member Price</Label>
                  {isEditing ? (
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.non_member_price}
                      onChange={(e) => setFormData({ ...formData, non_member_price: parseFloat(e.target.value) })}
                    />
                  ) : (
                    <p className="text-2xl font-bold">${service.non_member_price.toFixed(2)}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Duration</Label>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={formData.duration_minutes}
                      onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                    />
                  ) : (
                    <p className="text-2xl font-bold">{service.duration_minutes} min</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Valid For</Label>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={formData.valid_for_days}
                      onChange={(e) => setFormData({ ...formData, valid_for_days: parseInt(e.target.value) })}
                    />
                  ) : (
                    <p className="text-2xl font-bold">{service.valid_for_days} days</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Timestamps</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Created At</Label>
                  <p className="text-base">{new Date(service.created_at).toLocaleString()}</p>
                </div>
                <div className="space-y-2">
                  <Label>Updated At</Label>
                  <p className="text-base">{new Date(service.updated_at).toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metadata" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Custom Metadata Fields</CardTitle>
              <CardDescription>
                Service-specific fields for data collection
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <MetadataFieldBuilder
                  fields={formData.service_metadata?.fields || []}
                  onChange={(fields) => setFormData({ ...formData, service_metadata: { fields } })}
                />
              ) : (
                <>
                  {service.service_metadata?.fields && service.service_metadata.fields.length > 0 ? (
                    <div className="space-y-4">
                      {service.service_metadata.fields.map((field, index) => (
                        <Card key={index} className="border-muted">
                          <CardContent className="pt-6">
                            <div className="space-y-3">
                              <div className="flex items-start justify-between">
                                <div className="space-y-1 flex-1">
                                  <div className="flex items-center gap-3">
                                    <h4 className="text-lg font-semibold">{field.fieldLabel}</h4>
                                    {field.required && (
                                      <Badge variant="destructive" className="text-xs">Required</Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    Field Name: <code className="bg-muted px-2 py-1 rounded text-xs">{field.fieldName}</code>
                                  </p>
                                </div>
                                <Badge variant="outline">{field.fieldType}</Badge>
                              </div>
                              
                              {field.placeholder && (
                                <div className="space-y-1">
                                  <label className="text-xs font-medium text-muted-foreground">Placeholder</label>
                                  <p className="text-sm">{field.placeholder}</p>
                                </div>
                              )}
                              
                              {field.defaultValue && (
                                <div className="space-y-1">
                                  <label className="text-xs font-medium text-muted-foreground">Default Value</label>
                                  <p className="text-sm">{field.defaultValue}</p>
                                </div>
                              )}
                              
                              {field.options && field.options.length > 0 && (
                                <div className="space-y-2">
                                  <label className="text-xs font-medium text-muted-foreground">Options</label>
                                  <div className="flex flex-wrap gap-2">
                                    {field.options.map((option, optIndex) => (
                                      <Badge key={optIndex} variant="secondary">
                                        {option}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {field.validation && (
                                <div className="space-y-2">
                                  <label className="text-xs font-medium text-muted-foreground">Validation Rules</label>
                                  <div className="bg-muted/50 rounded p-3 space-y-1">
                                    {field.validation.min !== undefined && (
                                      <p className="text-xs">Min: {field.validation.min}</p>
                                    )}
                                    {field.validation.max !== undefined && (
                                      <p className="text-xs">Max: {field.validation.max}</p>
                                    )}
                                    {field.validation.pattern && (
                                      <p className="text-xs">Pattern: <code>{field.validation.pattern}</code></p>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Database className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                      <p className="text-muted-foreground">
                        No custom metadata fields configured for this service
                      </p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ServiceDetail;
