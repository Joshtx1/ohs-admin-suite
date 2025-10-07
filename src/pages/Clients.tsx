import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/common/DataTable";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Plus, Search, Download, SlidersHorizontal } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import ClientDetail from "@/components/ClientDetail";
import { getStatusBadgeVariant, getStatusDisplay } from "@/lib/status";
import { US_STATES } from "@/lib/constants/us-states";

import { Database } from "@/integrations/supabase/types";

type DatabaseClient = Database["public"]["Tables"]["clients"]["Row"];
type InsertClient = Database["public"]["Tables"]["clients"]["Insert"];

const clientSchema = z.object({
  profile: z.string().min(1, "Profile is required"),
  company_name: z.string().min(1, "Company name is required"),
  contact_person: z.string().min(1, "Contact person is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone is required"),
  short_code: z.string().min(1, "Short code is required"),
  mem_status: z.string().min(1, "Account type is required"),
  mem_type: z.string().min(1, "Account type is required"),
  po_required: z.boolean().default(false),
  billing_name: z.string().optional(),
  billing_emails: z.string().optional(),
  billing_street_address: z.string().optional(),
  billing_city: z.string().optional(),
  billing_state: z.string().optional(),
  billing_zip: z.string().optional().refine((val) => !val || /^\d{5}(-\d{4})?$/.test(val), {
    message: "Invalid ZIP code format (use 12345 or 12345-6789)",
  }),
  physical_street_address: z.string().optional(),
  physical_city: z.string().optional(),
  physical_state: z.string().optional(),
  physical_zip: z.string().optional().refine((val) => !val || /^\d{5}(-\d{4})?$/.test(val), {
    message: "Invalid ZIP code format (use 12345 or 12345-6789)",
  }),
  bill_to: z.string().optional(),
  comments: z.string().optional(),
  payment_status: z.string().optional(),
  payment_terms: z.string().optional(),
  net_terms: z.string().optional(),
  status: z.enum(["active", "inactive", "suspended"]).default("active"),
});

type Client = DatabaseClient;

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [clientTypeFilter, setClientTypeFilter] = useState("all");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showAdditionalFilters, setShowAdditionalFilters] = useState(false);
  const { userRole } = useAuth();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof clientSchema>>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      profile: "",
      company_name: "",
      contact_person: "",
      email: "",
      phone: "",
      short_code: "",
      mem_status: "member",
      mem_type: "Contractor",
      po_required: false,
      billing_name: "",
      billing_emails: "",
      billing_street_address: "",
      billing_city: "",
      billing_state: "",
      billing_zip: "",
      physical_street_address: "",
      physical_city: "",
      physical_state: "",
      physical_zip: "",
      bill_to: "",
      comments: "",
      payment_status: "Check",
      payment_terms: "Bill",
      net_terms: "30",
      status: "active",
    },
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .order("profile", { ascending: true });

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error("Error fetching clients:", error);
      toast({
        title: "Error",
        description: "Failed to fetch clients",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    form.reset();
    setEditingClient(null);
  };

  const handleSubmit = async (values: z.infer<typeof clientSchema>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Error",
          description: "You must be logged in to add clients",
          variant: "destructive",
        });
        return;
      }

      const clientData: InsertClient = {
        profile: values.profile,
        company_name: values.company_name,
        contact_person: values.contact_person,
        email: values.email,
        phone: values.phone,
        short_code: values.short_code,
        mem_status: values.mem_status,
        mem_type: values.mem_type,
        po_required: values.po_required,
        billing_name: values.billing_name || null,
        billing_emails: values.billing_emails ? values.billing_emails.split(',').map(e => e.trim()).filter(e => e) : null,
        billing_street_address: values.billing_street_address || null,
        billing_city: values.billing_city || null,
        billing_state: values.billing_state || null,
        billing_zip: values.billing_zip || null,
        physical_street_address: values.physical_street_address || null,
        physical_city: values.physical_city || null,
        physical_state: values.physical_state || null,
        physical_zip: values.physical_zip || null,
        bill_to: values.bill_to || null,
        comments: values.comments || null,
        payment_status: values.payment_status || null,
        payment_terms: values.payment_terms || null,
        net_terms: values.net_terms || null,
        status: values.status,
        created_by: user.id,
      };

      if (editingClient) {
        const { error } = await supabase
          .from("clients")
          .update(clientData)
          .eq("id", editingClient.id);

        if (error) throw error;
        toast({ title: "Success", description: "Client updated successfully" });
      } else {
        const { error } = await supabase
          .from("clients")
          .insert([clientData]);

        if (error) throw error;
        toast({ title: "Success", description: "Client created successfully" });
      }

      fetchClients();
      setIsDialogOpen(false);
      resetForm();
    } catch (error: any) {
      console.error("Error saving client:", error);
      
      // Show more specific error messages
      let errorMessage = "Failed to save client";
      if (error?.message) {
        errorMessage = error.message;
      } else if (error?.code === "23505") {
        errorMessage = "A client with this profile ID or code already exists";
      } else if (error?.code === "23502") {
        errorMessage = "Missing required field. Please fill in all required fields";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    form.reset({
      profile: client.profile || "",
      company_name: client.company_name || "",
      contact_person: client.contact_person || "",
      email: client.email || "",
      phone: client.phone || "",
      short_code: client.short_code || "",
      mem_status: client.mem_status || "member",
      mem_type: client.mem_type || "Contractor",
      po_required: client.po_required || false,
      billing_name: client.billing_name || "",
      billing_emails: Array.isArray(client.billing_emails) ? client.billing_emails.join(', ') : "",
      billing_street_address: client.billing_street_address || "",
      billing_city: client.billing_city || "",
      billing_state: client.billing_state || "",
      billing_zip: client.billing_zip || "",
      physical_street_address: client.physical_street_address || "",
      physical_city: client.physical_city || "",
      physical_state: client.physical_state || "",
      physical_zip: client.physical_zip || "",
      bill_to: client.bill_to || "",
      comments: client.comments || "",
      payment_status: client.payment_status || "Check",
      payment_terms: client.payment_terms || "Bill",
      net_terms: client.net_terms || "30",
      status: (client.status === "active" || client.status === "inactive" || client.status === "suspended") ? client.status : "active",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("clients")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast({ title: "Success", description: "Client deleted successfully" });
      fetchClients();
    } catch (error) {
      console.error("Error deleting client:", error);
      toast({
        title: "Error",
        description: "Failed to delete client",
        variant: "destructive",
      });
    }
  };

  const filteredClients = clients.filter((client) => {
    const matchesSearch = 
      client.profile?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.short_code?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || client.status === statusFilter;
    const matchesClientType = clientTypeFilter === "all" || client.mem_status === clientTypeFilter;
    
    return matchesSearch && matchesStatus && matchesClientType;
  });

  const exportToCSV = () => {
    const headers = ["Profile", "Client Type", "Company Name", "Status", "Payment Method"];
    const csvContent = [
      headers.join(","),
      ...filteredClients.map(client => [
        client.profile || "",
        client.mem_status || "",
        client.company_name || "",
        client.status || "",
        client.payment_status || ""
      ].map(field => `"${field}"`).join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "clients.csv";
    a.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading clients...</div>
      </div>
    );
  }

  if (selectedClient) {
    return (
      <ClientDetail 
        client={selectedClient} 
        onBack={() => setSelectedClient(null)} 
      />
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Clients</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Add Client
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingClient ? "Edit Client" : "Add New Client"}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="profile"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Profile (Billing ID)</FormLabel>
                      <FormControl>
                        <Input placeholder="RP-00001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="short_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client Code</FormLabel>
                      <FormControl>
                        <Input placeholder="OHM" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="company_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contact_person"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Person</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="mem_status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select account type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="member">Member</SelectItem>
                          <SelectItem value="non-member">Non-Member</SelectItem>
                          <SelectItem value="TPA">TPA</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">In-Active</SelectItem>
                          <SelectItem value="suspended">Suspended</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="mem_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select account type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Contractor">Contractor</SelectItem>
                          <SelectItem value="TPA">TPA</SelectItem>
                          <SelectItem value="Owner">Owner</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="payment_status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Method</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select payment method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Check">Check</SelectItem>
                          <SelectItem value="ACH">ACH</SelectItem>
                          <SelectItem value="Credit Card">Credit Card</SelectItem>
                          <SelectItem value="Cash">Cash</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="net_terms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Net Terms</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select net terms" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="30">30 Days</SelectItem>
                          <SelectItem value="45">45 Days</SelectItem>
                          <SelectItem value="60">60 Days</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="payment_terms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Terms</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select payment terms" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Bill">Bill</SelectItem>
                          <SelectItem value="Cash">Cash</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="po_required"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>PO Required</FormLabel>
                      </div>
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                          className="h-4 w-4"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Billing Remit Info Section */}
                <div className="col-span-2">
                  <h3 className="text-lg font-semibold mb-3">Billing Remit Info</h3>
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="billing_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Billing Name</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Name on invoice" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="billing_emails"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Billing Email(s)</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="email1@example.com, email2@example.com" />
                          </FormControl>
                          <p className="text-xs text-muted-foreground">Separate multiple emails with commas</p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="billing_street_address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Street Address</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="billing_city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="City" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="billing_state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>State</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="State" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {US_STATES.map((state) => (
                                  <SelectItem key={state.value} value={state.value}>
                                    {state.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="billing_zip"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ZIP Code</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="12345" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>

                {/* Physical Address Section */}
                <div className="col-span-2">
                  <h3 className="text-lg font-semibold mb-3">Physical Address</h3>
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="physical_street_address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Street Address</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="physical_city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="City" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="physical_state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>State</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="State" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {US_STATES.map((state) => (
                                  <SelectItem key={state.value} value={state.value}>
                                    {state.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="physical_zip"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ZIP Code</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="12345" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
                <FormField
                  control={form.control}
                  name="comments"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Comments</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="col-span-2 flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingClient ? "Update" : "Create"} Client
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter Section */}
      <div className="mb-6 space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search by client code, company name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Button onClick={exportToCSV} className="bg-cyan-500 hover:bg-cyan-600">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button 
            variant="outline" 
            className="text-cyan-500 border-cyan-500 hover:bg-cyan-50"
            onClick={() => setShowAdditionalFilters(!showAdditionalFilters)}
          >
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            Additional Filters
          </Button>
        </div>
        
        {showAdditionalFilters && (
          <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Client Type</label>
              <Select value={clientTypeFilter} onValueChange={setClientTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="non-member">Non-Member</SelectItem>
                  <SelectItem value="Owner">Owner</SelectItem>
                  <SelectItem value="TPA">TPA</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button 
                variant="ghost" 
                onClick={() => {
                  setClientTypeFilter("all");
                  setStatusFilter("all");
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <DataTable 
        data={filteredClients}
        columns={[
          {
            header: 'Actions',
            cell: (client) => (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedClient(client)}
                  className="text-cyan-500 hover:text-cyan-600"
                >
                  <Pencil className="w-4 h-4" />
                  Details
                </Button>
              </div>
            )
          },
          {
            header: 'Profile ID',
            accessorKey: 'profile'
          },
          {
            header: 'Client Type',
            accessorKey: 'mem_status'
          },
          {
            header: 'Company Name',
            accessorKey: 'company_name'
          },
          {
            header: 'Status',
            cell: (client) => (
              <Badge variant={getStatusBadgeVariant(client.status)}>
                {getStatusDisplay(client.status)}
              </Badge>
            )
          },
          {
            header: 'Contact',
            cell: (client) => (
              <div>
                <div>{client.contact_person}</div>
                <div className="text-sm text-muted-foreground">{client.email}</div>
                <div className="text-sm text-muted-foreground">{client.phone}</div>
              </div>
            )
          },
          {
            header: 'Payment Method',
            accessorKey: 'payment_status'
          }
        ]}
        pageSize={10}
      />
    </div>
  );
}