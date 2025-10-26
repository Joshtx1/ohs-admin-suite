import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MetadataFieldBuilder, MetadataField, METADATA_TEMPLATES } from "@/components/MetadataFieldBuilder";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Copy } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const ServiceTemplateManager = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [templateKey, setTemplateKey] = useState<string>("");
  const [customFields, setCustomFields] = useState<MetadataField[]>([]);
  const queryClient = useQueryClient();

  const { data: services, isLoading } = useQuery({
    queryKey: ["services-with-templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .order("name");
      
      if (error) throw error;
      return data;
    },
  });

  const updateServiceMutation = useMutation({
    mutationFn: async ({ id, metadata }: { id: string; metadata: any }) => {
      const { error } = await supabase
        .from("services")
        .update({ service_metadata: metadata })
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services-with-templates"] });
      toast.success("Service template updated successfully");
      handleCloseDialog();
    },
    onError: (error) => {
      toast.error("Failed to update service template");
      console.error(error);
    },
  });

  const handleOpenDialog = (service?: any) => {
    if (service) {
      setEditingService(service);
      const metadata = (service.service_metadata || {}) as any;
      setCustomFields(metadata.fields || []);
    } else {
      setEditingService(null);
      setCustomFields([]);
    }
    setTemplateKey("");
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingService(null);
    setCustomFields([]);
    setTemplateKey("");
  };

  const handleApplyTemplate = (key: string) => {
    const template = METADATA_TEMPLATES[key];
    if (template) {
      setCustomFields(template.fields);
      setTemplateKey(key);
      toast.success("Template applied");
    }
  };

  const handleSave = () => {
    if (!editingService) {
      toast.error("No service selected");
      return;
    }

    const metadata = {
      fields: customFields,
      templateKey: templateKey || undefined,
    };

    updateServiceMutation.mutate({
      id: editingService.id,
      metadata,
    });
  };

  const getFieldTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      text: "default",
      number: "secondary",
      select: "outline",
      boolean: "default",
      date: "secondary",
      textarea: "outline",
    };
    return colors[type] || "default";
  };

  if (isLoading) {
    return <div>Loading services...</div>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Service Metadata Templates</CardTitle>
          <CardDescription>
            Configure custom fields and templates for each service type. These fields will be collected when creating orders.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            {services?.map((service) => {
              const metadata = (service.service_metadata || {}) as any;
              const fieldCount = metadata.fields?.length || 0;
              const hasTemplate = !!metadata.templateKey;

              return (
                <Card key={service.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{service.name}</h4>
                        <Badge variant="secondary" className="text-xs">
                          {service.service_code}
                        </Badge>
                        {hasTemplate && (
                          <Badge variant="outline" className="text-xs">
                            <Copy className="h-3 w-3 mr-1" />
                            {metadata.templateKey}
                          </Badge>
                        )}
                      </div>
                      
                      {fieldCount > 0 ? (
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">
                            {fieldCount} custom field{fieldCount !== 1 ? 's' : ''} configured
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {metadata.fields?.slice(0, 3).map((field: MetadataField, idx: number) => (
                              <Badge key={idx} variant={getFieldTypeBadge(field.fieldType) as any}>
                                {field.fieldLabel}
                                {field.required && <span className="ml-1 text-destructive">*</span>}
                              </Badge>
                            ))}
                            {fieldCount > 3 && (
                              <Badge variant="outline">+{fieldCount - 3} more</Badge>
                            )}
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No custom fields configured</p>
                      )}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenDialog(service)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Configure
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Configure Template: {editingService?.name}
            </DialogTitle>
            <DialogDescription>
              Add custom fields that will be collected when this service is added to an order
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Quick Start Templates</Label>
              <div className="flex flex-wrap gap-2">
                {Object.keys(METADATA_TEMPLATES).map((key) => (
                  <Button
                    key={key}
                    variant="outline"
                    size="sm"
                    onClick={() => handleApplyTemplate(key)}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    {key}
                  </Button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Click a template to load predefined fields, then customize as needed
              </p>
            </div>

            <div className="space-y-2">
              <Label>Custom Fields</Label>
              <MetadataFieldBuilder 
                fields={customFields}
                onChange={setCustomFields}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={updateServiceMutation.isPending}>
              {updateServiceMutation.isPending ? "Saving..." : "Save Template"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
