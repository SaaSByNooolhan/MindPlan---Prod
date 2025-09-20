import React, { useState, useEffect } from 'react'
import { DollarSign, TrendingUp, TrendingDown, Wallet, Target, Calendar } from 'lucide-react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { supabase, Transaction } from '../../lib/supabase'
import { useAuthContext } from '../../contexts/AuthContext'
import { useSubscription } from '../../hooks/useSubscription'
import { PremiumFeature } from '../ui/PremiumGuard'
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
  const { isPremium, getTrialDaysLeft, subscription } = useSubscription()
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
      
      // Charger les transactions du mois actuel
      const startOfCurrentMonth = startOfMonth(new Date())
      const endOfCurrentMonth = endOfMonth(new Date())

      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', startOfCurrentMonth.toISOString().split('T')[0])
        .lte('date', endOfCurrentMonth.toISOString().split('T')[0])
        .order('date', { ascending: false })

      if (error) {
        return
      }

      // Calculer les statistiques
      const income = transactions?.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0) || 0
      const expenses = transactions?.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0) || 0
      const netBalance = income - expenses

      // Trouver la catégorie la plus dépensée
      const categoryExpenses = transactions?.filter(t => t.type === 'expense')
        .reduce((acc, t) => {
          acc[t.category] = (acc[t.category] || 0) + t.amount
          return acc
        }, {} as Record<string, number>) || {}

      const topCategory = Object.keys(categoryExpenses).length > 0 
        ? Object.entries(categoryExpenses).sort(([,a], [,b]) => b - a)[0][0]
        : 'Aucune'

      setStats({
        totalIncome: income,
        totalExpenses: expenses,
        netBalance,
        monthlyBudget: 1000, // Budget par défaut
        budgetUsed: expenses,
        transactionsCount: transactions?.length || 0,
        topCategory
      })

      // Charger les 5 dernières transactions
      const { data: recent, error: recentError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(5)

      if (!recentError) {
        setRecentTransactions(recent || [])
      }

    } catch (error) {
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

  // Pas d'écran de chargement bloquant - affichage immédiat avec skeleton

  return (
    <div className="p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Dashboard Financier
              </h1>
              <div className="flex items-center space-x-2">
                <p className="text-gray-600 dark:text-gray-400">
                  Vue d'ensemble de vos finances
                </p>
                <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full font-medium">
                  {format(new Date(), 'MMMM yyyy', { locale: fr })}
                </span>
              </div>
            </div>
            
            {/* Statut Premium */}
            {!loading && isPremium() && (
              <div className="flex items-center space-x-2">
                {subscription?.status === 'trial' && getTrialDaysLeft() > 0 ? (
                  <div className="bg-gradient-to-r from-blue-50 to-emerald-50 dark:from-blue-900/20 dark:to-emerald-900/20 border border-blue-200 dark:border-blue-800 rounded-lg px-4 py-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                        Essai Premium - {getTrialDaysLeft()} jour{getTrialDaysLeft() > 1 ? 's' : ''} restant{getTrialDaysLeft() > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg px-4 py-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                      <span className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
                        Premium Actif
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Revenus</p>
                {loading ? (
                  <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                ) : (
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(stats.totalIncome)}
                  </p>
                )}
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
                {loading ? (
                  <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                ) : (
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {formatCurrency(stats.totalExpenses)}
                  </p>
                )}
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
                {loading ? (
                  <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                ) : (
                  <p className={`text-2xl font-bold ${stats.netBalance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                    {formatCurrency(stats.netBalance)}
                  </p>
                )}
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                <Wallet className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Budget Utilisé</p>
                {loading ? (
                  <>
                    <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-1"></div>
                    <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  </>
                ) : (
                  <>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {Math.round((stats.budgetUsed / stats.monthlyBudget) * 100)}%
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatCurrency(stats.budgetUsed)} / {formatCurrency(stats.monthlyBudget)}
                    </p>
                  </>
                )}
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chart Section */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Évolution Financière
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onNavigate('finance')}
                >
                  Voir tout
                </Button>
              </div>
              <FinanceChart transactions={recentTransactions} />
            </Card>
          </div>

          {/* Recent Transactions */}
          <div>
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
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
              
              {recentTransactions.length === 0 ? (
                <div className="text-center py-8">
                  <DollarSign className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 mb-4">Aucune transaction</p>
                  <Button
                    onClick={() => onNavigate('finance')}
                    size="sm"
                  >
                    Ajouter une transaction
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          transaction.type === 'income' 
                            ? 'bg-emerald-100 dark:bg-emerald-900/20' 
                            : 'bg-red-100 dark:bg-red-900/20'
                        }`}>
                          {transaction.type === 'income' ? (
                            <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                            {transaction.title}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {transaction.category}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold text-sm ${
                          transaction.type === 'income' 
                            ? 'text-emerald-600 dark:text-emerald-400' 
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {format(new Date(transaction.date), 'dd/MM', { locale: fr })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
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
              <PremiumFeature featureName="Analytics">
                <Button
                  variant="outline"
                  onClick={() => onNavigate('analytics')}
                  className="h-16 flex flex-col items-center justify-center space-y-2"
                >
                  <TrendingUp className="w-6 h-6" />
                  <span>Voir Analytics</span>
                </Button>
              </PremiumFeature>
              <PremiumFeature featureName="Budgets">
                <Button
                  variant="outline"
                  onClick={() => onNavigate('budgets')}
                  className="h-16 flex flex-col items-center justify-center space-y-2"
                >
                  <Target className="w-6 h-6" />
                  <span>Gérer Budget</span>
                </Button>
              </PremiumFeature>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
