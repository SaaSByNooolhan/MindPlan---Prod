-- Add trial fields to subscriptions table
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS trial_end TIMESTAMPTZ;

-- Add index for trial queries
CREATE INDEX IF NOT EXISTS idx_subscriptions_trial_end 
ON subscriptions(trial_end) 
WHERE status = 'trial';

-- Add comment
COMMENT ON COLUMN subscriptions.trial_end IS 'End date of the free trial period';
