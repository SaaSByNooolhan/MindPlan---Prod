import React from 'react'
import { Card } from './Card'
import { Button } from './Button'
import { AlertTriangle, CreditCard, Zap } from 'lucide-react'

interface TestTrialModalProps {
  isOpen: boolean
  onClose: () => void
}

export const TestTrialModal: React.FC<TestTrialModalProps> = ({ isOpen, onClose }) => {
  const [isUpgrading, setIsUpgrading] = React.useState(false)

  const handleUpgrade = async () => {
    setIsUpgrading(true)
    try {
      // Simuler un délai de traitement
      await new Promise(resolve => setTimeout(resolve, 1000))
      alert('Redirection vers Stripe... (simulation)')
    } catch (error) {
      console.error('Error upgrading:', error)
      alert('Erreur lors de l\'upgrade. Veuillez réessayer.')
    } finally {
      setIsUpgrading(false)
    }
  }

  const handleContinueFree = () => {
    // Sauvegarder le choix de l'utilisateur
    localStorage.setItem('userChoseFreeVersion', 'true')
    
    // Fermer le modal immédiatement
    onClose()
    
    // Afficher un message de confirmation
    setTimeout(() => {
      alert('Vous continuez en version gratuite. Vous pouvez passer à Premium à tout moment dans les paramètres.')
    }, 100)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-md w-full p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Essai Expiré
          </h2>
          
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Votre essai Premium gratuit de 7 jours a expiré. Continuez à profiter de toutes les fonctionnalités Premium en vous abonnant.
          </p>

          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
              <div className="flex items-center space-x-3 mb-3">
                <Zap className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-semibold text-emerald-800 dark:text-emerald-200">
                  Passer à Premium
                </h3>
              </div>
              <p className="text-sm text-emerald-700 dark:text-emerald-300 mb-3">
                Accédez à toutes les fonctionnalités Premium pour 9.99€/mois
              </p>
              <Button 
                onClick={handleUpgrade}
                disabled={isUpgrading}
                className="w-full"
              >
                {isUpgrading ? (
                  <>
                    <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Chargement...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    S'abonner maintenant
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button 
              onClick={handleContinueFree}
              variant="ghost"
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Continuer en version gratuite
            </Button>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Vous pourrez toujours passer à Premium plus tard
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
