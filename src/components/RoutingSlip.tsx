import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Order } from "@/hooks/useOrdersData";

interface RoutingSlipProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order | null;
}

export default function RoutingSlip({ open, onOpenChange, order }: RoutingSlipProps) {
  if (!order) return null;

  // Group services by department (fallback to category if no department)
  const servicesByDepartment = (order.order_items || []).reduce((acc, item) => {
    const department = item.services.department || item.services.category || "Other";
    if (!acc[department]) {
      acc[department] = [];
    }
    acc[department].push(item);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Routing Slip - Trainee Schedule</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Information */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
            <div>
              <p className="text-sm font-semibold text-muted-foreground">Order ID</p>
              <p className="font-mono text-sm">{order.id.slice(0, 8)}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-muted-foreground">Service Date</p>
              <p className="font-medium">{format(new Date(order.service_date), "MMMM dd, yyyy")}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-muted-foreground">Created</p>
              <p className="text-sm">{format(new Date(order.created_at), "MMM dd, yyyy HH:mm")}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-muted-foreground">Status</p>
              <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
                {order.status}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Trainee Information */}
          {order.trainees && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Trainee Information</h3>
              <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
                <div>
                  <p className="text-sm font-semibold text-muted-foreground">Name</p>
                  <p className="font-medium">{order.trainees.name}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-muted-foreground">ID</p>
                  <p className="font-mono">{order.trainees.unique_id}</p>
                </div>
                {order.trainees.email && (
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground">Email</p>
                    <p className="text-sm">{order.trainees.email}</p>
                  </div>
                )}
                {order.trainees.phone && (
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground">Phone</p>
                    <p className="text-sm">{order.trainees.phone}</p>
                  </div>
                )}
                {order.trainees.date_of_birth && (
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground">Date of Birth</p>
                    <p className="text-sm">{format(new Date(order.trainees.date_of_birth), "MMM dd, yyyy")}</p>
                  </div>
                )}
                {order.trainees.ssn && (
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground">SSN</p>
                    <p className="text-sm">***-**-{order.trainees.ssn.slice(-4)}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <Separator />

          {/* Client Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Payment Information</h3>
            {order.clients ? (
              <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
                <div>
                  <p className="text-sm font-semibold text-muted-foreground">Company</p>
                  <p className="font-medium">{order.clients.company_name}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-muted-foreground">Contact Person</p>
                  <p className="text-sm">{order.clients.contact_person}</p>
                </div>
                {order.clients.phone && (
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground">Phone</p>
                    <p className="text-sm">{order.clients.phone}</p>
                  </div>
                )}
                {order.clients.email && (
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground">Email</p>
                    <p className="text-sm">{order.clients.email}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 border rounded-lg">
                <p className="font-medium text-muted-foreground">Self Pay</p>
              </div>
            )}
          </div>

          {order.notes && (
            <>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold mb-3">Notes</h3>
                <div className="p-4 border rounded-lg bg-muted/30">
                  <p className="text-sm">{order.notes}</p>
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Reason for Test */}
          {order.reason_for_test && (
            <>
              <div>
                <h3 className="text-lg font-semibold mb-3">Reason for Test</h3>
                <div className="p-4 border rounded-lg bg-muted/30">
                  <p className="font-medium">{order.reason_for_test}</p>
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Services by Department */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Scheduled Services by Department</h3>
            <div className="space-y-4">
              {Object.entries(servicesByDepartment).map(([department, items]) => (
                <div key={department} className="border rounded-lg overflow-hidden">
                  <div className="bg-primary/10 px-4 py-2 border-b">
                    <h4 className="font-semibold">{department}</h4>
                  </div>
                  <div className="divide-y">
                    {items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 hover:bg-muted/50">
                        <div className="flex-1">
                          <p className="font-medium">{item.services.name}</p>
                          <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                            <span>Code: {item.services.service_code}</span>
                            {item.services.room && <span>Room: {item.services.room}</span>}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">${item.price.toFixed(2)}</p>
                          <Badge variant="outline" className="mt-1">
                            {item.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Total */}
          <div className="flex justify-between items-center p-4 bg-primary/5 rounded-lg">
            <p className="text-lg font-semibold">Total Amount</p>
            <p className="text-2xl font-bold">${order.total_amount.toFixed(2)}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
