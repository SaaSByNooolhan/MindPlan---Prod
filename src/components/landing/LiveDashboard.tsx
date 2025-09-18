import React from 'react'
import { Card } from '../ui/Card'
import { 
  LayoutDashboard, 
  CheckSquare, 
  Calendar, 
  DollarSign, 
  Timer,
  TrendingUp,
  Clock,
  Wallet,
  AlertTriangle,
  Crown
} from 'lucide-react'

export const LiveDashboard: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-700 dark:to-gray-800 p-4 sm:p-6">
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Aperçu en temps réel du Dashboard
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Voici exactement ce que vous verrez dans votre compte
          </p>
        </div>
        
        {/* Live Dashboard Container */}
        <div className="bg-white dark:bg-black rounded-xl shadow-lg overflow-hidden" style={{ height: '600px' }}>
          <div className="h-full overflow-y-auto p-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  Bonjour !
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Voici un résumé de votre semaine
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
                  14:32
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Lundi 20 janvier 2025
                </div>
              </div>
            </div>

            {/* Current Balance Card */}
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                    <Wallet className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Solde Actuel
                    </h3>
                    <p className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400">
                      1,247.50€
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    12 transactions
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    Basé sur toutes vos transactions
                  </p>
                </div>
              </div>
            </Card>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
              <Card className="hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tâches</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                      8/12
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      67% complétées
                    </p>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-full">
                    <CheckSquare className="w-6 h-6 text-black dark:text-white" />
                  </div>
                </div>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Budget semaine</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                      156€
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      62% utilisé
                    </p>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-full">
                    <DollarSign className="w-6 h-6 text-black dark:text-white" />
                  </div>
                </div>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pomodoros</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                      6
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Aujourd'hui
                    </p>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-full">
                    <Clock className="w-6 h-6 text-black dark:text-white" />
                  </div>
                </div>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Événements</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                      4
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Cette semaine
                    </p>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-full">
                    <Calendar className="w-6 h-6 text-black dark:text-white" />
                  </div>
                </div>
              </Card>
            </div>

            {/* Premium Upgrade Banner */}
            <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <Crown className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Débloquez les statistiques avancées
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Passez à Premium pour des analyses financières détaillées
                    </p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg text-sm font-medium transition-colors">
                  Voir les statistiques
                </button>
              </div>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <Card className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Actions rapides</h3>
                <div className="space-y-3">
                  <button className="w-full text-left p-3 rounded-lg bg-white dark:bg-gray-700 shadow-sm hover:shadow-md transition-shadow">
                    <div className="font-medium text-gray-900 dark:text-gray-100">Ajouter une tâche</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Créer une nouvelle tâche</div>
                  </button>
                  <button className="w-full text-left p-3 rounded-lg bg-white dark:bg-gray-700 shadow-sm hover:shadow-md transition-shadow">
                    <div className="font-medium text-gray-900 dark:text-gray-100">Voir mes finances</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Accéder au suivi financier</div>
                  </button>
                  <button className="w-full text-left p-3 rounded-lg bg-white dark:bg-gray-700 shadow-sm hover:shadow-md transition-shadow">
                    <div className="font-medium text-gray-900 dark:text-gray-100">Nouvelle dépense</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Enregistrer une dépense</div>
                  </button>
                  <button className="w-full text-left p-3 rounded-lg bg-white dark:bg-gray-700 shadow-sm hover:shadow-md transition-shadow">
                    <div className="font-medium text-gray-900 dark:text-gray-100">Session Pomodoro</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Démarrer un cycle de travail</div>
                  </button>
                </div>
              </Card>

              <Card className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Prochains événements</h3>
                <div className="space-y-3">
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                    <p className="text-gray-600 dark:text-gray-400">Aucun événement planifié</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">Ajoutez un événement à votre agenda</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
        
        {/* Demo Notice */}
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200 text-center">
            💡 <strong>Dashboard réel</strong> - Voici exactement l'interface que vous utiliserez
          </p>
        </div>
      </div>
    </div>
  )
}
