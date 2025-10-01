-- Migration pour ajouter le support de la version beta
-- Ajoute le statut 'beta' et gère l'accès de 37 jours pour les testeurs

-- Ajouter le statut 'beta' aux contraintes existantes
ALTER TABLE subscriptions 
DROP CONSTRAINT IF EXISTS subscriptions_status_check;

ALTER TABLE subscriptions 
ADD CONSTRAINT subscriptions_status_check 
CHECK (status IN ('active', 'cancelled', 'expired', 'trial', 'trial_ending', 'beta'));

-- Ajouter un champ pour suivre la date de fin de la période beta
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS beta_end TIMESTAMPTZ;

-- Ajouter un champ pour marquer les utilisateurs beta
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS is_beta_tester BOOLEAN DEFAULT FALSE;

-- Créer un index pour optimiser les requêtes beta
CREATE INDEX IF NOT EXISTS idx_subscriptions_beta ON subscriptions(is_beta_tester, beta_end);

-- Fonction pour créer un abonnement beta par UUID
CREATE OR REPLACE FUNCTION public.create_beta_subscription(user_uuid UUID)
RETURNS VOID AS $$
BEGIN
  -- Vérifier si l'utilisateur a déjà un abonnement
  IF EXISTS (SELECT 1 FROM subscriptions WHERE user_id = user_uuid) THEN
    -- Mettre à jour l'abonnement existant en beta
    UPDATE subscriptions 
    SET 
      plan_type = 'premium',
      status = 'beta',
      is_beta_tester = TRUE,
      beta_end = NOW() + INTERVAL '37 days',
      trial_end = NULL,
      updated_at = NOW()
    WHERE user_id = user_uuid;
  ELSE
    -- Créer un nouvel abonnement beta
    INSERT INTO subscriptions (
      user_id, 
      plan_type, 
      status, 
      is_beta_tester, 
      beta_end
    ) VALUES (
      user_uuid, 
      'premium', 
      'beta', 
      TRUE, 
      NOW() + INTERVAL '37 days'
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour créer un abonnement beta par email
CREATE OR REPLACE FUNCTION public.create_beta_subscription_by_email(user_email TEXT)
RETURNS TEXT AS $$
DECLARE
  user_uuid UUID;
BEGIN
  -- Trouver l'UUID de l'utilisateur par son email
  SELECT id INTO user_uuid FROM auth.users WHERE email = user_email;
  
  -- Vérifier si l'utilisateur existe
  IF user_uuid IS NULL THEN
    RETURN 'Utilisateur non trouvé';
  END IF;
  
  -- Vérifier si l'utilisateur a déjà un abonnement
  IF EXISTS (SELECT 1 FROM subscriptions WHERE user_id = user_uuid) THEN
    -- Mettre à jour l'abonnement existant en beta
    UPDATE subscriptions 
    SET 
      plan_type = 'premium',
      status = 'beta',
      is_beta_tester = TRUE,
      beta_end = NOW() + INTERVAL '37 days',
      trial_end = NULL,
      updated_at = NOW()
    WHERE user_id = user_uuid;
  ELSE
    -- Créer un nouvel abonnement beta
    INSERT INTO subscriptions (
      user_id, 
      plan_type, 
      status, 
      is_beta_tester, 
      beta_end
    ) VALUES (
      user_uuid, 
      'premium', 
      'beta', 
      TRUE, 
      NOW() + INTERVAL '37 days'
    );
  END IF;
  
  RETURN 'Succès';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour vérifier si un utilisateur beta a encore accès
CREATE OR REPLACE FUNCTION public.is_beta_access_valid(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  beta_end_date TIMESTAMPTZ;
BEGIN
  SELECT beta_end INTO beta_end_date
  FROM subscriptions 
  WHERE user_id = user_uuid 
    AND status = 'beta' 
    AND is_beta_tester = TRUE;
  
  -- Si pas d'abonnement beta trouvé
  IF beta_end_date IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Vérifier si la période beta n'a pas expiré
  RETURN NOW() <= beta_end_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour expirer automatiquement les accès beta
CREATE OR REPLACE FUNCTION public.expire_beta_access()
RETURNS VOID AS $$
BEGIN
  UPDATE subscriptions 
  SET 
    plan_type = 'free',
    status = 'active',
    is_beta_tester = FALSE,
    beta_end = NULL,
    updated_at = NOW()
  WHERE status = 'beta' 
    AND is_beta_tester = TRUE 
    AND beta_end < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour récupérer l'email d'un utilisateur par son UUID
CREATE OR REPLACE FUNCTION public.get_user_email_by_id(user_id UUID)
RETURNS TEXT AS $$
DECLARE
  user_email TEXT;
BEGIN
  SELECT email INTO user_email FROM auth.users WHERE id = user_id;
  RETURN user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour récupérer tous les testeurs beta avec leurs emails
CREATE OR REPLACE FUNCTION public.get_beta_testers_with_emails()
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  beta_end TIMESTAMPTZ,
  days_left INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.user_id,
    au.email,
    s.beta_end,
    CASE 
      WHEN s.beta_end IS NOT NULL THEN 
        EXTRACT(DAY FROM (s.beta_end - NOW()))::INTEGER
      ELSE 0
    END as days_left
  FROM subscriptions s
  JOIN auth.users au ON s.user_id = au.id
  WHERE s.status = 'beta' 
    AND s.is_beta_tester = TRUE
  ORDER BY s.beta_end ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Commentaires pour la documentation
COMMENT ON COLUMN subscriptions.beta_end IS 'Date de fin de la période beta (37 jours)';
COMMENT ON COLUMN subscriptions.is_beta_tester IS 'Indique si l\'utilisateur est un testeur beta';
COMMENT ON FUNCTION public.create_beta_subscription(UUID) IS 'Crée ou met à jour un abonnement beta pour 37 jours';
COMMENT ON FUNCTION public.create_beta_subscription_by_email(TEXT) IS 'Crée ou met à jour un abonnement beta pour 37 jours via email';
COMMENT ON FUNCTION public.get_user_email_by_id(UUID) IS 'Récupère l\'email d\'un utilisateur par son UUID';
COMMENT ON FUNCTION public.is_beta_access_valid(UUID) IS 'Vérifie si un utilisateur beta a encore accès';
COMMENT ON FUNCTION public.expire_beta_access() IS 'Expire automatiquement les accès beta expirés';
