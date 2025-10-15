import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Order {
  id: string;
  client_id: string;
  billing_client_id: string | null;
  trainee_id: string;
  status: string;
  total_amount: number;
  service_date: string;
  notes: string | null;
  reason_for_test?: string | null;
  payment_status?: string | null;
  created_at: string;
  updated_at: string;
  created_by: string;
  created_by_profile?: {
    first_name: string;
    last_name: string;
  } | null;
  clients?: {
    id: string;
    company_name: string;
    contact_person: string;
    phone?: string;
    email?: string;
    billing_id?: string;
    short_code?: string;
  } | null;
  billing_clients?: {
    id: string;
    company_name: string;
    contact_person: string;
    phone?: string;
    email?: string;
    billing_id?: string;
    short_code?: string;
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
    payment_status?: string;
    services: {
      name: string;
      service_code: string;
      category: string;
      department?: string;
      room?: string;
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
          created_by_profile:profiles!orders_created_by_fkey (
            first_name,
            last_name
          ),
          clients!client_id (
            id,
            company_name,
            contact_person,
            phone,
            email,
            billing_id,
            short_code,
            mem_status
          ),
          billing_clients:clients!billing_client_id (
            id,
            company_name,
            contact_person,
            phone,
            email,
            billing_id,
            short_code,
            mem_status
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
            payment_status,
            billing_client_id,
            billing_client:clients!billing_client_id (
              billing_id
            ),
            services (
              name,
              service_code,
              category,
              department,
              room
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
