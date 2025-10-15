import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

export interface BillingExportRow {
  orderId: string;
  billingId: string;
  billingClientName: string;
  employerName: string;
  po: string;
  serviceCode: string;
  service: string;
  date: string;
  ssn: string;
  traineeName: string;
  paymentStatus: string;
  receipt: string;
  rate: number;
}

export const useBillingExportData = () => {
  return useQuery({
    queryKey: ["billing-export"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("order_items")
        .select(`
          id,
          price,
          payment_status,
          item_billing_client:clients!billing_client_id (
            company_name,
            billing_id,
            mem_status
          ),
          orders!inner (
            id,
            service_date,
            notes,
            client:clients!client_id (
              company_name,
              billing_id,
              mem_status
            ),
            billing_client:clients!billing_client_id (
              company_name,
              billing_id,
              mem_status
            ),
            trainees (
              name,
              ssn
            )
          ),
          services (
            service_code,
            name
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Transform data into flat structure for report
      const rows: BillingExportRow[] = (data || []).map((item: any) => {
        const order = item.orders;
        const trainee = order?.trainees;
        const service = item.services;

        // Prioritize item-level billing client, then order-level billing client, then registrant client
        const itemBillingClient = item.item_billing_client;
        const orderBillingClient = order?.billing_client;
        const assignedClient = order?.client;
        const effectiveBillingClient = itemBillingClient || orderBillingClient || assignedClient;

        // Extract PO from notes if it exists
        const poMatch = order?.notes?.match(/PO:\s*([^\s,]+)/i);
        const po = poMatch ? poMatch[1] : "";

        return {
          orderId: order?.id || "",
          billingId: effectiveBillingClient?.billing_id || "Self-Pay",
          billingClientName: effectiveBillingClient?.company_name || "Self-Pay",
          employerName: assignedClient?.company_name || "Self-Pay",
          po,
          serviceCode: service?.service_code || "",
          service: service?.name || "",
          date: order?.service_date ? format(new Date(order.service_date), "MM/dd/yy") : "",
          ssn: trainee?.ssn || "",
          traineeName: trainee?.name || "",
          paymentStatus: (item as any).payment_status || "Payment Due",
          receipt: "", // Placeholder for future payment tracking
          rate: Number(item.price) || 0,
        };
      });

      return rows;
    },
  });
};
