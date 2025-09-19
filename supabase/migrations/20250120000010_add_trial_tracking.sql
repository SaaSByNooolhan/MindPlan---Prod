-- Migration pour ajouter le suivi de l'essai gratuit
-- Empêche les utilisateurs de renouveler leur essai gratuit

-- Ajouter le champ pour suivre l'utilisation de l'essai
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS has_used_trial BOOLEAN DEFAULT FALSE;

-- Ajouter un index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_profiles_has_used_trial ON profiles(has_used_trial);

-- Commentaire pour la documentation
COMMENT ON COLUMN profiles.has_used_trial IS 'Indique si l\'utilisateur a déjà utilisé son essai gratuit de 7 jours';

