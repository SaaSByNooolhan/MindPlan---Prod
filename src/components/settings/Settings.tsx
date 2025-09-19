import React, { useState } from 'react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { 
  User, 
  Crown, 
  CreditCard, 
  Bell, 
  Shield, 
  HelpCircle,
  Gift,
  Sparkles,
  ArrowRight,
  Sun,
  Moon,
  LogOut
} from 'lucide-react'
import { useAuthContext } from '../../contexts/AuthContext'
import { useSubscription } from '../../hooks/useSubscription'
import { useTheme } from '../../contexts/ThemeContext'
import { useAuth } from '../../hooks/useAuth'

export const Settings: React.FC = () => {
  const { user } = useAuthContext()
  const { subscription, isPremium, startFreeTrial, upgradeToPremium, manageSubscription, getTrialDaysLeft } = useSubscription()
  const { theme, toggleTheme } = useTheme()
  const { signOut } = useAuth()
  const [isStartingTrial, setIsStartingTrial] = useState(false)
  const [isUpgrading, setIsUpgrading] = useState(false)

  const handleStartTrial = async () => {
    setIsStartingTrial(true)
    try {
      const result = await startFreeTrial()
      if (result?.error) {
        alert(`Erreur: ${result.error}`)
      } else {
        alert('🎉 Essai Premium de 7 jours démarré avec succès ! Profitez de toutes les fonctionnalités Premium.')
      }
    } catch (error) {
      console.error('Error starting trial:', error)
      alert('Erreur lors du démarrage de l\'essai. Veuillez réessayer.')
    } finally {
      setIsStartingTrial(false)
    }
  }

  const handleUpgrade = async () => {
    setIsUpgrading(true)
    try {
      const result = await upgradeToPremium()
      if (result?.error) {
        alert(`Erreur: ${result.error}`)
      }
    } catch (error) {
      console.error('Error upgrading:', error)
      alert('Erreur lors de l\'upgrade. Veuillez réessayer.')
    } finally {
      setIsUpgrading(false)
    }
  }

  const handleManageSubscription = async () => {
    try {
      const result = await manageSubscription()
      if (result?.error) {
        if (result.error.includes('No Stripe customer found')) {
          alert('Vous devez d\'abord créer un abonnement pour accéder au portail client. Veuillez vous abonner d\'abord.')
        } else {
          alert(`Erreur: ${result.error}`)
        }
      }
    } catch (error) {
      console.error('Error managing subscription:', error)
      alert('Erreur lors de l\'ouverture du portail. Veuillez réessayer.')
    }
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
          Paramètres
        </h1>

        {/* Section principale - Abonnement */}
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800">
            <div className="p-8">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <Crown className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    Abonnement
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Gérez votre plan et vos fonctionnalités Premium
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Statut actuel */}
                <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Plan actuel
                  </h3>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {isPremium() ? 'Premium' : 'Freemium'}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {subscription?.status === 'trial' ? 'Essai gratuit' : 'Plan actif'}
                      </p>
                    </div>
                    <div className={`px-4 py-2 rounded-full text-sm font-medium ${
                      isPremium() 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {subscription?.status === 'trial' ? 'Essai' : subscription?.status || 'Actif'}
                    </div>
                  </div>
                  
                  {subscription?.status === 'trial' && (
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                      <p className="text-sm text-purple-600 dark:text-purple-400">
                        ⏰ Il vous reste <span className="font-semibold">{getTrialDaysLeft()} jour{getTrialDaysLeft() > 1 ? 's' : ''}</span> d'essai Premium
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Actions
                  </h3>
                  
                  {!isPremium() && subscription?.status !== 'trial' && (
                    <div className="space-y-4">
                      <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                        <div className="flex items-center space-x-2 mb-3">
                          <Gift className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                          <h4 className="font-semibold text-purple-800 dark:text-purple-200">
                            Essai Premium gratuit
                          </h4>
                        </div>
                        <p className="text-sm text-purple-600 dark:text-purple-400 mb-4">
                          Testez toutes les fonctionnalités Premium pendant 7 jours
                        </p>
                        <div className="flex items-center space-x-2 text-xs text-purple-600 dark:text-purple-400 mb-4">
                          <Sparkles className="w-4 h-4" />
                          <span>Analytics avancées</span>
                          <Sparkles className="w-4 h-4" />
                          <span>Graphiques détaillés</span>
                          <Sparkles className="w-4 h-4" />
                          <span>Export de données</span>
                        </div>
                        <Button
                          onClick={handleStartTrial}
                          disabled={isStartingTrial}
                          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                        >
                          {isStartingTrial ? (
                            'Démarrage...'
                          ) : (
                            <>
                              Démarrer l'essai gratuit
                              <ArrowRight className="ml-2 w-4 h-4" />
                            </>
                          )}
                        </Button>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                          Aucune carte de crédit requise
                        </p>
                      </div>
                      
                      <Button
                        onClick={handleUpgrade}
                        disabled={isUpgrading}
                        variant="outline"
                        className="w-full"
                      >
                        {isUpgrading ? 'Chargement...' : 'Passer à Premium'}
                      </Button>
                    </div>
                  )}

                  {isPremium() && (
                    <Button
                      onClick={handleManageSubscription}
                      variant="outline"
                      className="w-full"
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      Gérer mon abonnement
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Sections secondaires */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profil utilisateur */}
          <Card>
            <div className="p-6">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    Profil
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Informations de votre compte
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <p className="text-gray-900 dark:text-gray-100">{user?.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    ID utilisateur
                  </label>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                    {user?.id}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Apparence */}
          <Card>
            <div className="p-6">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                  {theme === 'dark' ? <Sun className="w-6 h-6 text-white" /> : <Moon className="w-6 h-6 text-white" />}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    Apparence
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Personnalisez l'apparence de l'application
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">
                      Thème sombre
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {theme === 'dark' ? 'Mode sombre activé' : 'Mode clair activé'}
                    </p>
                  </div>
                  <button
                    onClick={toggleTheme}
                    className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
                  >
                    {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>
          </Card>

          {/* Notifications */}
          <Card>
            <div className="p-6">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center">
                  <Bell className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    Notifications
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Préférences de notification
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">
                      Rappels de tâches
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Recevoir des notifications pour les tâches
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">
                      Rappels d'événements
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Notifications pour les événements à venir
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Aide et support */}
          <Card>
            <div className="p-6">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                  <HelpCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    Aide et support
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Contactez-nous pour toute assistance
                  </p>
                </div>
              </div>
              
              <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">@</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-orange-800 dark:text-orange-200">
                      Support par email
                    </h3>
                    <p className="text-sm text-orange-600 dark:text-orange-400">
                      nooolhansaas@gmail.com
                    </p>
                  </div>
                </div>
                <p className="text-xs text-orange-500 dark:text-orange-400 mt-3">
                  Nous répondons généralement dans les 24h
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Section compte - Pleine largeur */}
        <div className="mt-6">
          <Card>
            <div className="p-6">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
                  <LogOut className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    Compte
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Gestion de votre compte et actions critiques
                  </p>
                </div>
              </div>
              
              <div className="max-w-md">
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <h3 className="font-medium text-red-800 dark:text-red-200 mb-2">
                    Zone de danger
                  </h3>
                  <p className="text-sm text-red-600 dark:text-red-400 mb-4">
                    Ces actions sont irréversibles. Veuillez réfléchir avant de continuer.
                  </p>
                  <Button
                    onClick={signOut}
                    variant="outline"
                    className="w-full border-red-300 text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Se déconnecter
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
