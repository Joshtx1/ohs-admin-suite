import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Pencil, Save, X, Plus } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Database } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";
import { US_STATES } from "@/lib/constants/us-states";

type Client = Database["public"]["Tables"]["clients"]["Row"];

const clientSchema = z.object({
  company_name: z.string().min(1, "Company name is required"),
  contact_person: z.string().min(1, "Contact person is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone is required"),
  mem_status: z.string().min(1, "Account type is required"),
  mem_type: z.string().min(1, "Member type is required"),
  po_required: z.boolean().default(false),
  billing_name: z.string().optional(),
  billing_emails: z.string().optional(),
  billing_street_address: z.string().optional(),
  billing_city: z.string().optional(),
  billing_state: z.string().optional(),
  billing_zip: z.string().optional(),
  physical_street_address: z.string().optional(),
  physical_city: z.string().optional(),
  physical_state: z.string().optional(),
  physical_zip: z.string().optional(),
  comments: z.string().optional(),
  payment_status: z.string().optional(),
  net_terms: z.string().optional(),
  status: z.enum(["active", "inactive", "suspended"]).default("active"),
});

interface ClientDetailProps {
  client: Client;
  onBack: () => void;
}

export default function ClientDetail({ client, onBack }: ClientDetailProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [currentUserName, setCurrentUserName] = useState("");
  const [localClient, setLocalClient] = useState(client);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("first_name, last_name")
          .eq("user_id", user.id)
          .single();
        
        if (profile) {
          setCurrentUserName(`${profile.first_name} ${profile.last_name}`);
        }
      }
    };
    fetchUserProfile();
  }, []);

  useEffect(() => {
    setLocalClient(client);
  }, [client]);

  const form = useForm<z.infer<typeof clientSchema>>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      company_name: client.company_name || "",
      contact_person: client.contact_person || "",
      email: client.email || "",
      phone: client.phone || "",
      mem_status: client.mem_status || "Member",
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
      comments: client.comments || "",
      payment_status: client.payment_status || "Check",
      net_terms: client.net_terms || "30",
      status: (client.status === "active" || client.status === "inactive" || client.status === "suspended") ? client.status : "active",
    },
  });

  const handleSave = async (values: z.infer<typeof clientSchema>) => {
    try {
      setIsSaving(true);
      const { error } = await supabase
        .from("clients")
        .update({
          company_name: values.company_name,
          contact_person: values.contact_person,
          email: values.email,
          phone: values.phone,
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
          comments: values.comments || null,
          payment_status: values.payment_status || null,
          net_terms: values.net_terms || null,
          status: values.status,
        })
        .eq("id", localClient.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Client updated successfully",
      });
      setIsEditMode(false);
      onBack(); // Refresh the parent view
    } catch (error) {
      console.error("Error updating client:", error);
      toast({
        title: "Error",
        description: "Failed to update client",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const DetailField = ({ label, value }: { label: string; value: string | null | undefined }) => (
    <div className="mb-2">
      <span className="font-semibold">{label}: </span>
      <span>{value || "-"}</span>
    </div>
  );

  const SectionHeader = ({ title }: { title: string }) => (
    <h3 className="text-lg font-bold mb-3 mt-4">{title}</h3>
  );

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    
    try {
      setIsAddingComment(true);
      const existingComments = localClient.comments || "";
      const timestamp = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      const commentPrefix = `- ${currentUserName} ${timestamp}`;
      const newCommentText = `${commentPrefix}\n${newComment}`;
      
      // Add new comment at the beginning (newest on top)
      const updatedComments = existingComments 
        ? `${newCommentText}\n\n${existingComments}`
        : newCommentText;

      const { error } = await supabase
        .from("clients")
        .update({ comments: updatedComments })
        .eq("id", localClient.id);

      if (error) throw error;

      // Update local state to show the new comment immediately
      setLocalClient({ ...localClient, comments: updatedComments });

      toast({
        title: "Success",
        description: "Comment added successfully",
      });
      setNewComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      });
    } finally {
      setIsAddingComment(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Client Detail</CardTitle>
          <CardDescription>Manage Client Information and Billing Details</CardDescription>
        </CardHeader>
      </Card>

      <div className="flex items-center justify-between mb-6">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        {!isEditMode ? (
          <Button onClick={() => setIsEditMode(true)}>
            <Pencil className="w-4 h-4 mr-2" />
            Edit Client
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button onClick={() => setIsEditMode(false)} variant="outline">
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={form.handleSubmit(handleSave)} disabled={isSaving}>
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        )}
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-6">
          {!isEditMode ? (
            <div className="bg-card rounded-lg border p-6">
              {/* Internal */}
              <SectionHeader title="Internal" />
              <DetailField label="Billing ID" value={localClient.billing_id} />
              <DetailField label="Short Code" value={localClient.short_code} />

              {/* Company Information */}
              <SectionHeader title="Company Information" />
              <DetailField label="Company Name" value={localClient.company_name} />
              <DetailField label="Contact Person" value={localClient.contact_person} />
              <DetailField label="Contact Email" value={localClient.email} />
              <DetailField label="Phone" value={localClient.phone} />
              
              <div className="mt-4 pl-4 border-l-2 border-muted">
                <p className="font-semibold text-sm mb-2">Billing Address:</p>
                <div className="text-sm mb-2">
                  {localClient.billing_street_address && <div>{localClient.billing_street_address}</div>}
                  {(localClient.billing_city || localClient.billing_state || localClient.billing_zip) && (
                    <div>{[localClient.billing_city, localClient.billing_state, localClient.billing_zip].filter(Boolean).join(', ')}</div>
                  )}
                  {!localClient.billing_street_address && !localClient.billing_city && <div className="text-muted-foreground">-</div>}
                </div>

                <p className="font-semibold text-sm mb-2 mt-3">Mailing Address:</p>
                <div className="text-sm mb-2">
                  {localClient.mailing_street_address && <div>{localClient.mailing_street_address}</div>}
                  {(localClient.billing_city || localClient.billing_state || localClient.billing_zip) && (
                    <div>{[localClient.billing_city, localClient.billing_state, localClient.billing_zip].filter(Boolean).join(', ')}</div>
                  )}
                  {!localClient.mailing_street_address && !localClient.billing_city && <div className="text-muted-foreground">-</div>}
                </div>

                <p className="font-semibold text-sm mb-2 mt-3">Physical Address:</p>
                <div className="text-sm">
                  {localClient.physical_street_address && <div>{localClient.physical_street_address}</div>}
                  {(localClient.physical_city || localClient.physical_state || localClient.physical_zip) && (
                    <div>{[localClient.physical_city, localClient.physical_state, localClient.physical_zip].filter(Boolean).join(', ')}</div>
                  )}
                  {!localClient.physical_street_address && !localClient.physical_city && <div className="text-muted-foreground">-</div>}
                </div>
              </div>

              {/* Account Info */}
              <SectionHeader title="Account Info" />
              <DetailField label="Account Type" value={localClient.mem_status} />
              <DetailField label="Status" value={localClient.status} />
              <DetailField label="Member Type" value={localClient.mem_type} />
              <DetailField label="PO Required" value={localClient.po_required ? "Yes" : "No"} />

              {/* Billing Remit Info */}
              <SectionHeader title="Billing Remit Info" />
              <div className="mb-2 pl-4 border-l-2 border-muted">
                <p className="font-semibold text-sm mb-2">Billing Address (managed in Company Information):</p>
                <div className="text-sm mb-3 text-muted-foreground">
                  {localClient.billing_street_address && <div>{localClient.billing_street_address}</div>}
                  {(localClient.billing_city || localClient.billing_state || localClient.billing_zip) && (
                    <div>{[localClient.billing_city, localClient.billing_state, localClient.billing_zip].filter(Boolean).join(', ')}</div>
                  )}
                  {!localClient.billing_street_address && !localClient.billing_city && <div>-</div>}
                </div>
              </div>
              <DetailField label="Payment Method" value={localClient.payment_status} />
              <DetailField label="Net Terms" value={localClient.net_terms ? `${localClient.net_terms} Days` : null} />
              <DetailField label="Billing Title" value={localClient.billing_name} />

              {/* Billing Email(s) */}
              <SectionHeader title="Billing Email(s)" />
              <div className="mb-2">
                {Array.isArray(localClient.billing_emails) && localClient.billing_emails.length > 0 ? (
                  localClient.billing_emails.map((email, idx) => (
                    <div key={idx}>{email}</div>
                  ))
                ) : (
                  <div className="text-muted-foreground">-</div>
                )}
              </div>
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Edit Client Information</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form className="grid grid-cols-2 gap-4">
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
                        <SelectItem value="Member">Member</SelectItem>
                        <SelectItem value="Non-member">Non-member</SelectItem>
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
                    <FormLabel>Member Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select member type" />
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
                name="po_required"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>PO Required</FormLabel>
                    </div>
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
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
                <Button type="button" variant="outline" onClick={() => setIsEditMode(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving} className="bg-green-500 hover:bg-green-600">
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="notes" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Notes & Comments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Textarea
                      placeholder="Add a new comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      rows={4}
                    />
                    <Button 
                      onClick={handleAddComment} 
                      disabled={isAddingComment || !newComment.trim()}
                      className="mt-2"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Comment
                    </Button>
                  </div>

                  {localClient.comments && (
                    <div className="border-t pt-4">
                      <h4 className="font-semibold mb-2">Comments History (Newest First):</h4>
                      <div className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-md">
                        {localClient.comments}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );
  }
