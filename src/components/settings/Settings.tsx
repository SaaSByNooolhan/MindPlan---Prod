import React, { useState } from 'react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { 
  User, 
  Crown, 
  CreditCard, 
  Sun,
  Moon,
  LogOut,
  Mail
} from 'lucide-react'
import { useAuthContext } from '../../contexts/AuthContext'
import { useSubscription } from '../../hooks/useSubscription'
import { useTheme } from '../../contexts/ThemeContext'
import { useAuth } from '../../hooks/useAuth'

export const Settings: React.FC = () => {
  const { user } = useAuthContext()
  const { subscription, isPremium, upgradeToPremium, manageSubscription, loading } = useSubscription()
  const { toggleTheme } = useTheme()
  const { signOut } = useAuth()
  const [isUpgrading, setIsUpgrading] = useState(false)

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
        if (typeof result.error === 'string' && result.error.includes('No Stripe customer found')) {
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

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
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
          <Card className="bg-gradient-to-r from-blue-50 to-emerald-50 dark:from-blue-900/20 dark:to-emerald-900/20 border-blue-200 dark:border-blue-800">
            <div className="p-8">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-full flex items-center justify-center">
                  <Crown className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    Abonnement
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Gérez votre abonnement et vos fonctionnalités Premium
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Statut de l'abonnement */}
                <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Statut actuel
                  </h3>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Plan</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {loading ? 'Chargement...' : (isPremium() ? 'Premium' : 'Gratuit')}
                      </p>
                    </div>
                    <div className={`px-4 py-2 rounded-full text-sm font-medium ${
                      loading 
                        ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        : (isPremium() 
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300')
                    }`}>
                      {subscription?.status === 'trial' ? 'Essai' : subscription?.status || 'Actif'}
                    </div>
                  </div>
                  
                  {subscription?.status === 'trial' && (
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <p className="text-sm text-blue-600 dark:text-blue-400">
                        ⏰ Vous êtes en période d'essai Premium
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Actions
                  </h3>
                  

                  {!loading && isPremium() && (
                    <div className="space-y-4">
                      <Button
                        onClick={handleManageSubscription}
                        variant="outline"
                        className="w-full"
                      >
                        <CreditCard className="w-4 h-4 mr-2" />
                        Gérer mon abonnement
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Section préférences */}
        <div className="mb-8">
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
                Préférences
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">Mode sombre</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Basculer entre le mode clair et sombre</p>
                    </div>
                  </div>
                  <Button
                    onClick={toggleTheme}
                    variant="outline"
                    size="sm"
                  >
                    <Moon className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Section compte */}
        <div className="mb-8">
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
                Compte
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">Email</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{user?.email}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <LogOut className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">Déconnexion</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Se déconnecter de votre compte</p>
                    </div>
                  </div>
                  <Button
                    onClick={handleSignOut}
                    variant="outline"
                    size="sm"
                  >
                    Déconnexion
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Section contact */}
        <div className="mb-8">
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
                Contact & Support
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">Support technique</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Pour toute question ou problème</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-blue-600 dark:text-blue-400">nooolhansaas@gmail.com</p>
                  </div>
                </div>
                
                <div className="p-4 bg-gradient-to-r from-blue-50 to-emerald-50 dark:from-blue-900/20 dark:to-emerald-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    💡 <strong>Besoin d'aide ?</strong> N'hésitez pas à nous contacter pour toute question concernant votre compte, vos abonnements ou l'utilisation de MindPlan.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}