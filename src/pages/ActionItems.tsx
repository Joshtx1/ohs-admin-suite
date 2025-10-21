import DashboardLayout from "@/components/layout/DashboardLayout";
import { ActionItemDialog } from "@/components/ActionItemDialog";
import { ActionItemsList } from "@/components/ActionItemsList";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ActionItems() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Action Items & Notes</h2>
            <p className="text-muted-foreground">
              Track ideas, bugs, and action items during development
            </p>
          </div>
          <ActionItemDialog />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your Notes</CardTitle>
            <CardDescription>
              Manage all your development action items in one place
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
