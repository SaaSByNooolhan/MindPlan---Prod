import React, { useEffect, useState } from 'react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { 
  User, 
  Sun,
  Moon,
  LogOut,
  Mail,
  Zap,
  CheckCircle
} from 'lucide-react'
import { useAuthContext } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import { useAuth } from '../../hooks/useAuth'

export const Settings: React.FC = () => {
  const { user } = useAuthContext()
  const { toggleTheme } = useTheme()
  const { signOut } = useAuth()
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false)

  useEffect(() => {
    // Vérifier si l'utilisateur vient de s'inscrire et veut l'essai premium
    const wantsPremium = localStorage.getItem('wantsPremium') === 'true'
    const isNewSignup = localStorage.getItem('isNewSignup') === 'true'
    
    if (wantsPremium && isNewSignup) {
      setShowWelcomeMessage(true)
      // Nettoyer les flags après 5 secondes
      setTimeout(() => {
        localStorage.removeItem('wantsPremium')
        localStorage.removeItem('isNewSignup')
        setShowWelcomeMessage(false)
      }, 5000)
    }
  }, [])

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {

    }
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
          Paramètres
        </h1>

        {/* Message de bienvenue pour l'essai gratuit */}
        {showWelcomeMessage && (
          <div className="mb-6">
            <Card className="p-6 bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 border-emerald-200 dark:border-emerald-800">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-600 to-blue-600 rounded-full flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-emerald-800 dark:text-emerald-200">
                    Bienvenue sur MindPlan !
                  </h3>
                  <p className="text-emerald-700 dark:text-emerald-300">
                    Commencez votre essai gratuit de 7 jours pour découvrir toutes les fonctionnalités Premium.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Section principale - Application Gratuite */}
        <div className="mb-8">
          <Card className="p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                MindPlan
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Gestion complète de vos finances personnelles
              </p>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">
                  Fonctionnalités incluses :
                </h4>
                <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                  <li>• Transactions illimitées</li>
                  <li>• Analytics avancées</li>
                  <li>• Budgets intelligents</li>
                  <li>• Export de données</li>
                  <li>• Toutes les fonctionnalités premium</li>
                </ul>
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
                    <Moon className="w-4 h-4 mr-2" />
                    Basculer
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
                      <p className="font-medium text-gray-900 dark:text-gray-100">Informations du compte</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {user?.email || 'Non connecté'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {user?.email || 'Non connecté'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <div className="flex items-center space-x-3">
                    <LogOut className="w-5 h-5 text-red-600 dark:text-red-400" />
                    <div>
                      <p className="font-medium text-red-800 dark:text-red-200">Déconnexion</p>
                      <p className="text-sm text-red-700 dark:text-red-300">Se déconnecter de votre compte</p>
                    </div>
                  </div>
                  <Button
                    onClick={handleSignOut}
                    variant="outline"
                    size="sm"
                    className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
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
