# Diagnostic du Système Beta

## Problème Actuel
- Erreurs 404/400 dans la console
- "Aucun testeur beta trouvé"
- Fonctions SQL non accessibles

## Étapes de Diagnostic

### 1. Vérifier si la migration a été appliquée

**Dans votre dashboard Supabase :**
1. Allez dans "SQL Editor"
2. Exécutez cette requête :

```sql
-- Vérifier si les colonnes beta existent
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'subscriptions' 
  AND column_name IN ('beta_end', 'is_beta_tester');
```

**Résultat attendu :** 2 lignes avec `beta_end` et `is_beta_tester`

### 2. Vérifier si les fonctions SQL existent

```sql
-- Vérifier si les fonctions existent
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name IN (
  'create_beta_subscription_by_email', 
  'get_user_email_by_id',
  'get_beta_testers_with_emails'
);
```

**Résultat attendu :** 3 lignes avec les noms des fonctions

### 3. Vérifier les abonnements existants

```sql
-- Voir tous les abonnements
SELECT * FROM subscriptions;
```

### 4. Tester l'ajout d'un testeur beta

```sql
-- Tester avec votre email
SELECT create_beta_subscription_by_email('cybsecroot@gmail.com');
```

### 5. Vérifier le résultat

```sql
-- Vérifier si l'abonnement beta a été créé
SELECT * FROM subscriptions WHERE status = 'beta';
```

## Solutions selon le diagnostic

### Si la migration n'a pas été appliquée :
1. Appliquez le code SQL complet dans "SQL Editor"
2. Vérifiez qu'il n'y a pas d'erreurs
3. Testez à nouveau

### Si les fonctions existent mais ne fonctionnent pas :
1. Vérifiez les permissions RLS
2. Testez les fonctions une par une

### Si aucun abonnement n'existe :
1. Créez d'abord un abonnement normal
2. Puis convertissez-le en beta

## Code SQL de Migration Complet

```sql
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
```

## Test Final

Après avoir appliqué la migration :

1. **Testez l'ajout :** Entrez `cybsecroot@gmail.com` et cliquez "Ajouter Testeur Beta"
2. **Vérifiez la liste :** Cliquez "Lister Testeurs" 
3. **Vérifiez la console :** Regardez les logs dans F12

## Contact

Si le problème persiste, partagez :
1. Les résultats des requêtes de diagnostic
2. Les erreurs exactes dans la console
3. Le statut de la migration
