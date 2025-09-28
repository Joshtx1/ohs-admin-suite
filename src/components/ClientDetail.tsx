import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Plus, Eye } from "lucide-react";
import { Database } from "@/integrations/supabase/types";

type Client = Database["public"]["Tables"]["clients"]["Row"];

interface ClientDetailProps {
  client: Client;
  onBack: () => void;
}

export default function ClientDetail({ client, onBack }: ClientDetailProps) {
  // Mock user data - in a real app, this would come from your database
  const [users] = useState([
    {
      id: "1",
      firstName: "Danielle",
      lastName: "Horn_RP",
      email: "dhorn@hasc.com",
      phone: "281-476-9900",
      lastLogon: "6/5/2025 6:15:54 AM",
    },
    {
      id: "2", 
      firstName: "Josh",
      lastName: "Trevino",
      email: "jtrevino@rioplexsafetycouncil.com",
      phone: "9563317161",
      lastLogon: "",
    },
  ]);

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
          <TabsTrigger value="users" className="bg-cyan-500 text-white data-[state=active]:bg-cyan-600">
            USERS
          </TabsTrigger>
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
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.firstName}</TableCell>
                      <TableCell>{user.lastName}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.phone}</TableCell>
                      <TableCell>{user.lastLogon || "—"}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-cyan-500 hover:text-cyan-600"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="text-sm text-muted-foreground">
              SHOWING 1 TO 2 OF 2 ENTRIES
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}