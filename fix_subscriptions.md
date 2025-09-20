# Correction du Problème de Subscription

## Problème Identifié

L'erreur 406 (Not Acceptable) lors de la requête vers la table `subscriptions` indique que :

1. **Table manquante ou mal configurée** : La table `subscriptions` n'existe pas ou n'est pas correctement configurée
2. **Permissions RLS** : Les politiques de sécurité au niveau des lignes (RLS) ne sont pas correctement configurées
3. **Abonnement manquant** : L'utilisateur n'a pas d'abonnement par défaut dans la base de données

## Solution

### 1. Appliquer la Migration

**Option 1 - Migration Minimale (Recommandée)**
Exécutez la migration `20250120000018_minimal_subscriptions_fix.sql` qui :

- ✅ Crée la table `subscriptions` avec toutes les colonnes nécessaires
- ✅ Ne touche pas aux politiques existantes
- ✅ Crée les index de base
- ✅ Crée des abonnements par défaut pour les utilisateurs existants

**Option 2 - Migration Sécurisée**
Si vous voulez recréer les politiques, utilisez `20250120000017_safe_subscriptions_fix.sql`

### 2. Commandes à Exécuter

```sql
-- Dans votre console Supabase ou via l'interface web
-- Exécutez le contenu du fichier : supabase/migrations/20250120000018_minimal_subscriptions_fix.sql
```

### 3. Si vous avez des erreurs de politiques existantes

Si vous rencontrez des erreurs avec les politiques existantes, utilisez la version minimale :

```sql
-- Version minimale qui ne touche pas aux politiques existantes
-- Exécutez : supabase/migrations/20250120000018_minimal_subscriptions_fix.sql
```

### 3. Vérification

Après avoir appliqué la migration, vérifiez que :

1. **Table créée** : La table `subscriptions` existe
2. **Politiques RLS** : Les politiques sont actives
3. **Abonnements par défaut** : Chaque utilisateur a un abonnement gratuit

### 4. Test

1. Rechargez l'application
2. Connectez-vous avec votre compte
3. Allez dans les Paramètres
4. Vérifiez que la section Abonnement s'affiche correctement
5. Testez le bouton "Continuer en version gratuite" dans le modal d'expiration

## Code Modifié

### useSubscription.ts
- ✅ **Requête simplifiée** : Suppression du `.single()` qui causait l'erreur
- ✅ **Gestion d'erreur robuste** : Création automatique d'un abonnement par défaut
- ✅ **Fallback** : En cas d'erreur, création d'un abonnement gratuit

### TrialExpiredModal.tsx
- ✅ **Mise à jour du statut** : Le bouton "Continuer en version gratuite" met à jour correctement le statut
- ✅ **Fermeture du modal** : Le modal se ferme après l'action

## Résultat Attendu

Après ces corrections :

1. ✅ **Plus d'erreur 406** : Les requêtes Supabase fonctionnent
2. ✅ **Abonnement par défaut** : Chaque utilisateur a un abonnement gratuit
3. ✅ **Modal fonctionnel** : Le bouton "Continuer en version gratuite" fonctionne
4. ✅ **Interface cohérente** : L'interface d'abonnement s'affiche correctement

## Prochaines Étapes

1. Appliquez la migration dans Supabase
2. Testez l'application
3. Vérifiez que le modal d'expiration fonctionne
4. Confirmez que l'utilisateur peut continuer en version gratuite
