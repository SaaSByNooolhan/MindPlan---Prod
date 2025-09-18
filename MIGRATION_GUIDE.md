# Guide de Migration - Ajout du champ estimated_time

## Problème
Le champ `estimated_time` n'existe pas dans votre base de données Supabase, ce qui empêche la création de tâches avec temps estimé.

## Solution Temporaire
J'ai temporairement masqué les fonctionnalités liées au temps estimé pour que la création de tâches fonctionne immédiatement.

## Application de la Migration

### Option 1: Via l'interface Supabase (Recommandé)

1. **Connectez-vous à votre projet Supabase**
   - Allez sur [supabase.com](https://supabase.com)
   - Ouvrez votre projet MindPlan

2. **Accédez à l'éditeur SQL**
   - Dans le menu de gauche, cliquez sur "SQL Editor"
   - Cliquez sur "New query"

3. **Exécutez la migration**
   - Copiez et collez ce code SQL :

```sql
-- Add estimated_time column to tasks table
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS estimated_time INTEGER;

-- Add comment to explain the column
COMMENT ON COLUMN tasks.estimated_time IS 'Estimated time to complete the task in minutes';
```

4. **Exécutez la requête**
   - Cliquez sur "Run" pour exécuter la migration

### Option 2: Via le CLI Supabase

Si vous avez le CLI Supabase installé :

```bash
# Appliquer la migration
supabase db push

# Ou exécuter directement le fichier SQL
supabase db reset --db-url "your-database-url"
```

## Après la Migration

Une fois la migration appliquée, vous devrez :

1. **Décommenter le code** dans `src/components/tasks/TaskList.tsx`
2. **Réactiver les fonctionnalités** de temps estimé
3. **Tester la création** de tâches avec temps estimé

## Vérification

Pour vérifier que la migration a fonctionné :

1. Allez dans l'éditeur SQL de Supabase
2. Exécutez cette requête :

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'tasks' 
AND column_name = 'estimated_time';
```

Vous devriez voir le champ `estimated_time` de type `integer`.

## Support

Si vous rencontrez des problèmes :
1. Vérifiez que vous êtes connecté au bon projet Supabase
2. Assurez-vous d'avoir les permissions d'administrateur
3. Vérifiez les logs d'erreur dans la console Supabase

