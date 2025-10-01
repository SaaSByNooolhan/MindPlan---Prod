# MindPlan - Application de Gestion Personnelle Gratuite

MindPlan est une application web complète de gestion personnelle qui vous aide à organiser vos finances, tâches, calendrier et sessions de travail avec la technique Pomodoro.

## ✨ Fonctionnalités

### 💰 Gestion Financière
- **Transactions illimitées** - Ajoutez autant de transactions que vous voulez
- **Analytics avancées** - Graphiques détaillés et analyses de vos finances
- **Budgets intelligents** - Créez et suivez vos budgets par catégorie
- **Transactions récurrentes** - Gérez vos abonnements et paiements récurrents
- **Export de données** - Exportez vos données en CSV ou PDF

### 📅 Gestion du Temps
- **Calendrier intégré** - Planifiez vos événements et rendez-vous
- **Technique Pomodoro** - Timer personnalisable pour optimiser votre productivité
- **Suivi des sessions** - Statistiques détaillées de vos sessions de travail

### ✅ Gestion des Tâches
- **Liste de tâches** - Organisez vos tâches par priorité et catégorie
- **Suivi des progrès** - Visualisez votre productivité

## 🆓 Totalement Gratuit

**MindPlan est maintenant 100% gratuit !** Toutes les fonctionnalités sont accessibles sans limitation :
- ✅ Transactions illimitées
- ✅ Analytics avancées
- ✅ Budgets intelligents
- ✅ Export de données
- ✅ Toutes les fonctionnalités premium

## 🚀 Technologies Utilisées

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **Charts**: Chart.js + Recharts
- **Icons**: Lucide React
- **Date handling**: date-fns

## 📦 Installation

1. **Cloner le projet**
   ```bash
   git clone <repository-url>
   cd mindplan
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configuration Supabase**
   - Créez un projet sur [Supabase](https://supabase.com)
   - Copiez l'URL et la clé anonyme
   - Créez un fichier `.env.local` :
   ```env
   VITE_SUPABASE_URL=your_supabase_url_here
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```

4. **Exécuter les migrations**
   ```bash
   npx supabase db push
   ```

5. **Lancer l'application**
   ```bash
   npm run dev
   ```

## 🗄️ Base de Données

L'application utilise les tables suivantes :
- `profiles` - Profils utilisateurs
- `transactions` - Transactions financières
- `budgets` - Budgets par catégorie
- `tasks` - Tâches utilisateur
- `events` - Événements du calendrier
- `pomodoro_sessions` - Sessions Pomodoro
- `subscriptions` - Abonnements (maintenant tous gratuits)

## 🎯 Fonctionnalités Principales

### Dashboard
- Vue d'ensemble de vos finances
- Statistiques en temps réel
- Actions rapides

### Finances
- Ajout de transactions (revenus/dépenses)
- Catégorisation automatique
- Suivi des budgets
- Analytics détaillées

### Calendrier
- Vue mensuelle et hebdomadaire
- Création d'événements
- Catégorisation par couleur

### Pomodoro
- Timer personnalisable
- Sessions de travail et pause
- Statistiques de productivité

## 🔧 Scripts Disponibles

- `npm run dev` - Lancer en mode développement
- `npm run build` - Construire pour la production
- `npm run preview` - Prévisualiser la build
- `npm run lint` - Linter le code

## 📱 Responsive Design

L'application est entièrement responsive et fonctionne parfaitement sur :
- 📱 Mobile
- 📱 Tablette
- 💻 Desktop

## 🌙 Mode Sombre

Support complet du mode sombre avec basculement automatique.

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :
- Signaler des bugs
- Proposer des améliorations
- Soumettre des pull requests

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier LICENSE pour plus de détails.

## 🎉 Remerciements

Merci à tous les utilisateurs qui ont contribué au développement de MindPlan !

---

**MindPlan - Votre assistant personnel gratuit pour une meilleure organisation !** 🚀