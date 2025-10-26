import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ServiceTemplateManager } from "@/components/admin/ServiceTemplateManager";
import { Settings, FileText, Database } from "lucide-react";

const Admin = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Settings</h1>
        <p className="text-muted-foreground">
          Manage system configuration and customize data structures
        </p>
      </div>

      <Tabs defaultValue="templates" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="templates">
            <FileText className="h-4 w-4 mr-2" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="tables" disabled>
            <Database className="h-4 w-4 mr-2" />
            Tables
          </TabsTrigger>
          <TabsTrigger value="system" disabled>
            <Settings className="h-4 w-4 mr-2" />
            System
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          <ServiceTemplateManager />
        </TabsContent>

        <TabsContent value="tables" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Table Customization</CardTitle>
              <CardDescription>
                Add, edit, or remove custom fields from database tables
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Configuration</CardTitle>
              <CardDescription>
                Configure system-wide settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;
