import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ExternalLink, Trash2, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface ActionItem {
  id: string;
  title: string;
  description: string | null;
  page_url: string | null;
  image_url: string | null;
  completed: boolean;
  created_at: string;
}

export function ActionItemsList() {
  const [items, setItems] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadItems = async () => {
    try {
      const { data, error } = await supabase
        .from('action_items')
        .select('*')
        .order('completed', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error loading action items:', error);
      toast({
        title: "Error",
        description: "Failed to load action items.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const toggleComplete = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('action_items')
        .update({ completed: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      setItems(items.map(item => 
        item.id === id ? { ...item, completed: !currentStatus } : item
      ));

      toast({
        title: currentStatus ? "Marked as incomplete" : "Marked as complete",
      });
    } catch (error) {
      console.error('Error updating action item:', error);
      toast({
        title: "Error",
        description: "Failed to update action item.",
        variant: "destructive",
      });
    }
  };

  const deleteItem = async (id: string, imageUrl: string | null) => {
    try {
      // Delete image from storage if exists
      if (imageUrl) {
        const path = imageUrl.split('/action-items/')[1];
        if (path) {
          await supabase.storage.from('action-items').remove([path]);
        }
      }

      const { error } = await supabase
        .from('action_items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setItems(items.filter(item => item.id !== id));

      toast({
        title: "Deleted",
        description: "Action item removed successfully.",
      });
    } catch (error) {
      console.error('Error deleting action item:', error);
      toast({
        title: "Error",
        description: "Failed to delete action item.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading action items...</div>;
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-lg mb-2">No action items yet</p>
        <p className="text-sm">Create your first note to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <Card key={item.id} className={item.completed ? "opacity-60" : ""}>
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <Checkbox
                checked={item.completed}
                onCheckedChange={() => toggleComplete(item.id, item.completed)}
                className="mt-1"
              />
              
              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className={`font-medium ${item.completed ? "line-through" : ""}`}>
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(item.created_at), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.completed && (
                      <Badge variant="secondary">Completed</Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteItem(item.id, item.image_url)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {item.description && (
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {item.description}
                  </p>
                )}

                <div className="flex flex-wrap gap-2">
                  {item.page_url && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => window.open(item.page_url!, '_blank')}
                    >
                      <ExternalLink className="h-3 w-3" />
                      View Page
                    </Button>
                  )}

                  {item.image_url && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => window.open(item.image_url!, '_blank')}
                    >
                      <ImageIcon className="h-3 w-3" />
                      View Image
                    </Button>
                  )}
                </div>

                {item.image_url && (
                  <div className="mt-2">
                    <img
                      src={item.image_url}
                      alt="Attachment"
                      className="max-h-48 rounded-md border cursor-pointer"
                      onClick={() => window.open(item.image_url!, '_blank')}
                    />
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
