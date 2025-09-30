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
import { Pencil, Plus, Trash2, Search, Download, SlidersHorizontal } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import ClientDetail from "@/components/ClientDetail";
import { getStatusBadgeVariant, getStatusDisplay } from "@/lib/status";

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
  mem_status: z.string().min(1, "Client type is required"),
  mem_type: z.string().min(1, "Membership type is required"),
  mailing_street_address: z.string().optional(),
  mailing_city_state_zip: z.string().optional(),
  bill_to: z.string().optional(),
  comments: z.string().optional(),
  payment_status: z.string().optional(),
  payment_terms: z.string().optional(),
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
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
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
      mailing_street_address: "",
      mailing_city_state_zip: "",
      bill_to: "",
      comments: "",
      payment_status: "Check",
      payment_terms: "Bill",
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
      const clientData: InsertClient = {
        profile: values.profile,
        company_name: values.company_name,
        contact_person: values.contact_person,
        email: values.email,
        phone: values.phone,
        short_code: values.short_code,
        mem_status: values.mem_status,
        mem_type: values.mem_type,
        mailing_street_address: values.mailing_street_address || null,
        mailing_city_state_zip: values.mailing_city_state_zip || null,
        bill_to: values.bill_to || null,
        comments: values.comments || null,
        payment_status: values.payment_status || null,
        payment_terms: values.payment_terms || null,
        status: values.status,
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
    } catch (error) {
      console.error("Error saving client:", error);
      toast({
        title: "Error",
        description: "Failed to save client",
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
      mailing_street_address: client.mailing_street_address || "",
      mailing_city_state_zip: client.mailing_city_state_zip || "",
      bill_to: client.bill_to || "",
      comments: client.comments || "",
      payment_status: client.payment_status || "Check",
      payment_terms: client.payment_terms || "Bill",
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
    
    return matchesSearch && matchesStatus;
  });

  const exportToCSV = () => {
    const headers = ["Profile", "Client Code", "Company Name", "Status", "Address"];
    const csvContent = [
      headers.join(","),
      ...filteredClients.map(client => [
        client.profile || "",
        client.short_code || "",
        client.company_name || "",
        client.status || "",
        client.mailing_street_address || ""
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
          <DialogContent className="max-w-2xl">
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
                      <FormLabel>Client Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select client type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="member">Member</SelectItem>
                          <SelectItem value="non-member">Non-Member</SelectItem>
                          <SelectItem value="Owner">Owner</SelectItem>
                          <SelectItem value="TPA">TPA</SelectItem>
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
                      <FormLabel>Membership Type</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="payment_status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Status</FormLabel>
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
                  name="mailing_street_address"
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
                <FormField
                  control={form.control}
                  name="mailing_city_state_zip"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City, State, Zip</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportToCSV} className="bg-cyan-500 hover:bg-cyan-600">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" className="text-cyan-500 border-cyan-500 hover:bg-cyan-50">
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            View Optional Filters
          </Button>
        </div>
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
                {userRole === "admin" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(client.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            )
          },
          {
            header: 'Profile ID',
            accessorKey: 'profile'
          },
          {
            header: 'Client Code',
            accessorKey: 'short_code'
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
            header: 'Address',
            accessorKey: 'mailing_street_address'
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