import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { ActionItemsList } from "@/components/ActionItemsList";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ActionItemsLog() {
  const [showCompleted, setShowCompleted] = useState(false);

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
            <CardTitle>{showCompleted ? "Action Items - Complete" : "Action Items - Active"}</CardTitle>
            <CardDescription>
              Track all action items with their status, attachments, and links
            </CardDescription>
            <Button
              variant="link"
              className="w-fit px-0 h-auto"
              onClick={() => setShowCompleted(!showCompleted)}
            >
              {showCompleted ? "View Active" : "View Complete"}
            </Button>
          </CardHeader>
          <CardContent>
            <ActionItemsList showCompleted={showCompleted} />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
