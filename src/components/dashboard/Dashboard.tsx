import React, { useState, useEffect } from 'react'
import { DollarSign, TrendingUp, TrendingDown, Wallet, Target, Calendar } from 'lucide-react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { supabase, Transaction } from '../../lib/supabase'
import { useAuthContext } from '../../contexts/AuthContext'
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns'
import { fr } from 'date-fns/locale'
import { FinanceChart } from './FinanceChart'

interface DashboardStats {
  totalIncome: number
  totalExpenses: number
  netBalance: number
  monthlyBudget: number
  budgetUsed: number
  transactionsCount: number
  topCategory: string
}

interface DashboardProps {
  onNavigate: (section: string, params?: any) => void
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { user } = useAuthContext()
  const [stats, setStats] = useState<DashboardStats>({
    totalIncome: 0,
    totalExpenses: 0,
    netBalance: 0,
    monthlyBudget: 1000,
    budgetUsed: 0,
    transactionsCount: 0,
    topCategory: 'Aucune'
  })
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadDashboardData()
    }
  }, [user])

  const loadDashboardData = async () => {
    if (!user) return

    try {
      setLoading(true)
      
      // Récupérer les transactions du mois actuel
      const now = new Date()
      const startOfCurrentMonth = startOfMonth(now)
      const endOfCurrentMonth = endOfMonth(now)

      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', startOfCurrentMonth.toISOString())
        .lte('date', endOfCurrentMonth.toISOString())
        .order('date', { ascending: false })

      if (error) {
        console.error('Error loading transactions:', error)
        return
      }

      // Calculer les statistiques
      const totalIncome = transactions
        ?.filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0) || 0

      const totalExpenses = transactions
        ?.filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0) || 0

      const netBalance = totalIncome - totalExpenses

      // Trouver la catégorie la plus dépensée
      const categoryExpenses = transactions
        ?.filter(t => t.type === 'expense')
        .reduce((acc, t) => {
          acc[t.category] = (acc[t.category] || 0) + t.amount
          return acc
        }, {} as Record<string, number>) || {}

      const topCategory = Object.entries(categoryExpenses)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Aucune'

      setStats({
        totalIncome,
        totalExpenses,
        netBalance,
        monthlyBudget: 1000,
        budgetUsed: totalExpenses,
        transactionsCount: transactions?.length || 0,
        topCategory
      })

      // Récupérer les 5 transactions les plus récentes
      const { data: recentData } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(5)

      setRecentTransactions(recentData || [])
    } catch (error) {
      console.error('Error loading dashboard data:', error)
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

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
              Tableau de Bord
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Vue d'ensemble de vos finances
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {format(new Date(), 'dd MMMM yyyy', { locale: fr })}
              </p>
            </div>
            
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Revenus</p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(stats.totalIncome)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Ce mois
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
                  {formatCurrency(stats.totalExpenses)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Ce mois
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Solde</p>
                <p className={`text-2xl font-bold ${stats.netBalance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                  {formatCurrency(stats.netBalance)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Net
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Transactions</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {stats.transactionsCount}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Ce mois
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </Card>
        </div>

        {/* Chart and Recent Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Finance Chart */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Évolution Financière
            </h2>
            <FinanceChart />
          </Card>

          {/* Recent Transactions */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Transactions Récentes
              </h2>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onNavigate('finance')}
              >
                Voir tout
              </Button>
            </div>
            <div className="space-y-3">
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                  </div>
                ))
              ) : recentTransactions.length > 0 ? (
                recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${transaction.type === 'income' ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                        {transaction.type === 'income' ? (
                          <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {transaction.title}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {transaction.category}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${transaction.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {format(parseISO(transaction.date), 'dd/MM', { locale: fr })}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <DollarSign className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">Aucune transaction</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
              Actions Rapides
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                onClick={() => onNavigate('finance')}
                className="h-16 flex flex-col items-center justify-center space-y-2"
              >
                <DollarSign className="w-6 h-6" />
                <span>Ajouter Transaction</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => onNavigate('analytics')}
                className="h-16 flex flex-col items-center justify-center space-y-2"
              >
                <TrendingUp className="w-6 h-6" />
                <span>Voir Analytics</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => onNavigate('budgets')}
                className="h-16 flex flex-col items-center justify-center space-y-2"
              >
                <Target className="w-6 h-6" />
                <span>Gérer Budget</span>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}