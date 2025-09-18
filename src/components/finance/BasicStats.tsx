import React from 'react'
import { Card } from '../ui/Card'
import { TrendingUp, TrendingDown, DollarSign, Calendar, PieChart } from 'lucide-react'
import { Transaction } from '../../lib/supabase'
import { format, startOfMonth, endOfMonth, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
interface BasicStatsProps {
  transactions: Transaction[]
  monthlyBudget: number
}

export const BasicStats: React.FC<BasicStatsProps> = ({ transactions, monthlyBudget }) => {
  
  // Calculate basic statistics
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

  // Calculate totals (including recurring transactions)
  const totalMonthlyIncome = monthlyIncome
  const totalMonthlyExpenses = monthlyExpenses
  const totalMonthlyBalance = totalMonthlyIncome - totalMonthlyExpenses
  const budgetUsed = (totalMonthlyExpenses / monthlyBudget) * 100

  // Calculate categories from transactions only
  const expenseCategories = monthlyTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount
      return acc
    }, {} as Record<string, number>)

  const incomeCategories = monthlyTransactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount
      return acc
    }, {} as Record<string, number>)

  return (
    <div className="space-y-6">
      {/* Monthly Overview */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Aperçu du mois (avec éléments récurrents)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <TrendingUp className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Revenus totaux</p>
            <p className="text-xl font-bold text-green-600 dark:text-green-400">
              +{totalMonthlyIncome.toFixed(2)}€
            </p>
          </div>

          <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <TrendingDown className="w-8 h-8 text-red-600 dark:text-red-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Dépenses totales</p>
            <p className="text-xl font-bold text-red-600 dark:text-red-400">
              -{totalMonthlyExpenses.toFixed(2)}€
            </p>
          </div>

          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <DollarSign className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Solde total</p>
            <p className={`text-xl font-bold ${totalMonthlyBalance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {totalMonthlyBalance >= 0 ? '+' : ''}{totalMonthlyBalance.toFixed(2)}€
            </p>
          </div>

          <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <PieChart className="w-8 h-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Budget utilisé</p>
            <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
              {budgetUsed.toFixed(0)}%
            </p>
          </div>
        </div>
      </Card>

      {/* Pie Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense Categories Pie Chart */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Répartition des dépenses
          </h3>
          {Object.keys(expenseCategories).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(expenseCategories)
                .sort(([, a], [, b]) => b - a)
                .map(([category, amount], index) => {
                  const percentage = (amount / totalMonthlyExpenses) * 100
                  const colors = [
                    'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 
                    'bg-blue-500', 'bg-indigo-500', 'bg-purple-500', 'bg-pink-500'
                  ]
                  const color = colors[index % colors.length]
                  
                  return (
                    <div key={category} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded-full ${color}`}></div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">{category}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {percentage.toFixed(1)}% du total
                          </p>
                        </div>
                      </div>
                      <p className="font-semibold text-red-600 dark:text-red-400">
                        -{amount.toFixed(2)}€
                      </p>
                    </div>
                  )
                })}
            </div>
          ) : (
            <div className="text-center py-8">
              <TrendingDown className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Aucune dépense ce mois</p>
            </div>
          )}
        </Card>

        {/* Income Categories Pie Chart */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Répartition des revenus
          </h3>
          {Object.keys(incomeCategories).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(incomeCategories)
                .sort(([, a], [, b]) => b - a)
                .map(([category, amount], index) => {
                  const percentage = (amount / totalMonthlyIncome) * 100
                  const colors = [
                    'bg-green-500', 'bg-emerald-500', 'bg-teal-500', 'bg-cyan-500',
                    'bg-blue-500', 'bg-indigo-500', 'bg-purple-500', 'bg-violet-500'
                  ]
                  const color = colors[index % colors.length]
                  
                  return (
                    <div key={category} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded-full ${color}`}></div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">{category}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {percentage.toFixed(1)}% du total
                          </p>
                        </div>
                      </div>
                      <p className="font-semibold text-green-600 dark:text-green-400">
                        +{amount.toFixed(2)}€
                      </p>
                    </div>
                  )
                })}
            </div>
          ) : (
            <div className="text-center py-8">
              <TrendingUp className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Aucun revenu ce mois</p>
            </div>
          )}
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Transactions récentes
        </h3>
        <div className="space-y-3">
          {monthlyTransactions.slice(0, 5).map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${transaction.type === 'income' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                  {transaction.type === 'income' ? (
                    <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{transaction.title}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{transaction.category}</p>
                  {transaction.title.includes('(Mensuel)') || transaction.title.includes('(Hebdomadaire)') || 
                   transaction.title.includes('(Annuel)') || transaction.title.includes('(Quotidien)') ? (
                    <p className="text-xs text-blue-600 dark:text-blue-400">🔄 Élément récurrent</p>
                  ) : null}
                </div>
              </div>
              <div className="text-right">
                <p className={`font-semibold ${transaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {transaction.type === 'income' ? '+' : '-'}{transaction.amount.toFixed(2)}€
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {format(parseISO(transaction.date), 'dd/MM', { locale: fr })}
                </p>
              </div>
            </div>
          ))}
          
          {monthlyTransactions.length === 0 && (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Aucune transaction ce mois</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
