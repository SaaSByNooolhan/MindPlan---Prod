# Configuration Stripe pour MindPlan

## Variables d'environnement requises

Créez un fichier `.env.local` avec les variables suivantes :

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Stripe Price IDs
STRIPE_PREMIUM_MONTHLY_PRICE_ID=price_your_premium_monthly_price_id_here
```

## Configuration Stripe

### 1. Créer un produit et un prix dans Stripe

1. Connectez-vous à votre [Dashboard Stripe](https://dashboard.stripe.com)
2. Allez dans **Produits** → **Ajouter un produit**
3. Créez un produit "MindPlan Premium" avec un prix récurrent mensuel de 9.99€
4. Copiez l'ID du prix (commence par `price_`)

### 2. Configurer les webhooks

1. Allez dans **Développeurs** → **Webhooks**
2. Cliquez sur **Ajouter un endpoint**
3. URL : `https://votre-domaine.com/api/webhook`
4. Événements à écouter :
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copiez le secret du webhook (commence par `whsec_`)

### 3. Mettre à jour le code

Dans `src/lib/stripe.ts`, mettez à jour l'ID du prix :

```typescript
export const STRIPE_PRICES = {
  premium_monthly: {
    id: 'price_VOTRE_PRIX_ID_ICI', // Remplacez par votre vrai price_id
    amount: 999, // 9.99€ en centimes
    currency: 'eur',
    interval: 'month' as const,
    product: {
      name: 'MindPlan Premium',
      description: 'Accès complet à toutes les fonctionnalités'
    }
  }
}
```

## Fonctionnalités implémentées

### ✅ Système de paiement complet

1. **Essai gratuit unique** - Un seul essai gratuit de 7 jours par utilisateur
2. **Paiement direct** - Les utilisateurs peuvent payer immédiatement sans essai
3. **Gestion des abonnements** - Portail client Stripe pour gérer les paiements
4. **Expiration d'essai** - Modal automatique quand l'essai expire avec option de continuer gratuitement
5. **Webhooks** - Synchronisation automatique des statuts d'abonnement

### ✅ Interface utilisateur

1. **SubscriptionManager** - Interface complète de gestion des abonnements
2. **TrialExpiredModal** - Modal pour gérer l'expiration de l'essai
3. **Intégration dans Settings** - Section dédiée dans les paramètres
4. **Messages informatifs** - Interface claire pour les différents statuts

### ✅ Flux de paiement

1. **Paiement direct uniquement** : `upgradeToPremium(true)`
2. **Gestion** : `manageSubscription()` (portail client)
3. **Détection d'expiration** : `isTrialExpired()`
4. **Retour gratuit** : Mise à jour automatique du statut d'abonnement

## Test du système

### Mode développement

Le système fonctionne en mode développement même sans clés Stripe configurées. Les fonctions retournent des erreurs appropriées.

### Mode production

1. Configurez toutes les variables d'environnement
2. Déployez les API routes (`api/create-checkout-session.js`, `api/webhook.js`)
3. Configurez les webhooks Stripe
4. Testez avec les cartes de test Stripe

## Cartes de test Stripe

- **Succès** : `4242 4242 4242 4242`
- **Échec** : `4000 0000 0000 0002`
- **3D Secure** : `4000 0025 0000 3155`

## Support

Le système est maintenant entièrement fonctionnel avec :
- ✅ Paiements Stripe
- ✅ Essais gratuits
- ✅ Gestion des abonnements
- ✅ Webhooks
- ✅ Interface utilisateur complète
- ✅ Gestion des erreurs
- ✅ Expiration d'essai automatique
