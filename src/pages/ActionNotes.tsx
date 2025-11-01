import { useState, useEffect } from "react";
import { ActionItemsList } from "@/components/ActionItemsList";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

export default function ActionNotes() {
  const [searchTerm, setSearchTerm] = useState("");
  const [pageFilter, setPageFilter] = useState("all");
  const [userFilter, setUserFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("active");
  const [users, setUsers] = useState<Array<{ id: string; name: string }>>([]);
  const [pages, setPages] = useState<string[]>([]);

  useEffect(() => {
    loadFilterOptions();
  }, []);

  const loadFilterOptions = async () => {
    // Load unique users
    const { data: actionItems } = await supabase
      .from('action_items')
      .select('user_id, page_url');

    if (actionItems) {
      // Get unique user IDs
      const uniqueUserIds = [...new Set(actionItems.map(item => item.user_id))];
      const userProfiles = await Promise.all(
        uniqueUserIds.map(async (userId) => {
          const { data } = await supabase
            .from('profiles')
            .select('first_name, last_name')
            .eq('user_id', userId)
            .single();
          return {
            id: userId,
            name: data ? `${data.first_name} ${data.last_name}` : 'Unknown'
          };
        })
      );
      setUsers(userProfiles);

      // Get unique pages
      const uniquePages = [...new Set(
        actionItems
          .filter(item => item.page_url)
          .map(item => {
            try {
              const pathname = new URL(item.page_url!).pathname;
              const parts = pathname.split('/').filter(Boolean);
              return parts[parts.length - 1] || 'Dashboard';
            } catch {
              return 'Unknown';
            }
          })
      )];
      setPages(uniquePages);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Action Notes</h2>
        <p className="text-muted-foreground">
          View and manage all your action items and notes
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Action Items</CardTitle>
          <CardDescription>
            Track all action items with their status, attachments, and links
          </CardDescription>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
            <Input
              placeholder="Search by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Select value={pageFilter} onValueChange={setPageFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by page" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Pages</SelectItem>
                {pages.map(page => (
                  <SelectItem key={page} value={page}>{page}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={userFilter} onValueChange={setUserFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by user" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                {users.map(user => (
                  <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="complete">Complete</SelectItem>
                <SelectItem value="all">All Status</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <ActionItemsList 
            searchTerm={searchTerm}
            pageFilter={pageFilter}
            userFilter={userFilter}
            statusFilter={statusFilter}
          />
        </CardContent>
      </Card>
    </div>
  );
}
