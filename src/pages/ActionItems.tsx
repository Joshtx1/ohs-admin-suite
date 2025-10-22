import DashboardLayout from "@/components/layout/DashboardLayout";
import { ActionItemDialog } from "@/components/ActionItemDialog";
import { ActionItemsList } from "@/components/ActionItemsList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ActionItems() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Action Items & Notes</h2>
          <p className="text-muted-foreground">
            Track ideas, bugs, and action items during development
          </p>
        </div>

        <Tabs defaultValue="log" className="space-y-4">
          <TabsList>
            <TabsTrigger value="add">Add Task/Note</TabsTrigger>
            <TabsTrigger value="log">View Log</TabsTrigger>
          </TabsList>

          <TabsContent value="add" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Create Action Item</CardTitle>
                <CardDescription>
                  Add a new task or note to track
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ActionItemDialog embedded />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="log" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Your Notes</CardTitle>
                <CardDescription>
                  Manage all your action items in one place
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ActionItemsList />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
