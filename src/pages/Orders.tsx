import { useState, useEffect } from "react";
import { Search, X, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  const [currentStep, setCurrentStep] = useState(1);
  
  // Step 1: Trainee Selection
  const [traineeSearchQuery, setTraineeSearchQuery] = useState("");
  const [allTrainees, setAllTrainees] = useState<Trainee[]>([]);
  const [selectedTrainees, setSelectedTrainees] = useState<Trainee[]>([]);
  
  // Step 2: Registration Type
  const [registrationType, setRegistrationType] = useState<"client" | "selfpay">("client");
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [orderPO, setOrderPO] = useState("");
  
  // Step 3: Service Selection
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);
  const [isServiceDialogOpen, setIsServiceDialogOpen] = useState(false);
  
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

  const fetchTrainees = async () => {
    try {
      const { data, error } = await supabase
        .from("trainees")
        .select("id, name, unique_id")
        .eq("status", "active")
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
        .select("id, company_name, contact_person")
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
        const totalAmount = selectedServices.reduce((sum, service) => 
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
            service_date: selectedServices[0]?.date || new Date().toISOString().split('T')[0],
            notes: registrationType === "client" ? `PO: ${orderPO}` : "Self Pay"
          })
          .select()
          .single();

        if (orderError) throw orderError;

        // Create order items for each service
        const orderItems = selectedServices.map(service => ({
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

      // Reset form
      setCurrentStep(1);
      setSelectedTrainees([]);
      setSelectedServices([]);
      setSelectedClientId("");
      setOrderPO("");
      setRegistrationType("client");
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
  const canProceedToStep3 = registrationType === "selfpay" || 
    (registrationType === "client" && selectedClientId);
  const canProceedToStep4 = selectedServices.length > 0;

  const filteredTrainees = allTrainees.filter(trainee => {
    const query = traineeSearchQuery.toLowerCase();
    const lastName = trainee.name?.split(' ').pop()?.toLowerCase() || '';
    const ssn = trainee.ssn?.toLowerCase() || '';
    return lastName.includes(query) || ssn.includes(query);
  });

  const servicesByCategory = services.reduce((acc, service) => {
    const category = service.category || "Other";
    if (!acc[category]) acc[category] = [];
    acc[category].push(service);
    return acc;
  }, {} as Record<string, Service[]>);

  const totalRegistrations = selectedTrainees.length * selectedServices.length;

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
        <h1 className="text-3xl font-bold tracking-tight">Trainee Registration</h1>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {/* Step Navigation */}
        <div className="col-span-1 space-y-2">
          {[
            { num: 1, label: "Trainees" },
            { num: 2, label: "Registration Type" },
            { num: 3, label: "Service" },
            { num: 4, label: "Review" }
          ].map((step) => (
            <button
              key={step.num}
              onClick={() => {
                if (step.num === 1 || 
                    (step.num === 2 && canProceedToStep2) ||
                    (step.num === 3 && canProceedToStep3) ||
                    (step.num === 4 && canProceedToStep4)) {
                  setCurrentStep(step.num);
                }
              }}
              className={`w-full text-left p-3 rounded-lg transition-colors ${
                currentStep === step.num
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="font-semibold">{step.num}</span>
                <span>{step.label}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Step Content */}
        <div className="col-span-3">
          <Card>
            <CardContent className="p-6">
              {/* Step 1: Trainee Selection */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-sm">Search by SSN or Last Name</Label>
                        <Button
                          variant="link"
                          className="h-auto p-0 text-primary"
                          onClick={() => setIsCreateTraineeOpen(true)}
                        >
                          Create New Trainee
                        </Button>
                      </div>
                      <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search by SSN or last name"
                          value={traineeSearchQuery}
                          onChange={(e) => setTraineeSearchQuery(e.target.value)}
                          className="pl-8"
                        />
                      </div>
                      <ScrollArea className="h-[400px] mt-4 border rounded-lg p-2">
                        {filteredTrainees.map((trainee) => (
                          <div
                            key={trainee.id}
                            onClick={() => addTrainee(trainee)}
                            className="p-2 hover:bg-muted cursor-pointer rounded text-sm"
                          >
                            {trainee.name} - {trainee.unique_id}
                          </div>
                        ))}
                      </ScrollArea>
                    </div>
                    <div>
                      <Label className="text-sm mb-2 block">SELECTED</Label>
                      <div className="space-y-2">
                        {selectedTrainees.map((trainee) => (
                          <div key={trainee.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <Button
                                variant="link"
                                className="h-auto p-0 text-primary"
                                onClick={() => removeTrainee(trainee.id)}
                              >
                                REMOVE
                              </Button>
                              <div className="font-medium">{trainee.name}</div>
                            </div>
                            <div className="font-mono text-sm">{trainee.unique_id}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end">
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
                    <div className="grid grid-cols-2 gap-6 mt-6">
                      <div>
                        <Button onClick={() => {
                          const client = clients[0];
                          if (client) setSelectedClientId(client.id);
                        }}>
                          SELECT CLIENT
                        </Button>
                        {selectedClientId && (
                          <div className="mt-4 p-4 border rounded-lg">
                            <div className="font-medium">
                              {clients.find(c => c.id === selectedClientId)?.company_name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {clients.find(c => c.id === selectedClientId)?.contact_person}
                            </div>
                          </div>
                        )}
                        <ScrollArea className="h-[200px] mt-4 border rounded-lg p-2">
                          {clients.map((client) => (
                            <div
                              key={client.id}
                              onClick={() => setSelectedClientId(client.id)}
                              className={`p-2 hover:bg-muted cursor-pointer rounded text-sm ${
                                selectedClientId === client.id ? "bg-muted" : ""
                              }`}
                            >
                              {client.company_name}
                            </div>
                          ))}
                        </ScrollArea>
                      </div>
                      <div>
                        <Label className="text-sm mb-2 block">ORDER PO Number</Label>
                        <Input
                          placeholder="Enter PO number"
                          value={orderPO}
                          onChange={(e) => setOrderPO(e.target.value)}
                        />
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
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-semibold">SERVICE</Label>
                    <Dialog open={isServiceDialogOpen} onOpenChange={setIsServiceDialogOpen}>
                      <DialogTrigger asChild>
                        <Button>SELECT SERVICES</Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh]">
                        <DialogHeader>
                          <DialogTitle>Select Services</DialogTitle>
                        </DialogHeader>
                        <Tabs defaultValue={Object.keys(servicesByCategory)[0]} className="w-full">
                          <TabsList className="w-full justify-start overflow-x-auto">
                            {Object.keys(servicesByCategory).map((category) => (
                              <TabsTrigger key={category} value={category}>
                                {category}
                              </TabsTrigger>
                            ))}
                          </TabsList>
                          {Object.entries(servicesByCategory).map(([category, categoryServices]) => (
                            <TabsContent key={category} value={category}>
                              <ScrollArea className="h-[400px]">
                                <div className="space-y-2 p-2">
                                  {categoryServices.map((service) => (
                                    <div
                                      key={service.id}
                                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted cursor-pointer"
                                      onClick={() => {
                                        const date = new Date().toISOString().split('T')[0];
                                        addService(service, date);
                                      }}
                                    >
                                      <div>
                                        <div className="font-medium">{service.name}</div>
                                        <div className="text-sm text-muted-foreground">
                                          {service.service_code}
                                        </div>
                                      </div>
                                      <div className="text-sm font-medium">
                                        ${service.member_price}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </ScrollArea>
                            </TabsContent>
                          ))}
                        </Tabs>
                      </DialogContent>
                    </Dialog>
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
                    <Button onClick={() => setCurrentStep(4)} disabled={!canProceedToStep4}>
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
                      <div key={trainee.id} className="mb-6 border-b pb-4">
                        <div className="font-semibold mb-2">{trainee.name}</div>
                        <div className="space-y-1">
                          {selectedServices.map((service, idx) => (
                            <div key={idx} className="flex justify-between text-sm p-2 bg-muted/50 rounded">
                              <div className="flex gap-4">
                                <span>{service.service_code}</span>
                                <span>{service.name}</span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-auto p-0 text-destructive"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
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
                            ? clients.find(c => c.id === selectedClientId)?.company_name 
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
    </div>
  );
}