# Configuration Google OAuth avec Supabase

## Étapes pour configurer Google OAuth

### 1. Configuration Google Cloud Console

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créez un nouveau projet ou sélectionnez un projet existant
3. Activez l'API Google+ (ou Google Identity)
4. Allez dans "Identifiants" > "Créer des identifiants" > "ID client OAuth 2.0"
5. Configurez l'écran de consentement OAuth si ce n'est pas déjà fait
6. Ajoutez les URI de redirection autorisées :
   - `https://your-project.supabase.co/auth/v1/callback`
   - `http://localhost:3000/auth/v1/callback` (pour le développement)

### 2. Configuration Supabase

1. Allez dans votre dashboard Supabase
2. Naviguez vers "Authentication" > "Providers"
3. Activez le provider Google
4. Ajoutez votre Client ID et Client Secret de Google
5. Configurez l'URL de redirection : `https://your-project.supabase.co/auth/v1/callback`

### 3. Variables d'environnement

Assurez-vous d'avoir ces variables dans votre fichier `.env` :

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Test de la configuration

1. Démarrez votre application
2. Cliquez sur "Se connecter avec Google"
3. Vous devriez être redirigé vers Google pour l'authentification
4. Après authentification, vous serez redirigé vers votre dashboard

## Fonctionnalités implémentées

✅ **Connexion par email/mot de passe**
✅ **Inscription par email/mot de passe**
✅ **Connexion avec Google**
✅ **Inscription avec Google**
✅ **Gestion des modes connexion/inscription**
✅ **Support Premium avec Google OAuth**
✅ **Redirection automatique après authentification**
✅ **Gestion des erreurs**
✅ **Interface utilisateur moderne avec thème bleu/emerald**

## Notes importantes

- L'authentification Google fonctionne pour les deux modes (connexion et inscription)
- Les utilisateurs Premium sont automatiquement gérés via localStorage
- La redirection se fait vers `/dashboard` après authentification
- Le thème est cohérent avec le reste de l'application MindPlan




