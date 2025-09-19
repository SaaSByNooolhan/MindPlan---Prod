import React, { useState, useEffect } from 'react'
import { Card } from '../ui/Card'
import { PremiumGuard } from '../ui/PremiumGuard'
import { Button } from '../ui/Button'
import { 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  BarChart3,
  Target,
  Settings,
  FileText
} from 'lucide-react'
import { useAuthContext } from '../../contexts/AuthContext'
import { supabase, Transaction, Budget } from '../../lib/supabase'
import { format, startOfMonth, endOfMonth, subMonths, parseISO, eachMonthOfInterval } from 'date-fns'
import { fr } from 'date-fns/locale'

interface ReportData {
  period: string
  // 1. Résumé global
  totalIncome: number
  totalExpenses: number
  netBalance: number
  savingsRate: number
  
  // 2. Revenus détaillés
  incomeBreakdown: {
    salary: number
    freelance: number
    rental: number
    dividends: number
    other: number
  }
  
  // 3. Dépenses détaillées
  expenseBreakdown: {
    fixed: number
    variable: number
    exceptional: number
  }
  topCategories: Array<{ category: string; amount: number; percentage: number }>
  
  // 4. Épargne et investissements
  savings: {
    total: number
    accounts: number
    investments: number
    realEstate: number
  }
  
  // 5. Dettes et engagements
  debts: {
    total: number
    mortgage: number
    consumer: number
    personal: number
  }
  
  // 6. Analyse et indicateurs
  indicators: {
    savingsRate: number
    debtRatio: number
    expenseRatio: number
  }
  
  // 7. Perspectives
  insights: string[]
  recommendations: string[]
  goals: string[]
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
      description: 'Bilan financier complet du mois avec analyse détaillée',
      icon: <Calendar className="w-6 h-6" />,
      period: 'monthly',
      sections: ['Résumé global', 'Revenus', 'Dépenses', 'Épargne', 'Analyse']
    },
    {
      id: 'quarterly',
      name: 'Rapport Trimestriel',
      description: 'Bilan financier sur 3 mois avec tendances et objectifs',
      icon: <BarChart3 className="w-6 h-6" />,
      period: 'quarterly',
      sections: ['Résumé global', 'Revenus', 'Dépenses', 'Investissements', 'Dettes', 'Analyse']
    },
    {
      id: 'yearly',
      name: 'Rapport Annuel',
      description: 'Bilan financier complet de l\'année avec perspectives',
      icon: <TrendingUp className="w-6 h-6" />,
      period: 'yearly',
      sections: ['Résumé global', 'Revenus', 'Dépenses', 'Épargne', 'Investissements', 'Dettes', 'Analyse', 'Perspectives']
    },
    {
      id: 'custom',
      name: 'Rapport Personnalisé',
      description: 'Rapport financier sur la période de votre choix',
      icon: <Settings className="w-6 h-6" />,
      period: 'custom',
      sections: ['Résumé global', 'Revenus', 'Dépenses', 'Épargne', 'Analyse', 'Objectifs']
    }
  ]

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user])

  // Auto-générer et afficher le rapport dès que les données sont disponibles
  useEffect(() => {
    if (transactions.length > 0 || budgets.length > 0) {
      setShowPreview(true) // Afficher automatiquement le rapport
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

    // 2. Revenus détaillés
    const incomeBreakdown = {
      salary: periodTransactions.filter(t => t.type === 'income' && t.category === 'Salaire').reduce((sum, t) => sum + t.amount, 0),
      freelance: periodTransactions.filter(t => t.type === 'income' && t.category === 'Freelance').reduce((sum, t) => sum + t.amount, 0),
      rental: periodTransactions.filter(t => t.type === 'income' && t.category === 'Location').reduce((sum, t) => sum + t.amount, 0),
      dividends: periodTransactions.filter(t => t.type === 'income' && t.category === 'Dividendes').reduce((sum, t) => sum + t.amount, 0),
      other: periodTransactions.filter(t => t.type === 'income' && !['Salaire', 'Freelance', 'Location', 'Dividendes'].includes(t.category)).reduce((sum, t) => sum + t.amount, 0)
    }

    // 3. Dépenses détaillées
    const fixedCategories = ['Loyer', 'Assurance', 'Abonnement', 'Impôts', 'Scolarité']
    const variableCategories = ['Alimentation', 'Transport', 'Loisirs', 'Habillement', 'Santé']
    const exceptionalCategories = ['Voyage', 'Réparation', 'Gros achat']

    const expenseBreakdown = {
      fixed: periodTransactions.filter(t => t.type === 'expense' && fixedCategories.includes(t.category)).reduce((sum, t) => sum + t.amount, 0),
      variable: periodTransactions.filter(t => t.type === 'expense' && variableCategories.includes(t.category)).reduce((sum, t) => sum + t.amount, 0),
      exceptional: periodTransactions.filter(t => t.type === 'expense' && exceptionalCategories.includes(t.category)).reduce((sum, t) => sum + t.amount, 0)
    }

    // 4. Épargne et investissements (simulation basée sur les transactions)
    const savings = {
      total: Math.max(0, netBalance * 0.3), // Estimation 30% du solde
      accounts: Math.max(0, netBalance * 0.2),
      investments: Math.max(0, netBalance * 0.1),
      realEstate: 0 // À compléter avec des données réelles
    }

    // 5. Dettes et engagements (simulation)
    const debts = {
      total: Math.max(0, totalExpenses * 0.4), // Estimation 40% des dépenses
      mortgage: Math.max(0, totalExpenses * 0.25),
      consumer: Math.max(0, totalExpenses * 0.1),
      personal: Math.max(0, totalExpenses * 0.05)
    }

    // 6. Indicateurs clés
    const indicators = {
      savingsRate: savingsRate,
      debtRatio: totalIncome > 0 ? (debts.total / totalIncome) * 100 : 0,
      expenseRatio: totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0
    }

    // 7. Générer des insights et recommandations
    const insights = generateInsights(totalIncome, totalExpenses, netBalance, savingsRate, topCategories, indicators)
    const recommendations = generateRecommendations(netBalance, savingsRate, indicators, debts)
    const goals = generateGoals(netBalance, savingsRate, indicators)

    // Forcer la mise à jour avec un timestamp
    const reportWithTimestamp = {
      period: periodLabel,
      totalIncome,
      totalExpenses,
      netBalance,
      savingsRate,
      incomeBreakdown,
      expenseBreakdown,
      topCategories,
      savings,
      debts,
      indicators,
      insights,
      recommendations,
      goals,
      generatedAt: new Date().toISOString() // Timestamp pour forcer le re-rendu
    }
    
    setReportData(reportWithTimestamp)
  }

  const generateInsights = (income: number, expenses: number, balance: number, savingsRate: number, topCategories: any[], indicators: any) => {
    const insights: string[] = []
    
    // Analyse du solde
    if (balance > 0) {
      insights.push(`✅ Excellent ! Votre solde est positif de ${formatCurrency(balance)}.`)
    } else if (balance < 0) {
      insights.push(`⚠️ Attention : Votre solde est négatif de ${formatCurrency(Math.abs(balance))}.`)
    }

    // Analyse du taux d'épargne
    if (savingsRate > 20) {
      insights.push(`💰 Taux d'épargne excellent : ${savingsRate.toFixed(1)}% (recommandé : 20%)`)
    } else if (savingsRate > 10) {
      insights.push(`📈 Taux d'épargne correct : ${savingsRate.toFixed(1)}% (objectif : 20%)`)
    } else {
      insights.push(`📉 Taux d'épargne faible : ${savingsRate.toFixed(1)}% (recommandé : 20%)`)
    }

    // Analyse du ratio d'endettement
    if (indicators.debtRatio > 33) {
      insights.push(`🚨 Ratio d'endettement élevé : ${indicators.debtRatio.toFixed(1)}% (limite recommandée : 33%)`)
    } else if (indicators.debtRatio > 0) {
      insights.push(`📊 Ratio d'endettement acceptable : ${indicators.debtRatio.toFixed(1)}%`)
    }

    // Analyse des dépenses
    if (indicators.expenseRatio > 80) {
      insights.push(`💸 Dépenses élevées : ${indicators.expenseRatio.toFixed(1)}% des revenus`)
    } else if (indicators.expenseRatio < 60) {
      insights.push(`💪 Bon contrôle des dépenses : ${indicators.expenseRatio.toFixed(1)}% des revenus`)
    }

    // Catégorie principale
    if (topCategories.length > 0) {
      const topCategory = topCategories[0]
      insights.push(`🎯 Catégorie principale : ${topCategory.category} (${topCategory.percentage.toFixed(1)}% des dépenses)`)
    }

    return insights
  }

  const generateRecommendations = (balance: number, savingsRate: number, indicators: any, debts: any) => {
    const recommendations: string[] = []
    
    // Recommandations basées sur le solde
    if (balance < 0) {
      recommendations.push('🔧 Réduisez vos dépenses variables ou augmentez vos revenus pour équilibrer votre budget')
    }

    // Recommandations sur l'épargne
    if (savingsRate < 10) {
      recommendations.push('💡 Épargnez au moins 10% de vos revenus chaque mois (règle des 50/30/20)')
    } else if (savingsRate < 20) {
      recommendations.push('📈 Augmentez votre épargne pour atteindre 20% de vos revenus')
    } else {
      recommendations.push('🚀 Excellent ! Considérez des investissements à long terme (PEA, assurance-vie)')
    }

    // Recommandations sur l'endettement
    if (indicators.debtRatio > 33) {
      recommendations.push('⚠️ Réduisez vos dettes - le ratio d\'endettement ne devrait pas dépasser 33%')
    } else if (indicators.debtRatio > 0) {
      recommendations.push('📊 Maintenez votre niveau d\'endettement actuel')
    }

    // Recommandations sur les dépenses
    if (indicators.expenseRatio > 80) {
      recommendations.push('💸 Réduisez vos dépenses - elles représentent plus de 80% de vos revenus')
    }

    // Recommandations générales
    recommendations.push('📋 Établissez un budget mensuel détaillé')
    recommendations.push('🎯 Fixez-vous des objectifs financiers SMART (Spécifiques, Mesurables, Atteignables, Réalistes, Temporels)')

    return recommendations
  }

  const generateGoals = (balance: number, savingsRate: number, indicators: any) => {
    const goals: string[] = []
    
    // Objectifs basés sur la situation actuelle
    if (savingsRate < 20) {
      goals.push('🎯 Atteindre un taux d\'épargne de 20% dans les 6 prochains mois')
    }
    
    if (indicators.debtRatio > 0) {
      goals.push('💳 Réduire le ratio d\'endettement de 5% cette année')
    }
    
    if (balance > 0) {
      goals.push('💰 Maintenir un solde positif chaque mois')
    } else {
      goals.push('📈 Atteindre un solde positif dans les 3 prochains mois')
    }

    // Objectifs généraux
    goals.push('🏠 Constituer un apport pour un achat immobilier')
    goals.push('👴 Préparer sa retraite avec des investissements long terme')
    goals.push('🛡️ Constituer un fonds d\'urgence de 3-6 mois de dépenses')

    return goals
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  // Fonction d'export PDF supprimée - non nécessaire

  // Fonction d'export Excel supprimée - non nécessaire

  // Fonctions de programmation et partage supprimées - non nécessaires

  // Fonction d'impression supprimée - non nécessaire
  const _printReport = () => {
    if (!reportData) return

    // Create a print-friendly version
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      const template = reportTemplates.find(t => t.id === selectedTemplate)
      
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Rapport Financier - ${template?.name}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 15px; }
            .summary { background: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 5px; }
            .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-top: 15px; }
            .summary-item { text-align: center; padding: 10px; background: white; border-radius: 5px; }
            .summary-value { font-size: 20px; font-weight: bold; margin: 5px 0; }
            .income { color: #10B981; }
            .expense { color: #EF4444; }
            .balance { color: #3B82F6; }
            .savings { color: #8B5CF6; }
            table { width: 100%; border-collapse: collapse; margin: 15px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .section { margin: 25px 0; }
            .insights, .recommendations { background: #f9f9f9; padding: 15px; margin: 15px 0; border-radius: 5px; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Rapport Financier</h1>
            <p><strong>${template?.name}</strong></p>
            <p>Période : ${reportData.period}</p>
            <p>Généré le ${format(new Date(), 'dd/MM/yyyy à HH:mm', { locale: fr })}</p>
          </div>

          <div class="summary">
            <h3>Vue d'ensemble</h3>
            <div class="summary-grid">
              <div class="summary-item">
                <div class="summary-value income">${reportData.totalIncome.toFixed(2)} €</div>
                <div><strong>Revenus</strong></div>
              </div>
              <div class="summary-item">
                <div class="summary-value expense">${reportData.totalExpenses.toFixed(2)} €</div>
                <div><strong>Dépenses</strong></div>
              </div>
              <div class="summary-item">
                <div class="summary-value balance">${reportData.netBalance.toFixed(2)} €</div>
                <div><strong>Solde Net</strong></div>
              </div>
              <div class="summary-item">
                <div class="summary-value savings">${reportData.savingsRate.toFixed(1)}%</div>
                <div><strong>Taux d'épargne</strong></div>
              </div>
            </div>
          </div>

          <div class="section">
            <h3>Top 5 des Catégories de Dépenses</h3>
            <table>
              <thead>
                <tr><th>Rang</th><th>Catégorie</th><th>Montant</th><th>Pourcentage</th></tr>
              </thead>
              <tbody>
                ${reportData.topCategories.map((category, index) => `
                  <tr>
                    <td><strong>${index + 1}</strong></td>
                    <td>${category.category}</td>
                    <td>${category.amount.toFixed(2)} €</td>
                    <td>${category.percentage.toFixed(1)}%</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          ${reportData.budgetPerformance.length > 0 ? `
            <div class="section">
              <h3>Performance des Budgets</h3>
              <table>
                <thead>
                  <tr><th>Catégorie</th><th>Budget</th><th>Dépensé</th><th>Restant</th><th>Utilisation</th></tr>
                </thead>
                <tbody>
                  ${reportData.budgetPerformance.map(budget => `
                    <tr>
                      <td>${budget.category}</td>
                      <td>${budget.budget.toFixed(2)} €</td>
                      <td>${budget.spent.toFixed(2)} €</td>
                      <td>${budget.remaining.toFixed(2)} €</td>
                      <td>${budget.percentage.toFixed(1)}%</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          ` : ''}

          <div class="insights">
            <h4>💡 Insights</h4>
            <ul>
              ${reportData.insights.map(insight => `<li>${insight}</li>`).join('')}
            </ul>
          </div>

          <div class="recommendations">
            <h4>🎯 Recommandations</h4>
            <ul>
              ${reportData.recommendations.map(recommendation => `<li>${recommendation}</li>`).join('')}
            </ul>
          </div>

          <div style="margin-top: 30px; text-align: center; color: #666;">
            <p><strong>Rapport généré par MindPlan</strong> - Gestionnaire Financier Personnel</p>
          </div>
        </body>
        </html>
      `)
      
      printWindow.document.close()
      printWindow.focus()
      printWindow.print()
    }
  }

  // Pas d'écran de chargement bloquant - affichage immédiat

  return (
    <div className="p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Rapports Financiers
          </h1>
            <div className="flex items-center space-x-2">
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Rapports détaillés et export de données
              </p>
              <span className="px-2 py-1 text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 rounded-full font-medium">
                Premium
              </span>
            </div>
          </div>
        </div>


        <PremiumGuard
          featureName="Rapports Financiers"
          description="Générez et exportez vos rapports financiers facilement."
        >
          {/* Configuration directe du rapport */}
          <Card className="p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
              Configuration du Rapport Financier
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Période */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Période d'analyse
                </label>
                <div className="space-y-2">
                  {[
                    { value: '3m', label: '3 derniers mois', icon: '📅' },
                    { value: '6m', label: '6 derniers mois', icon: '📊' },
                    { value: '12m', label: '12 derniers mois', icon: '📈' }
                  ].map((period) => (
                    <button
                      key={period.value}
                      onClick={() => setSelectedPeriod(period.value as any)}
                      className={`w-full flex items-center space-x-3 p-3 rounded-lg border-2 transition-all duration-200 ${
                        selectedPeriod === period.value
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                      }`}
                    >
                      <span className="text-lg">{period.icon}</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{period.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Type de rapport */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Type de rapport
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'monthly', label: 'Rapport Mensuel', icon: '📅', desc: 'Bilan du mois' },
                    { value: 'quarterly', label: 'Rapport Trimestriel', icon: '📊', desc: 'Bilan sur 3 mois' },
                    { value: 'yearly', label: 'Rapport Annuel', icon: '📈', desc: 'Bilan de l\'année' },
                    { value: 'custom', label: 'Rapport Personnalisé', icon: '⚙️', desc: 'Période choisie' }
                  ].map((template) => (
                    <button
                      key={template.value}
                      onClick={() => setSelectedTemplate(template.value)}
                      className={`w-full flex items-center space-x-3 p-3 rounded-lg border-2 transition-all duration-200 ${
                        selectedTemplate === template.value
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                      }`}
                    >
                      <span className="text-lg">{template.icon}</span>
                      <div className="text-left">
                        <div className="font-medium text-gray-900 dark:text-gray-100">{template.label}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">{template.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
          </div>

            {/* Dates personnalisées */}
            {selectedTemplate === 'custom' && (
              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Période personnalisée
                </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Date de début</label>
                  <input
                    type="date"
                    value={customDateRange.start}
                    onChange={(e) => setCustomDateRange({ ...customDateRange, start: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Date de fin</label>
                  <input
                    type="date"
                    value={customDateRange.end}
                    onChange={(e) => setCustomDateRange({ ...customDateRange, end: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              </div>
            )}

          </Card>


          {/* Aperçu simple du rapport */}
          {showPreview && reportData && (
            <div className="space-y-6">
              {/* En-tête simple */}
              <Card className="p-6 bg-gradient-to-r from-blue-50 to-emerald-50 dark:from-blue-900/20 dark:to-emerald-900/20">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    Rapport Financier
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    {reportTemplates.find(t => t.id === selectedTemplate)?.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    Période : {reportData.period}
                  </p>
                  {reportData.generatedAt && (
                    <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">
                      Généré le {format(new Date(reportData.generatedAt), 'dd/MM/yyyy à HH:mm', { locale: fr })}
                    </p>
                  )}
                </div>
              </Card>

              {/* 1. Résumé global */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  1. Résumé Global
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Revenus</p>
                    <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(reportData.totalIncome)}
                    </p>
                  </div>

                  <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Dépenses</p>
                    <p className="text-xl font-bold text-red-600 dark:text-red-400">
                      {formatCurrency(reportData.totalExpenses)}
                    </p>
                  </div>

                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Solde Net</p>
                    <p className={`text-xl font-bold ${reportData.netBalance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                      {formatCurrency(reportData.netBalance)}
                    </p>
                  </div>

                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <Target className="w-6 h-6 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Taux d'épargne</p>
                    <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                      {reportData.savingsRate.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </Card>

              {/* 2. Revenus détaillés */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  2. Revenus Détaillés
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Salaire</p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(reportData.incomeBreakdown.salary)}</p>
                        </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Freelance</p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(reportData.incomeBreakdown.freelance)}</p>
                        </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Location</p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(reportData.incomeBreakdown.rental)}</p>
                    </div>
                </div>
              </Card>

              {/* 3. Dépenses détaillées */}
                <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  3. Dépenses Détaillées
                  </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Fixes</p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(reportData.expenseBreakdown.fixed)}</p>
                        </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Variables</p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(reportData.expenseBreakdown.variable)}</p>
                        </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Exceptionnelles</p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(reportData.expenseBreakdown.exceptional)}</p>
                        </div>
                      </div>
              </Card>

              {/* 6. Indicateurs clés */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  6. Indicateurs Clés
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Taux d'épargne</p>
                    <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{reportData.indicators.savingsRate.toFixed(1)}%</p>
                  </div>
                  <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Ratio d'endettement</p>
                    <p className="text-lg font-bold text-orange-600 dark:text-orange-400">{reportData.indicators.debtRatio.toFixed(1)}%</p>
                  </div>
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Ratio des dépenses</p>
                    <p className="text-lg font-bold text-red-600 dark:text-red-400">{reportData.indicators.expenseRatio.toFixed(1)}%</p>
                  </div>
                  </div>
                </Card>

              {/* 7. Analyse et Perspectives */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    📊 Analyse
                  </h3>
                  <div className="space-y-3">
                    {reportData.insights.map((insight, index) => (
                      <div key={index} className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-sm text-blue-800 dark:text-blue-200">{insight}</p>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    💡 Recommandations
                  </h3>
                  <div className="space-y-3">
                    {reportData.recommendations.slice(0, 4).map((recommendation, index) => (
                      <div key={index} className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                        <p className="text-sm text-emerald-800 dark:text-emerald-200">{recommendation}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Objectifs financiers */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  🎯 Objectifs Financiers
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {reportData.goals.map((goal, index) => (
                    <div key={index} className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <p className="text-sm text-purple-800 dark:text-purple-200">{goal}</p>
                    </div>
                  ))}
                </div>
              </Card>



            </div>
          )}

          {!showPreview && (
            <Card className="p-8 text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Configuration du rapport financier
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                Le rapport se génère automatiquement dès que vous modifiez la configuration. Ajustez la période et le type de rapport ci-dessus pour voir votre analyse en temps réel.
              </p>
              <div className="flex flex-wrap justify-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
                  Résumé global
                </span>
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Revenus détaillés
                </span>
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                  Dépenses analysées
                </span>
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                  Objectifs personnalisés
                </span>
              </div>
            </Card>
          )}
        </PremiumGuard>
      </div>
    </div>
  )
}