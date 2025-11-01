import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Trash2, FileText, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EditActionItemDialog } from "./EditActionItemDialog";
import { ViewDescriptionDialog } from "./ViewDescriptionDialog";
import { ViewMediaDialog } from "./ViewMediaDialog";

interface ActionItem {
  id: string;
  title: string;
  description: string | null;
  page_url: string | null;
  screenshot_url: string | null;
  attachment_url: string | null;
  completed: boolean;
  created_at: string;
  user_id: string;
  creator_name?: string;
}

interface ActionItemsListProps {
  searchTerm?: string;
  pageFilter?: string;
  userFilter?: string;
  statusFilter?: string;
}

export function ActionItemsList({ 
  searchTerm = "",
  pageFilter = "all",
  userFilter = "all",
  statusFilter = "active"
}: ActionItemsListProps) {
  const [items, setItems] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadItems = async () => {
    try {
      const { data: actionItems, error } = await supabase
        .from('action_items')
        .select('*')
        .order('completed', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get user details for each action item
      const itemsWithUsers = await Promise.all(
        (actionItems || []).map(async (item) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('first_name, last_name')
            .eq('user_id', item.user_id)
            .single();
          
          return {
            ...item,
            creator_name: profile 
              ? `${profile.first_name} ${profile.last_name}`
              : 'Unknown'
          };
        })
      );

      setItems(itemsWithUsers);
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

  const deleteItem = async (id: string, screenshotUrl: string | null, attachmentUrl: string | null) => {
    try {
      // Delete screenshot from storage if exists
      if (screenshotUrl) {
        const path = screenshotUrl.split('/action-items/')[1];
        if (path) {
          await supabase.storage.from('action-items').remove([path]);
        }
      }

      // Delete attachment from storage if exists
      if (attachmentUrl) {
        const path = attachmentUrl.split('/action-items/')[1];
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

  const getPageName = (url: string | null) => {
    if (!url) return '-';
    try {
      const pathname = new URL(url).pathname;
      const parts = pathname.split('/').filter(Boolean);
      return parts[parts.length - 1] || 'Dashboard';
    } catch {
      return '-';
    }
  };

  const filteredItems = items.filter(item => {
    // Status filter
    if (statusFilter === "active" && item.completed) return false;
    if (statusFilter === "complete" && !item.completed) return false;
    
    // Search filter
    if (searchTerm && !item.title.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Page filter
    if (pageFilter !== "all" && getPageName(item.page_url) !== pageFilter) {
      return false;
    }
    
    // User filter
    if (userFilter !== "all" && item.user_id !== userFilter) {
      return false;
    }
    
    return true;
  });

  if (filteredItems.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-lg mb-2">No action items found</p>
        <p className="text-sm">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">Status</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Page</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-center">Screenshot</TableHead>
            <TableHead className="text-center">Attachment</TableHead>
            <TableHead className="w-12"></TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredItems.map((item) => (
            <TableRow key={item.id} className={item.completed ? "opacity-60" : ""}>
              <TableCell>
                <Checkbox
                  checked={item.completed}
                  onCheckedChange={() => toggleComplete(item.id, item.completed)}
                />
              </TableCell>
              <TableCell className={`font-medium ${item.completed ? "line-through" : ""}`}>
                {item.title}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {getPageName(item.page_url)}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                {format(new Date(item.created_at), 'MMM d, yyyy')}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                {item.creator_name || '-'}
              </TableCell>
              <TableCell className="max-w-md">
                {item.description ? (
                  <ViewDescriptionDialog description={item.description} />
                ) : (
                  <span className="text-sm text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell className="text-center">
                {item.screenshot_url ? (
                  <ViewMediaDialog 
                    mediaUrl={item.screenshot_url} 
                    type="screenshot" 
                  />
                ) : (
                  '-'
                )}
              </TableCell>
              <TableCell className="text-center">
                {item.attachment_url ? (
                  <ViewMediaDialog 
                    mediaUrl={item.attachment_url} 
                    type="attachment" 
                  />
                ) : (
                  '-'
                )}
              </TableCell>
              <TableCell>
                <EditActionItemDialog item={item} onUpdate={loadItems} />
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteItem(item.id, item.screenshot_url, item.attachment_url)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
