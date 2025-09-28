import React from 'react'
import { Card } from './Card'
import { Button } from './Button'

interface BetaExpiredModalProps {
  isOpen: boolean
  onClose: () => void
  onUpgrade: () => void
}

export const BetaExpiredModal: React.FC<BetaExpiredModalProps> = ({ 
  isOpen, 
  onClose, 
  onUpgrade 
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-md w-full">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900 mb-4">
            <svg className="h-6 w-6 text-orange-600 dark:text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Période Beta Expirée
          </h3>
          
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Votre accès beta de 37 jours a expiré. Pour continuer à profiter de toutes les fonctionnalités premium, 
            passez à un abonnement payant.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={onUpgrade}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Passer à Premium
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              Continuer en Gratuit
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
