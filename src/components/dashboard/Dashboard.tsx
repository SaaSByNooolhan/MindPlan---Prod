import React, { useState, useEffect } from 'react'
import { Calendar, CheckSquare, DollarSign, Clock, AlertTriangle, Crown, Wallet } from 'lucide-react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { supabase, Task, Transaction } from '../../lib/supabase'
import { useAuthContext } from '../../contexts/AuthContext'
import { useSubscription } from '../../hooks/useSubscription'
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns'
import { fr } from 'date-fns/locale'
import { FinanceChart } from './FinanceChart'
import { TaskListSimple } from './TaskListSimple'
import { TrialStatus } from '../finance/TrialStatus'

interface DashboardStats {
  tasksCompleted: number
  tasksTotal: number
  weeklyExpenses: number
  monthlyBudget: number
  pomodoroSessions: number
  upcomingEvents: number
  currentBalance: number
}


interface DashboardProps {
  onNavigate: (section: string, params?: any) => void
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { user } = useAuthContext()
  const { isPremium } = useSubscription()
  const [stats, setStats] = useState<DashboardStats>({
    tasksCompleted: 0,
    tasksTotal: 0,
    weeklyExpenses: 0,
    monthlyBudget: 1000,
    pomodoroSessions: 0,
    upcomingEvents: 0,
    currentBalance: 0
  })
  const [currentTime, setCurrentTime] = useState(new Date())
  const [tasks, setTasks] = useState<Task[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])

  useEffect(() => {
    if (user) {
      loadDashboardStats()
    }
    
    // Update time every second
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => {
      clearInterval(timeInterval)
    }
  }, [user])

  const loadDashboardStats = async () => {
    if (!user) return

    const now = new Date()
    const weekStart = startOfWeek(now, { weekStartsOn: 1 })
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 })
    const monthStart = startOfMonth(now)
    const monthEnd = endOfMonth(now)

    try {
      // Get tasks stats
      const { data: tasksData } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)

      setTasks(tasksData || [])

      const tasksTotal = tasksData?.length || 0
      const tasksCompleted = tasksData?.filter(t => t.completed).length || 0

      // Get all transactions for balance calculation
      const { data: allTransactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)

      setTransactions(allTransactions || [])

      // Calculate current balance
      const currentBalance = allTransactions?.reduce((balance, t) => {
        return t.type === 'income' ? balance + t.amount : balance - t.amount
      }, 0) || 0

      // Get weekly expenses
      const weeklyExpenses = allTransactions
        ?.filter(t => t.type === 'expense' && 
          new Date(t.date) >= weekStart && 
          new Date(t.date) <= weekEnd)
        ?.reduce((sum, t) => sum + t.amount, 0) || 0

      // Get pomodoro sessions today
      const { data: pomodoros } = await supabase
        .from('pomodoro_sessions')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', new Date().toISOString().split('T')[0])

      const pomodoroSessions = pomodoros?.filter(p => p.completed).length || 0

      // Get upcoming events this week
      const { data: events } = await supabase
        .from('events')
        .select('*')
        .eq('user_id', user.id)
        .gte('start_time', now.toISOString())
        .lte('start_time', weekEnd.toISOString())

      const upcomingEvents = events?.length || 0

      setStats({
        tasksCompleted,
        tasksTotal,
        weeklyExpenses,
        monthlyBudget: 1000, // TODO: Get from user profile
        pomodoroSessions,
        upcomingEvents,
        currentBalance
      })
    } catch (error) {
      console.error('Error loading dashboard stats:', error)
    }
  }

  const completionRate = stats.tasksTotal > 0 ? (stats.tasksCompleted / stats.tasksTotal) * 100 : 0
  const budgetUsed = (stats.weeklyExpenses / (stats.monthlyBudget / 4)) * 100

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Bonjour !
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Voici un résumé de votre semaine
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
            {format(currentTime, 'HH:mm', { locale: fr })}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {format(currentTime, 'EEEE dd MMMM yyyy', { locale: fr })}
          </div>
        </div>
      </div>


      {/* Trial Status */}
      <TrialStatus />

      {/* Current Balance Card */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Solde Actuel
              </h3>
              <p className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400">
                {stats.currentBalance.toFixed(2)}€
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card hover>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tâches</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                {stats.tasksCompleted}/{stats.tasksTotal}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {completionRate.toFixed(0)}% complétées
              </p>
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-full">
              <CheckSquare className="w-6 h-6 text-black dark:text-white" />
            </div>
          </div>
        </Card>

        <Card hover>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Budget semaine</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                {stats.weeklyExpenses.toFixed(0)}€
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {budgetUsed.toFixed(0)}% utilisé
              </p>
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-full">
              <DollarSign className="w-6 h-6 text-black dark:text-white" />
            </div>
          </div>
        </Card>

        <Card hover>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pomodoros</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                {stats.pomodoroSessions}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Aujourd'hui
              </p>
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-full">
              <Clock className="w-6 h-6 text-black dark:text-white" />
            </div>
          </div>
        </Card>

        <Card hover>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Événements</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                {stats.upcomingEvents}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Cette semaine
              </p>
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-full">
              <Calendar className="w-6 h-6 text-black dark:text-white" />
            </div>
          </div>
        </Card>
      </div>


      {/* Alerts */}
      {budgetUsed > 80 && (
        <Card className="border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-black dark:text-white" />
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">Attention au budget !</h4>
              <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">
                Vous avez déjà utilisé {budgetUsed.toFixed(0)}% de votre budget hebdomadaire.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Charts and Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <FinanceChart transactions={transactions} />
        <TaskListSimple tasks={tasks} onNavigate={onNavigate} />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Actions rapides</h3>
          <div className="space-y-3">
            <button 
              onClick={() => onNavigate('tasks', { openAddForm: true })}
              className="w-full text-left p-3 rounded-lg bg-white dark:bg-gray-700 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="font-medium text-gray-900 dark:text-gray-100">Ajouter une tâche</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Créer une nouvelle tâche</div>
            </button>
            <button 
              onClick={() => onNavigate('finance')}
              className="w-full text-left p-3 rounded-lg bg-white dark:bg-gray-700 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="font-medium text-gray-900 dark:text-gray-100">Voir mes finances</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Accéder au suivi financier</div>
            </button>
            <button 
              onClick={() => onNavigate('finance', { openAddForm: true })}
              className="w-full text-left p-3 rounded-lg bg-white dark:bg-gray-700 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="font-medium text-gray-900 dark:text-gray-100">Nouvelle dépense</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Enregistrer une dépense</div>
            </button>
            <button 
              onClick={() => onNavigate('pomodoro')}
              className="w-full text-left p-3 rounded-lg bg-white dark:bg-gray-700 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="font-medium text-gray-900 dark:text-gray-100">Session Pomodoro</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Démarrer un cycle de travail</div>
            </button>
            <button 
              onClick={() => onNavigate('calendar')}
              className="w-full text-left p-3 rounded-lg bg-white dark:bg-gray-700 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="font-medium text-gray-900 dark:text-gray-100">Nouvel événement</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Ajouter un événement à l'agenda</div>
            </button>
          </div>
        </Card>

        <Card className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Prochains événements</h3>
          <div className="space-y-3">
            {stats.upcomingEvents > 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                <p className="text-gray-600 dark:text-gray-400">Chargement des événements...</p>
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                <p className="text-gray-600 dark:text-gray-400">Aucun événement planifié</p>
                <p className="text-sm text-gray-500 dark:text-gray-500">Ajoutez un événement à votre agenda</p>
              </div>
            )}
          </div>
        </Card>

      </div>
    </div>
  )
}