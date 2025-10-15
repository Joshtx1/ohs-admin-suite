-- Fix payment status for order items that have a billing_client_id but incorrectly show "Payment Due"
-- These should be "Billed" since they're being billed to a client/TPA
UPDATE order_items
SET payment_status = 'Billed'
WHERE billing_client_id IS NOT NULL 
  AND payment_status = 'Payment Due';

-- Update order-level payment status to reflect the corrected item statuses
-- This will set orders to "Billed" if all items are billed, "Mixed" if some are, or "Payment Due" if none are
UPDATE orders o
SET payment_status = (
  CASE 
    WHEN (SELECT COUNT(DISTINCT payment_status) FROM order_items WHERE order_id = o.id) = 1 
      THEN (SELECT payment_status FROM order_items WHERE order_id = o.id LIMIT 1)
    WHEN (SELECT COUNT(DISTINCT payment_status) FROM order_items WHERE order_id = o.id) > 1
      THEN 'Mixed'
    ELSE 'Payment Due'
  END
)
WHERE id IN (
  SELECT DISTINCT order_id 
  FROM order_items 
  WHERE billing_client_id IS NOT NULL 
    AND payment_status = 'Billed'
);