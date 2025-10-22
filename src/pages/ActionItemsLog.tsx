import DashboardLayout from "@/components/layout/DashboardLayout";
import { ActionItemsList } from "@/components/ActionItemsList";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ActionItemsLog() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Action Items Log</h2>
          <p className="text-muted-foreground">
            View and manage all your action items and notes
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your Notes</CardTitle>
            <CardDescription>
              Track all action items with their status, attachments, and links
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ActionItemsList />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
