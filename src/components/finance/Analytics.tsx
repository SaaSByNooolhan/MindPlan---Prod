import React, { useState, useEffect } from 'react'
import { Card } from '../ui/Card'
import { 
  TrendingUp, 
  PieChart, 
  BarChart3, 
  DollarSign, 
  Calendar,
  Target,
  AlertTriangle,
  TrendingDown,
  Wallet,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
  Filter
} from 'lucide-react'
import { supabase, Transaction } from '../../lib/supabase'
import { useAuthContext } from '../../contexts/AuthContext'
import { format, startOfMonth, endOfMonth, subMonths, eachMonthOfInterval, parseISO, startOfYear, endOfYear } from 'date-fns'
import { fr } from 'date-fns/locale'
import { LineChart } from './LineChart'
import { PieChart as CustomPieChart } from './PieChart'
import { BasicCharts } from './BasicCharts'

export const Analytics: React.FC = () => {
  const { user } = useAuthContext()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState<'3m' | '6m' | '12m'>('6m')
  const [selectedChart, setSelectedChart] = useState<'pie' | 'line'>('pie')
  const [selectedMonthOffset, setSelectedMonthOffset] = useState(0)
  const [monthlyBudget] = useState(1000)

  useEffect(() => {
    if (user) {
      loadTransactions()
    }
  }, [user, selectedPeriod])

  const loadTransactions = async () => {
    if (!user) return

    try {
      setLoading(true)
      
      const now = new Date()
      let startDate: Date
      
      switch (selectedPeriod) {
        case '3m':
          startDate = subMonths(now, 3)
          break
        case '6m':
          startDate = subMonths(now, 6)
          break
        case '12m':
          startDate = subMonths(now, 12)
          break
        default:
          startDate = subMonths(now, 6)
      }

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', startDate.toISOString())
        .lte('date', now.toISOString())
        .order('date', { ascending: false })

      if (error) {
        console.error('Error loading transactions:', error)
      } else {
        setTransactions(data || [])
      }
    } catch (error) {
      console.error('Error loading transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  const calculateAnalytics = () => {
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)

    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)

    const netBalance = income - expenses

    // Calculer les catégories les plus dépensées
    const categoryExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount
        return acc
      }, {} as Record<string, number>)

    const topCategories = Object.entries(categoryExpenses)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)

    return {
      income,
      expenses,
      netBalance,
      totalTransactions: transactions.length,
      topCategories,
      budgetUsed: expenses,
      budgetRemaining: monthlyBudget - expenses
    }
  }

  const analytics = calculateAnalytics()

  const periods = [
    { key: '3m', label: '3 mois' },
    { key: '6m', label: '6 mois' },
    { key: '12m', label: '12 mois' }
  ]

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
              Analytics Financières
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Analysez vos finances avec des graphiques détaillés
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value as any)}
                className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
              >
                {periods.map((period) => (
                  <option key={period.key} value={period.key}>
                    {period.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="space-y-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            {/* Statistiques principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Revenus</p>
                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(analytics.income)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {analytics.totalTransactions} transactions
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/20 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Dépenses</p>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {formatCurrency(analytics.expenses)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {analytics.topCategories.length} catégories
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                    <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Solde Net</p>
                    <p className={`text-2xl font-bold ${analytics.netBalance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                      {formatCurrency(analytics.netBalance)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {analytics.netBalance >= 0 ? 'Positif' : 'Négatif'}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                    <Wallet className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Budget</p>
                    <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                      {formatCurrency(analytics.budgetRemaining)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Restant sur {formatCurrency(monthlyBudget)}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/20 rounded-full flex items-center justify-center">
                    <Target className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                </div>
              </Card>
            </div>

            {/* Graphiques */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
                  Répartition par Catégorie
                </h2>
                {analytics.topCategories.length > 0 ? (
                  <CustomPieChart 
                    data={{
                      labels: analytics.topCategories.map(([category]) => category),
                      datasets: [{
                        data: analytics.topCategories.map(([, amount]) => amount),
                        backgroundColor: [
                          '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
                          '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
                        ],
                        borderColor: [
                          '#2563EB', '#059669', '#D97706', '#DC2626', '#7C3AED',
                          '#0891B2', '#65A30D', '#EA580C', '#DB2777', '#4F46E5'
                        ],
                        borderWidth: 2
                      }]
                    }}
                    title="Dépenses par catégorie"
                    height={300}
                  />
                ) : (
                  <div className="flex items-center justify-center h-[300px]">
                    <div className="text-center text-gray-500 dark:text-gray-400">
                      <PieChart className="w-12 h-12 mx-auto mb-4" />
                      <p>Aucune dépense enregistrée</p>
                    </div>
                  </div>
                )}
              </Card>

              <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
                  Évolution Mensuelle
                </h2>
                <LineChart
                  data={{
                    labels: (() => {
                      const months = eachMonthOfInterval({
                        start: subMonths(new Date(), selectedPeriod === '3m' ? 3 : selectedPeriod === '6m' ? 6 : 12),
                        end: new Date()
                      })
                      return months.map(month => format(month, 'MMM yyyy', { locale: fr }))
                    })(),
                    datasets: [
                      {
                        label: 'Revenus',
                        data: (() => {
                          const months = eachMonthOfInterval({
                            start: subMonths(new Date(), selectedPeriod === '3m' ? 3 : selectedPeriod === '6m' ? 6 : 12),
                            end: new Date()
                          })
                          return months.map(month => {
                            const monthStart = startOfMonth(month)
                            const monthEnd = endOfMonth(month)
                            return transactions
                              .filter(t => t.type === 'income' && 
                                new Date(t.date) >= monthStart && 
                                new Date(t.date) <= monthEnd)
                              .reduce((sum, t) => sum + t.amount, 0)
                          })
                        })(),
                        borderColor: 'rgb(34, 197, 94)',
                        backgroundColor: 'rgba(34, 197, 94, 0.1)',
                        tension: 0.4
                      },
                      {
                        label: 'Dépenses',
                        data: (() => {
                          const months = eachMonthOfInterval({
                            start: subMonths(new Date(), selectedPeriod === '3m' ? 3 : selectedPeriod === '6m' ? 6 : 12),
                            end: new Date()
                          })
                          return months.map(month => {
                            const monthStart = startOfMonth(month)
                            const monthEnd = endOfMonth(month)
                            return transactions
                              .filter(t => t.type === 'expense' && 
                                new Date(t.date) >= monthStart && 
                                new Date(t.date) <= monthEnd)
                              .reduce((sum, t) => sum + t.amount, 0)
                          })
                        })(),
                        borderColor: 'rgb(239, 68, 68)',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        tension: 0.4
                      }
                    ]
                  }}
                  title="Évolution des revenus et dépenses"
                  height={300}
                />
              </Card>
            </div>

            {/* Top Catégories */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
                Top Catégories de Dépenses
              </h2>
              <div className="space-y-4">
                {analytics.topCategories.map(([category, amount], index) => (
                  <div key={category} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                          {index + 1}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">{category}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {((amount / analytics.expenses) * 100).toFixed(1)}% du total
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-red-600 dark:text-red-400">
                        {formatCurrency(amount)}
                      </p>
                    </div>
                  </div>
                ))}
                
                {analytics.topCategories.length === 0 && (
                  <div className="text-center py-8">
                    <PieChart className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">Aucune dépense enregistrée</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}