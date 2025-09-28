import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Eye, Pencil } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Database } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";

type Client = Database["public"]["Tables"]["clients"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];

const userSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
});

interface ClientDetailProps {
  client: Client;
  onBack: () => void;
}

export default function ClientDetail({ client, onBack }: ClientDetailProps) {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Profile | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof userSchema>>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
    },
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Create mock users based on client data
      const mockUsers: Profile[] = [
        {
          id: `${client.id}-user-1`,
          user_id: `${client.id}-user-1`,
          first_name: client.contact_person?.split(' ')[0] || "John",
          last_name: client.contact_person?.split(' ')[1] || "Doe",
          email: client.email,
          phone: client.phone,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: `${client.id}-user-2`,
          user_id: `${client.id}-user-2`,
          first_name: "Admin",
          last_name: "User",
          email: `admin@${client.company_name.toLowerCase().replace(/\s+/g, '')}.com`,
          phone: client.phone,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ];
      
      setUsers(mockUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    form.reset();
    setEditingUser(null);
  };

  const handleEditUser = (user: Profile) => {
    setEditingUser(user);
    form.reset({
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      email: user.email || "",
      phone: user.phone || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleSubmit = async (values: z.infer<typeof userSchema>) => {
    if (!editingUser) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: values.first_name,
          last_name: values.last_name,
          email: values.email,
          phone: values.phone,
        })
        .eq("id", editingUser.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "User updated successfully",
      });

      setIsEditDialogOpen(false);
      resetForm();
      fetchUsers();
    } catch (error) {
      console.error("Error updating user:", error);
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Client Details:</h1>
        </div>
        <Button className="bg-cyan-500 hover:bg-cyan-600">
          Return
        </Button>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">GENERAL</TabsTrigger>
          <TabsTrigger value="notes">NOTES</TabsTrigger>
          <TabsTrigger value="users">USERS</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label>Profile ID</Label>
                <Input value={client.profile || ""} readOnly />
              </div>
              <div>
                <Label>Client Code</Label>
                <Input value={client.short_code || ""} readOnly />
              </div>
              <div>
                <Label>Company Name</Label>
                <Input value={client.company_name || ""} readOnly />
              </div>
              <div>
                <Label>Contact Person</Label>
                <Input value={client.contact_person || ""} readOnly />
              </div>
              <div>
                <Label>Email</Label>
                <Input value={client.email || ""} readOnly />
              </div>
              <div>
                <Label>Phone</Label>
                <Input value={client.phone || ""} readOnly />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <Label>Membership Status</Label>
                <Input value={client.mem_status || ""} readOnly />
              </div>
              <div>
                <Label>Membership Type</Label>
                <Input value={client.mem_type || ""} readOnly />
              </div>
              <div>
                <Label>Payment Status</Label>
                <Input value={client.payment_status || ""} readOnly />
              </div>
              <div>
                <Label>Street Address</Label>
                <Input value={client.mailing_street_address || ""} readOnly />
              </div>
              <div>
                <Label>City, State, Zip</Label>
                <Input value={client.mailing_city_state_zip || ""} readOnly />
              </div>
              <div>
                <Label>Comments</Label>
                <Input value={client.comments || ""} readOnly />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="notes" className="mt-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Client Notes</h3>
              <Button className="bg-cyan-500 hover:bg-cyan-600">
                <Plus className="w-4 h-4 mr-2" />
                Add Note
              </Button>
            </div>
            <div className="border rounded-lg p-4">
              <p className="text-muted-foreground">No notes available for this client.</p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="users" className="mt-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Active Users</h3>
              <div className="flex gap-2">
                <Button className="bg-cyan-500 hover:bg-cyan-600">
                  View All
                </Button>
                <Button className="bg-green-500 hover:bg-green-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Add New User
                </Button>
              </div>
            </div>

            <div className="border rounded-lg">
              <Table>
                <TableHeader className="bg-gray-800">
                  <TableRow>
                    <TableHead className="text-white">First Name</TableHead>
                    <TableHead className="text-white">Last Name</TableHead>
                    <TableHead className="text-white">Email</TableHead>
                    <TableHead className="text-white">Phone</TableHead>
                    <TableHead className="text-white">Last Logon</TableHead>
                    <TableHead className="text-white">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">
                        Loading users...
                      </TableCell>
                    </TableRow>
                  ) : users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">
                        No users found for this client.
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.first_name}</TableCell>
                        <TableCell>{user.last_name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.phone || "—"}</TableCell>
                        <TableCell>—</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditUser(user)}
                              className="text-blue-500 hover:text-blue-600"
                            >
                              <Pencil className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-cyan-500 hover:text-cyan-600"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="text-sm text-muted-foreground">
              SHOWING {users.length > 0 ? "1" : "0"} TO {users.length} OF {users.length} ENTRIES
            </div>
          </div>

          {/* Edit User Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader className="flex flex-row items-center justify-between">
                <DialogTitle className="text-xl font-semibold">Edit Link User</DialogTitle>
                <Button className="bg-cyan-500 hover:bg-cyan-600 text-white">
                  📧 Send Credentials
                </Button>
              </DialogHeader>
              
              <div className="grid grid-cols-12 gap-6 mt-6">
                {/* Left Column */}
                <div className="col-span-4 space-y-4">
                  <div className="flex items-center gap-4">
                    <span className="font-medium">
                      {editingUser?.first_name}_{editingUser?.last_name}
                    </span>
                    <Button variant="link" className="text-cyan-500 p-0 h-auto">
                      Username
                    </Button>
                  </div>
                  
                  <Button className="bg-cyan-500 hover:bg-cyan-600 text-white w-full">
                    Login as User
                  </Button>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox id="disabled" />
                    <Label htmlFor="disabled">Disabled</Label>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Company Code</Label>
                    <div className="relative">
                      <Input 
                        value={client.short_code || "RIOTEST"} 
                        readOnly 
                        className="pr-8"
                      />
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="absolute right-1 top-1 h-6 w-6 p-0"
                      >
                        🔍
                      </Button>
                    </div>
                  </div>
                  
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="first_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name*</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="last_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name*</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div>
                        <Label>Portal Phone</Label>
                        <Input 
                          value={editingUser?.phone || ""} 
                          placeholder="Phone number"
                        />
                      </div>
                      
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
                      
                      <div>
                        <Label>Title</Label>
                        <Input placeholder="Director" />
                      </div>
                    </form>
                  </Form>
                </div>
                
                {/* Right Column - Tabs and Roles */}
                <div className="col-span-8">
                  <Tabs defaultValue="general" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="general">GENERAL</TabsTrigger>
                      <TabsTrigger value="notes">NOTES</TabsTrigger>
                      <TabsTrigger value="login-history">LOGIN HISTORY</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="general" className="mt-4">
                      <div>
                        <h3 className="font-semibold mb-4">Roles</h3>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox id="training-reg" defaultChecked />
                            <Label htmlFor="training-reg">Training Registration</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="training-history" defaultChecked />
                            <Label htmlFor="training-history">Training History</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="roster" defaultChecked />
                            <Label htmlFor="roster">Roster</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="roster-edit" defaultChecked />
                            <Label htmlFor="roster-edit">Roster Edit</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="user-admin" defaultChecked />
                            <Label htmlFor="user-admin">User Admin</Label>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="notes" className="mt-4">
                      <div className="text-muted-foreground">Notes section coming soon...</div>
                    </TabsContent>
                    
                    <TabsContent value="login-history" className="mt-4">
                      <div className="text-muted-foreground">Login history coming soon...</div>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
              
              <div className="flex justify-start gap-2 mt-6 pt-4 border-t">
                <Button 
                  className="bg-cyan-500 hover:bg-cyan-600 text-white"
                  onClick={() => form.handleSubmit(handleSubmit)()}
                >
                  Save
                </Button>
                <Button 
                  variant="link" 
                  className="text-cyan-500"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Return
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </div>
  );
}