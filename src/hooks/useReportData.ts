import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

export interface BillingExportRow {
  orderId: string;
  billingId: string;
  clientName: string;
  po: string;
  serviceCode: string;
  service: string;
  date: string;
  ssn: string;
  traineeName: string;
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
          orders!inner (
            id,
            service_date,
            notes,
            clients (
              company_name,
              profile
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
        .order("orders(service_date)", { ascending: false });

      if (error) throw error;

      // Transform data into flat structure for report
      const rows: BillingExportRow[] = (data || []).map((item: any) => {
        const order = item.orders;
        const client = order?.clients;
        const trainee = order?.trainees;
        const service = item.services;

        // Extract PO from notes if it exists
        const poMatch = order?.notes?.match(/PO:\s*([^\s,]+)/i);
        const po = poMatch ? poMatch[1] : "";

        return {
          orderId: order?.id || "",
          billingId: client?.profile || "Self-Pay",
          clientName: client?.company_name || "Self-Pay",
          po,
          serviceCode: service?.service_code || "",
          service: service?.name || "",
          date: order?.service_date ? format(new Date(order.service_date), "MM/dd/yy") : "",
          ssn: trainee?.ssn || "",
          traineeName: trainee?.name || "",
          receipt: "", // Placeholder for future payment tracking
          rate: Number(item.price) || 0,
        };
      });

      return rows;
    },
  });
};
