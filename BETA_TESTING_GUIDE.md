# Guide de Gestion des Testeurs Beta

## Vue d'ensemble

Ce guide explique comment gérer la version beta de votre SaaS avec un accès de 37 jours pour les testeurs.

## Fonctionnalités Implémentées

### 1. Statut Beta dans la Base de Données

- **Nouveau statut**: `beta` ajouté aux abonnements
- **Durée**: 37 jours d'accès complet
- **Champs ajoutés**:
  - `beta_end`: Date de fin de la période beta
  - `is_beta_tester`: Marqueur pour identifier les testeurs beta

### 2. Fonctions Supabase

#### `create_beta_subscription(user_uuid)`
Crée ou met à jour un abonnement beta pour un utilisateur.

```sql
SELECT create_beta_subscription('user-uuid-here');
```

#### `is_beta_access_valid(user_uuid)`
Vérifie si un utilisateur beta a encore accès.

```sql
SELECT is_beta_access_valid('user-uuid-here');
```

#### `expire_beta_access()`
Expire automatiquement tous les accès beta expirés.

```sql
SELECT expire_beta_access();
```

### 3. Composants UI

#### `BetaBadge`
Badge visuel pour identifier les fonctionnalités beta.

#### `BetaStatusCard`
Affiche le statut beta et les jours restants.

#### `BetaExpiredModal`
Modal affiché quand la période beta expire.

#### `BetaTesterManager`
Interface d'administration pour gérer les testeurs beta.

## Comment Utiliser

### 1. Ajouter un Testeur Beta

#### Via l'Interface Admin
```tsx
import { BetaTesterManager } from './components/admin/BetaTesterManager'

// Dans votre page d'administration
<BetaTesterManager />
```

#### Via Supabase Directement
```sql
-- Trouver l'UUID de l'utilisateur
SELECT id FROM auth.users WHERE email = 'testeur@example.com';

-- Créer l'abonnement beta
SELECT create_beta_subscription('user-uuid-here');
```

### 2. Vérifier le Statut Beta

```tsx
import { useSubscription } from './hooks/useSubscription'

const { isBetaTester, getBetaDaysLeft, isBetaExpired } = useSubscription()

if (isBetaTester()) {
  const daysLeft = getBetaDaysLeft()
  console.log(`${daysLeft} jours restants`)
}
```

### 3. Afficher le Statut Beta

```tsx
import { BetaStatusCard } from './components/ui/BetaStatusCard'

// Dans votre dashboard
<BetaStatusCard />
```

## Gestion Automatique

### Expiration Automatique
Les accès beta expirent automatiquement après 37 jours. L'utilisateur retourne au plan gratuit.

### Vérification en Temps Réel
Le hook `useSubscription` vérifie automatiquement l'expiration à chaque utilisation.

## Migration

### Appliquer la Migration
```bash
# Dans votre projet Supabase
supabase db push
```

### Vérifier l'Installation
```sql
-- Vérifier que les contraintes sont ajoutées
SELECT conname, consrc 
FROM pg_constraint 
WHERE conname LIKE '%subscriptions%';

-- Vérifier les nouvelles colonnes
\d subscriptions
```

## Sécurité

### Row Level Security (RLS)
Toutes les politiques RLS existantes s'appliquent aux nouveaux champs beta.

### Fonctions Sécurisées
Les fonctions utilisent `SECURITY DEFINER` pour s'exécuter avec les privilèges appropriés.

## Monitoring

### Requêtes Utiles

```sql
-- Compter les testeurs beta actifs
SELECT COUNT(*) FROM subscriptions 
WHERE status = 'beta' AND is_beta_tester = true;

-- Voir les testeurs beta qui expirent bientôt
SELECT user_id, beta_end, 
       (beta_end - NOW()) as days_left
FROM subscriptions 
WHERE status = 'beta' 
  AND is_beta_tester = true 
  AND beta_end > NOW()
ORDER BY beta_end;

-- Voir les testeurs beta expirés
SELECT user_id, beta_end
FROM subscriptions 
WHERE status = 'beta' 
  AND is_beta_tester = true 
  AND beta_end <= NOW();
```

## Intégration avec Stripe

### Conversion Beta → Premium
Quand un testeur beta veut passer à Premium :

1. Il garde son accès beta jusqu'à expiration
2. Il peut souscrire à Premium via Stripe
3. Son statut passe de `beta` à `active`

### Webhook Stripe
Le webhook existant gère automatiquement la conversion.

## Dépannage

### Problèmes Courants

1. **Migration échoue** : Vérifiez que vous avez les droits d'administration
2. **Fonction non trouvée** : Assurez-vous que la migration a été appliquée
3. **RLS bloque** : Vérifiez que l'utilisateur est authentifié

### Logs
```sql
-- Voir les logs d'erreur
SELECT * FROM pg_stat_statements 
WHERE query LIKE '%beta%';
```

## Prochaines Étapes

1. **Automatisation** : Créer un cron job pour expirer automatiquement les accès
2. **Analytics** : Ajouter des métriques sur l'utilisation beta
3. **Notifications** : Envoyer des emails avant expiration
4. **Feedback** : Collecter les retours des testeurs beta

## Support

Pour toute question ou problème, consultez :
- La documentation Supabase
- Les logs de l'application
- Le code source des composants UI
