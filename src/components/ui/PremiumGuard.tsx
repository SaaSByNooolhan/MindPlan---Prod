import React from 'react'
import { Card } from './Card'
import { Button } from './Button'
import { Crown, Lock } from 'lucide-react'
import { useSubscription } from '../../hooks/useSubscription'

interface PremiumGuardProps {
  children: React.ReactNode
  featureName: string
  description?: string
  showUpgradeButton?: boolean
}

export const PremiumGuard: React.FC<PremiumGuardProps> = ({ 
  children, 
  featureName, 
  description,
  showUpgradeButton = true 
}) => {
  const { isPremium, upgradeToPremium, loading } = useSubscription()
  const isPremiumUser = isPremium()

  // Pendant le chargement, afficher le contenu pour éviter le flash
  if (loading) {
    return (
      <div className="space-y-4">
        {children}
      </div>
    )
  }

  // Si l'utilisateur est Premium (actif ou en essai), afficher le contenu
  if (isPremiumUser) {
    return (
      <div className="space-y-4">
        {children}
      </div>
    )
  }

  // Si l'utilisateur n'est pas Premium, afficher le message de protection
  return (
    <div className="space-y-6">
      <Card className="p-8 text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Crown className="w-8 h-8 text-white" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          {featureName}
        </h2>
        
        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
          {description || `Cette fonctionnalité est disponible uniquement pour les utilisateurs Premium. Débloquez ${featureName} et bien plus encore !`}
        </p>

        <div className="bg-gradient-to-r from-blue-50 to-emerald-50 dark:from-blue-900/20 dark:to-emerald-900/20 rounded-lg p-6 mb-6 border border-blue-200 dark:border-blue-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Avec Premium, vous obtenez :
          </h3>
          <ul className="text-left space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
              <span>Analytics financières avancées</span>
            </li>
            <li className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full"></div>
              <span>Budgets intelligents avec alertes</span>
            </li>
            <li className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
              <span>Rapports détaillés et exports</span>
            </li>
            <li className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full"></div>
              <span>Prévisions et recommandations</span>
            </li>
            <li className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
              <span>Support prioritaire</span>
            </li>
          </ul>
        </div>

        {showUpgradeButton && (
          <div className="space-y-3">
            <Button 
              onClick={upgradeToPremium}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700"
            >
              <Crown className="w-5 h-5 mr-2" />
              Essai Premium gratuit - 7 jours
            </Button>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Puis 9.99€/mois. Annulez à tout moment.
            </p>
          </div>
        )}
      </Card>
    </div>
  )
}

// Composant pour les fonctionnalités Premium dans le dashboard
export const PremiumFeature: React.FC<{
  children: React.ReactNode
  featureName: string
  description?: string
}> = ({ children, featureName, description }) => {
  const { isPremium } = useSubscription()
  const isPremiumUser = isPremium()

  if (isPremiumUser) {
    return <>{children}</>
  }

  return (
    <div className="relative">
      <div className="opacity-50 pointer-events-none">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 rounded-lg">
        <div className="text-center">
          <Lock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {featureName}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            Premium uniquement
          </p>
        </div>
      </div>
    </div>
  )
}

