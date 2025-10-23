import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, TrendingUp, Package, DollarSign } from 'lucide-react';
import { useOrdersData } from '@/hooks/useOrdersData';

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  completedOrders: number;
  pendingOrders: number;
}

interface TopCustomer {
  name: string;
  orderCount: number;
  revenue: number;
}

interface TopService {
  name: string;
  count: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { orders, loading: ordersLoading } = useOrdersData();
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalRevenue: 0,
    completedOrders: 0,
    pendingOrders: 0,
  });
  const [topCustomers, setTopCustomers] = useState<TopCustomer[]>([]);
  const [topServices, setTopServices] = useState<TopService[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ordersLoading) {
      calculateStats();
    }
  }, [orders, ordersLoading]);

  const calculateStats = () => {
    try {
      const totalOrders = orders.length;
      const totalRevenue = orders.reduce((sum, order) => sum + (Number(order.total_amount) || 0), 0);
      const completedOrders = orders.filter(o => o.status === 'completed').length;
      const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'created').length;

      setStats({
        totalOrders,
        totalRevenue,
        completedOrders,
        pendingOrders,
      });

      // Calculate top customers
      const customerMap = new Map<string, { name: string; orderCount: number; revenue: number }>();
      orders.forEach(order => {
        const clientName = order.clients?.company_name || 'Unknown';
        const clientId = order.client_id;
        if (!customerMap.has(clientId)) {
          customerMap.set(clientId, { name: clientName, orderCount: 0, revenue: 0 });
        }
        const customer = customerMap.get(clientId)!;
        customer.orderCount++;
        customer.revenue += Number(order.total_amount) || 0;
      });
      const topCustomersArray = Array.from(customerMap.values())
        .sort((a, b) => b.orderCount - a.orderCount)
        .slice(0, 5);
      setTopCustomers(topCustomersArray);

      // Calculate top services
      const serviceMap = new Map<string, { name: string; count: number }>();
      orders.forEach(order => {
        order.order_items?.forEach(item => {
          const serviceName = item.services.name;
          if (!serviceMap.has(serviceName)) {
            serviceMap.set(serviceName, { name: serviceName, count: 0 });
          }
          serviceMap.get(serviceName)!.count++;
        });
      });
      const topServicesArray = Array.from(serviceMap.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
      setTopServices(topServicesArray);

      setLoading(false);
    } catch (error) {
      console.error('Error calculating stats:', error);
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      description: 'All orders in the system',
      icon: ShoppingCart,
      color: 'text-blue-600',
      route: '/orders',
    },
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      description: 'Revenue from all orders',
      icon: DollarSign,
      color: 'text-green-600',
      route: '/orders',
    },
    {
      title: 'Completed Orders',
      value: stats.completedOrders,
      description: 'Successfully completed',
      icon: TrendingUp,
      color: 'text-purple-600',
      route: '/orders',
    },
    {
      title: 'Pending Orders',
      value: stats.pendingOrders,
      description: 'Awaiting completion',
      icon: Package,
      color: 'text-orange-600',
      route: '/orders',
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Order Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your orders, customers, and services
          </p>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Loading...</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">--</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Order Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your orders, customers, and services
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card 
              key={card.title}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(card.route)}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {card.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <p className="text-xs text-muted-foreground">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Customers</CardTitle>
            <CardDescription>
              Customers with most orders
            </CardDescription>
          </CardHeader>
          <CardContent>
            {topCustomers.length > 0 ? (
              <div className="space-y-4">
                {topCustomers.map((customer, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{customer.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {customer.orderCount} orders
                      </p>
                    </div>
                    <div className="text-sm font-semibold">
                      ${customer.revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No customer data available</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Popular Services</CardTitle>
            <CardDescription>
              Most requested services
            </CardDescription>
          </CardHeader>
          <CardContent>
            {topServices.length > 0 ? (
              <div className="space-y-4">
                {topServices.map((service, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{service.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Requested {service.count} times
                      </p>
                    </div>
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No service data available</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;