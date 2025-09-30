import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { z } from 'zod';

const pricingSchema = z.object({
  service_id: z.string().min(1, 'Service is required'),
  client_id: z.string().optional(),
  price: z.number().min(0.01, 'Price must be greater than 0'),
  currency: z.string().default('USD'),
  pricing_type: z.enum(['standard', 'custom', 'bulk']).default('standard'),
  effective_from: z.string().min(1, 'Effective date is required'),
  effective_to: z.string().optional(),
  is_active: z.boolean().default(true),
});

interface PricingRecord {
  id: string;
  service_id: string;
  client_id?: string;
  price: number;
  currency: string;
  pricing_type: string;
  effective_from: string;
  effective_to?: string;
  is_active: boolean;
  created_at: string;
  services?: { name: string };
  clients?: { company_name: string };
}

interface Service {
  id: string;
  name: string;
}

interface Client {
  id: string;
  company_name: string;
}

const Pricing = () => {
  const { user, userRole } = useAuth();
  const [pricing, setPricing] = useState<PricingRecord[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPricing, setEditingPricing] = useState<PricingRecord | null>(null);
  const [formData, setFormData] = useState({
    service_id: '',
    client_id: '',
    price: '',
    currency: 'USD',
    pricing_type: 'standard',
    effective_from: new Date().toISOString().split('T')[0],
    effective_to: '',
    is_active: true,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [pricingRes, servicesRes, clientsRes] = await Promise.all([
        supabase
          .from('pricing')
          .select(`
            *,
            services!service_id(name),
            clients!client_id(company_name)
          `)
          .order('created_at', { ascending: false }),
        supabase
          .from('services')
          .select('id, name')
          .eq('is_active', true)
          .order('name'),
        supabase
          .from('clients')
          .select('id, company_name')
          .eq('status', 'active')
          .order('company_name'),
      ]);

      if (pricingRes.error) throw pricingRes.error;
      if (servicesRes.error) throw servicesRes.error;
      if (clientsRes.error) throw clientsRes.error;

      setPricing(pricingRes.data || []);
      setServices(servicesRes.data || []);
      setClients(clientsRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch pricing data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      service_id: '',
      client_id: 'standard',
      price: '',
      currency: 'USD',
      pricing_type: 'standard',
      effective_from: new Date().toISOString().split('T')[0],
      effective_to: '',
      is_active: true,
    });
    setEditingPricing(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const processedData = {
        ...formData,
        price: parseFloat(formData.price),
        client_id: formData.client_id === 'standard' ? undefined : formData.client_id || undefined,
        effective_to: formData.effective_to || undefined,
      };

      const validatedData = pricingSchema.parse(processedData);

      if (editingPricing) {
        const { error } = await supabase
          .from('pricing')
          .update(validatedData)
          .eq('id', editingPricing.id);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Pricing updated successfully',
        });
      } else {
        const { error } = await supabase
          .from('pricing')
          .insert([{
            service_id: validatedData.service_id,
            client_id: validatedData.client_id,
            price: validatedData.price,
            currency: validatedData.currency,
            pricing_type: validatedData.pricing_type,
            effective_from: validatedData.effective_from,
            effective_to: validatedData.effective_to,
            is_active: validatedData.is_active,
            created_by: user?.id,
          }]);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Pricing created successfully',
        });
      }

      setDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: 'Validation Error',
          description: error.errors[0].message,
          variant: 'destructive',
        });
      } else {
        console.error('Error saving pricing:', error);
        toast({
          title: 'Error',
          description: 'Failed to save pricing',
          variant: 'destructive',
        });
      }
    }
  };

  const handleEdit = (pricingRecord: PricingRecord) => {
    setEditingPricing(pricingRecord);
    setFormData({
      service_id: pricingRecord.service_id,
      client_id: pricingRecord.client_id || 'standard',
      price: pricingRecord.price.toString(),
      currency: pricingRecord.currency,
      pricing_type: pricingRecord.pricing_type,
      effective_from: pricingRecord.effective_from,
      effective_to: pricingRecord.effective_to || '',
      is_active: pricingRecord.is_active,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (pricingId: string) => {
    if (!window.confirm('Are you sure you want to delete this pricing record?')) return;

    try {
      const { error } = await supabase
        .from('pricing')
        .delete()
        .eq('id', pricingId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Pricing deleted successfully',
      });
      fetchData();
    } catch (error) {
      console.error('Error deleting pricing:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete pricing',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return <div>Loading pricing...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pricing</h1>
          <p className="text-muted-foreground">
            Manage service pricing and rates
          </p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Pricing
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingPricing ? 'Edit Pricing' : 'Add New Pricing'}
              </DialogTitle>
              <DialogDescription>
                {editingPricing ? 'Update pricing information' : 'Set pricing for a service'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="service_id">Service *</Label>
                <Select
                  value={formData.service_id}
                  onValueChange={(value) => setFormData({ ...formData, service_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a service" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="client_id">Client (Optional)</Label>
                <Select
                  value={formData.client_id}
                  onValueChange={(value) => setFormData({ ...formData, client_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a client (leave empty for standard pricing)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard Pricing</SelectItem>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.company_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value) => setFormData({ ...formData, currency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="CAD">CAD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pricing_type">Pricing Type</Label>
                <Select
                  value={formData.pricing_type}
                  onValueChange={(value) => setFormData({ ...formData, pricing_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                    <SelectItem value="bulk">Bulk</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="effective_from">Effective From *</Label>
                  <Input
                    id="effective_from"
                    type="date"
                    value={formData.effective_from}
                    onChange={(e) => setFormData({ ...formData, effective_from: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="effective_to">Effective To</Label>
                  <Input
                    id="effective_to"
                    type="date"
                    value={formData.effective_to}
                    onChange={(e) => setFormData({ ...formData, effective_to: e.target.value })}
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
                <Label htmlFor="is_active">Pricing is active</Label>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingPricing ? 'Update' : 'Create'} Pricing
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pricing Records</CardTitle>
          <CardDescription>
            All pricing configurations ({pricing.length} total)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Effective Period</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pricing.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">
                    {record.services?.name || 'Unknown Service'}
                  </TableCell>
                  <TableCell>
                    {record.clients?.company_name || 'Standard Pricing'}
                  </TableCell>
                  <TableCell>
                    {record.currency} {record.price.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {record.pricing_type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>From: {new Date(record.effective_from).toLocaleDateString()}</div>
                      {record.effective_to && (
                        <div>To: {new Date(record.effective_to).toLocaleDateString()}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={record.is_active ? 'default' : 'secondary'}>
                      {record.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(record)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {userRole === 'admin' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(record.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Pricing;