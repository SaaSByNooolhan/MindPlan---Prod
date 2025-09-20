import React, { useState, useEffect } from 'react'
import { Card } from '../ui/Card'
import { PremiumGuard } from '../ui/PremiumGuard'
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
  Filter,
  Lock
} from 'lucide-react'
import { supabase, Transaction } from '../../lib/supabase'
import { useAuthContext } from '../../contexts/AuthContext'
import { format, startOfMonth, endOfMonth, subMonths, eachMonthOfInterval, parseISO, startOfYear, endOfYear } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useSubscription } from '../../hooks/useSubscription'
import { LineChart } from './LineChart'
import { PieChart as CustomPieChart } from './PieChart'
import { BasicCharts } from './BasicCharts'

export const Analytics: React.FC = () => {
  const { user } = useAuthContext()
  const { isPremium } = useSubscription()
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
      
      // Calculer la période
      const endDate = endOfMonth(new Date())
      const startDate = startOfMonth(subMonths(new Date(), selectedPeriod === '3m' ? 3 : selectedPeriod === '6m' ? 6 : 12))

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])
        .order('date', { ascending: false })

      if (error) {
        console.error('Error loading transactions:', error)
      } else {
        setTransactions(data || [])
      }
    } catch (error) {
      console.error('Error in loadTransactions:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calculer les statistiques
  const getAnalytics = () => {
    const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
    const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
    const netBalance = income - expenses

    // Répartition par catégorie
    const categoryBreakdown = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount
        return acc
      }, {} as Record<string, number>)

    // Top catégories
    const topCategories = Object.entries(categoryBreakdown)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)

    // Tendances mensuelles
    const monthlyData = eachMonthOfInterval({
      start: startOfMonth(subMonths(new Date(), selectedPeriod === '3m' ? 3 : selectedPeriod === '6m' ? 6 : 12)),
      end: endOfMonth(new Date())
    }).map(month => {
      const monthStart = startOfMonth(month)
      const monthEnd = endOfMonth(month)
      
      const monthTransactions = transactions.filter(t => {
        try {
          const transactionDate = parseISO(t.date)
          return transactionDate >= monthStart && transactionDate <= monthEnd
        } catch (error) {
          console.error('Error parsing date:', t.date, error)
          return false
        }
      })

      const monthIncome = monthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
      const monthExpenses = monthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)

      return {
        month: format(month, 'MMM yyyy', { locale: fr }),
        income: monthIncome,
        expenses: monthExpenses,
        balance: monthIncome - monthExpenses
      }
    })

    return {
      income,
      expenses,
      netBalance,
      topCategories,
      monthlyData,
      totalTransactions: transactions.length
    }
  }

  const analytics = getAnalytics()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  const getPercentageChange = (current: number, previous: number) => {
    if (previous === 0) return 0
    return ((current - previous) / previous) * 100
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Analytics Financières
            </h1>
            <div className="flex items-center space-x-2">
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Analyse détaillée sur
              </p>
              <span className="px-2 py-1 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 rounded-full font-medium">
                {selectedPeriod === '3m' ? '3 derniers mois' : selectedPeriod === '6m' ? '6 derniers mois' : '12 derniers mois'}
              </span>
            </div>
          </div>
          
          
          {/* Sélecteur de période */}
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            {[
              { value: '3m', label: '3 mois' },
              { value: '6m', label: '6 mois' },
              { value: '12m', label: '12 mois' }
            ].map((period) => (
              <button
                key={period.value}
                onClick={() => setSelectedPeriod(period.value as any)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  selectedPeriod === period.value
                    ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                {period.label}
              </button>
            ))}
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
        ) : isPremium() ? (
          <PremiumGuard 
            featureName="Analytics Financières Avancées"
            description="Analysez vos finances avec des graphiques avancés, des tendances détaillées et des insights personnalisés."
          >
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
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${analytics.netBalance >= 0 ? 'bg-emerald-100 dark:bg-emerald-900/20' : 'bg-red-100 dark:bg-red-900/20'}`}>
                      <Wallet className={`w-6 h-6 ${analytics.netBalance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`} />
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Taux d'Épargne</p>
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {analytics.income > 0 ? Math.round((analytics.netBalance / analytics.income) * 100) : 0}%
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Sur {selectedPeriod}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                      <PiggyBank className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                </Card>
              </div>

              {/* Statistiques mensuelles (de BasicStats) */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
                  Aperçu du mois en cours
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {(() => {
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
                    const budgetUsed = (monthlyExpenses / monthlyBudget) * 100

                    return (
                      <>
                        <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                          <TrendingUp className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto mb-2" />
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Revenus du mois</p>
                          <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                            +{formatCurrency(monthlyIncome)}
                          </p>
                        </div>

                        <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                          <TrendingDown className="w-8 h-8 text-red-600 dark:text-red-400 mx-auto mb-2" />
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Dépenses du mois</p>
                          <p className="text-xl font-bold text-red-600 dark:text-red-400">
                            -{formatCurrency(monthlyExpenses)}
                          </p>
                        </div>

                        <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <DollarSign className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Solde du mois</p>
                          <p className={`text-xl font-bold ${monthlyBalance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                            {monthlyBalance >= 0 ? '+' : ''}{formatCurrency(monthlyBalance)}
                          </p>
                        </div>

                        <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                          <PieChart className="w-8 h-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Budget utilisé</p>
                          <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                            {budgetUsed.toFixed(0)}%
                          </p>
                        </div>
                      </>
                    )
                  })()}
                </div>
              </Card>

              {/* Graphique des tendances mensuelles */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
                  Tendances Mensuelles
                </h2>
                <div className="space-y-4">
                  {analytics.monthlyData.map((month, index) => {
                    const maxAmount = Math.max(...analytics.monthlyData.map(m => Math.max(m.income, m.expenses)))
                    const incomeWidth = (month.income / maxAmount) * 100
                    const expensesWidth = (month.expenses / maxAmount) * 100
                    
                    return (
                      <div key={month.month} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {month.month}
                          </span>
                          <span className={`text-sm font-semibold ${month.balance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                            {formatCurrency(month.balance)}
                          </span>
                        </div>
                        
                        <div className="space-y-1">
                          {/* Revenus */}
                          <div className="flex items-center space-x-2">
                            <div className="w-16 text-xs text-emerald-600 dark:text-emerald-400">Revenus</div>
                            <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-3 relative">
                              <div 
                                className="bg-emerald-500 h-3 rounded-full"
                                style={{ width: `${incomeWidth}%` }}
                              ></div>
                            </div>
                            <div className="w-20 text-xs text-right text-emerald-600 dark:text-emerald-400">
                              {formatCurrency(month.income)}
                            </div>
                          </div>
                          
                          {/* Dépenses */}
                          <div className="flex items-center space-x-2">
                            <div className="w-16 text-xs text-red-600 dark:text-red-400">Dépenses</div>
                            <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-3 relative">
                              <div 
                                className="bg-red-500 h-3 rounded-full"
                                style={{ width: `${expensesWidth}%` }}
                              ></div>
                            </div>
                            <div className="w-20 text-xs text-right text-red-600 dark:text-red-400">
                              {formatCurrency(month.expenses)}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </Card>

              {/* Répartition par catégorie */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
                    Top Catégories de Dépenses
                  </h2>
                  <div className="space-y-4">
                    {analytics.topCategories.map(([category, amount], index) => {
                      const percentage = (amount / analytics.expenses) * 100
                      const colors = [
                        'bg-blue-500',
                        'bg-emerald-500', 
                        'bg-yellow-500',
                        'bg-purple-500',
                        'bg-red-500'
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

                <Card className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
                    Insights & Recommandations
                  </h2>
                  <div className="space-y-4">
                    {analytics.netBalance >= 0 ? (
                      <div className="flex items-start space-x-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                        <ArrowUpRight className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                        <div>
                          <h3 className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
                            Excellente gestion !
                          </h3>
                          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                            Votre solde est positif. Continuez à maintenir cette discipline financière.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start space-x-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                        <ArrowDownRight className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                        <div>
                          <h3 className="text-sm font-semibold text-red-800 dark:text-red-200">
                            Attention aux dépenses
                          </h3>
                          <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                            Votre solde est négatif. Considérez réduire vos dépenses ou augmenter vos revenus.
                          </p>
                        </div>
                      </div>
                    )}

                    {analytics.topCategories.length > 0 && (
                      <div className="flex items-start space-x-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <Target className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                        <div>
                          <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-200">
                            Catégorie principale
                          </h3>
                          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                            {analytics.topCategories[0][0]} représente {((analytics.topCategories[0][1] / analytics.expenses) * 100).toFixed(1)}% de vos dépenses.
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-start space-x-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                      <AlertTriangle className="w-5 h-5 text-gray-600 dark:text-gray-400 mt-0.5" />
                      <div>
                        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                          Conseil d'épargne
                        </h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          Essayez de maintenir un taux d'épargne d'au moins 20% de vos revenus.
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Graphiques avancés (d'AdvancedStats) */}
              {!loading && isPremium() ? (
                <Card className="p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                        Graphiques Avancés
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Visualisations détaillées de vos finances
                      </p>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {/* Type de graphique */}
                      <div className="flex items-center space-x-2">
                        <Filter className="w-4 h-4 text-gray-500" />
                        <select
                          value={selectedChart}
                          onChange={(e) => setSelectedChart(e.target.value as any)}
                          className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="pie">Camembert</option>
                          <option value="line">Graphique en ligne</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Graphiques Chart.js */}
                  <div className="w-full">
                    {selectedChart === 'pie' ? (
                      <CustomPieChart
                        data={{
                          labels: analytics.topCategories.map(([category]) => category),
                          datasets: [{
                            data: analytics.topCategories.map(([, amount]) => amount),
                            backgroundColor: [
                              'rgba(59, 130, 246, 0.8)',   // blue-500
                              'rgba(16, 185, 129, 0.8)',   // emerald-500
                              'rgba(245, 158, 11, 0.8)',   // yellow-500
                              'rgba(147, 51, 234, 0.8)',   // purple-500
                              'rgba(239, 68, 68, 0.8)',    // red-500
                              'rgba(34, 197, 94, 0.8)',    // green-500
                              'rgba(168, 85, 247, 0.8)',   // violet-500
                              'rgba(251, 146, 60, 0.8)'    // orange-500
                            ],
                            borderColor: [
                              'rgba(59, 130, 246, 1)',
                              'rgba(16, 185, 129, 1)',
                              'rgba(245, 158, 11, 1)',
                              'rgba(147, 51, 234, 1)',
                              'rgba(239, 68, 68, 1)',
                              'rgba(34, 197, 94, 1)',
                              'rgba(168, 85, 247, 1)',
                              'rgba(251, 146, 60, 1)'
                            ],
                            borderWidth: 2
                          }]
                        }}
                        title="Répartition des dépenses par catégorie"
                        height={400}
                      />
                    ) : (
                      <LineChart
                        data={{
                          labels: analytics.monthlyData.map(month => month.month),
                          datasets: [
                            {
                              label: 'Revenus',
                              data: analytics.monthlyData.map(month => month.income),
                              borderColor: 'rgba(16, 185, 129, 1)',
                              backgroundColor: 'rgba(16, 185, 129, 0.1)',
                              fill: true,
                              tension: 0.4
                            },
                            {
                              label: 'Dépenses',
                              data: analytics.monthlyData.map(month => month.expenses),
                              borderColor: 'rgba(239, 68, 68, 1)',
                              backgroundColor: 'rgba(239, 68, 68, 0.1)',
                              fill: true,
                              tension: 0.4
                            },
                            {
                              label: 'Solde Net',
                              data: analytics.monthlyData.map(month => month.balance),
                              borderColor: 'rgba(59, 130, 246, 1)',
                              backgroundColor: 'rgba(59, 130, 246, 0.1)',
                              fill: false,
                              tension: 0.4
                            }
                          ]
                        }}
                        title="Évolution des revenus, dépenses et solde"
                        height={400}
                      />
                    )}
                  </div>
                </Card>
              ) : (
                <Card className="p-6">
                  <div className="text-center py-12">
                    <div className="flex justify-center mb-4">
                      <div className="p-4 bg-gradient-to-r from-blue-100 to-emerald-100 dark:from-blue-900/20 dark:to-emerald-900/20 rounded-full">
                        <Lock className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      Graphiques Avancés
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Accédez à des graphiques interactifs et des analyses détaillées
                    </p>
                    <div className="bg-gradient-to-r from-blue-50 to-emerald-50 dark:from-blue-900/20 dark:to-emerald-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                      <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                        🔒 Fonctionnalité Premium
                      </p>
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                        Passez Premium pour débloquer les graphiques avancés
                      </p>
                    </div>
                  </div>
                </Card>
              )}

              {/* Graphique de tendances quotidiennes */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
                  Tendances Quotidiennes
                </h2>
                <LineChart
                  data={{
                    labels: (() => {
                      // Générer les 30 derniers jours
                      const days = []
                      for (let i = 29; i >= 0; i--) {
                        const date = new Date()
                        date.setDate(date.getDate() - i)
                        days.push(format(date, 'dd/MM', { locale: fr }))
                      }
                      return days
                    })(),
                    datasets: [
                      {
                        label: 'Revenus quotidiens',
                        data: (() => {
                          const dailyIncome = new Array(30).fill(0)
                          transactions.filter(t => t.type === 'income').forEach(t => {
                            const transactionDate = new Date(t.date)
                            const today = new Date()
                            const daysDiff = Math.floor((today.getTime() - transactionDate.getTime()) / (1000 * 60 * 60 * 24))
                            if (daysDiff >= 0 && daysDiff < 30) {
                              dailyIncome[29 - daysDiff] += t.amount
                            }
                          })
                          return dailyIncome
                        })(),
                        borderColor: 'rgba(16, 185, 129, 1)',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        fill: true,
                        tension: 0.4
                      },
                      {
                        label: 'Dépenses quotidiennes',
                        data: (() => {
                          const dailyExpenses = new Array(30).fill(0)
                          transactions.filter(t => t.type === 'expense').forEach(t => {
                            const transactionDate = new Date(t.date)
                            const today = new Date()
                            const daysDiff = Math.floor((today.getTime() - transactionDate.getTime()) / (1000 * 60 * 60 * 24))
                            if (daysDiff >= 0 && daysDiff < 30) {
                              dailyExpenses[29 - daysDiff] += t.amount
                            }
                          })
                          return dailyExpenses
                        })(),
                        borderColor: 'rgba(239, 68, 68, 1)',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        fill: true,
                        tension: 0.4
                      }
                    ]
                  }}
                  title="Évolution quotidienne des revenus et dépenses (30 derniers jours)"
                  height={300}
                />
              </Card>
            </div>
          </PremiumGuard>
        ) : (
          // Version freemium - graphiques simples
          <BasicCharts transactions={transactions} />
        )}
      </div>
    </div>
  )
}