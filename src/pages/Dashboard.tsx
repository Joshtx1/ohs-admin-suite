import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Users, Building2, Wrench, DollarSign } from 'lucide-react';

interface DashboardStats {
  clients: number;
  services: number;
  activePricing: number;
  totalUsers: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    clients: 0,
    services: 0,
    activePricing: 0,
    totalUsers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [clientsRes, servicesRes, pricingRes, usersRes] = await Promise.all([
          supabase.from('clients').select('id', { count: 'exact', head: true }),
          supabase.from('services').select('id', { count: 'exact', head: true }),
          supabase.from('pricing').select('id', { count: 'exact', head: true }).eq('is_active', true),
          supabase.from('profiles').select('id', { count: 'exact', head: true }),
        ]);

        setStats({
          clients: clientsRes.count || 0,
          services: servicesRes.count || 0,
          activePricing: pricingRes.count || 0,
          totalUsers: usersRes.count || 0,
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Total Clients',
      value: stats.clients,
      description: 'Active client companies',
      icon: Building2,
      color: 'text-blue-600',
    },
    {
      title: 'Services',
      value: stats.services,
      description: 'Available services',
      icon: Wrench,
      color: 'text-green-600',
    },
    {
      title: 'Active Pricing',
      value: stats.activePricing,
      description: 'Current pricing records',
      icon: DollarSign,
      color: 'text-yellow-600',
    },
    {
      title: 'Total Users',
      value: stats.totalUsers,
      description: 'System users',
      icon: Users,
      color: 'text-purple-600',
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to your OHS Clinic management system
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
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your OHS Clinic management system
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title}>
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
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest updates across your clinic management system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                System is ready for client, service, and pricing management.
              </p>
              <p className="text-sm text-muted-foreground">
                Navigate using the sidebar to manage your clinic data.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks to get you started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm">• Add your first client company</p>
              <p className="text-sm">• Define your services catalog</p>
              <p className="text-sm">• Set up pricing structure</p>
              <p className="text-sm">• Manage user access levels</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;