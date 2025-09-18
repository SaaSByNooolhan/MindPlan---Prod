# Statistiques Financières Avancées - StudyLife

## Vue d'ensemble

Ce projet implémente un système de statistiques financières avec deux niveaux d'accès :

- **Utilisateurs gratuits** : Statistiques basiques
- **Utilisateurs Premium** : Statistiques avancées avec graphiques interactifs

## Fonctionnalités

### Statistiques Basiques (Gratuit)
- Aperçu du mois avec revenus, dépenses, solde et budget utilisé
- Top 3 des dépenses par catégorie
- Top 3 des sources de revenus
- Activité récente (5 dernières transactions)

### Statistiques Avancées (Premium)
- **Graphiques interactifs** :
  - Camembert : Répartition des dépenses par catégorie
  - Barres : Comparaison revenus vs dépenses
  - Ligne : Évolution des revenus et dépenses dans le temps
  - Aires : Répartition des revenus et dépenses
  - Composé : Vue d'ensemble avec barres et ligne de solde

- **Périodes d'analyse** :
  - Ce mois
  - Ce trimestre
  - Cette année

- **Statistiques détaillées** :
  - Totaux par période
  - Pourcentages et tendances
  - Export de données (à implémenter)

## Structure des fichiers

```
src/
├── components/finance/
│   ├── FinanceTracker.tsx      # Composant principal
│   ├── BasicStats.tsx          # Statistiques gratuites
│   ├── AdvancedStats.tsx       # Statistiques premium
│   └── PremiumUpgrade.tsx      # Promotion premium
├── hooks/
│   └── useSubscription.ts      # Gestion des abonnements
└── lib/
    └── supabase.ts             # Types et configuration
```

## Base de données

### Table `subscriptions`
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_type TEXT CHECK (plan_type IN ('free', 'premium')) DEFAULT 'free',
  status TEXT CHECK (status IN ('active', 'cancelled', 'expired')) DEFAULT 'active',
  start_date TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
```

## Utilisation

### Hook useSubscription
```typescript
const { isPremium, upgradeToPremium, subscription } = useSubscription()

// Vérifier si l'utilisateur est premium
if (isPremium()) {
  // Afficher les statistiques avancées
}

// Mettre à niveau vers premium
const { error } = await upgradeToPremium()
```

### Composants de statistiques
```typescript
// Statistiques basiques
<BasicStats transactions={transactions} monthlyBudget={1000} />

// Statistiques avancées
<AdvancedStats transactions={transactions} />

// Promotion premium
<PremiumUpgrade />
```

## Graphiques disponibles

### 1. Camembert (Pie Chart)
- **Usage** : Répartition des dépenses par catégorie
- **Données** : Montants par catégorie
- **Interactivité** : Tooltips avec pourcentages

### 2. Barres (Bar Chart)
- **Usage** : Comparaison revenus vs dépenses
- **Données** : Revenus et dépenses par période
- **Interactivité** : Légende et tooltips

### 3. Ligne (Line Chart)
- **Usage** : Évolution temporelle
- **Données** : Revenus et dépenses dans le temps
- **Interactivité** : Lignes interactives

### 4. Aires (Area Chart)
- **Usage** : Répartition empilée
- **Données** : Revenus et dépenses empilés
- **Interactivité** : Aires colorées

### 5. Composé (Composed Chart)
- **Usage** : Vue d'ensemble complète
- **Données** : Barres + ligne de solde
- **Interactivité** : Multiples visualisations

## Dépendances

- **Recharts** : Bibliothèque de graphiques React
- **Date-fns** : Manipulation des dates
- **Lucide React** : Icônes
- **Supabase** : Base de données et authentification

## Installation

1. Installer les dépendances :
```bash
npm install recharts date-fns lucide-react
```

2. Appliquer la migration de base de données :
```bash
# Exécuter le fichier de migration
supabase/migrations/20250818000329_add_subscriptions.sql
```

3. Redémarrer l'application :
```bash
npm run dev
```

## Fonctionnalités à venir

- [ ] Export de données en CSV/PDF
- [ ] Notifications de dépassement de budget
- [ ] Prévisions financières
- [ ] Comparaison avec les mois précédents
- [ ] Alertes personnalisées
- [ ] Intégration avec des comptes bancaires

## Notes techniques

- Les graphiques sont responsives et s'adaptent à toutes les tailles d'écran
- Les données sont filtrées par période sélectionnée
- Les couleurs sont cohérentes avec le thème de l'application
- Support du mode sombre/clair
- Optimisation des performances avec React.memo si nécessaire

