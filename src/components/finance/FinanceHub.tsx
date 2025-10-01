import React, { useState } from 'react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { 
  DollarSign, 
  TrendingUp, 
  PieChart, 
  BarChart3, 
  CreditCard, 
  Target, 
  Download,
  Plus,
  Receipt
} from 'lucide-react'
import { useAuthContext } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { FinanceTracker } from './FinanceTracker'
import { Analytics } from './Analytics'
import { Budgets } from './Budgets'
import { Reports } from './Reports'
import { Accounts } from './Accounts'
import { FinancialGoals } from './FinancialGoals'
import { ExportData } from './ExportData'

type FinanceSection = 'overview' | 'transactions' | 'analytics' | 'budgets' | 'accounts' | 'goals' | 'reports' | 'export'

interface FinanceHubProps {
  initialSection?: FinanceSection
}

export const FinanceHub: React.FC<FinanceHubProps> = ({ initialSection = 'overview' }) => {
  const [activeSection, setActiveSection] = useState<FinanceSection>(initialSection)

  // Mettre à jour la section active si initialSection change
  React.useEffect(() => {
    setActiveSection(initialSection)
  }, [initialSection])

  const financeSections = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: DollarSign, description: 'Tableau de bord financier' },
    { id: 'transactions', label: 'Transactions', icon: Receipt, description: 'Gérer vos revenus et dépenses' },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp, description: 'Graphiques et statistiques' },
    { id: 'budgets', label: 'Budgets', icon: PieChart, description: 'Suivi de vos budgets' },
    { id: 'accounts', label: 'Comptes', icon: CreditCard, description: 'Gestion multi-comptes' },
    { id: 'goals', label: 'Objectifs', icon: Target, description: 'Objectifs financiers' },
    { id: 'reports', label: 'Rapports', icon: BarChart3, description: 'Rapports détaillés' },
    { id: 'export', label: 'Export', icon: Download, description: 'Exporter vos données' },
  ]

  const renderContent = () => {
    switch (activeSection) {
      case 'transactions':
        return <FinanceTracker />
      case 'analytics':
        return <Analytics />
      case 'budgets':
        return <Budgets />
      case 'accounts':
        return <Accounts />
      case 'goals':
        return <FinancialGoals />
      case 'reports':
        return <Reports />
      case 'export':
        return <ExportData />
      case 'overview':
      default:
        return <FinanceOverview onNavigate={setActiveSection} />
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Finances
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Gérez vos finances en un seul endroit
          </p>
        </div>
        <Button
          onClick={() => setActiveSection('transactions')}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle Transaction
        </Button>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {financeSections.map((section) => {
            const Icon = section.icon
            const isActive = activeSection === section.id
            
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id as FinanceSection)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  isActive
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{section.label}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="min-h-[600px]">
        {renderContent()}
      </div>
    </div>
  )
}

// Composant Vue d'ensemble simplifié
const FinanceOverview: React.FC<{ onNavigate: (section: FinanceSection) => void }> = ({ onNavigate }) => {
  const { user } = useAuthContext()
  const [stats, setStats] = useState({
    totalBalance: 0,
    monthlyExpenses: 0,
    goalsAchieved: 0,
    totalGoals: 0
  })
  const [loading, setLoading] = useState(true)

  React.useEffect(() => {
    if (user) {
      loadRealStats()
    }
  }, [user])

  const loadRealStats = async () => {
    if (!user) return

    try {
      setLoading(true)
      
      // Charger les transactions du mois actuel
      const startOfCurrentMonth = new Date()
      startOfCurrentMonth.setDate(1)
      const endOfCurrentMonth = new Date()
      endOfCurrentMonth.setMonth(endOfCurrentMonth.getMonth() + 1, 0)

      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', startOfCurrentMonth.toISOString().split('T')[0])
        .lte('date', endOfCurrentMonth.toISOString().split('T')[0])

      if (error) {
        console.error('Erreur lors du chargement des transactions:', error)
        return
      }

      // Calculer les statistiques réelles
      const income = transactions?.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0) || 0
      const expenses = transactions?.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0) || 0
      const netBalance = income - expenses

      // Charger les objectifs financiers
      const { data: goals, error: goalsError } = await supabase
        .from('financial_goals')
        .select('*')
        .eq('user_id', user.id)

      if (!goalsError && goals) {
        const achievedGoals = goals.filter(goal => {
          // Logique simple : objectif atteint si le montant actuel >= montant cible
          return goal.current_amount >= goal.target_amount
        }).length

        setStats({
          totalBalance: netBalance,
          monthlyExpenses: expenses,
          goalsAchieved: achievedGoals,
          totalGoals: goals.length
        })
      } else {
        setStats({
          totalBalance: netBalance,
          monthlyExpenses: expenses,
          goalsAchieved: 0,
          totalGoals: 0
        })
      }

    } catch (error) {
      console.error('Erreur lors du chargement des stats:', error)
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
      action: () => onNavigate('transactions'),
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      title: 'Voir les analytics',
      description: 'Graphiques et statistiques',
      icon: TrendingUp,
      action: () => onNavigate('analytics'),
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      title: 'Gérer les budgets',
      description: 'Créer et suivre vos budgets',
      icon: PieChart,
      action: () => onNavigate('budgets'),
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      title: 'Objectifs financiers',
      description: 'Définir et suivre vos objectifs',
      icon: Target,
      action: () => onNavigate('goals'),
      color: 'bg-orange-500 hover:bg-orange-600'
    },
    {
      title: 'Gérer les comptes',
      description: 'Multi-comptes bancaires',
      icon: CreditCard,
      action: () => onNavigate('accounts'),
      color: 'bg-indigo-500 hover:bg-indigo-600'
    },
    {
      title: 'Générer un rapport',
      description: 'Rapports détaillés',
      icon: BarChart3,
      action: () => onNavigate('reports'),
      color: 'bg-pink-500 hover:bg-pink-600'
    }
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {action.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {action.description}
                  </p>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onNavigate('transactions')}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Solde Total</p>
              {loading ? (
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
                </div>
              ) : (
                <p className={`text-2xl font-bold ${stats.totalBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(stats.totalBalance)}
                </p>
              )}
              <p className="text-xs text-gray-400 mt-1">Cliquez pour voir les transactions</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-500" />
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onNavigate('analytics')}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Dépenses ce mois</p>
              {loading ? (
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
                </div>
              ) : (
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(stats.monthlyExpenses)}
                </p>
              )}
              <p className="text-xs text-gray-400 mt-1">Cliquez pour voir les analytics</p>
            </div>
            <TrendingUp className="w-8 h-8 text-red-500" />
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onNavigate('goals')}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Objectifs atteints</p>
              {loading ? (
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-2"></div>
                </div>
              ) : (
                <p className="text-2xl font-bold text-blue-600">
                  {stats.goalsAchieved}/{stats.totalGoals}
                </p>
              )}
              <p className="text-xs text-gray-400 mt-1">Cliquez pour gérer les objectifs</p>
            </div>
            <Target className="w-8 h-8 text-blue-500" />
          </div>
        </Card>
      </div>

    </div>
  )
}
