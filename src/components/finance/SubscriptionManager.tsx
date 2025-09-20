import React, { useState } from 'react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { 
  Crown, 
  CheckCircle, 
  AlertTriangle,
  Loader2,
  ExternalLink,
  Zap
} from 'lucide-react'
import { useSubscription } from '../../hooks/useSubscription'

export const SubscriptionManager: React.FC = () => {
  const { 
    subscription, 
    upgradeToPremium, 
    manageSubscription, 
    getTrialDaysLeft,
    loading 
  } = useSubscription()
  
  const [isStartingTrial, setIsStartingTrial] = useState(false)
  const [isManaging, setIsManaging] = useState(false)

  const handleStartTrial = async () => {
    setIsStartingTrial(true)
    try {
      const result = await upgradeToPremium(false) // Avec essai gratuit Stripe
      if (result?.error) {
        alert(`Erreur: ${result.error}`)
      }
    } catch (error) {

      alert('Erreur lors du démarrage de l\'essai. Veuillez réessayer.')
    } finally {
      setIsStartingTrial(false)
    }
  }

  const handleManageSubscription = async () => {
    setIsManaging(true)
    try {
      const result = await manageSubscription()
      if (result?.error) {
        alert(`Erreur: ${result.error}`)
      }
    } catch (error) {

      alert('Erreur lors de l\'accès au portail. Veuillez réessayer.')
    } finally {
      setIsManaging(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getSubscriptionStatus = () => {
    if (!subscription) return 'free'
    
    // Si c'est un plan freemium, toujours retourner 'free'
    if (subscription.plan_type === 'free') {
      return 'free'
    }
    
    // Si c'est un plan premium, vérifier le statut
    if (subscription.plan_type === 'premium') {
      if (subscription.status === 'trial') {
        return 'trial'
      } else if (subscription.status === 'active') {
        return 'active'
      } else if (subscription.status === 'cancelled') {
        return 'cancelled'
      } else if (subscription.status === 'expired') {
        return 'expired'
      }
    }
    
    // Par défaut, considérer comme freemium
    return 'free'
  }

  const status = getSubscriptionStatus()

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600 dark:text-gray-400">Chargement...</span>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Statut actuel */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Votre Abonnement
          </h2>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200' :
            status === 'trial' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200' :
            status === 'expired' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200' :
            'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200'
          }`}>
            {status === 'active' ? 'Premium Actif' :
             status === 'trial' ? 'Essai Gratuit' :
             status === 'expired' ? 'Abonnement Expiré' :
             status === 'cancelled' ? 'Annulé' :
             'Gratuit'}
          </div>
        </div>

        {status === 'free' && (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Crown className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Version Gratuite
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Vous utilisez la version gratuite de MindPlan
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Limite actuelle : 10 transactions par mois, graphiques simples, export CSV
              </p>
            </div>
            
            <Button 
              onClick={handleStartTrial}
              disabled={isStartingTrial}
              className="w-full bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700"
            >
              {isStartingTrial ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Chargement...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Commencer votre essai gratuit
                </>
              )}
            </Button>
          </div>
        )}

        {status === 'trial' && (
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <Crown className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <div>
                <h3 className="font-semibold text-blue-800 dark:text-blue-200">
                  Essai Premium Gratuit
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {getTrialDaysLeft()} jour{getTrialDaysLeft() !== 1 ? 's' : ''} restant{getTrialDaysLeft() !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            
            {subscription?.trial_end && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p>Fin de l'essai : {formatDate(subscription.trial_end)}</p>
              </div>
            )}

            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800 dark:text-yellow-200">
                    Action requise
                  </h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                    Votre essai se termine bientôt. Configurez votre paiement pour continuer à profiter de Premium.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {status === 'active' && (
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
          <div>
                <h3 className="font-semibold text-green-800 dark:text-green-200">
                  Premium Actif
            </h3>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Vous profitez de toutes les fonctionnalités Premium
            </p>
          </div>
        </div>
        
            {subscription?.end_date && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p>Prochain paiement : {formatDate(subscription.end_date)}</p>
            </div>
            )}
          </div>
        )}
        
        {status === 'expired' && (
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
              <div>
                <h3 className="font-semibold text-red-800 dark:text-red-200">
                  Abonnement Expiré
                </h3>
                <p className="text-sm text-red-700 dark:text-red-300">
                  Votre paiement n'a pas pu être traité. Mettez à jour vos informations de paiement.
                </p>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Actions */}
      {status === 'free' && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Passer à Premium
          </h3>
          <div className="space-y-4">
            <div className="max-w-md mx-auto">
              <div className="p-6 border border-emerald-200 dark:border-emerald-800 rounded-lg text-center">
                <div className="flex items-center justify-center space-x-3 mb-4">
                  <Zap className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                  <h4 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    Passer à Premium
                  </h4>
            </div>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Accédez à toutes les fonctionnalités Premium pour 9.99€/mois
                </p>
                <Button 
                  onClick={handleStartTrial}
                  disabled={isStartingTrial}
                  className="w-full"
                  size="lg"
                >
                  {isStartingTrial ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Chargement...
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5 mr-2" />
                      Commencer votre essai gratuit
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                Avec Premium, vous obtenez :
              </h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Transactions illimitées</li>
                <li>• Analytics avancées et graphiques interactifs</li>
                <li>• Budgets intelligents avec alertes</li>
                <li>• Rapports détaillés et export PDF</li>
                <li>• Objectifs financiers avancés</li>
                <li>• Support prioritaire</li>
              </ul>
            </div>
          </div>
        </Card>
      )}

      {(status === 'trial' || status === 'active' || status === 'expired') && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Gestion de l'Abonnement
            </h3>
          <div className="space-y-4">
            <Button 
              onClick={handleManageSubscription}
              disabled={isManaging}
              variant="outline"
              className="w-full"
            >
              {isManaging ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Chargement...
                        </>
                      ) : (
                        <>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Gérer mon abonnement
                        </>
                      )}
            </Button>
            
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Gérez vos informations de paiement, téléchargez vos factures et annulez votre abonnement
            </p>
            
          </div>
        </Card>
      )}
    </div>
  )
}
