import React, { useState, useEffect } from 'react'
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts'
import { Card } from '../ui/Card'
import { Transaction } from '../../lib/supabase'
import { useSubscription } from '../../hooks/useSubscription'
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { DollarSign, Calendar, Filter, Lock } from 'lucide-react'

interface ChartData {
  name: string
  value: number
  income?: number
  expense?: number
  balance?: number
}

interface LineData {
  date: string
  income: number
  expense: number
  balance: number
  transactions: Array<{
    title: string
    amount: number
    type: 'income' | 'expense'
    category: string
  }>
}

interface AdvancedStatsProps {
  transactions: Transaction[]
}

const COLORS = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#ff0000',
  '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'
]

export const AdvancedStats: React.FC<AdvancedStatsProps> = ({ transactions }) => {
  const { isPremium } = useSubscription()
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'quarter' | 'year'>('month')
  const [selectedMonthOffset, setSelectedMonthOffset] = useState(0)
  const [selectedChart, setSelectedChart] = useState<'pie' | 'line'>('pie')
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [lineData, setLineData] = useState<LineData[]>([])

  useEffect(() => {
    generateChartData()
  }, [transactions, selectedPeriod, selectedMonthOffset])

  const generateChartData = () => {
    const now = new Date()
    let startDate: Date
    let endDate: Date

    switch (selectedPeriod) {
      case 'month':
        startDate = startOfMonth(subMonths(now, selectedMonthOffset))
        endDate = endOfMonth(subMonths(now, selectedMonthOffset))
        break
      case 'quarter':
        startDate = startOfMonth(subMonths(now, selectedMonthOffset + 2))
        endDate = endOfMonth(subMonths(now, selectedMonthOffset))
        break
      case 'year':
        startDate = startOfYear(subMonths(now, selectedMonthOffset * 12))
        endDate = endOfYear(subMonths(now, selectedMonthOffset * 12))
        break
    }

    const filteredTransactions = transactions.filter(t => {
      try {
        const transactionDate = parseISO(t.date)
        return transactionDate >= startDate && transactionDate <= endDate
      } catch (error) {
        return false
      }
    })

    // Generate category data for pie chart (expenses only)
    const categoryData = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount
        return acc
      }, {} as Record<string, number>)

    // Add recurring expenses to category data
    const recurringExpenses = 0 // No longer using separate subscriptions
    
    // Scale recurring amounts based on selected period
    let scaledRecurringExpenses = recurringExpenses
    
    if (selectedPeriod === 'quarter') {
      scaledRecurringExpenses = recurringExpenses * 3
    } else if (selectedPeriod === 'year') {
      scaledRecurringExpenses = recurringExpenses * 12
    }

    // Add recurring expenses to category data (we'll add them to a "Abonnements" category)
    if (scaledRecurringExpenses > 0) {
      categoryData['Abonnements'] = (categoryData['Abonnements'] || 0) + scaledRecurringExpenses
    }

    const pieData = Object.entries(categoryData).map(([name, value]) => ({
      name,
      value: parseFloat(value.toFixed(2))
    }))

    // Generate line chart data grouped by date
    const dailyData = filteredTransactions.reduce((acc, t) => {
      const dateKey = t.date
      if (!acc[dateKey]) {
        acc[dateKey] = { 
          income: 0, 
          expense: 0, 
          balance: 0,
          transactions: []
        }
      }
      
      if (t.type === 'income') {
        acc[dateKey].income += t.amount
      } else {
        acc[dateKey].expense += t.amount
      }
      
      acc[dateKey].transactions.push({
        title: t.title,
        amount: t.amount,
        type: t.type,
        category: t.category
      })
      
      return acc
    }, {} as Record<string, { income: number; expense: number; balance: number; transactions: Array<{ title: string; amount: number; type: 'income' | 'expense'; category: string }> }>)

    // Calculate running balance and convert to array
    let runningBalance = 0
    const lineChartData: LineData[] = Object.entries(dailyData)
      .sort(([a], [b]) => a.localeCompare(b)) // Sort by date
      .map(([date, data]) => {
        runningBalance += data.income - data.expense
        
        return {
          date: format(parseISO(date), 'dd/MM', { locale: fr }),
          income: parseFloat(data.income.toFixed(2)),
          expense: parseFloat(data.expense.toFixed(2)),
          balance: parseFloat(runningBalance.toFixed(2)),
          transactions: data.transactions
        }
      })

    setChartData(pieData)
    setLineData(lineChartData)
  }

  const renderChart = () => {
    switch (selectedChart) {
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value}€`} />
            </PieChart>
          </ResponsiveContainer>
        )

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={lineData}>
              <XAxis 
                dataKey="date" 
                name="Date"
                label={{ value: 'Date', position: 'insideBottom', offset: -5 }}
              />
              <YAxis 
                name="Montant"
                label={{ value: 'Montant (€)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload
                    return (
                      <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-w-xs">
                        <p className="font-medium text-gray-900 dark:text-gray-100 mb-2">{`Date: ${label}`}</p>
                        
                        {data.transactions && data.transactions.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Transactions:</p>
                            {data.transactions.map((transaction: any, index: number) => (
                              <div key={index} className="flex justify-between items-center text-sm">
                                <span className={`${transaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                  {transaction.title}
                                </span>
                                <span className={`font-medium ${transaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                  {transaction.type === 'income' ? '+' : '-'}{transaction.amount}€
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-600">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Revenus:</span>
                            <span className="text-green-600 dark:text-green-400 font-medium">+{data.income}€</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Dépenses:</span>
                            <span className="text-red-600 dark:text-red-400 font-medium">-{data.expense}€</span>
                          </div>
                          <div className="flex justify-between text-sm font-medium">
                            <span className="text-gray-600 dark:text-gray-400">Solde:</span>
                            <span className={`${data.balance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                              {data.balance >= 0 ? '+' : ''}{data.balance}€
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Legend 
                verticalAlign="top" 
                height={36}
                iconType="line"
                wrapperStyle={{ paddingBottom: '10px' }}
              />
              <Line 
                type="monotone" 
                dataKey="income" 
                stroke="#82ca9d" 
                name="Revenus" 
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#82ca9d' }}
              />
              <Line 
                type="monotone" 
                dataKey="expense" 
                stroke="#ff7300" 
                name="Dépenses" 
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#ff7300' }}
              />
              <Line 
                type="monotone" 
                dataKey="balance" 
                stroke="#8884d8" 
                name="Solde" 
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 5, fill: '#8884d8' }}
              />
            </LineChart>
          </ResponsiveContainer>
        )

      default:
        return null
    }
  }

  const getChartTitle = () => {
    const getPeriodName = () => {
      const periodNames = {
        month: 'mois',
        quarter: 'trimestre',
        year: 'année'
      }
      
      if (selectedMonthOffset === 0) {
        return `Ce ${periodNames[selectedPeriod]}`
      } else if (selectedMonthOffset === 1) {
        return `Le ${periodNames[selectedPeriod]} précédent`
      } else {
        return `Il y a ${selectedMonthOffset} ${periodNames[selectedPeriod]}s`
      }
    }
    
    const chartNames = {
      pie: 'Répartition des dépenses par catégorie',
      line: 'Évolution des revenus, dépenses et solde'
    }

    return `${chartNames[selectedChart]} - ${getPeriodName()}`
  }

  // Protection Premium pour les analytics avancées
  if (!isPremium()) {
    return (
      <Card>
        <div className="text-center py-12">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-full">
              <Lock className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Analytics Financières Avancées
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Accédez à des graphiques détaillés, analyses de tendances et insights financiers
          </p>
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
            <p className="text-sm text-purple-700 dark:text-purple-300 font-medium">
              🔒 Fonctionnalité Premium
            </p>
            <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
              Passez Premium pour débloquer les analytics avancées
            </p>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {getChartTitle()}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Statistiques avancées pour analyser vos finances
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {/* Period Selector */}
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as any)}
              className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500"
            >
              <option value="month">Mois</option>
              <option value="quarter">Trimestre</option>
              <option value="year">Année</option>
            </select>
          </div>

          {/* Time Navigation */}
          {selectedChart === 'line' && (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setSelectedMonthOffset(selectedMonthOffset + 1)}
                className="px-2 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                title="Période précédente"
              >
                ←
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[80px] text-center">
                {selectedMonthOffset === 0 ? 'Actuel' : 
                 selectedMonthOffset === 1 ? 'Précédent' : 
                 `${selectedMonthOffset} périodes avant`}
              </span>
              <button
                onClick={() => setSelectedMonthOffset(Math.max(0, selectedMonthOffset - 1))}
                className="px-2 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={selectedMonthOffset === 0}
                title="Période suivante"
              >
                →
              </button>
            </div>
          )}

          {/* Chart Type Selector */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={selectedChart}
              onChange={(e) => setSelectedChart(e.target.value as any)}
              className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500"
            >
              <option value="pie">Camembert</option>
              <option value="line">Graphique en ligne</option>
            </select>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="w-full h-96">
        {chartData.length > 0 ? (
          renderChart()
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <DollarSign className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Aucune donnée disponible pour cette période</p>
            </div>
          </div>
        )}
      </div>

    </Card>
  )
}
