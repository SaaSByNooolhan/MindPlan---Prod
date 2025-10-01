-- Migration pour supprimer complètement le système de paiement
-- Cette migration rend l'application totalement gratuite

-- Supprimer les colonnes Stripe de la table profiles
ALTER TABLE profiles 
DROP COLUMN IF EXISTS stripe_customer_id;

-- Supprimer les colonnes Stripe de la table subscriptions
ALTER TABLE subscriptions 
DROP COLUMN IF EXISTS stripe_subscription_id,
DROP COLUMN IF EXISTS current_period_start,
DROP COLUMN IF EXISTS current_period_end;

-- Supprimer les contraintes liées à Stripe
ALTER TABLE subscriptions 
DROP CONSTRAINT IF EXISTS unique_stripe_subscription_id;

-- Supprimer les index liés à Stripe
DROP INDEX IF EXISTS idx_profiles_stripe_customer_id;
DROP INDEX IF EXISTS idx_subscriptions_stripe_subscription_id;

-- Supprimer les colonnes de trial et beta de la table subscriptions
ALTER TABLE subscriptions 
DROP COLUMN IF EXISTS trial_start,
DROP COLUMN IF EXISTS trial_end,
DROP COLUMN IF EXISTS beta_start,
DROP COLUMN IF EXISTS beta_end,
DROP COLUMN IF EXISTS is_beta_tester;

-- Mettre à jour tous les utilisateurs existants pour qu'ils aient un plan gratuit
UPDATE subscriptions 
SET 
  plan_type = 'free',
  status = 'active',
  updated_at = NOW()
WHERE plan_type != 'free';

-- Ajouter un commentaire pour indiquer que l'application est maintenant gratuite
COMMENT ON TABLE subscriptions IS 'Table des abonnements - Application maintenant totalement gratuite';
COMMENT ON COLUMN subscriptions.plan_type IS 'Type de plan - maintenant toujours "free"';
COMMENT ON COLUMN subscriptions.status IS 'Statut de l\'abonnement - maintenant toujours "active"';
