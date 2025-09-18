import React from 'react'
import { Clock, Crown, AlertTriangle } from 'lucide-react'
import { useSubscription } from '../../hooks/useSubscription'
import { Button } from '../ui/Button'

export const TrialStatus: React.FC = () => {
  const { subscription, getTrialDaysLeft, isTrialExpired } = useSubscription()

  // Vérifier si c'est un essai
  const isTrial = subscription?.plan_type === 'premium' && subscription?.status === 'trial'
  
  if (!isTrial) return null

  // Calculer les jours restants
  const daysLeft = getTrialDaysLeft()
  const isExpiringSoon = daysLeft <= 2
  const isExpired = isTrialExpired()

  if (isExpired) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
          <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
            Essai Premium expiré
          </h3>
        </div>
        <p className="text-sm text-red-600 dark:text-red-400 mt-1">
          Votre essai Premium gratuit a expiré.
        </p>
      </div>
    )
  }

  if (isExpiringSoon) {
    return (
      <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 mb-6">
        <div className="flex items-center space-x-2">
          <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          <h3 className="text-sm font-medium text-orange-800 dark:text-orange-200">
            Essai Premium se termine bientôt
          </h3>
        </div>
        <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">
          Il vous reste {daysLeft} jour{daysLeft > 1 ? 's' : ''} d'essai Premium gratuit.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4 mb-6">
      <div className="flex items-center space-x-2">
        <Crown className="w-5 h-5 text-purple-600 dark:text-purple-400" />
        <h3 className="text-sm font-medium text-purple-800 dark:text-purple-200">
          Essai Premium actif
        </h3>
      </div>
      <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">
        Il vous reste {daysLeft} jour{daysLeft > 1 ? 's' : ''} d'essai Premium gratuit.
      </p>
    </div>
  )
}
