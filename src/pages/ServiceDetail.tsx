import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Package, Database } from 'lucide-react';
import { getStatusBadgeVariant, getStatusDisplay } from '@/lib/status';
import { ServiceMetadata } from '@/components/MetadataFieldBuilder';

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
      
      setService({
        ...data,
        service_metadata: data.service_metadata as unknown as ServiceMetadata | undefined
      });
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

  if (loading) {
    return <div>Loading service details...</div>;
  }

  if (!service) {
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
                  <label className="text-sm font-medium text-muted-foreground">Service Code</label>
                  <p className="text-base">{service.service_code}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Service Name</label>
                  <p className="text-base">{service.name}</p>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-muted-foreground">Description</label>
                  <p className="text-base">{service.description || 'No description provided'}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Category</label>
                  <p className="text-base">{service.category}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Service Groups</label>
                  <div className="flex flex-wrap gap-2">
                    {service.service_group.map((group, index) => (
                      <Badge key={index} variant="secondary">
                        {group}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className="flex gap-2">
                    <Badge variant={getStatusBadgeVariant(service.status)}>
                      {getStatusDisplay(service.status)}
                    </Badge>
                    <Badge variant={service.is_active ? 'default' : 'destructive'}>
                      {service.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Department</label>
                  <p className="text-base">{service.department || 'Not specified'}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Room</label>
                  <p className="text-base">{service.room || 'Not specified'}</p>
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
                  <label className="text-sm font-medium text-muted-foreground">Member Price</label>
                  <p className="text-2xl font-bold">${service.member_price.toFixed(2)}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Non-Member Price</label>
                  <p className="text-2xl font-bold">${service.non_member_price.toFixed(2)}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Duration</label>
                  <p className="text-2xl font-bold">{service.duration_minutes} min</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Valid For</label>
                  <p className="text-2xl font-bold">{service.valid_for_days} days</p>
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
                  <label className="text-sm font-medium text-muted-foreground">Created At</label>
                  <p className="text-base">{new Date(service.created_at).toLocaleString()}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Updated At</label>
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ServiceDetail;
