import React from 'react'
import { Card } from '../ui/Card'
import { Transaction } from '../../lib/supabase'
import { format, startOfMonth, endOfMonth, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'

interface BasicChartsProps {
  transactions: Transaction[]
}

export const BasicCharts: React.FC<BasicChartsProps> = ({ transactions }) => {
  // Calculer les statistiques de base
  const getBasicStats = () => {
    const currentMonth = new Date()
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)

    const monthlyTransactions = transactions.filter(t => {
      try {
        const transactionDate = parseISO(t.date)
        return transactionDate >= monthStart && transactionDate <= monthEnd
      } catch (error) {
        return false
      }
    })

    const monthlyIncome = monthlyTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)

    const monthlyExpenses = monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)

    const monthlyBalance = monthlyIncome - monthlyExpenses

    // Top 3 catégories de dépenses
    const categoryBreakdown = monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount
        return acc
      }, {} as Record<string, number>)

    const topCategories = Object.entries(categoryBreakdown)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)

    return {
      monthlyIncome,
      monthlyExpenses,
      monthlyBalance,
      topCategories,
      totalTransactions: monthlyTransactions.length
    }
  }

  const stats = getBasicStats()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* Statistiques du mois */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
          Aperçu du mois de {format(new Date(), 'MMMM yyyy', { locale: fr })}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Revenus</p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              +{formatCurrency(stats.monthlyIncome)}
            </p>
          </div>

          <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Dépenses</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              -{formatCurrency(stats.monthlyExpenses)}
            </p>
          </div>

          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Solde</p>
            <p className={`text-2xl font-bold ${stats.monthlyBalance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
              {stats.monthlyBalance >= 0 ? '+' : ''}{formatCurrency(stats.monthlyBalance)}
            </p>
          </div>
        </div>
      </Card>

      {/* Top catégories de dépenses */}
      {stats.topCategories.length > 0 && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
            Top 3 Catégories de Dépenses
          </h2>
          <div className="space-y-4">
            {stats.topCategories.map(([category, amount], index) => {
              const percentage = (amount / stats.monthlyExpenses) * 100
              const colors = [
                'bg-blue-500',
                'bg-emerald-500', 
                'bg-yellow-500'
              ]
              
              return (
                <div key={category} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${colors[index] || 'bg-gray-500'}`}></div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {category}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {formatCurrency(amount)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {percentage.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${colors[index] || 'bg-gray-500'}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* Graphique simple en barres */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
          Répartition des Dépenses
        </h2>
        <div className="space-y-3">
          {stats.topCategories.map(([category, amount], index) => {
            const maxAmount = Math.max(...stats.topCategories.map(([, amt]) => amt))
            const width = (amount / maxAmount) * 100
            const colors = [
              'bg-blue-500',
              'bg-emerald-500', 
              'bg-yellow-500'
            ]
            
            return (
              <div key={category} className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {category}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {formatCurrency(amount)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                  <div 
                    className={`h-4 rounded-full ${colors[index] || 'bg-gray-500'}`}
                    style={{ width: `${width}%` }}
                  ></div>
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Message d'information freemium */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-emerald-50 dark:from-blue-900/20 dark:to-emerald-900/20 border border-blue-200 dark:border-blue-800">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">
            Graphiques Simples - Version Gratuite
          </h3>
          <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
            Vous visualisez vos données de base. Passez Premium pour accéder aux graphiques avancés, 
            aux analyses détaillées et aux exports PDF.
          </p>
          <div className="text-xs text-blue-600 dark:text-blue-400">
            Limite actuelle : 10 transactions par mois
          </div>
        </div>
      </Card>
    </div>
  )
}
