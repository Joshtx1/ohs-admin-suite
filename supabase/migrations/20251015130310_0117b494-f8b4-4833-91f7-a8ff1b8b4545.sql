-- Add payment_status column to order_items
ALTER TABLE public.order_items
ADD COLUMN payment_status text DEFAULT 'Payment Due';

-- Add comment to explain the column
COMMENT ON COLUMN public.order_items.payment_status IS 'Payment status for this specific line item: "Billed" for items billed to members/TPAs, "Payment Due" for non-members/self-pay';