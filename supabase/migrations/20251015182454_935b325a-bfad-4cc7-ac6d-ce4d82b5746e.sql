-- Fix payment status for order items based on membership status
-- This corrects the payment logic to consider whether a client is Member or Non-member

-- First, update items billed to Non-member clients to "Payment Due"
UPDATE order_items oi
SET payment_status = 'Payment Due'
FROM clients c
WHERE oi.billing_client_id = c.id 
  AND c.mem_status = 'Non-member'
  AND oi.payment_status = 'Billed';

-- Keep "Billed" status for:
-- 1. Items billed to Member clients
-- 2. Items billed to TPA (billing_client_id different from order's client_id)
UPDATE order_items oi
SET payment_status = 'Billed'
FROM clients c, orders o
WHERE oi.billing_client_id = c.id 
  AND oi.order_id = o.id
  AND (
    c.mem_status = 'Member' 
    OR oi.billing_client_id != o.client_id
  )
  AND oi.payment_status = 'Payment Due';

-- Update order-level payment status based on corrected item statuses
UPDATE orders o
SET payment_status = (
  CASE 
    -- All items have same status
    WHEN (SELECT COUNT(DISTINCT payment_status) FROM order_items WHERE order_id = o.id) = 1 
      THEN (SELECT payment_status FROM order_items WHERE order_id = o.id LIMIT 1)
    -- Mixed payment statuses
    WHEN (SELECT COUNT(DISTINCT payment_status) FROM order_items WHERE order_id = o.id) > 1
      THEN 'Mixed'
    -- Default to Payment Due
    ELSE 'Payment Due'
  END
)
WHERE EXISTS (
  SELECT 1 FROM order_items WHERE order_id = o.id
);