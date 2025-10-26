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
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MetadataFieldBuilder, MetadataField } from "@/components/MetadataFieldBuilder";
import { toast } from "sonner";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ServiceTemplate {
  id: string;
  template_key: string;
  template_name: string;
  description: string | null;
  fields: MetadataField[];
}

export const ServiceTemplateManager = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ServiceTemplate | null>(null);
  const [deleteTemplate, setDeleteTemplate] = useState<ServiceTemplate | null>(null);
  const [templateKey, setTemplateKey] = useState("");
  const [templateName, setTemplateName] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");
  const [customFields, setCustomFields] = useState<MetadataField[]>([]);
  const queryClient = useQueryClient();

  const { data: templates, isLoading } = useQuery({
    queryKey: ["service-templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_templates")
        .select("*")
        .order("template_name");
      
      if (error) throw error;
      return (data || []).map(t => ({
        ...t,
        fields: (t.fields as any) || []
      })) as ServiceTemplate[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (template: Omit<ServiceTemplate, "id">) => {
      const { error } = await supabase
        .from("service_templates")
        .insert({
          template_key: template.template_key,
          template_name: template.template_name,
          description: template.description,
          fields: template.fields as any,
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-templates"] });
      toast.success("Template created successfully");
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create template");
      console.error(error);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, template }: { id: string; template: Partial<ServiceTemplate> }) => {
      const { error } = await supabase
        .from("service_templates")
        .update({
          template_name: template.template_name,
          description: template.description,
          fields: template.fields as any,
        })
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-templates"] });
      toast.success("Template updated successfully");
      handleCloseDialog();
    },
    onError: (error) => {
      toast.error("Failed to update template");
      console.error(error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("service_templates")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-templates"] });
      toast.success("Template deleted successfully");
      setIsDeleteDialogOpen(false);
      setDeleteTemplate(null);
    },
    onError: (error) => {
      toast.error("Failed to delete template");
      console.error(error);
    },
  });

  const handleOpenDialog = (template?: ServiceTemplate) => {
    if (template) {
      setEditingTemplate(template);
      setTemplateKey(template.template_key);
      setTemplateName(template.template_name);
      setTemplateDescription(template.description || "");
      setCustomFields(template.fields);
    } else {
      setEditingTemplate(null);
      setTemplateKey("");
      setTemplateName("");
      setTemplateDescription("");
      setCustomFields([]);
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingTemplate(null);
    setTemplateKey("");
    setTemplateName("");
    setTemplateDescription("");
    setCustomFields([]);
  };

  const handleOpenDeleteDialog = (template: ServiceTemplate) => {
    setDeleteTemplate(template);
    setIsDeleteDialogOpen(true);
  };

  const handleSave = () => {
    if (!templateName.trim()) {
      toast.error("Template name is required");
      return;
    }

    if (!editingTemplate && !templateKey.trim()) {
      toast.error("Template key is required");
      return;
    }

    if (editingTemplate) {
      updateMutation.mutate({
        id: editingTemplate.id,
        template: {
          template_name: templateName,
          description: templateDescription,
          fields: customFields,
        },
      });
    } else {
      createMutation.mutate({
        template_key: templateKey.toLowerCase().replace(/\s+/g, "-"),
        template_name: templateName,
        description: templateDescription,
        fields: customFields,
      });
    }
  };

  const handleDelete = () => {
    if (deleteTemplate) {
      deleteMutation.mutate(deleteTemplate.id);
    }
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
    return <div>Loading templates...</div>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Service Templates</CardTitle>
              <CardDescription>
                Create and manage metadata templates for different service types
              </CardDescription>
            </div>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              New Template
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            {templates?.map((template) => {
              const fieldCount = template.fields.length;

              return (
                <Card key={template.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{template.template_name}</h4>
                        <Badge variant="secondary" className="text-xs">
                          {template.template_key}
                        </Badge>
                      </div>
                      
                      {template.description && (
                        <p className="text-sm text-muted-foreground">{template.description}</p>
                      )}
                      
                      {fieldCount > 0 ? (
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">
                            {fieldCount} field{fieldCount !== 1 ? 's' : ''} configured
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {template.fields.slice(0, 3).map((field: MetadataField, idx: number) => (
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
                        <p className="text-sm text-muted-foreground">No fields configured</p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenDialog(template)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenDeleteDialog(template)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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
              {editingTemplate ? `Edit Template: ${editingTemplate.template_name}` : "Create New Template"}
            </DialogTitle>
            <DialogDescription>
              {editingTemplate 
                ? "Update the template name, description, and fields"
                : "Create a new metadata template for services"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {!editingTemplate && (
              <div className="space-y-2">
                <Label htmlFor="template-key">Template Key *</Label>
                <Input
                  id="template-key"
                  placeholder="e.g., drug-screen, respirator-fit"
                  value={templateKey}
                  onChange={(e) => setTemplateKey(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Unique identifier (lowercase, use hyphens instead of spaces)
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="template-name">Template Name *</Label>
              <Input
                id="template-name"
                placeholder="e.g., Drug Screen"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="template-description">Description</Label>
              <Textarea
                id="template-description"
                placeholder="Describe when this template should be used"
                value={templateDescription}
                onChange={(e) => setTemplateDescription(e.target.value)}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Template Fields</Label>
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
            <Button 
              onClick={handleSave} 
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending 
                ? "Saving..." 
                : editingTemplate ? "Update Template" : "Create Template"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the template "{deleteTemplate?.template_name}"? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteTemplate(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};