import React, { useState, useEffect } from 'react'
import { Card } from '../ui/Card'
import { PremiumGuard } from '../ui/PremiumGuard'
import { Button } from '../ui/Button'
import { 
  FileText, 
  Download, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  BarChart3,
  PieChart,
  Target,
  Clock,
  Mail,
  Settings,
  Filter,
  Eye,
  Share2,
  Printer,
  FileSpreadsheet,
  File
} from 'lucide-react'
import { useAuthContext } from '../../contexts/AuthContext'
import { supabase, Transaction, Budget } from '../../lib/supabase'
import { format, startOfMonth, endOfMonth, subMonths, parseISO, eachMonthOfInterval } from 'date-fns'
import { fr } from 'date-fns/locale'

interface ReportData {
  period: string
  totalIncome: number
  totalExpenses: number
  netBalance: number
  savingsRate: number
  topCategories: Array<{ category: string; amount: number; percentage: number }>
  monthlyTrends: Array<{ month: string; income: number; expenses: number; balance: number }>
  budgetPerformance: Array<{ category: string; budget: number; spent: number; remaining: number; percentage: number }>
  insights: string[]
  recommendations: string[]
}

interface ReportTemplate {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  period: 'monthly' | 'quarterly' | 'yearly' | 'custom'
  sections: string[]
}

export const Reports: React.FC = () => {
  const { user } = useAuthContext()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTemplate, setSelectedTemplate] = useState<string>('monthly')
  const [selectedPeriod, setSelectedPeriod] = useState<'3m' | '6m' | '12m'>('6m')
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [customDateRange, setCustomDateRange] = useState({
    start: format(subMonths(new Date(), 6), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd')
  })

  const reportTemplates: ReportTemplate[] = [
    {
      id: 'monthly',
      name: 'Rapport Mensuel',
      description: 'Analyse complète du mois en cours avec comparaisons',
      icon: <Calendar className="w-6 h-6" />,
      period: 'monthly',
      sections: ['Vue d\'ensemble', 'Tendances', 'Budgets', 'Recommandations']
    },
    {
      id: 'quarterly',
      name: 'Rapport Trimestriel',
      description: 'Bilan financier sur 3 mois avec analyses détaillées',
      icon: <BarChart3 className="w-6 h-6" />,
      period: 'quarterly',
      sections: ['Performance', 'Évolution', 'Budgets', 'Objectifs']
    },
    {
      id: 'yearly',
      name: 'Rapport Annuel',
      description: 'Rapport complet de l\'année avec projections',
      icon: <TrendingUp className="w-6 h-6" />,
      period: 'yearly',
      sections: ['Bilan', 'Tendances', 'Budgets', 'Projections']
    },
    {
      id: 'budget',
      name: 'Rapport Budget',
      description: 'Analyse détaillée de la performance des budgets',
      icon: <Target className="w-6 h-6" />,
      period: 'monthly',
      sections: ['Budgets', 'Dépassements', 'Recommandations']
    },
    {
      id: 'custom',
      name: 'Rapport Personnalisé',
      description: 'Créez votre propre rapport avec période personnalisée',
      icon: <Settings className="w-6 h-6" />,
      period: 'custom',
      sections: ['Données personnalisées', 'Analyses', 'Insights']
    }
  ]

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user])

  useEffect(() => {
    if (transactions.length > 0 || budgets.length > 0) {
      generateReport()
    }
  }, [selectedTemplate, selectedPeriod, transactions, budgets, customDateRange])

  const loadData = async () => {
    if (!user) return

    setLoading(true)
    try {
      // Charger les transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })

      if (transactionsError) {
        console.error('Error loading transactions:', transactionsError)
      } else {
        setTransactions(transactionsData || [])
      }

      // Charger les budgets
      const { data: budgetsData, error: budgetsError } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id)

      if (budgetsError) {
        console.error('Error loading budgets:', budgetsError)
        setBudgets([])
      } else {
        setBudgets(budgetsData || [])
      }
    } catch (error) {
      console.error('Error in loadData:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateReport = () => {
    const template = reportTemplates.find(t => t.id === selectedTemplate)
    if (!template) return

    let startDate: Date
    let endDate: Date
    let periodLabel: string

    if (template.period === 'custom') {
      startDate = new Date(customDateRange.start)
      endDate = new Date(customDateRange.end)
      periodLabel = `${format(startDate, 'dd/MM/yyyy')} - ${format(endDate, 'dd/MM/yyyy')}`
    } else {
      const months = selectedPeriod === '3m' ? 3 : selectedPeriod === '6m' ? 6 : 12
      startDate = startOfMonth(subMonths(new Date(), months - 1))
      endDate = endOfMonth(new Date())
      periodLabel = `${months} derniers mois`
    }

    // Filtrer les transactions par période
    const periodTransactions = transactions.filter(t => {
      try {
        const transactionDate = parseISO(t.date)
        return transactionDate >= startDate && transactionDate <= endDate
      } catch (error) {
        return false
      }
    })

    // Calculer les statistiques
    const totalIncome = periodTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
    const totalExpenses = periodTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
    const netBalance = totalIncome - totalExpenses
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0

    // Top catégories
    const categoryBreakdown = periodTransactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount
        return acc
      }, {} as Record<string, number>)

    const topCategories = Object.entries(categoryBreakdown)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: (amount / totalExpenses) * 100
      }))

    // Tendances mensuelles
    const monthlyTrends = eachMonthOfInterval({
      start: startDate,
      end: endDate
    }).map(month => {
      const monthStart = startOfMonth(month)
      const monthEnd = endOfMonth(month)
      
      const monthTransactions = periodTransactions.filter(t => {
        try {
          const transactionDate = parseISO(t.date)
          return transactionDate >= monthStart && transactionDate <= monthEnd
        } catch (error) {
          return false
        }
      })

      const income = monthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
      const expenses = monthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)

      return {
        month: format(month, 'MMM yyyy', { locale: fr }),
        income,
        expenses,
        balance: income - expenses
      }
    })

    // Performance des budgets
    const budgetPerformance = budgets.map(budget => {
      const spent = periodTransactions
        .filter(t => t.category === budget.category && t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0)
      
      return {
        category: budget.category,
        budget: budget.amount,
        spent,
        remaining: budget.amount - spent,
        percentage: (spent / budget.amount) * 100
      }
    })

    // Générer des insights
    const insights = generateInsights(totalIncome, totalExpenses, netBalance, savingsRate, topCategories)
    const recommendations = generateRecommendations(netBalance, savingsRate, budgetPerformance)

    setReportData({
      period: periodLabel,
      totalIncome,
      totalExpenses,
      netBalance,
      savingsRate,
      topCategories,
      monthlyTrends,
      budgetPerformance,
      insights,
      recommendations
    })
  }

  const generateInsights = (income: number, expenses: number, balance: number, savingsRate: number, topCategories: any[]) => {
    const insights: string[] = []
    
    if (balance > 0) {
      insights.push(`Excellent ! Votre solde est positif de ${formatCurrency(balance)}.`)
    } else if (balance < 0) {
      insights.push(`Attention : Votre solde est négatif de ${formatCurrency(Math.abs(balance))}.`)
    }

    if (savingsRate > 20) {
      insights.push(`Taux d'épargne excellent : ${savingsRate.toFixed(1)}%.`)
    } else if (savingsRate > 10) {
      insights.push(`Taux d'épargne correct : ${savingsRate.toFixed(1)}%.`)
    } else {
      insights.push(`Taux d'épargne faible : ${savingsRate.toFixed(1)}%.`)
    }

    if (topCategories.length > 0) {
      const topCategory = topCategories[0]
      insights.push(`Catégorie principale : ${topCategory.category} (${topCategory.percentage.toFixed(1)}% des dépenses).`)
    }

    return insights
  }

  const generateRecommendations = (balance: number, savingsRate: number, budgetPerformance: any[]) => {
    const recommendations: string[] = []
    
    if (balance < 0) {
      recommendations.push('Réduisez vos dépenses non essentielles pour améliorer votre solde.')
    }

    if (savingsRate < 10) {
      recommendations.push('Essayez d\'augmenter votre taux d\'épargne à au moins 10%.')
    }

    const exceededBudgets = budgetPerformance.filter(b => b.percentage > 100)
    if (exceededBudgets.length > 0) {
      recommendations.push(`${exceededBudgets.length} budget(s) dépassé(s). Réajustez vos allocations.`)
    }

    const highSpendingCategories = budgetPerformance.filter(b => b.percentage > 80)
    if (highSpendingCategories.length > 0) {
      recommendations.push('Surveillez vos catégories de dépenses qui approchent de leur limite.')
    }

    return recommendations
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  const exportToPDF = () => {
    // Simulation d'export PDF
    alert('📄 Export PDF - Fonctionnalité en cours de développement\n\nCette fonctionnalité sera disponible prochainement pour exporter vos rapports financiers au format PDF avec mise en forme professionnelle.')
  }

  const exportToExcel = () => {
    // Simulation d'export Excel
    alert('📊 Export Excel - Fonctionnalité en cours de développement\n\nCette fonctionnalité sera disponible prochainement pour exporter vos rapports financiers au format Excel avec tableaux et graphiques.')
  }

  const scheduleReport = () => {
    // Simulation de programmation de rapport
    alert('⏰ Programmation de rapports - Fonctionnalité en cours de développement\n\nCette fonctionnalité permettra de programmer l\'envoi automatique de rapports par email à intervalles réguliers.')
  }

  if (loading) {
    return (
      <div className="p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
            Rapports Financiers
          </h1>
          <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
            Rapports Financiers
          </h1>
          <div className="flex gap-2">
            <Button onClick={() => setShowPreview(!showPreview)} variant="outline">
              <Eye className="w-4 h-4 mr-2" />
              {showPreview ? 'Masquer' : 'Aperçu'}
            </Button>
            <Button onClick={exportToPDF} variant="outline">
              <File className="w-4 h-4 mr-2" />
              PDF
            </Button>
            <Button onClick={exportToExcel} variant="outline">
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Excel
            </Button>
          </div>
        </div>

        {/* Message d'information sur les fonctionnalités en développement */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-50 to-emerald-50 dark:from-blue-900/20 dark:to-emerald-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 dark:text-blue-400 text-sm">🚧</span>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-1">
                  Fonctionnalités en cours de développement
                </h3>
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  Les fonctionnalités d'export PDF, Excel et de programmation de rapports sont actuellement en développement et seront disponibles prochainement.
                </p>
              </div>
            </div>
          </div>
        </div>

        <PremiumGuard
          featureName="Rapports Financiers"
          description="Générez des rapports détaillés, exportez vos données et programmez des rapports automatiques."
        >
          {/* Sélection du modèle de rapport */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {reportTemplates.map((template) => (
              <Card 
                key={template.id} 
                className={`p-6 cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  selectedTemplate === template.id 
                    ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
                onClick={() => setSelectedTemplate(template.id)}
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className={`p-2 rounded-lg ${
                    selectedTemplate === template.id 
                      ? 'bg-blue-100 dark:bg-blue-800' 
                      : 'bg-gray-100 dark:bg-gray-700'
                  }`}>
                    {template.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {template.name}
                  </h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {template.description}
                </p>
                <div className="flex flex-wrap gap-1">
                  {template.sections.map((section, index) => (
                    <span 
                      key={index}
                      className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded"
                    >
                      {section}
                    </span>
                  ))}
                </div>
              </Card>
            ))}
          </div>

          {/* Configuration de la période */}
          <Card className="p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
              Configuration du Rapport
            </h2>
            
            {selectedTemplate === 'custom' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date de début
                  </label>
                  <input
                    type="date"
                    value={customDateRange.start}
                    onChange={(e) => setCustomDateRange({ ...customDateRange, start: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date de fin
                  </label>
                  <input
                    type="date"
                    value={customDateRange.end}
                    onChange={(e) => setCustomDateRange({ ...customDateRange, end: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                {[
                  { value: '3m', label: '3 mois' },
                  { value: '6m', label: '6 mois' },
                  { value: '12m', label: '12 mois' }
                ].map((period) => (
                  <Button
                    key={period.value}
                    variant={selectedPeriod === period.value ? 'default' : 'outline'}
                    onClick={() => setSelectedPeriod(period.value as any)}
                    size="sm"
                  >
                    {period.label}
                  </Button>
                ))}
              </div>
            )}
          </Card>

          {/* Aperçu du rapport */}
          {showPreview && reportData && (
            <div className="space-y-8">
              {/* En-tête du rapport */}
              <Card className="p-8 bg-gradient-to-r from-blue-50 to-emerald-50 dark:from-blue-900/20 dark:to-emerald-900/20">
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    Rapport Financier
                  </h2>
                  <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
                    {reportTemplates.find(t => t.id === selectedTemplate)?.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    Période : {reportData.period} | Généré le {format(new Date(), 'dd/MM/yyyy à HH:mm')}
                  </p>
                </div>
              </Card>

              {/* Vue d'ensemble */}
              <Card className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
                  Vue d'ensemble
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                    <TrendingUp className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Revenus</p>
                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(reportData.totalIncome)}
                    </p>
                  </div>

                  <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <TrendingDown className="w-8 h-8 text-red-600 dark:text-red-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Dépenses</p>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {formatCurrency(reportData.totalExpenses)}
                    </p>
                  </div>

                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <DollarSign className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Solde Net</p>
                    <p className={`text-2xl font-bold ${reportData.netBalance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                      {formatCurrency(reportData.netBalance)}
                    </p>
                  </div>

                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <Target className="w-8 h-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Taux d'épargne</p>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {reportData.savingsRate.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </Card>

              {/* Top catégories */}
              <Card className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
                  Top 5 des Catégories de Dépenses
                </h3>
                <div className="space-y-4">
                  {reportData.topCategories.map((category, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                          <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                            {index + 1}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">{category.category}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {category.percentage.toFixed(1)}% du total
                          </p>
                        </div>
                      </div>
                      <p className="text-lg font-semibold text-red-600 dark:text-red-400">
                        {formatCurrency(category.amount)}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Performance des budgets */}
              {reportData.budgetPerformance.length > 0 && (
                <Card className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
                    Performance des Budgets
                  </h3>
                  <div className="space-y-4">
                    {reportData.budgetPerformance.map((budget, index) => (
                      <div key={index} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium text-gray-900 dark:text-gray-100">{budget.category}</h4>
                          <span className={`text-sm font-medium ${
                            budget.percentage > 100 ? 'text-red-600' :
                            budget.percentage > 80 ? 'text-yellow-600' :
                            'text-emerald-600'
                          }`}>
                            {budget.percentage.toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                          <span>Budget: {formatCurrency(budget.budget)}</span>
                          <span>Dépensé: {formatCurrency(budget.spent)}</span>
                          <span>Restant: {formatCurrency(budget.remaining)}</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              budget.percentage > 100 ? 'bg-red-500' :
                              budget.percentage > 80 ? 'bg-yellow-500' :
                              'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Insights et recommandations */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
                    Insights
                  </h3>
                  <div className="space-y-3">
                    {reportData.insights.map((insight, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                        <p className="text-sm text-blue-800 dark:text-blue-200">{insight}</p>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
                    Recommandations
                  </h3>
                  <div className="space-y-3">
                    {reportData.recommendations.map((recommendation, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                        <Target className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                        <p className="text-sm text-emerald-800 dark:text-emerald-200">{recommendation}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Actions du rapport */}
              <Card className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
                  Actions
                </h3>
                <div className="flex flex-wrap gap-3">
                  <Button onClick={exportToPDF}>
                    <File className="w-4 h-4 mr-2" />
                    Exporter en PDF
                  </Button>
                  <Button onClick={exportToExcel} variant="outline">
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                    Exporter en Excel
                  </Button>
                  <Button onClick={scheduleReport} variant="outline">
                    <Clock className="w-4 h-4 mr-2" />
                    Programmer
                  </Button>
                  <Button variant="outline">
                    <Share2 className="w-4 h-4 mr-2" />
                    Partager
                  </Button>
                  <Button variant="outline">
                    <Printer className="w-4 h-4 mr-2" />
                    Imprimer
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {!showPreview && (
            <Card className="p-12 text-center">
              <FileText className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Sélectionnez un modèle de rapport
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Choisissez un modèle de rapport et configurez la période pour générer votre rapport financier
              </p>
              <Button onClick={() => setShowPreview(true)}>
                <Eye className="w-4 h-4 mr-2" />
                Générer le Rapport
              </Button>
            </Card>
          )}
        </PremiumGuard>
      </div>
    </div>
  )
}