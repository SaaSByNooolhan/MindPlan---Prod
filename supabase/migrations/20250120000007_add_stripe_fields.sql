-- Migration pour ajouter les champs Stripe
-- Ajoute les colonnes nécessaires pour l'intégration Stripe

-- Ajouter stripe_customer_id à la table profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

-- Ajouter les champs Stripe à la table subscriptions
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS current_period_start TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMPTZ;

-- Créer un index pour stripe_customer_id
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id ON profiles(stripe_customer_id);

-- Créer un index pour stripe_subscription_id
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);

-- Ajouter une contrainte unique pour stripe_subscription_id
ALTER TABLE subscriptions 
ADD CONSTRAINT IF NOT EXISTS unique_stripe_subscription_id UNIQUE (stripe_subscription_id);

-- Commentaires pour la documentation
COMMENT ON COLUMN profiles.stripe_customer_id IS 'ID du customer Stripe associé à ce profil';
COMMENT ON COLUMN subscriptions.stripe_subscription_id IS 'ID de l\'abonnement Stripe';
COMMENT ON COLUMN subscriptions.current_period_start IS 'Début de la période de facturation actuelle';
COMMENT ON COLUMN subscriptions.current_period_end IS 'Fin de la période de facturation actuelle';
