-- Fix subscription status constraint to include 'trial'
ALTER TABLE subscriptions 
DROP CONSTRAINT IF EXISTS subscriptions_status_check;

ALTER TABLE subscriptions 
ADD CONSTRAINT subscriptions_status_check 
CHECK (status IN ('active', 'cancelled', 'expired', 'trial'));

-- Add comment
COMMENT ON CONSTRAINT subscriptions_status_check ON subscriptions IS 'Status can be active, cancelled, expired, or trial';
