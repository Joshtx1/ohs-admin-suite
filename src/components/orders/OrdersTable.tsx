import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Eye, FileText } from 'lucide-react';
import { DataTable } from '@/components/common/DataTable';
import { Order } from '@/hooks/useOrdersData';
import { getStatusBadgeVariant, getStatusDisplay } from '@/lib/status';
import { format } from 'date-fns';

interface OrdersTableProps {
  orders: Order[];
  onViewOrder: (order: Order) => void;
}

export function OrdersTable({ orders, onViewOrder }: OrdersTableProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOrders = orders.filter(order => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      order.clients?.company_name.toLowerCase().includes(searchLower) ||
      order.trainees?.name.toLowerCase().includes(searchLower) ||
      order.trainees?.unique_id?.toLowerCase().includes(searchLower) ||
      order.status.toLowerCase().includes(searchLower)
    );
  });

  const columns = [
    {
      header: 'Trainee',
      cell: (order: Order) => (
        <div>
          <div className="font-medium">{order.trainees?.name || 'N/A'}</div>
          <div className="text-sm text-muted-foreground">{order.trainees?.unique_id || 'N/A'}</div>
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
      cell: (order: Order) => format(new Date(order.service_date), 'MMM dd, yyyy'),
    },
    {
      header: 'Total',
      cell: (order: Order) => (
        <span className="font-medium">${order.total_amount.toFixed(2)}</span>
      ),
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
      header: 'Created',
      cell: (order: Order) => format(new Date(order.created_at), 'MMM dd, yyyy'),
    },
    {
      header: 'Actions',
      cell: (order: Order) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewOrder(order)}
        >
          <Eye className="h-4 w-4 mr-2" />
          View
        </Button>
      ),
    },
  ];

  return (
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
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by trainee, client, or status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <DataTable data={filteredOrders} columns={columns} pageSize={10} />
      </CardContent>
    </Card>
  );
}
