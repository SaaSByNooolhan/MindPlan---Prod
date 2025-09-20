import React, { useState, useEffect } from 'react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { useSubscription } from '../../hooks/useSubscription'
import { useAuthContext } from '../../contexts/AuthContext'
import { supabase, Transaction } from '../../lib/supabase'
import { BarChart3, Calendar, TrendingUp, DollarSign, PieChart, BarChart, Crown } from 'lucide-react'
import { format, startOfMonth, endOfMonth, subMonths, startOfYear, endOfYear } from 'date-fns'
import { fr } from 'date-fns/locale'

export const Reports: React.FC = () => {
  const { isPremium, upgradeToPremium } = useSubscription()
  const { user } = useAuthContext()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'year'>('month')
  const [selectedMonth, setSelectedMonth] = useState(new Date())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [generatedReports, setGeneratedReports] = useState<any[]>([])

  // Charger les transactions
  useEffect(() => {
    if (user && isPremium()) {
      loadTransactions()
    } else if (user && !isPremium()) {
      // Si l'utilisateur n'est pas premium, arrêter le chargement
      setLoading(false)
    }
  }, [user])

  const loadTransactions = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })

      if (error) {
        return
      }

      setTransactions(data || [])
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  // Calculer les statistiques pour la période sélectionnée
  const getPeriodStats = () => {
    const now = new Date()
    let startDate: Date
    let endDate: Date

    if (selectedPeriod === 'month') {
      startDate = startOfMonth(selectedMonth)
      endDate = endOfMonth(selectedMonth)
    } else {
      startDate = startOfYear(new Date(selectedYear, 0, 1))
      endDate = endOfYear(new Date(selectedYear, 0, 1))
    }

    const periodTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date)
      return transactionDate >= startDate && transactionDate <= endDate
    })

    const income = periodTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)

    const expenses = periodTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)

    const balance = income - expenses

    // Top catégories de dépenses
    const categoryStats = periodTransactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount
        return acc
      }, {} as Record<string, number>)

    const topCategories = Object.entries(categoryStats)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)

    return {
      income,
      expenses,
      balance,
      transactionCount: periodTransactions.length,
      topCategories,
      periodTransactions
    }
  }

  const generateMonthlyReport = () => {
    const stats = getPeriodStats()
    const previousMonth = new Date(selectedMonth)
    previousMonth.setMonth(previousMonth.getMonth() - 1)
    
    // Calculer les stats du mois précédent pour comparaison
    const previousStats = getPreviousPeriodStats(previousMonth)
    
    const report = {
      id: Date.now(),
      type: 'monthly',
      title: `Rapport Mensuel - ${format(selectedMonth, 'MMMM yyyy', { locale: fr })}`,
      date: new Date(),
      stats: {
        ...stats,
        previousStats,
        savingsRate: stats.income > 0 ? (stats.balance / stats.income) * 100 : 0,
        expenseBreakdown: getExpenseBreakdown(stats.periodTransactions),
        incomeBreakdown: getIncomeBreakdown(stats.periodTransactions),
        topCategories: stats.topCategories,
        recommendations: generateRecommendations(stats, previousStats)
      },
      period: selectedPeriod,
      periodDate: selectedPeriod === 'month' ? selectedMonth : new Date(selectedYear, 0, 1)
    }
    
    setGeneratedReports(prev => [report, ...prev])
    return report
  }

  const generateYearlyReport = () => {
    const stats = getPeriodStats()
    const previousYear = selectedYear - 1
    
    // Calculer les stats de l'année précédente pour comparaison
    const previousStats = getPreviousYearStats(previousYear)
    
    const report = {
      id: Date.now(),
      type: 'yearly',
      title: `Rapport Annuel - ${selectedYear}`,
      date: new Date(),
      stats: {
        ...stats,
        previousStats,
        savingsRate: stats.income > 0 ? (stats.balance / stats.income) * 100 : 0,
        expenseBreakdown: getExpenseBreakdown(stats.periodTransactions),
        incomeBreakdown: getIncomeBreakdown(stats.periodTransactions),
        topCategories: stats.topCategories,
        recommendations: generateRecommendations(stats, previousStats),
        monthlyBreakdown: getMonthlyBreakdown(selectedYear)
      },
      period: selectedPeriod,
      periodDate: new Date(selectedYear, 0, 1)
    }
    
    setGeneratedReports(prev => [report, ...prev])
    return report
  }

  const generateBudgetReport = () => {
    const stats = getPeriodStats()
    const previousMonth = new Date(selectedMonth)
    previousMonth.setMonth(previousMonth.getMonth() - 1)
    
    const previousStats = getPreviousPeriodStats(previousMonth)
    
    const report = {
      id: Date.now(),
      type: 'budget',
      title: `Rapport de Budget - ${format(selectedMonth, 'MMMM yyyy', { locale: fr })}`,
      date: new Date(),
      stats: {
        ...stats,
        previousStats,
        savingsRate: stats.income > 0 ? (stats.balance / stats.income) * 100 : 0,
        expenseBreakdown: getExpenseBreakdown(stats.periodTransactions),
        incomeBreakdown: getIncomeBreakdown(stats.periodTransactions),
        topCategories: stats.topCategories,
        recommendations: generateBudgetRecommendations(stats, previousStats),
        budgetAnalysis: analyzeBudgetPerformance(stats)
      },
      period: selectedPeriod,
      periodDate: selectedMonth
    }
    
    setGeneratedReports(prev => [report, ...prev])
    return report
  }


  const deleteReport = (reportId: number) => {
    setGeneratedReports(prev => prev.filter(r => r.id !== reportId))
  }

  // Fonctions d'analyse détaillée
  const getPreviousPeriodStats = (previousDate: Date) => {
    const startDate = startOfMonth(previousDate)
    const endDate = endOfMonth(previousDate)

    const periodTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date)
      return transactionDate >= startDate && transactionDate <= endDate
    })

    const income = periodTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)

    const expenses = periodTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)

    return {
      income,
      expenses,
      balance: income - expenses,
      transactionCount: periodTransactions.length
    }
  }

  const getExpenseBreakdown = (periodTransactions: Transaction[]) => {
    const expenses = periodTransactions.filter(t => t.type === 'expense')
    
    // Catégoriser les dépenses selon la structure demandée
    const categories = {
      fixes: ['Logement', 'Assurances', 'Abonnements', 'Impôts', 'Scolarité'],
      variables: ['Alimentation', 'Transport', 'Loisirs', 'Habillement', 'Santé'],
      exceptionnelles: ['Voyages', 'Réparations', 'Gros achats']
    }

    const breakdown = {
      fixes: 0,
      variables: 0,
      exceptionnelles: 0,
      autres: 0
    }

    expenses.forEach(expense => {
      if (categories.fixes.includes(expense.category)) {
        breakdown.fixes += expense.amount
      } else if (categories.variables.includes(expense.category)) {
        breakdown.variables += expense.amount
      } else if (categories.exceptionnelles.includes(expense.category)) {
        breakdown.exceptionnelles += expense.amount
      } else {
        breakdown.autres += expense.amount
      }
    })

    return breakdown
  }

  const getIncomeBreakdown = (periodTransactions: Transaction[]) => {
    const incomes = periodTransactions.filter(t => t.type === 'income')
    
    const breakdown = {
      salaire: 0,
      complementaires: 0,
      exceptionnels: 0
    }

    incomes.forEach(income => {
      if (income.category === 'Salaire' || income.category === 'Revenus professionnels') {
        breakdown.salaire += income.amount
      } else if (['Freelance', 'Location', 'Dividendes', 'Intérêts', 'Aides'].includes(income.category)) {
        breakdown.complementaires += income.amount
      } else {
        breakdown.exceptionnels += income.amount
      }
    })

    return breakdown
  }

  const generateRecommendations = (currentStats: any, previousStats: any) => {
    const recommendations = []

    // Analyse du taux d'épargne
    if (currentStats.income > 0) {
      const savingsRate = (currentStats.balance / currentStats.income) * 100
      if (savingsRate < 10) {
        recommendations.push({
          type: 'warning',
          title: 'Taux d\'épargne faible',
          message: `Votre taux d'épargne est de ${savingsRate.toFixed(1)}%. Il est recommandé d'épargner au moins 10-20% de vos revenus.`
        })
      } else if (savingsRate > 20) {
        recommendations.push({
          type: 'success',
          title: 'Excellent taux d\'épargne',
          message: `Félicitations ! Votre taux d'épargne de ${savingsRate.toFixed(1)}% est excellent.`
        })
      }
    }

    // Comparaison avec la période précédente
    if (previousStats) {
      const incomeChange = ((currentStats.income - previousStats.income) / previousStats.income) * 100
      const expenseChange = ((currentStats.expenses - previousStats.expenses) / previousStats.expenses) * 100

      if (expenseChange > 15) {
        recommendations.push({
          type: 'warning',
          title: 'Augmentation des dépenses',
          message: `Vos dépenses ont augmenté de ${expenseChange.toFixed(1)}% par rapport au mois précédent.`
        })
      }

      if (incomeChange > 10) {
        recommendations.push({
          type: 'success',
          title: 'Augmentation des revenus',
          message: `Excellent ! Vos revenus ont augmenté de ${incomeChange.toFixed(1)}%.`
        })
      }
    }

    // Analyse des catégories de dépenses
    const topCategory = currentStats.topCategories[0]
    if (topCategory && topCategory[1] > currentStats.expenses * 0.4) {
      recommendations.push({
        type: 'info',
        title: 'Concentration des dépenses',
        message: `${topCategory[0]} représente ${((topCategory[1] / currentStats.expenses) * 100).toFixed(1)}% de vos dépenses.`
      })
    }

    return recommendations
  }

  const getPreviousYearStats = (year: number) => {
    const startDate = startOfYear(new Date(year, 0, 1))
    const endDate = endOfYear(new Date(year, 0, 1))

    const periodTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date)
      return transactionDate >= startDate && transactionDate <= endDate
    })

    const income = periodTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)

    const expenses = periodTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)

    return {
      income,
      expenses,
      balance: income - expenses,
      transactionCount: periodTransactions.length
    }
  }

  const getMonthlyBreakdown = (year: number) => {
    const monthlyData = []
    
    for (let month = 0; month < 12; month++) {
      const startDate = startOfMonth(new Date(year, month, 1))
      const endDate = endOfMonth(new Date(year, month, 1))
      
      const monthTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date)
        return transactionDate >= startDate && transactionDate <= endDate
      })

      const income = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0)

      const expenses = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0)

      monthlyData.push({
        month: format(new Date(year, month, 1), 'MMM', { locale: fr }),
        income,
        expenses,
        balance: income - expenses,
        transactionCount: monthTransactions.length
      })
    }

    return monthlyData
  }

  const generateBudgetRecommendations = (currentStats: any, previousStats: any) => {
    const recommendations = generateRecommendations(currentStats, previousStats)
    
    // Ajouter des recommandations spécifiques au budget
    if (currentStats.expenseBreakdown) {
      const fixedRatio = (currentStats.expenseBreakdown.fixes / currentStats.expenses) * 100
      if (fixedRatio > 60) {
        recommendations.push({
          type: 'warning',
          title: 'Dépenses fixes élevées',
          message: `Vos dépenses fixes représentent ${fixedRatio.toFixed(1)}% de vos dépenses totales. Considérez réduire certains abonnements ou négocier vos contrats.`
        })
      }

      const variableRatio = (currentStats.expenseBreakdown.variables / currentStats.expenses) * 100
      if (variableRatio > 50) {
        recommendations.push({
          type: 'info',
          title: 'Optimisation possible',
          message: `Vos dépenses variables (${variableRatio.toFixed(1)}%) peuvent être optimisées. Suivez vos achats quotidiens pour identifier les économies possibles.`
        })
      }
    }

    return recommendations
  }

  const analyzeBudgetPerformance = (stats: any) => {
    return {
      totalBudget: stats.income, // En supposant que le budget = revenus
      actualSpending: stats.expenses,
      remainingBudget: stats.balance,
      budgetUtilization: stats.income > 0 ? (stats.expenses / stats.income) * 100 : 0,
      isOverBudget: stats.balance < 0,
      overBudgetAmount: stats.balance < 0 ? Math.abs(stats.balance) : 0
    }
  }

  if (loading) {
    return (
      <div className="p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Chargement des données...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Rapports Financiers
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Générez des rapports détaillés de vos finances
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Chargement des données...</p>
            </div>
          </div>
        ) : isPremium() ? (
          <div className="space-y-6">
            {/* Sélecteur de période */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Configuration du Rapport
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Type de période
                  </label>
                  <select
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value as 'month' | 'year')}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  >
                    <option value="month">Mensuel</option>
                    <option value="year">Annuel</option>
                  </select>
                </div>
                
                {selectedPeriod === 'month' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Mois
                    </label>
                    <input
                      type="month"
                      value={format(selectedMonth, 'yyyy-MM')}
                      onChange={(e) => setSelectedMonth(new Date(e.target.value + '-01'))}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Année
                    </label>
                    <input
                      type="number"
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                      min="2020"
                      max={new Date().getFullYear()}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                )}
                
              </div>
            </Card>

            {/* Rapports disponibles */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Générer un Rapport
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-300 dark:hover:border-blue-600 transition-colors">
                  <div className="flex items-center mb-3">
                    <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-2" />
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">
                      Rapport Mensuel
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Analyse complète de vos finances du mois
                  </p>
                  <Button
                    onClick={generateMonthlyReport}
                    size="sm"
                    className="w-full"
                  >
                    Générer
                  </Button>
                </div>
                
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-emerald-300 dark:hover:border-emerald-600 transition-colors">
                  <div className="flex items-center mb-3">
                    <TrendingUp className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mr-2" />
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">
                      Rapport Annuel
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Vue d'ensemble de votre année financière
                  </p>
                  <Button
                    onClick={generateYearlyReport}
                    size="sm"
                    variant="outline"
                    className="w-full border-emerald-300 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-900/20"
                  >
                    Générer
                  </Button>
                </div>
                
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-purple-300 dark:hover:border-purple-600 transition-colors">
                  <div className="flex items-center mb-3">
                    <BarChart className="w-6 h-6 text-purple-600 dark:text-purple-400 mr-2" />
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">
                      Rapport de Budget
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Analyse de vos budgets et objectifs
                  </p>
                  <Button
                    onClick={generateBudgetReport}
                    size="sm"
                    variant="outline"
                    className="w-full border-purple-300 text-purple-600 hover:bg-purple-50 dark:border-purple-700 dark:text-purple-400 dark:hover:bg-purple-900/20"
                  >
                    Générer
                  </Button>
                </div>
              </div>
            </Card>

            {/* Historique des rapports */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Rapports Générés
              </h2>
              {generatedReports.length === 0 ? (
                <div className="text-center py-8">
                  <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    Aucun rapport généré pour le moment
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                    Générez votre premier rapport ci-dessus
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {generatedReports.map((report) => (
                    <div key={report.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-gray-100">
                            {report.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Généré le {format(report.date, 'dd/MM/yyyy à HH:mm')}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => deleteReport(report.id)}
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-700 dark:hover:bg-red-900/20"
                          >
                            Supprimer
                          </Button>
                        </div>
                      </div>
                      
                      {/* Statistiques du rapport */}
                      <div className="space-y-4">
                        {/* 1. Résumé global */}
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center">
                            1. Résumé Global
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                              <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400 mx-auto mb-1" />
                              <p className="text-sm text-green-700 dark:text-green-300 font-medium">
                                {report.stats.income.toFixed(2)}€
                              </p>
                              <p className="text-xs text-green-600 dark:text-green-400">Revenus totaux</p>
                            </div>
                            <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                              <TrendingUp className="w-5 h-5 text-red-600 dark:text-red-400 mx-auto mb-1" />
                              <p className="text-sm text-red-700 dark:text-red-300 font-medium">
                                {report.stats.expenses.toFixed(2)}€
                              </p>
                              <p className="text-xs text-red-600 dark:text-red-400">Dépenses totales</p>
                            </div>
                            <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                              <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400 mx-auto mb-1" />
                              <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                                {report.stats.balance.toFixed(2)}€
                              </p>
                              <p className="text-xs text-blue-600 dark:text-blue-400">Solde final</p>
                            </div>
                            <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                              <PieChart className="w-5 h-5 text-purple-600 dark:text-purple-400 mx-auto mb-1" />
                              <p className="text-sm text-purple-700 dark:text-purple-300 font-medium">
                                {report.stats.savingsRate?.toFixed(1) || 0}%
                              </p>
                              <p className="text-xs text-purple-600 dark:text-purple-400">Taux d'épargne</p>
                            </div>
                          </div>
                        </div>

                        {/* 2. Analyse des revenus */}
                        {report.stats.incomeBreakdown && (
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center">
                              2. Analyse des Revenus
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                <p className="text-sm font-medium text-green-800 dark:text-green-200">Salaire principal</p>
                                <p className="text-lg font-bold text-green-700 dark:text-green-300">
                                  {report.stats.incomeBreakdown.salaire.toFixed(2)}€
                                </p>
                              </div>
                              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Revenus complémentaires</p>
                                <p className="text-lg font-bold text-blue-700 dark:text-blue-300">
                                  {report.stats.incomeBreakdown.complementaires.toFixed(2)}€
                                </p>
                              </div>
                              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                <p className="text-sm font-medium text-purple-800 dark:text-purple-200">Revenus exceptionnels</p>
                                <p className="text-lg font-bold text-purple-700 dark:text-purple-300">
                                  {report.stats.incomeBreakdown.exceptionnels.toFixed(2)}€
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* 3. Analyse des dépenses */}
                        {report.stats.expenseBreakdown && (
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center">
                              💸 3. Analyse des Dépenses
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                              <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                                <p className="text-sm font-medium text-orange-800 dark:text-orange-200">Dépenses fixes</p>
                                <p className="text-lg font-bold text-orange-700 dark:text-orange-300">
                                  {report.stats.expenseBreakdown.fixes.toFixed(2)}€
                                </p>
                                <p className="text-xs text-orange-600 dark:text-orange-400">
                                  {report.stats.expenses > 0 ? ((report.stats.expenseBreakdown.fixes / report.stats.expenses) * 100).toFixed(1) : 0}%
                                </p>
                              </div>
                              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Dépenses variables</p>
                                <p className="text-lg font-bold text-yellow-700 dark:text-yellow-300">
                                  {report.stats.expenseBreakdown.variables.toFixed(2)}€
                                </p>
                                <p className="text-xs text-yellow-600 dark:text-yellow-400">
                                  {report.stats.expenses > 0 ? ((report.stats.expenseBreakdown.variables / report.stats.expenses) * 100).toFixed(1) : 0}%
                                </p>
                              </div>
                              <div className="p-3 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
                                <p className="text-sm font-medium text-pink-800 dark:text-pink-200">Dépenses exceptionnelles</p>
                                <p className="text-lg font-bold text-pink-700 dark:text-pink-300">
                                  {report.stats.expenseBreakdown.exceptionnelles.toFixed(2)}€
                                </p>
                                <p className="text-xs text-pink-600 dark:text-pink-400">
                                  {report.stats.expenses > 0 ? ((report.stats.expenseBreakdown.exceptionnelles / report.stats.expenses) * 100).toFixed(1) : 0}%
                                </p>
                              </div>
                              <div className="p-3 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
                                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Autres</p>
                                <p className="text-lg font-bold text-gray-700 dark:text-gray-300">
                                  {report.stats.expenseBreakdown.autres.toFixed(2)}€
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                  {report.stats.expenses > 0 ? ((report.stats.expenseBreakdown.autres / report.stats.expenses) * 100).toFixed(1) : 0}%
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* 4. Top catégories */}
                        {report.stats.topCategories && report.stats.topCategories.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center">
                              4. Top Catégories de Dépenses
                            </h4>
                            <div className="space-y-2">
                              {report.stats.topCategories.slice(0, 5).map(([category, amount], index) => (
                                <div key={category} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                  <div className="flex items-center">
                                    <span className="w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xs font-medium mr-3">
                                      {index + 1}
                                    </span>
                                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{category}</span>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{amount.toFixed(2)}€</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      {report.stats.expenses > 0 ? ((amount / report.stats.expenses) * 100).toFixed(1) : 0}%
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 5. Breakdown mensuel (pour rapports annuels) */}
                        {report.stats.monthlyBreakdown && (
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center">
                              5. Évolution Mensuelle
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                              {report.stats.monthlyBreakdown.map((month, index) => (
                                <div key={index} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                  <h5 className="font-medium text-gray-900 dark:text-gray-100 text-sm mb-2">{month.month}</h5>
                                  <div className="space-y-1">
                                    <div className="flex justify-between text-xs">
                                      <span className="text-green-600 dark:text-green-400">Revenus:</span>
                                      <span className="text-green-700 dark:text-green-300 font-medium">{month.income.toFixed(0)}€</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                      <span className="text-red-600 dark:text-red-400">Dépenses:</span>
                                      <span className="text-red-700 dark:text-red-300 font-medium">{month.expenses.toFixed(0)}€</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                      <span className="text-blue-600 dark:text-blue-400">Solde:</span>
                                      <span className={`font-medium ${month.balance >= 0 ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                                        {month.balance.toFixed(0)}€
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 6. Analyse de budget (pour rapports de budget) */}
                        {report.stats.budgetAnalysis && (
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center">
                              6. Analyse de Performance du Budget
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <h5 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Utilisation du Budget</h5>
                                <div className="space-y-2">
                                  <div className="flex justify-between">
                                    <span className="text-sm text-blue-700 dark:text-blue-300">Budget total:</span>
                                    <span className="font-medium text-blue-800 dark:text-blue-200">{report.stats.budgetAnalysis.totalBudget.toFixed(2)}€</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-sm text-blue-700 dark:text-blue-300">Dépenses réelles:</span>
                                    <span className="font-medium text-blue-800 dark:text-blue-200">{report.stats.budgetAnalysis.actualSpending.toFixed(2)}€</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-sm text-blue-700 dark:text-blue-300">Taux d'utilisation:</span>
                                    <span className="font-medium text-blue-800 dark:text-blue-200">{report.stats.budgetAnalysis.budgetUtilization.toFixed(1)}%</span>
                                  </div>
                                </div>
                              </div>
                              <div className={`p-4 rounded-lg ${report.stats.budgetAnalysis.isOverBudget ? 'bg-red-50 dark:bg-red-900/20' : 'bg-green-50 dark:bg-green-900/20'}`}>
                                <h5 className={`font-medium mb-2 ${report.stats.budgetAnalysis.isOverBudget ? 'text-red-800 dark:text-red-200' : 'text-green-800 dark:text-green-200'}`}>
                                  {report.stats.budgetAnalysis.isOverBudget ? 'Dépassement de Budget' : 'Budget Respecté'}
                                </h5>
                                <div className="space-y-2">
                                  <div className="flex justify-between">
                                    <span className={`text-sm ${report.stats.budgetAnalysis.isOverBudget ? 'text-red-700 dark:text-red-300' : 'text-green-700 dark:text-green-300'}`}>
                                      {report.stats.budgetAnalysis.isOverBudget ? 'Dépassement:' : 'Reste à dépenser:'}
                                    </span>
                                    <span className={`font-medium ${report.stats.budgetAnalysis.isOverBudget ? 'text-red-800 dark:text-red-200' : 'text-green-800 dark:text-green-200'}`}>
                                      {report.stats.budgetAnalysis.isOverBudget ? 
                                        `+${report.stats.budgetAnalysis.overBudgetAmount.toFixed(2)}€` : 
                                        `${report.stats.budgetAnalysis.remainingBudget.toFixed(2)}€`
                                      }
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* 7. Recommandations */}
                        {report.stats.recommendations && report.stats.recommendations.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center">
                              {report.stats.monthlyBreakdown ? '6' : report.stats.budgetAnalysis ? '7' : '5'}. Recommandations et Perspectives
                            </h4>
                            <div className="space-y-3">
                              {report.stats.recommendations.map((rec, index) => (
                                <div key={index} className={`p-3 rounded-lg border-l-4 ${
                                  rec.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 border-green-400' :
                                  rec.type === 'warning' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-400' :
                                  'bg-blue-50 dark:bg-blue-900/20 border-blue-400'
                                }`}>
                                  <h5 className={`font-medium ${
                                    rec.type === 'success' ? 'text-green-800 dark:text-green-200' :
                                    rec.type === 'warning' ? 'text-yellow-800 dark:text-yellow-200' :
                                    'text-blue-800 dark:text-blue-200'
                                  }`}>
                                    {rec.title}
                                  </h5>
                                  <p className={`text-sm ${
                                    rec.type === 'success' ? 'text-green-700 dark:text-green-300' :
                                    rec.type === 'warning' ? 'text-yellow-700 dark:text-yellow-300' :
                                    'text-blue-700 dark:text-blue-300'
                                  }`}>
                                    {rec.message}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        ) : (
          // Version freemium - rapports limités
          <div className="space-y-6">
            <Card className="p-6">
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Rapports Financiers
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                  Créez des rapports personnalisés avec des analyses détaillées, des graphiques avancés et des insights financiers.
                </p>
                <div className="bg-gradient-to-r from-blue-50 to-emerald-50 dark:from-blue-900/20 dark:to-emerald-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-3">
                    Fonctionnalité Premium
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
                    Les rapports détaillés sont disponibles uniquement pour les utilisateurs Premium.
                  </p>
                  <ul className="text-sm text-blue-600 dark:text-blue-400 text-left space-y-1 mb-4">
                    <li>• Rapports mensuels et annuels</li>
                    <li>• Analyses détaillées par catégorie</li>
                    <li>• Graphiques avancés et interactifs</li>
                    <li>• Export PDF professionnel</li>
                  </ul>
                  <p className="text-xs text-blue-500 dark:text-blue-400">
                    Version Gratuite : Utilisez l'export CSV dans la section Export pour vos données
                  </p>
                </div>
                <div className="mt-6">
                  <Button
                    onClick={() => upgradeToPremium(false)}
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700"
                  >
                    <Crown className="w-5 h-5 mr-2" />
                    Commencer votre essai gratuit
                  </Button>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Puis 9.99€/mois. Annulez à tout moment.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
