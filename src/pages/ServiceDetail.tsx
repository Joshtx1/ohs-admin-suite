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
import { ArrowLeft, Package, Database, Edit, Save, X, Wand2 } from 'lucide-react';
import { getStatusBadgeVariant, getStatusDisplay } from '@/lib/status';
import { ServiceMetadata, MetadataFieldBuilder, MetadataField } from '@/components/MetadataFieldBuilder';
import { Checkbox } from '@/components/ui/checkbox';
import { useQuery } from '@tanstack/react-query';

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
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

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

  const { data: templates } = useQuery({
    queryKey: ['service-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_templates')
        .select('*')
        .order('template_name');
      
      if (error) throw error;
      return data || [];
    },
  });

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

  const applyTemplate = () => {
    if (!selectedTemplate || !formData) return;

    const template = templates?.find(t => t.id === selectedTemplate);
    if (!template) return;

    const templateFields = (template.fields as any) as MetadataField[];
    
    const newMetadata: ServiceMetadata = {
      fields: templateFields
    };

    setFormData({ ...formData, service_metadata: newMetadata });
    toast({
      title: 'Template Applied',
      description: `${template.template_name} template has been applied successfully.`,
    });
    setSelectedTemplate('');
  };

  if (loading) {
    return <div>Loading service details...</div>;
  }

  if (!service || !formData) {
    return <div>Service not found</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard/services')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Service Details: {service.name}</h1>
        </div>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button onClick={handleCancel} variant="outline" size="sm">
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave} size="sm">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)} size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="w-full justify-start bg-transparent border-b rounded-none h-auto p-0 space-x-8">
          <TabsTrigger 
            value="general" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent bg-transparent px-0 pb-3 font-semibold"
          >
            GENERAL
          </TabsTrigger>
          <TabsTrigger 
            value="metadata" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent bg-transparent px-0 pb-3 font-semibold"
          >
            METADATA FIELDS
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-0 pt-8">
          <div className="grid grid-cols-2 gap-x-16 gap-y-4 max-w-5xl">
            {/* Service Code */}
            <div className="flex items-baseline">
              <span className="font-semibold min-w-[200px]">Service Code:</span>
              {isEditing ? (
                <Input
                  value={formData?.service_code || ''}
                  onChange={(e) => setFormData({ ...formData!, service_code: e.target.value })}
                  className="flex-1 max-w-xs"
                />
              ) : (
                <span>{service.service_code}</span>
              )}
            </div>

            {/* Service Name */}
            <div className="flex items-baseline">
              <span className="font-semibold min-w-[200px]">Service Name:</span>
              {isEditing ? (
                <Input
                  value={formData?.name || ''}
                  onChange={(e) => setFormData({ ...formData!, name: e.target.value })}
                  className="flex-1 max-w-xs"
                />
              ) : (
                <span>{service.name}</span>
              )}
            </div>

            {/* Category */}
            <div className="flex items-baseline">
              <span className="font-semibold min-w-[200px]">Category:</span>
              {isEditing ? (
                <Select
                  value={formData?.category || ''}
                  onValueChange={(value) => setFormData({ ...formData!, category: value })}
                >
                  <SelectTrigger className="flex-1 max-w-xs">
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
                <span>{service.category}</span>
              )}
            </div>

            {/* Status */}
            <div className="flex items-baseline">
              <span className="font-semibold min-w-[200px]">Status:</span>
              {isEditing ? (
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData?.is_active || false}
                    onCheckedChange={(checked) => setFormData({ ...formData!, is_active: checked })}
                  />
                  <span className="text-sm">{formData?.is_active ? 'Active' : 'Inactive'}</span>
                </div>
              ) : (
                <span>{service.is_active ? 'Active' : 'Inactive'}</span>
              )}
            </div>

            {/* Department */}
            <div className="flex items-baseline">
              <span className="font-semibold min-w-[200px]">Department:</span>
              {isEditing ? (
                <Select
                  value={formData?.department || ''}
                  onValueChange={(value) => setFormData({ ...formData!, department: value })}
                >
                  <SelectTrigger className="flex-1 max-w-xs">
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
                <span>{service.department || 'Not specified'}</span>
              )}
            </div>

            {/* Room */}
            <div className="flex items-baseline">
              <span className="font-semibold min-w-[200px]">Room:</span>
              {isEditing ? (
                <Input
                  value={formData?.room || ''}
                  onChange={(e) => setFormData({ ...formData!, room: e.target.value })}
                  className="flex-1 max-w-xs"
                />
              ) : (
                <span>{service.room || 'Not specified'}</span>
              )}
            </div>

            {/* Member Price */}
            <div className="flex items-baseline">
              <span className="font-semibold min-w-[200px]">Member Price:</span>
              {isEditing ? (
                <Input
                  type="number"
                  step="0.01"
                  value={formData?.member_price || ''}
                  onChange={(e) => setFormData({ ...formData!, member_price: parseFloat(e.target.value) })}
                  className="flex-1 max-w-xs"
                />
              ) : (
                <span>${service.member_price?.toFixed(2) || '0.00'}</span>
              )}
            </div>

            {/* Non-Member Price */}
            <div className="flex items-baseline">
              <span className="font-semibold min-w-[200px]">Non-Member Price:</span>
              {isEditing ? (
                <Input
                  type="number"
                  step="0.01"
                  value={formData?.non_member_price || ''}
                  onChange={(e) => setFormData({ ...formData!, non_member_price: parseFloat(e.target.value) })}
                  className="flex-1 max-w-xs"
                />
              ) : (
                <span>${service.non_member_price?.toFixed(2) || '0.00'}</span>
              )}
            </div>

            {/* Duration */}
            <div className="flex items-baseline">
              <span className="font-semibold min-w-[200px]">Duration (minutes):</span>
              {isEditing ? (
                <Input
                  type="number"
                  value={formData?.duration_minutes || ''}
                  onChange={(e) => setFormData({ ...formData!, duration_minutes: parseInt(e.target.value) })}
                  className="flex-1 max-w-xs"
                />
              ) : (
                <span>{service.duration_minutes}</span>
              )}
            </div>

            {/* Valid For Days */}
            <div className="flex items-baseline">
              <span className="font-semibold min-w-[200px]">Valid For (days):</span>
              {isEditing ? (
                <Input
                  type="number"
                  value={formData?.valid_for_days || ''}
                  onChange={(e) => setFormData({ ...formData!, valid_for_days: parseInt(e.target.value) })}
                  className="flex-1 max-w-xs"
                />
              ) : (
                <span>{service.valid_for_days || 'Not specified'}</span>
              )}
            </div>

            {/* Description - Full Width */}
            <div className="col-span-2 flex items-start">
              <span className="font-semibold min-w-[200px]">Description:</span>
              {isEditing ? (
                <Textarea
                  value={formData?.description || ''}
                  onChange={(e) => setFormData({ ...formData!, description: e.target.value })}
                  rows={3}
                  className="flex-1 max-w-2xl"
                />
              ) : (
                <span className="flex-1">{service.description || 'No description'}</span>
              )}
            </div>

            {/* Service Groups - Full Width */}
            <div className="col-span-2 flex items-start">
              <span className="font-semibold min-w-[200px]">Service Groups:</span>
              {isEditing ? (
                <div className="flex-1 space-y-2">
                  {serviceCategories.map((group) => (
                    <div key={group} className="flex items-center space-x-2">
                      <Checkbox
                        id={`group-${group}`}
                        checked={formData?.service_group?.includes(group) || false}
                        onCheckedChange={() => toggleServiceGroup(group)}
                      />
                      <Label htmlFor={`group-${group}`} className="font-normal">
                        {group}
                      </Label>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex-1 flex flex-wrap gap-2">
                  {service.service_group && service.service_group.length > 0 ? (
                    service.service_group.map((group) => (
                      <Badge key={group} variant="outline">
                        {group}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-muted-foreground">No groups assigned</span>
                  )}
                </div>
              )}
            </div>

            {/* Timestamps */}
            <div className="col-span-2 border-t pt-4 mt-4 grid grid-cols-2 gap-x-16 gap-y-4">
              <div className="flex items-baseline">
                <span className="font-semibold min-w-[200px]">Created At:</span>
                <span className="text-muted-foreground">
                  {new Date(service.created_at).toLocaleString()}
                </span>
              </div>
              <div className="flex items-baseline">
                <span className="font-semibold min-w-[200px]">Last Updated:</span>
                <span className="text-muted-foreground">
                  {new Date(service.updated_at).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="metadata" className="space-y-0 pt-8">
          <div className="space-y-6">
            {/* Template Selection */}
            {isEditing && (
              <div className="flex items-center gap-2 pb-4 border-b">
                <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                  <SelectTrigger className="w-[250px]">
                    <SelectValue placeholder="Select a template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates?.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.template_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  onClick={applyTemplate} 
                  disabled={!selectedTemplate}
                  variant="outline"
                  size="sm"
                >
                  <Wand2 className="h-4 w-4 mr-2" />
                  Apply Template
                </Button>
              </div>
            )}

            {/* Metadata Content */}
            {isEditing ? (
              <MetadataFieldBuilder
                fields={formData?.service_metadata?.fields || []}
                onChange={(fields) => setFormData({ ...formData!, service_metadata: { fields } })}
              />
            ) : (
              <div className="space-y-8">
                {service.service_metadata?.fields && service.service_metadata.fields.length > 0 ? (
                  service.service_metadata.fields.map((field, index) => (
                    <div key={index} className="space-y-4 pb-6 border-b last:border-0">
                      <h3 className="font-semibold text-base">{field.fieldLabel}</h3>
                      <div className="grid grid-cols-2 gap-x-16 gap-y-3 max-w-4xl">
                        <div className="flex items-baseline">
                          <span className="font-semibold min-w-[180px]">Field Name:</span>
                          <span className="font-mono text-sm">{field.fieldName}</span>
                        </div>
                        <div className="flex items-baseline">
                          <span className="font-semibold min-w-[180px]">Type:</span>
                          <span>{field.fieldType}</span>
                        </div>
                        <div className="flex items-baseline">
                          <span className="font-semibold min-w-[180px]">Required:</span>
                          <span>{field.required ? 'Yes' : 'No'}</span>
                        </div>
                        {field.placeholder && (
                          <div className="flex items-baseline">
                            <span className="font-semibold min-w-[180px]">Placeholder:</span>
                            <span>{field.placeholder}</span>
                          </div>
                        )}
                        {field.defaultValue && (
                          <div className="flex items-baseline">
                            <span className="font-semibold min-w-[180px]">Default Value:</span>
                            <span>{field.defaultValue}</span>
                          </div>
                        )}
                        {field.options && field.options.length > 0 && (
                          <div className="col-span-2 flex items-start">
                            <span className="font-semibold min-w-[180px]">Options:</span>
                            <div className="flex flex-wrap gap-2">
                              {field.options.map((option, idx) => (
                                <Badge key={idx} variant="secondary">
                                  {option}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        {field.validation && (
                          <div className="col-span-2 flex items-start">
                            <span className="font-semibold min-w-[180px]">Validation:</span>
                            <div className="space-y-1">
                              {field.validation.min !== undefined && (
                                <p>Min: {field.validation.min}</p>
                              )}
                              {field.validation.max !== undefined && (
                                <p>Max: {field.validation.max}</p>
                              )}
                              {field.validation.pattern && (
                                <p>Pattern: {field.validation.pattern}</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    No metadata fields configured
                  </p>
                )}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ServiceDetail;
