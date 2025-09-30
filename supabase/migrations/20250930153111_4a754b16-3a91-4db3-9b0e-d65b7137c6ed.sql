-- Add payment_status column to orders table
ALTER TABLE public.orders
ADD COLUMN payment_status text DEFAULT 'Payment Due';

-- Add comment explaining the field
COMMENT ON COLUMN public.orders.payment_status IS 'Payment status: "Billed" for members who get billed, "Payment Due" for non-members/self-pay who must pay first';