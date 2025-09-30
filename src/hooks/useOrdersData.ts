import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Order {
  id: string;
  client_id: string;
  trainee_id: string;
  status: string;
  total_amount: number;
  service_date: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  created_by: string;
  clients?: {
    id: string;
    company_name: string;
    contact_person: string;
    phone?: string;
    email?: string;
  } | null;
  trainees?: {
    id: string;
    name: string;
    unique_id: string;
    email?: string;
    phone?: string;
    date_of_birth?: string;
    ssn?: string;
  };
  order_items?: Array<{
    service_id: string;
    price: number;
    status: string;
    services: {
      name: string;
      service_code: string;
      category: string;
    };
  }>;
}

export function useOrdersData() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          clients (
            id,
            company_name,
            contact_person,
            phone,
            email
          ),
          trainees (
            id,
            name,
            unique_id,
            email,
            phone,
            date_of_birth,
            ssn
          ),
          order_items (
            service_id,
            price,
            status,
            services (
              name,
              service_code,
              category
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return { orders, loading, refetch: fetchOrders };
}
