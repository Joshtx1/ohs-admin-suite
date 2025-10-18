import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, FileText, MoreVertical, FileSpreadsheet, Pencil, Trash2 } from 'lucide-react';
import { DataTable } from '@/components/common/DataTable';
import { Order } from '@/hooks/useOrdersData';
import { getStatusBadgeVariant, getStatusDisplay } from '@/lib/status';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface OrdersTableProps {
  orders: Order[];
  onViewOrder: (order: Order) => void;
  onEditOrder?: (order: Order) => void;
  onDeleteOrder?: (orderId: string) => void;
}

export function OrdersTable({ orders, onViewOrder, onEditOrder, onDeleteOrder }: OrdersTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('all');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);

  const filteredOrders = orders.filter(order => {
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        order.clients?.company_name.toLowerCase().includes(searchLower) ||
        order.trainees?.name.toLowerCase().includes(searchLower) ||
        order.trainees?.unique_id?.toLowerCase().includes(searchLower) ||
        order.status.toLowerCase().includes(searchLower);
      
      if (!matchesSearch) return false;
    }
    
    // Status filter
    if (statusFilter !== 'all' && order.status !== statusFilter) {
      return false;
    }
    
    // Payment status filter
    if (paymentStatusFilter !== 'all' && order.payment_status !== paymentStatusFilter) {
      return false;
    }
    
    return true;
  });

  const columns = [
    {
      header: 'Trainee',
      cell: (order: Order) => (
        <div>
          <div className="font-medium">{order.trainees?.name || 'N/A'}</div>
          <div className="text-sm text-muted-foreground">{order.trainees?.ssn || 'N/A'}</div>
        </div>
      ),
    },
    {
      header: 'Client',
      cell: (order: Order) => (
        <div>
          <div className="font-medium">{order.clients?.company_name || 'Self-Pay'}</div>
          <div className="text-sm text-muted-foreground">
            {order.clients?.contact_person || '-'}
          </div>
        </div>
      ),
    },
    {
      header: 'Service Date',
      cell: (order: Order) => format(new Date(order.service_date), 'MM/dd/yyyy'),
    },
    {
      header: 'Total Services',
      cell: (order: Order) => order.order_items?.length || 0,
    },
    {
      header: 'Status',
      cell: (order: Order) => (
        <Badge variant={getStatusBadgeVariant(order.status)}>
          {getStatusDisplay(order.status)}
        </Badge>
      ),
    },
    {
      header: 'Payment Status',
      cell: (order: Order) => {
        const status = order.payment_status || 'Payment Due';
        return (
          <Badge 
            variant={
              status === 'Billed' ? 'default' : 
              status === 'Mixed' ? 'outline' : 
              'secondary'
            }
          >
            {status}
          </Badge>
        );
      },
    },
    {
      header: 'Actions',
      cell: (order: Order) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => onViewOrder(order)}>
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Routing Slip
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSelectedOrderDetails(order)}>
              <FileText className="h-4 w-4 mr-2" />
              Details
            </DropdownMenuItem>
            {onEditOrder && (
              <DropdownMenuItem onClick={() => onEditOrder(order)}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
            )}
            {onDeleteOrder && (
              <DropdownMenuItem 
                onClick={() => setOrderToDelete(order)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Orders & Registrations
          </CardTitle>
          <CardDescription>
            View and manage all order registrations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 items-end">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by trainee, client, or status..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="created">Created</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by Payment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payment Status</SelectItem>
                <SelectItem value="Billed">Billed</SelectItem>
                <SelectItem value="Payment Due">Payment Due</SelectItem>
                <SelectItem value="Mixed">Mixed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DataTable data={filteredOrders} columns={columns} pageSize={10} />
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrderDetails} onOpenChange={() => setSelectedOrderDetails(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Order Details - Services</DialogTitle>
          </DialogHeader>
          {selectedOrderDetails && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <div className="text-sm text-muted-foreground">Trainee</div>
                  <div className="font-medium">{selectedOrderDetails.trainees?.name}</div>
                  <div className="text-sm">{selectedOrderDetails.trainees?.unique_id}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Client</div>
                  <div className="font-medium">{selectedOrderDetails.clients?.company_name || 'Self-Pay'}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Service Date</div>
                  <div className="font-medium">{format(new Date(selectedOrderDetails.service_date), 'MM/dd/yyyy')}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Created Date</div>
                  <div className="font-medium">{format(new Date(selectedOrderDetails.created_at), 'MM/dd/yyyy')}</div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Services ({selectedOrderDetails.order_items?.length || 0})</h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left p-3">Service</th>
                        <th className="text-left p-3">Code</th>
                        <th className="text-left p-3">Category</th>
                        <th className="text-left p-3">Billing ID</th>
                        <th className="text-right p-3">Price</th>
                        <th className="text-left p-3">Payment Status</th>
                        <th className="text-left p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrderDetails.order_items?.map((item, idx) => {
                        // @ts-ignore - billing_client may not be in type yet
                        const itemBillingId = item.billing_client?.billing_id || 
                          selectedOrderDetails.billing_clients?.billing_id || 
                          selectedOrderDetails.clients?.billing_id || 
                          'Self-Pay';
                        
                        return (
                          <tr key={idx} className="border-t">
                            <td className="p-3">{item.services.name}</td>
                            <td className="p-3">{item.services.service_code}</td>
                            <td className="p-3">{item.services.category}</td>
                            <td className="p-3">{itemBillingId}</td>
                            <td className="p-3 text-right">${item.price.toFixed(2)}</td>
                            <td className="p-3">
                              <Badge 
                                variant={
                                  item.payment_status === 'Billed' ? 'default' : 'secondary'
                                }
                              >
                                {item.payment_status || 'Payment Due'}
                              </Badge>
                            </td>
                            <td className="p-3">
                              <Badge variant={getStatusBadgeVariant(item.status)}>
                                {getStatusDisplay(item.status)}
                              </Badge>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!orderToDelete} onOpenChange={() => setOrderToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this order? This will permanently delete the order and all associated service items. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (orderToDelete && onDeleteOrder) {
                  onDeleteOrder(orderToDelete.id);
                  setOrderToDelete(null);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
