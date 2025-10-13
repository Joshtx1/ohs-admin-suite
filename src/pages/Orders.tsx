import { useState, useEffect } from "react";
import { Search, X, Check, CalendarIcon, Eye } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import RoutingSlip from "@/components/RoutingSlip";
import { OrdersTable } from "@/components/orders/OrdersTable";
import { useOrdersData, Order } from "@/hooks/useOrdersData";

interface Trainee {
  id: string;
  name: string;
  unique_id: string;
  ssn?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
}

interface Client {
  id: string;
  company_name: string;
  contact_person: string;
  profile?: string;
  po_required?: boolean;
  mem_status?: string;
  short_code?: string;
  bill_to?: string;
}

interface Service {
  id: string;
  name: string;
  service_code: string;
  category: string;
  member_price: number;
  non_member_price: number;
}

interface SelectedService extends Service {
  date: string;
}

export default function Orders() {
  const { toast } = useToast();
  const [currentTab, setCurrentTab] = useState<"view" | "create">("view");
  const [currentStep, setCurrentStep] = useState(1);
  
  // Orders viewing using the custom hook
  const { orders, loading: ordersLoading, refetch: refetchOrders } = useOrdersData();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isRoutingSlipOpen, setIsRoutingSlipOpen] = useState(false);
  
  // Step 1: Trainee Selection
  const [traineeSearchQuery, setTraineeSearchQuery] = useState("");
  const [allTrainees, setAllTrainees] = useState<Trainee[]>([]);
  const [selectedTrainees, setSelectedTrainees] = useState<Trainee[]>([]);
  const [isSelectTraineeOpen, setIsSelectTraineeOpen] = useState(false);
  
  // Step 2: Registration Type
  const [registrationType, setRegistrationType] = useState<"client" | "selfpay">("client");
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [orderPO, setOrderPO] = useState("");
  const [clientSearchQuery, setClientSearchQuery] = useState("");
  const [isSelectClientOpen, setIsSelectClientOpen] = useState(false);
  
  // Step 3: Service Selection
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);
  const [isServiceDialogOpen, setIsServiceDialogOpen] = useState(false);
  const [serviceDate, setServiceDate] = useState<Date>(new Date());
  const [serviceSearchQuery, setServiceSearchQuery] = useState("");
  const [reasonForTest, setReasonForTest] = useState<string>("");
  
  // Track excluded trainee-service combinations
  const [excludedCombinations, setExcludedCombinations] = useState<Set<string>>(new Set());
  
  // Loading states
  const [loading, setLoading] = useState(true);
  
  // Create trainee dialog
  const [isCreateTraineeOpen, setIsCreateTraineeOpen] = useState(false);
  const [newTrainee, setNewTrainee] = useState({
    first_name: "",
    last_name: "",
    ssn: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    fetchTrainees();
    fetchClients();
    fetchServices();
  }, []);

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsRoutingSlipOpen(true);
  };

  const fetchTrainees = async () => {
    try {
      const { data, error } = await supabase
        .from("trainees")
        .select("id, name, unique_id, ssn, first_name, last_name, email, phone")
        .ilike("status", "active")
        .order("name");

      if (error) throw error;
      setAllTrainees(data || []);
    } catch (error) {
      console.error("Error fetching trainees:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from("clients")
        .select("id, company_name, contact_person, profile, po_required, mem_status, short_code, bill_to")
        .eq("status", "active")
        .order("company_name");

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  };

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from("services")
        .select("id, name, service_code, category, member_price, non_member_price")
        .eq("is_active", true)
        .order("category, name");

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };

  const addTrainee = (trainee: Trainee) => {
    if (!selectedTrainees.find(t => t.id === trainee.id)) {
      setSelectedTrainees([...selectedTrainees, trainee]);
      setTraineeSearchQuery(""); // Clear search after selection
    }
  };

  const removeTrainee = (traineeId: string) => {
    setSelectedTrainees(selectedTrainees.filter(t => t.id !== traineeId));
  };

  const addService = (service: Service, date: string) => {
    setSelectedServices([...selectedServices, { ...service, date }]);
  };

  const removeService = (index: number) => {
    setSelectedServices(selectedServices.filter((_, i) => i !== index));
  };

  const removeServiceFromTrainee = (traineeId: string, serviceId: string) => {
    const key = `${traineeId}-${serviceId}`;
    setExcludedCombinations(prev => new Set([...prev, key]));
  };

  const isServiceExcluded = (traineeId: string, serviceId: string) => {
    return excludedCombinations.has(`${traineeId}-${serviceId}`);
  };

  const createTrainee = async () => {
    if (!newTrainee.first_name || !newTrainee.last_name) {
      toast({
        title: "Error",
        description: "First name and last name are required",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("trainees")
        .insert({
          name: `${newTrainee.first_name} ${newTrainee.last_name}`,
          first_name: newTrainee.first_name,
          last_name: newTrainee.last_name,
          ssn: newTrainee.ssn || null,
          email: newTrainee.email || null,
          phone: newTrainee.phone || null,
          created_by: user.user.id,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Trainee created successfully",
      });

      // Add to trainees list and selected trainees
      setAllTrainees([...allTrainees, data]);
      setSelectedTrainees([...selectedTrainees, data]);
      
      // Reset form and close dialog
      setNewTrainee({
        first_name: "",
        last_name: "",
        ssn: "",
        email: "",
        phone: "",
      });
      setIsCreateTraineeOpen(false);
    } catch (error) {
      console.error("Error creating trainee:", error);
      toast({
        title: "Error",
        description: "Failed to create trainee",
        variant: "destructive",
      });
    }
  };

  const createRegistrations = async () => {
    if (selectedTrainees.length === 0 || selectedServices.length === 0) {
      toast({
        title: "Error",
        description: "Please select trainees and services",
        variant: "destructive",
      });
      return;
    }

    if (registrationType === "client" && !selectedClientId) {
      toast({
        title: "Error",
        description: "Please select a client",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("User not authenticated");

      // Create one order per trainee
      for (const trainee of selectedTrainees) {
        // Filter out excluded services for this trainee
        const traineeServices = selectedServices.filter(service => 
          !isServiceExcluded(trainee.id, service.id)
        );
        
        // Skip if no services for this trainee
        if (traineeServices.length === 0) continue;
        
        const totalAmount = traineeServices.reduce((sum, service) => 
          sum + (service.member_price || 0), 0
        );

        const { data: orderData, error: orderError } = await supabase
          .from("orders")
          .insert({
            client_id: registrationType === "client" ? selectedClientId : null,
            trainee_id: trainee.id,
            created_by: user.user.id,
            status: "created",
            total_amount: totalAmount,
            service_date: traineeServices[0]?.date || new Date().toISOString().split('T')[0],
            notes: registrationType === "client" ? `PO: ${orderPO}` : "Self Pay",
            reason_for_test: reasonForTest,
            payment_status: registrationType === "client" ? "Billed" : "Payment Due"
          })
          .select()
          .single();

        if (orderError) throw orderError;

        // Create order items for each service
        const orderItems = traineeServices.map(service => ({
          order_id: orderData.id,
          service_id: service.id,
          price: service.member_price || 0,
          status: "pending"
        }));

        const { error: itemsError } = await supabase
          .from("order_items")
          .insert(orderItems);

        if (itemsError) throw itemsError;
      }

      toast({
        title: "Success",
        description: `Created ${selectedTrainees.length} registration${selectedTrainees.length > 1 ? 's' : ''}`,
      });

      // Refresh orders list
      refetchOrders();

      // Reset form and switch to view tab
      setCurrentStep(1);
      setSelectedTrainees([]);
      setSelectedServices([]);
      setSelectedClientId("");
      setOrderPO("");
      setRegistrationType("client");
      setExcludedCombinations(new Set());
      setCurrentTab("view");
    } catch (error) {
      console.error("Error creating registrations:", error);
      toast({
        title: "Error",
        description: "Failed to create registrations",
        variant: "destructive",
      });
    }
  };

  const canProceedToStep2 = selectedTrainees.length > 0;
  
  const selectedClient = clients.find(c => c.id === selectedClientId);
  const canProceedToStep3 = registrationType === "selfpay" || 
    (registrationType === "client" && selectedClientId && 
      (!selectedClient?.po_required || (selectedClient?.po_required && orderPO.trim() !== "")));
  
  const canProceedToStep4 = selectedServices.length > 0;

  const filteredTrainees = allTrainees.filter(trainee => {
    if (!traineeSearchQuery.trim()) return true; // Show all when no search query
    const query = traineeSearchQuery.toLowerCase();
    const name = trainee.name?.toLowerCase() || '';
    const firstName = trainee.first_name?.toLowerCase() || '';
    const lastName = trainee.last_name?.toLowerCase() || '';
    const ssn = trainee.ssn?.toLowerCase() || '';
    // Filter out already selected trainees
    const isNotSelected = !selectedTrainees.find(t => t.id === trainee.id);
    return isNotSelected && (name.includes(query) || firstName.includes(query) || lastName.includes(query) || ssn.includes(query));
  });

  const filteredClients = clients.filter(client => {
    if (!clientSearchQuery.trim()) return true;
    const query = clientSearchQuery.toLowerCase();
    const companyName = client.company_name?.toLowerCase() || '';
    const profile = client.profile?.toLowerCase() || '';
    return companyName.includes(query) || profile.includes(query);
  });

  const filteredServices = services.filter(service => {
    if (!serviceSearchQuery.trim()) return true;
    const query = serviceSearchQuery.toLowerCase();
    const name = service.name?.toLowerCase() || '';
    const code = service.service_code?.toLowerCase() || '';
    const category = service.category?.toLowerCase() || '';
    return name.includes(query) || code.includes(query) || category.includes(query);
  });

  const servicesByCategory = filteredServices.reduce((acc, service) => {
    const category = service.category || "Other";
    if (!acc[category]) acc[category] = [];
    acc[category].push(service);
    return acc;
  }, {} as Record<string, Service[]>);

  const totalRegistrations = selectedTrainees.reduce((total, trainee) => {
    return total + selectedServices.filter(service => 
      !isServiceExcluded(trainee.id, service.id)
    ).length;
  }, 0);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-32 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Orders Management</h1>
      </div>

      <Tabs value={currentTab} onValueChange={(v) => setCurrentTab(v as "view" | "create")}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="view">View Orders</TabsTrigger>
          <TabsTrigger value="create">Create Registration</TabsTrigger>
        </TabsList>

        {/* View Orders Tab */}
        <TabsContent value="view" className="mt-6">
          <OrdersTable 
            orders={orders}
            onViewOrder={handleViewOrder}
          />
        </TabsContent>

        {/* Create Registration Tab */}
        <TabsContent value="create" className="mt-6">

        {/* Step Navigation - Horizontal Tabs */}
        <div className="space-y-6">
          <div className="flex items-center gap-1 border-b">
            {[
              { num: 1, label: "Trainees" },
              { num: 2, label: "Registration Type" },
              { num: 3, label: "Service" },
              { num: 4, label: "Review" }
            ].map((step) => (
              <button
                key={step.num}
                type="button"
                onClick={() => {
                  if (step.num === 1 || 
                      (step.num === 2 && canProceedToStep2) ||
                      (step.num === 3 && canProceedToStep3) ||
                      (step.num === 4 && canProceedToStep4)) {
                    setCurrentStep(step.num);
                  }
                }}
                className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
                  currentStep === step.num
                    ? 'bg-primary text-primary-foreground'
                    : currentStep > step.num
                    ? 'bg-muted/50 text-foreground hover:bg-muted cursor-pointer'
                    : 'bg-muted/30 text-muted-foreground cursor-not-allowed'
                }`}
              >
                <span>{step.num}</span>
                <span>{step.label}</span>
              </button>
            ))}
          </div>

          {/* Step Content */}
          <div>
          <Card>
            <CardContent className="p-6">
              {/* Step 1: Trainee Selection */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex gap-3">
                      <Dialog open={isSelectTraineeOpen} onOpenChange={setIsSelectTraineeOpen}>
                        <DialogTrigger asChild>
                          <Button>Select Trainees</Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>Search and Select Trainee</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="relative">
                              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                              <Input
                                placeholder="Search by SSN, first name, or last name"
                                value={traineeSearchQuery}
                                onChange={(e) => setTraineeSearchQuery(e.target.value)}
                                className="pl-8"
                              />
                            </div>
                            <ScrollArea className="h-[300px] border rounded-lg">
                              {filteredTrainees.length > 0 ? (
                                filteredTrainees.map((trainee) => (
                                  <div
                                    key={trainee.id}
                                    onClick={() => {
                                      addTrainee(trainee);
                                      setIsSelectTraineeOpen(false);
                                    }}
                                    className="p-3 hover:bg-muted cursor-pointer border-b last:border-b-0"
                                  >
                                    <div className="font-medium">{trainee.name}</div>
                                    <div className="text-sm text-muted-foreground">
                                      {trainee.unique_id} {trainee.ssn && `• SSN: ${trainee.ssn}`}
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="p-6 text-center text-muted-foreground">
                                  No trainees found
                                </div>
                              )}
                            </ScrollArea>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="link"
                        className="h-auto p-0 text-primary"
                        onClick={() => setIsCreateTraineeOpen(true)}
                      >
                        Create New Trainee
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm mb-3 block font-semibold">SELECTED TRAINEES</Label>
                    <div className="space-y-2">
                      {selectedTrainees.length > 0 ? (
                        selectedTrainees.map((trainee) => (
                          <div key={trainee.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <div className="font-medium">{trainee.name}</div>
                              <div className="text-sm text-muted-foreground">{trainee.unique_id}</div>
                            </div>
                            <Button
                              variant="link"
                              className="h-auto p-0 text-destructive"
                              onClick={() => removeTrainee(trainee.id)}
                            >
                              REMOVE
                            </Button>
                          </div>
                        ))
                      ) : (
                        <div className="p-6 text-center border rounded-lg border-dashed">
                          <p className="text-muted-foreground">No trainees selected</p>
                          <p className="text-sm text-muted-foreground mt-1">Click "Select Trainees" to add</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end mt-6">
                    <Button onClick={() => setCurrentStep(2)} disabled={!canProceedToStep2}>
                      Next
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: Registration Type */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <Label className="text-sm font-semibold mb-4 block">REGISTRATION TYPE</Label>
                    <RadioGroup value={registrationType} onValueChange={(v) => setRegistrationType(v as "client" | "selfpay")}>
                      <div className="flex items-center space-x-2 mb-2">
                        <RadioGroupItem value="client" id="client" />
                        <Label htmlFor="client" className="cursor-pointer">CLIENT TO PAY</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="selfpay" id="selfpay" />
                        <Label htmlFor="selfpay" className="cursor-pointer">Self Pay</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {registrationType === "client" && (
                    <div className="space-y-6 mt-6">
                      <div>
                        <Dialog open={isSelectClientOpen} onOpenChange={setIsSelectClientOpen}>
                          <DialogTrigger asChild>
                            <Button>Select Client</Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>Search and Select Client</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="relative">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                  placeholder="Search by company name or profile ID"
                                  value={clientSearchQuery}
                                  onChange={(e) => setClientSearchQuery(e.target.value)}
                                  className="pl-8"
                                />
                              </div>
                              <ScrollArea className="h-[300px] border rounded-lg">
                                {filteredClients.length > 0 ? (
                                  filteredClients.map((client) => (
                                    <div
                                      key={client.id}
                                      onClick={() => {
                                        setSelectedClientId(client.id);
                                        setIsSelectClientOpen(false);
                                        setClientSearchQuery("");
                                      }}
                                      className="p-3 hover:bg-muted cursor-pointer border-b last:border-b-0"
                                    >
                                      <div className="font-medium">{client.company_name}</div>
                                      {client.profile && (
                                        <div className="text-sm text-muted-foreground">Profile: {client.profile}</div>
                                      )}
                                    </div>
                                  ))
                                ) : (
                                  <div className="p-6 text-center text-muted-foreground">
                                    No clients found
                                  </div>
                                )}
                              </ScrollArea>
                            </div>
                          </DialogContent>
                        </Dialog>
                        
                        {selectedClientId && (
                          <div className="mt-4 p-4 border rounded-lg space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">
                                  {clients.find(c => c.id === selectedClientId)?.company_name}
                                </span>
                                {selectedClient?.mem_status && (
                                  <Badge 
                                    variant={
                                      selectedClient.mem_status.toLowerCase() === 'member' ? 'default' : 
                                      selectedClient.mem_status.toLowerCase() === 'tpa' ? 'secondary' : 
                                      'outline'
                                    }
                                    className={cn(
                                      "capitalize",
                                      selectedClient.mem_status.toLowerCase() === 'member' && "bg-green-600 hover:bg-green-700",
                                      selectedClient.mem_status.toLowerCase() === 'tpa' && "bg-blue-600 hover:bg-blue-700"
                                    )}
                                  >
                                    {selectedClient.mem_status}
                                  </Badge>
                                )}
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedClientId("")}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <Label className="text-sm mb-2 block">
                          ORDER PO Number
                          {selectedClient?.po_required && (
                            <span className="text-destructive ml-1">*</span>
                          )}
                        </Label>
                        <Input
                          placeholder="Enter PO number"
                          value={orderPO}
                          onChange={(e) => setOrderPO(e.target.value)}
                          className={cn(
                            selectedClient?.po_required && orderPO.trim() === "" && "border-destructive focus-visible:ring-destructive"
                          )}
                        />
                        {selectedClient?.po_required && (
                          <p className="text-sm text-muted-foreground mt-1">
                            This client requires a PO number
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setCurrentStep(1)}>
                      Back
                    </Button>
                    <Button onClick={() => setCurrentStep(3)} disabled={!canProceedToStep3}>
                      Next
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Service Selection */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-semibold mb-2 block">SERVICE DATE</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !serviceDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {serviceDate ? format(serviceDate, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={serviceDate}
                            onSelect={(date) => date && setServiceDate(date)}
                            initialFocus
                            className={cn("p-3 pointer-events-auto")}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div>
                      <Label className="text-sm font-semibold mb-2 block">REASON FOR TEST *</Label>
                      <Select value={reasonForTest} onValueChange={setReasonForTest}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select reason for test" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover z-50">
                          <SelectItem value="Pre-Employment">Pre-Employment</SelectItem>
                          <SelectItem value="Pre-Access">Pre-Access</SelectItem>
                          <SelectItem value="Random">Random</SelectItem>
                          <SelectItem value="Follow-up">Follow-up</SelectItem>
                          <SelectItem value="Return to Duty">Return to Duty</SelectItem>
                          <SelectItem value="Post-Accident">Post-Accident</SelectItem>
                          <SelectItem value="Reasonable Suspicion">Reasonable Suspicion</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex justify-between items-center">
                      <Label className="text-sm font-semibold">SERVICES</Label>
                      <Dialog open={isServiceDialogOpen} onOpenChange={setIsServiceDialogOpen}>
                        <DialogTrigger asChild>
                          <Button>SELECT SERVICES</Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh]">
                          <DialogHeader>
                            <DialogTitle>Select Services</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="relative">
                              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                              <Input
                                placeholder="Search services by name, code, or category"
                                value={serviceSearchQuery}
                                onChange={(e) => setServiceSearchQuery(e.target.value)}
                                className="pl-8"
                              />
                            </div>
                            <Tabs defaultValue={Object.keys(servicesByCategory)[0]} className="w-full">
                              <TabsList className="w-full justify-start overflow-x-auto">
                                {Object.keys(servicesByCategory).map((category) => (
                                  <TabsTrigger key={category} value={category}>
                                    {category} ({servicesByCategory[category].length})
                                  </TabsTrigger>
                                ))}
                              </TabsList>
                              {Object.entries(servicesByCategory).map(([category, categoryServices]) => (
                                <TabsContent key={category} value={category}>
                                  <ScrollArea className="h-[400px]">
                                    <div className="space-y-2 p-2">
                                      {categoryServices.map((service) => {
                                        const isSelected = selectedServices.some(s => s.id === service.id);
                                        return (
                                          <div
                                            key={service.id}
                                            className={cn(
                                              "flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors",
                                              isSelected 
                                                ? "bg-primary/10 border-primary" 
                                                : "hover:bg-muted"
                                            )}
                                            onClick={() => {
                                              const date = format(serviceDate, "yyyy-MM-dd");
                                              if (!isSelected) {
                                                addService(service, date);
                                              }
                                            }}
                                          >
                                            <div className="flex-1">
                                              <div className="font-medium flex items-center gap-2">
                                                {service.name}
                                                {isSelected && (
                                                  <Check className="h-4 w-4 text-primary" />
                                                )}
                                              </div>
                                              <div className="text-sm text-muted-foreground">
                                                {service.service_code}
                                              </div>
                                            </div>
                                            <div className="text-sm font-medium">
                                              ${service.member_price}
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </ScrollArea>
                                </TabsContent>
                              ))}
                            </Tabs>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>

                  <div className="border rounded-lg">
                    <div className="bg-muted p-2 grid grid-cols-4 gap-2 text-sm font-semibold">
                      <div>Date</div>
                      <div>Code</div>
                      <div>Name</div>
                      <div></div>
                    </div>
                    <ScrollArea className="h-[300px]">
                      {selectedServices.map((service, index) => (
                        <div key={index} className="p-2 grid grid-cols-4 gap-2 text-sm border-b items-center">
                          <div>{service.date}</div>
                          <div>{service.service_code}</div>
                          <div>{service.name}</div>
                          <div className="flex justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeService(index)}
                            >
                              <X className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </ScrollArea>
                  </div>

                  <div className="text-right text-sm font-semibold">
                    {selectedServices.length} TOTAL
                  </div>

                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setCurrentStep(2)}>
                      Back
                    </Button>
                    <Button onClick={() => setCurrentStep(4)} disabled={!canProceedToStep4 || !reasonForTest}>
                      Next
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 4: Review */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <Label className="text-sm font-semibold">Review</Label>
                  
                  <ScrollArea className="h-[400px]">
                    {selectedTrainees.map((trainee) => (
                      <div key={trainee.id} className="mb-6 border rounded-lg overflow-hidden">
                        <div className="font-semibold mb-2 bg-muted p-2">{trainee.name}</div>
                        <div className="bg-muted/50 p-2 grid grid-cols-6 gap-2 text-xs font-semibold">
                          <div>Name</div>
                          <div>Code</div>
                          <div>Service</div>
                          <div>Bill To</div>
                          <div>Date</div>
                          <div></div>
                        </div>
                        <div className="space-y-1">
                          {selectedServices.map((service, idx) => {
                            const client = clients.find(c => c.id === selectedClientId);
                            const billTo = registrationType === "client" 
                              ? client?.profile || "N/A"
                              : "Self Pay";
                            
                            const isExcluded = isServiceExcluded(trainee.id, service.id);
                            if (isExcluded) return null;
                            
                            return (
                              <div key={idx} className="p-2 grid grid-cols-6 gap-2 text-sm border-b items-center">
                                <div>{trainee.name}</div>
                                <div>{service.service_code}</div>
                                <div>{service.name}</div>
                                <div>{billTo}</div>
                                <div>{service.date}</div>
                                <div className="flex justify-end">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeServiceFromTrainee(trainee.id, service.id)}
                                    className="h-6 w-6 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </ScrollArea>

                  <div className="bg-primary/10 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-semibold">Add {totalRegistrations} Registrations</div>
                        <div className="text-sm text-muted-foreground">
                          Employer: {registrationType === "client" 
                            ? `${clients.find(c => c.id === selectedClientId)?.profile} ${clients.find(c => c.id === selectedClientId)?.short_code} ${clients.find(c => c.id === selectedClientId)?.company_name}`
                            : "SELF PAY"}
                        </div>
                      </div>
                      <Button onClick={createRegistrations} size="lg">
                        <Check className="mr-2 h-4 w-4" />
                        Confirm
                      </Button>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setCurrentStep(3)}>
                      Back
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          </div>
        </div>

        {/* Create Trainee Dialog */}
        <Dialog open={isCreateTraineeOpen} onOpenChange={setIsCreateTraineeOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Trainee</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>First Name *</Label>
              <Input
                value={newTrainee.first_name}
                onChange={(e) => setNewTrainee({ ...newTrainee, first_name: e.target.value })}
                placeholder="Enter first name"
              />
            </div>
            <div>
              <Label>Last Name *</Label>
              <Input
                value={newTrainee.last_name}
                onChange={(e) => setNewTrainee({ ...newTrainee, last_name: e.target.value })}
                placeholder="Enter last name"
              />
            </div>
            <div>
              <Label>SSN</Label>
              <Input
                value={newTrainee.ssn}
                onChange={(e) => setNewTrainee({ ...newTrainee, ssn: e.target.value })}
                placeholder="Enter SSN"
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={newTrainee.email}
                onChange={(e) => setNewTrainee({ ...newTrainee, email: e.target.value })}
                placeholder="Enter email"
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                value={newTrainee.phone}
                onChange={(e) => setNewTrainee({ ...newTrainee, phone: e.target.value })}
                placeholder="Enter phone"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateTraineeOpen(false)}>
                Cancel
              </Button>
              <Button onClick={createTrainee}>
                Create Trainee
              </Button>
            </div>
          </div>
        </DialogContent>
        </Dialog>
        </TabsContent>
      </Tabs>

      {/* Routing Slip Dialog */}
      <RoutingSlip 
        open={isRoutingSlipOpen}
        onOpenChange={setIsRoutingSlipOpen}
        order={selectedOrder}
      />
    </div>
  );
}