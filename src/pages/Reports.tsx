import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, Search } from "lucide-react";
import { DataTable } from "@/components/common/DataTable";
import { useBillingExportData, BillingExportRow } from "@/hooks/useReportData";
import { toast } from "sonner";

const Reports = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: billingData = [], isLoading } = useBillingExportData();

  // Filter data based on search term
  const filteredData = billingData.filter((row) => {
    const search = searchTerm.toLowerCase();
    return (
      row.orderId.toLowerCase().includes(search) ||
      row.billingId.toLowerCase().includes(search) ||
      row.clientName.toLowerCase().includes(search) ||
      row.po.toLowerCase().includes(search) ||
      row.serviceCode.toLowerCase().includes(search) ||
      row.service.toLowerCase().includes(search) ||
      row.traineeName.toLowerCase().includes(search) ||
      row.ssn.toLowerCase().includes(search)
    );
  });

  const handleExportCSV = () => {
    const headers = [
      "Order ID",
      "Bill To",
      "Employer",
      "PO",
      "Service Code",
      "Service",
      "Date",
      "SSN",
      "Trainee Name",
      "Receipt",
      "Rate",
    ];

    const csvContent = [
      headers.join(","),
      ...filteredData.map((row) =>
        [
          row.orderId,
          row.billingId,
          `"${row.clientName}"`,
          row.po,
          row.serviceCode,
          `"${row.service}"`,
          row.date,
          row.ssn,
          `"${row.traineeName}"`,
          row.receipt,
          row.rate,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `billing-export-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Report exported successfully");
  };

  const totalRevenue = filteredData.reduce((sum, row) => sum + row.rate, 0);

  const columns = [
    { header: "Order ID", accessorKey: "orderId" as keyof BillingExportRow },
    { header: "Bill To", accessorKey: "billingId" as keyof BillingExportRow },
    { header: "Employer", accessorKey: "clientName" as keyof BillingExportRow },
    { header: "PO", accessorKey: "po" as keyof BillingExportRow },
    { header: "Service Code", accessorKey: "serviceCode" as keyof BillingExportRow },
    { header: "Service", accessorKey: "service" as keyof BillingExportRow },
    { header: "Date", accessorKey: "date" as keyof BillingExportRow },
    { header: "SSN", accessorKey: "ssn" as keyof BillingExportRow },
    { header: "Trainee Name", accessorKey: "traineeName" as keyof BillingExportRow },
    { header: "Receipt", accessorKey: "receipt" as keyof BillingExportRow },
    {
      header: "Rate",
      cell: (row: BillingExportRow) => `$${row.rate.toFixed(2)}`,
    },
  ];

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reports</h1>
        <p className="text-muted-foreground">Generate and export various reports</p>
      </div>

      <Tabs defaultValue="billing" className="space-y-6">
        <TabsList>
          <TabsTrigger value="billing">Billing Export</TabsTrigger>
        </TabsList>

        <TabsContent value="billing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Billing Export Report</CardTitle>
              <CardDescription>
                Line-item level billing data for all orders
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by client, trainee, service, PO..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Button onClick={handleExportCSV} disabled={filteredData.length === 0}>
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>

              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  Showing {filteredData.length} line item{filteredData.length !== 1 ? "s" : ""}
                </span>
                <span className="font-semibold">
                  Total Revenue: ${totalRevenue.toFixed(2)}
                </span>
              </div>

              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading report data...
                </div>
              ) : (
                <DataTable
                  data={filteredData}
                  columns={columns}
                  pageSize={20}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
