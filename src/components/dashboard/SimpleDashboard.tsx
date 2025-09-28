import React, { useState, useEffect } from 'react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Target, 
  Calendar,
  Plus,
  ArrowRight
} from 'lucide-react'
import { supabase, Transaction } from '../../lib/supabase'
import { useAuthContext } from '../../contexts/AuthContext'
import { useSubscription } from '../../hooks/useSubscription'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import { fr } from 'date-fns/locale'

interface DashboardStats {
  totalIncome: number
  totalExpenses: number
  netBalance: number
  transactionsCount: number
  topCategory: string
}

interface SimpleDashboardProps {
  onNavigate: (section: string, params?: any) => void
}

export const SimpleDashboard: React.FC<SimpleDashboardProps> = ({ onNavigate }) => {
  const { user } = useAuthContext()
  const { isPremium, getTrialDaysLeft, subscription } = useSubscription()
  const [stats, setStats] = useState<DashboardStats>({
    totalIncome: 0,
    totalExpenses: 0,
    netBalance: 0,
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
        transactionsCount: transactions?.length || 0,
        topCategory
      })

      // Charger les 3 dernières transactions
      const { data: recent, error: recentError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(3)

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

  const quickActions = [
    {
      title: 'Ajouter une transaction',
      description: 'Enregistrer un revenu ou une dépense',
      icon: Plus,
      action: () => onNavigate('finance', { section: 'transactions' }),
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      title: 'Voir les finances',
      description: 'Gérer toutes vos finances',
      icon: DollarSign,
      action: () => onNavigate('finance', { section: 'overview' }),
      color: 'bg-green-600 hover:bg-green-700'
    }
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Bonjour {user?.email?.split('@')[0]} 👋
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {format(new Date(), 'EEEE d MMMM yyyy', { locale: fr })}
          </p>
        </div>
        
        
        {/* Statut Premium/Beta */}
        {isPremium() && (
          <div className="flex items-center space-x-2 px-3 py-1 bg-blue-100 dark:bg-blue-900 rounded-full">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              {subscription?.status === 'beta' ? 'BETA' : 'PREMIUM'}
            </span>
          </div>
        )}
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Solde du mois</p>
              <p className={`text-2xl font-bold ${stats.netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(stats.netBalance)}
              </p>
            </div>
            <Wallet className="w-8 h-8 text-gray-400" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Revenus</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(stats.totalIncome)}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Dépenses</p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(stats.totalExpenses)}
              </p>
            </div>
            <TrendingDown className="w-8 h-8 text-red-500" />
          </div>
        </Card>
      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {quickActions.map((action, index) => {
          const Icon = action.icon
          return (
            <Card 
              key={index} 
              className="p-6 hover:shadow-lg transition-shadow cursor-pointer" 
              onClick={action.action}
            >
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-lg ${action.color} text-white`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {action.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {action.description}
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </div>
            </Card>
          )
        })}
      </div>

      {/* Transactions récentes */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Transactions récentes
          </h3>
          <Button
            onClick={() => onNavigate('finance', { section: 'transactions' })}
            variant="outline"
            size="sm"
          >
            Voir tout
          </Button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : recentTransactions.length > 0 ? (
          <div className="space-y-3">
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {transaction.title}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {transaction.category} • {format(new Date(transaction.date), 'd MMM', { locale: fr })}
                  </p>
                </div>
                <p className={`font-semibold ${
                  transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <DollarSign className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Aucune transaction ce mois-ci
            </p>
            <Button
              onClick={() => onNavigate('finance', { section: 'transactions' })}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Ajouter une transaction
            </Button>
          </div>
        )}
      </Card>
    </div>
  )
}
