import React from 'react'
import { Card } from '../ui/Card'
import { Transaction } from '../../lib/supabase'
import { format, startOfWeek, endOfWeek, eachDayOfInterval, subWeeks } from 'date-fns'
import { fr } from 'date-fns/locale'

interface FinanceChartProps {
  transactions?: Transaction[]
}

export const FinanceChart: React.FC<FinanceChartProps> = ({ transactions = [] }) => {
  // Get the last 7 days
  const endDate = new Date()
  const startDate = subWeeks(endDate, 1)
  const days = eachDayOfInterval({ start: startDate, end: endDate })

  // Calculate daily balances
  const dailyData = days.map(day => {
    const dayStart = new Date(day)
    dayStart.setHours(0, 0, 0, 0)
    const dayEnd = new Date(day)
    dayEnd.setHours(23, 59, 59, 999)

    const dayTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date)
      return transactionDate >= dayStart && transactionDate <= dayEnd
    })

    const dayIncome = dayTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
    
    const dayExpenses = dayTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)

    return {
      date: day,
      income: dayIncome,
      expenses: dayExpenses,
      balance: dayIncome - dayExpenses
    }
  })

  // Calculate max value for scaling
  const maxValue = Math.max(
    ...dailyData.map(d => Math.max(d.income, d.expenses)),
    100 // Minimum scale
  )

  // Calculate total income and expenses for the week
  const totalIncome = dailyData.reduce((sum, d) => sum + d.income, 0)
  const totalExpenses = dailyData.reduce((sum, d) => sum + d.expenses, 0)
  const weeklyBalance = totalIncome - totalExpenses

  return (
    <Card>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Finances - 7 derniers jours
        </h3>
        
        {/* Summary */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              +{totalIncome.toFixed(0)}€
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Revenus</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              -{totalExpenses.toFixed(0)}€
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Dépenses</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${weeklyBalance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {weeklyBalance >= 0 ? '+' : ''}{weeklyBalance.toFixed(0)}€
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Solde</div>
          </div>
        </div>

        {/* Simple Bar Chart */}
        <div className="space-y-2">
          {dailyData.map((day, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div className="w-12 text-xs text-gray-600 dark:text-gray-400">
                {format(day.date, 'dd/MM', { locale: fr })}
              </div>
              
              {/* Income Bar */}
              <div className="flex-1 flex items-center space-x-1">
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-4 relative">
                  {day.income > 0 && (
                    <div 
                      className="bg-green-500 h-4 rounded-full"
                      style={{ width: `${(day.income / maxValue) * 100}%` }}
                    />
                  )}
                </div>
                {day.income > 0 && (
                  <span className="text-xs text-green-600 dark:text-green-400 w-12 text-right">
                    +{day.income.toFixed(0)}€
                  </span>
                )}
              </div>
              
              {/* Expenses Bar */}
              <div className="flex-1 flex items-center space-x-1">
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-4 relative">
                  {day.expenses > 0 && (
                    <div 
                      className="bg-red-500 h-4 rounded-full"
                      style={{ width: `${(day.expenses / maxValue) * 100}%` }}
                    />
                  )}
                </div>
                {day.expenses > 0 && (
                  <span className="text-xs text-red-600 dark:text-red-400 w-12 text-right">
                    -{day.expenses.toFixed(0)}€
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center space-x-6 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Revenus</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Dépenses</span>
          </div>
        </div>
      </div>
    </Card>
  )
}

