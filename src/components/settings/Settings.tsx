import React from 'react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { 
  User, 
  Sun,
  Moon,
  LogOut,
  Mail
} from 'lucide-react'
import { useAuthContext } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import { useAuth } from '../../hooks/useAuth'
import { SubscriptionManager } from '../finance/SubscriptionManager'

export const Settings: React.FC = () => {
  const { user } = useAuthContext()
  const { toggleTheme } = useTheme()
  const { signOut } = useAuth()

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

        {/* Section principale - Abonnement */}
        <div className="mb-8">
          <SubscriptionManager />
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
