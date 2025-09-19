import React from 'react'
import { Card } from '../ui/Card'
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Target,
  PieChart,
  BarChart3
} from 'lucide-react'

export const LiveDashboard: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="bg-gradient-to-br from-blue-50 to-emerald-50 dark:from-gray-700 dark:to-gray-800 p-4 sm:p-6">
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Aperçu en temps réel du Dashboard Financier
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Voici exactement ce que vous verrez dans votre compte MindPlan
          </p>
        </div>
        
        {/* Live Dashboard Container */}
        <div className="bg-white dark:bg-black rounded-xl shadow-lg overflow-hidden" style={{ height: '600px' }}>
          {/* Mock Dashboard Header */}
          <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">MindPlan</h2>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">En direct</span>
              </div>
            </div>
          </div>

          {/* Mock Dashboard Content */}
          <div className="p-4 space-y-4" style={{ height: 'calc(100% - 80px)', overflowY: 'auto' }}>
            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-lg border border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Revenus</p>
                    <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300">2,450€</p>
                  </div>
                  <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
              
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-red-600 dark:text-red-400 font-medium">Dépenses</p>
                    <p className="text-lg font-bold text-red-700 dark:text-red-300">1,890€</p>
                  </div>
                  <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
              </div>
            </div>

            {/* Balance Card */}
            <div className="bg-gradient-to-r from-blue-50 to-emerald-50 dark:from-blue-900/20 dark:to-emerald-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Solde Net</p>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">+560€</p>
                </div>
                <Wallet className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>

            {/* Budget Progress */}
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Budget Mensuel</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">63% utilisé</p>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-gradient-to-r from-blue-600 to-emerald-600 h-2 rounded-full" style={{ width: '63%' }}></div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">1,890€ / 3,000€</p>
            </div>

            {/* Recent Transactions */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Transactions Récentes</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                      <TrendingDown className="w-3 h-3 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Courses</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Aujourd'hui</p>
                    </div>
                  </div>
                  <p className="text-xs font-semibold text-red-600 dark:text-red-400">-45€</p>
                </div>
                
                <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-emerald-100 dark:bg-emerald-900/20 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Salaire</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Hier</p>
                    </div>
                  </div>
                  <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">+2,450€</p>
                </div>
                
                <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                      <TrendingDown className="w-3 h-3 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Loyer</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Il y a 2 jours</p>
                    </div>
                  </div>
                  <p className="text-xs font-semibold text-red-600 dark:text-red-400">-800€</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-2">
              <button className="p-3 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors">
                <DollarSign className="w-4 h-4 mx-auto mb-1" />
                Ajouter
              </button>
              <button className="p-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                <BarChart3 className="w-4 h-4 mx-auto mb-1" />
                Analytics
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}