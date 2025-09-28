import React from 'react'
import { Card } from './Card'
import { BetaBadge } from './BetaBadge'
import { useSubscription } from '../../hooks/useSubscription'

export const BetaStatusCard: React.FC = () => {
  const { isBetaTester, getBetaDaysLeft, subscription } = useSubscription()

  if (!isBetaTester()) return null

  const daysLeft = getBetaDaysLeft()

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <BetaBadge />
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              Accès Beta Actif
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {daysLeft > 0 
                ? `${daysLeft} jour${daysLeft > 1 ? 's' : ''} restant${daysLeft > 1 ? 's' : ''}`
                : 'Expiré aujourd\'hui'
              }
            </p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Accès complet
          </div>
          <div className="text-xs font-medium text-green-600 dark:text-green-400">
            Toutes fonctionnalités
          </div>
        </div>
      </div>
      
      {daysLeft <= 3 && daysLeft > 0 && (
        <div className="mt-3 p-2 bg-orange-50 dark:bg-orange-900/20 rounded-md">
          <p className="text-xs text-orange-700 dark:text-orange-300">
            ⚠️ Votre période beta expire bientôt. Pensez à passer à Premium pour conserver l'accès complet.
          </p>
        </div>
      )}
    </Card>
  )
}
