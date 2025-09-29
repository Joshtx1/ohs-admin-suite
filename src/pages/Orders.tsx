import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Filter, Eye, Edit, Trash2, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Order {
  id: string;
  client_id: string;
  trainee_id: string;
  status: string;
  total_amount: number;
  service_date: string;
  notes: string;
  created_at: string;
  clients: {
    company_name: string;
    contact_person: string;
  };
  trainees: {
    name: string;
    unique_id: string;
  };
  order_items: {
    id: string;
    service_id: string;
    price: number;
    status: string;
    services: {
      name: string;
      service_code: string;
    };
  }[];
}

interface Client {
  id: string;
  company_name: string;
  contact_person: string;
}

interface Trainee {
  id: string;
  name: string;
  unique_id: string;
}

interface Service {
  id: string;
  name: string;
  service_code: string;
  member_price: number;
  non_member_price: number;
}

const statusColors = {
  created: "bg-blue-100 text-blue-800",
  scheduled: "bg-yellow-100 text-yellow-800",
  "in-progress": "bg-orange-100 text-orange-800",
  completed: "bg-green-100 text-green-800",
  billed: "bg-purple-100 text-purple-800",
  cancelled: "bg-red-100 text-red-800"
};

export default function Orders() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  // Create order form state
  const [clients, setClients] = useState<Client[]>([]);
  const [trainees, setTrainees] = useState<Trainee[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [selectedTraineeId, setSelectedTraineeId] = useState("");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [serviceDate, setServiceDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [orderNotes, setOrderNotes] = useState("");

  useEffect(() => {
    fetchOrders();
    fetchClients();
    fetchServices();
  }, []);

  useEffect(() => {
    if (selectedClientId) {
      fetchClientTrainees(selectedClientId);
    }
  }, [selectedClientId]);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          clients (company_name, contact_person),
          trainees (name, unique_id),
          order_items (
            id,
            service_id,
            price,
            status,
            services (name, service_code)
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast({
        title: "Error",
        description: "Failed to load orders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from("clients")
        .select("id, company_name, contact_person")
        .eq("status", "active")
        .order("company_name");

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  };

  const fetchClientTrainees = async (clientId: string) => {
    try {
      const { data, error } = await supabase
        .from("client_trainee_assignments")
        .select(`
          trainees (id, name, unique_id)
        `)
        .eq("client_id", clientId)
        .eq("status", "active");

      if (error) throw error;
      const traineesData = data?.map(item => item.trainees).filter(Boolean) || [];
      setTrainees(traineesData);
    } catch (error) {
      console.error("Error fetching client trainees:", error);
    }
  };

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from("services")
        .select("id, name, service_code, member_price, non_member_price")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };

  const createOrder = async () => {
    if (!selectedClientId || !selectedTraineeId || selectedServices.length === 0) {
      toast({
        title: "Error",
        description: "Please select client, trainee, and at least one service",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("User not authenticated");

      // Calculate total amount
      const selectedServiceDetails = services.filter(s => selectedServices.includes(s.id));
      const totalAmount = selectedServiceDetails.reduce((sum, service) => sum + (service.member_price || 0), 0);

      // Create order
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert({
          client_id: selectedClientId,
          trainee_id: selectedTraineeId,
          created_by: user.user.id,
          status: "created",
          total_amount: totalAmount,
          service_date: serviceDate,
          notes: orderNotes
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = selectedServiceDetails.map(service => ({
        order_id: orderData.id,
        service_id: service.id,
        price: service.member_price || 0,
        status: "pending"
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      toast({
        title: "Success",
        description: "Order created successfully",
      });

      setIsCreateDialogOpen(false);
      resetCreateForm();
      fetchOrders();
    } catch (error) {
      console.error("Error creating order:", error);
      toast({
        title: "Error",
        description: "Failed to create order",
        variant: "destructive",
      });
    }
  };

  const resetCreateForm = () => {
    setSelectedClientId("");
    setSelectedTraineeId("");
    setSelectedServices([]);
    setServiceDate(format(new Date(), "yyyy-MM-dd"));
    setOrderNotes("");
    setTrainees([]);
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.clients.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.trainees.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.trainees.unique_id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
          <div className="h-32 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">
            Manage and track service orders for trainees
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Order
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Order</DialogTitle>
              <DialogDescription>
                Select a client, trainee, and services to create a new order.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="client">Client</Label>
                <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.company_name} - {client.contact_person}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedClientId && (
                <div className="grid gap-2">
                  <Label htmlFor="trainee">Trainee</Label>
                  <Select value={selectedTraineeId} onValueChange={setSelectedTraineeId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a trainee" />
                    </SelectTrigger>
                    <SelectContent>
                      {trainees.map((trainee) => (
                        <SelectItem key={trainee.id} value={trainee.id}>
                          {trainee.name} ({trainee.unique_id})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid gap-2">
                <Label>Services</Label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                  {services.map((service) => (
                    <label key={service.id} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedServices.includes(service.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedServices([...selectedServices, service.id]);
                          } else {
                            setSelectedServices(selectedServices.filter(id => id !== service.id));
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">
                        {service.name} - ${service.member_price}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="service-date">Service Date</Label>
                <Input
                  id="service-date"
                  type="date"
                  value={serviceDate}
                  onChange={(e) => setServiceDate(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any notes or special instructions..."
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={createOrder}>
                Create Order
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order Management</CardTitle>
          <CardDescription>
            View and manage all service orders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by client or trainee..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="created">Created</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="billed">Billed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Trainee</TableHead>
                <TableHead>Services</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Service Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-sm">
                    {order.id.slice(0, 8)}...
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{order.clients.company_name}</div>
                      <div className="text-sm text-muted-foreground">
                        {order.clients.contact_person}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{order.trainees.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {order.trainees.unique_id}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {order.order_items.map((item) => (
                        <div key={item.id} className="text-sm">
                          {item.services.name}
                          <Badge variant="outline" className="ml-2">
                            {item.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[order.status as keyof typeof statusColors]}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    ${order.total_amount}
                  </TableCell>
                  <TableCell>
                    {format(new Date(order.service_date), "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredOrders.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No orders found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}