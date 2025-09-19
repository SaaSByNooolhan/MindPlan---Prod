import React, { useState, useEffect } from 'react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { 
  Plus, 
  Target, 
  TrendingUp, 
  DollarSign,
  Calendar,
  Edit3, 
  Trash2,
  CheckCircle,
  Clock,
  AlertTriangle,
  Pause,
  Play,
  Trophy,
  PiggyBank,
  CreditCard,
  GraduationCap,
  Home,
  Car,
  Heart
} from 'lucide-react'
import { useAuthContext } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { formatCurrency } from '../../lib/utils'
import { format, differenceInDays, isAfter, isBefore } from 'date-fns'
import { fr } from 'date-fns/locale'

interface FinancialGoal {
  id: string
  user_id: string
  title: string
  description?: string
  target_amount: number
  current_amount: number
  currency: string
  target_date?: string
  category: 'savings' | 'debt_payment' | 'investment' | 'purchase' | 'emergency_fund' | 'retirement' | 'education' | 'other'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'active' | 'completed' | 'paused' | 'cancelled'
  color: string
  is_public: boolean
  created_at: string
  updated_at: string
}

const goalCategories = {
  savings: { label: 'Épargne', icon: PiggyBank, color: 'bg-green-500' },
  debt_payment: { label: 'Remboursement', icon: CreditCard, color: 'bg-red-500' },
  investment: { label: 'Investissement', icon: TrendingUp, color: 'bg-blue-500' },
  purchase: { label: 'Achat', icon: Home, color: 'bg-purple-500' },
  emergency_fund: { label: 'Urgence', icon: AlertTriangle, color: 'bg-orange-500' },
  retirement: { label: 'Retraite', icon: Trophy, color: 'bg-yellow-500' },
  education: { label: 'Éducation', icon: GraduationCap, color: 'bg-indigo-500' },
  other: { label: 'Autre', icon: Target, color: 'bg-gray-500' }
}

const priorityColors = {
  low: 'text-gray-600 bg-gray-100 dark:bg-gray-800',
  medium: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20',
  high: 'text-orange-600 bg-orange-100 dark:bg-orange-900/20',
  urgent: 'text-red-600 bg-red-100 dark:bg-red-900/20'
}

export const FinancialGoals: React.FC = () => {
  const { user } = useAuthContext()
  const [goals, setGoals] = useState<FinancialGoal[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingGoal, setEditingGoal] = useState<FinancialGoal | null>(null)
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'paused'>('all')
  
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    target_amount: '',
    current_amount: '',
    target_date: '',
    category: 'savings' as FinancialGoal['category'],
    priority: 'medium' as FinancialGoal['priority'],
    color: '#3B82F6'
  })

  const colors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6B7280'
  ]

  useEffect(() => {
    if (user) {
      loadGoals()
    }
  }, [user])

  const loadGoals = async () => {
    if (!user) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('financial_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading goals:', error)
      } else {
        setGoals(data || [])
      }
    } catch (error) {
      console.error('Error in loadGoals:', error)
    } finally {
      setLoading(false)
    }
  }

  const addGoal = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    try {
      const { error } = await supabase
        .from('financial_goals')
        .insert({
          user_id: user.id,
          title: newGoal.title,
          description: newGoal.description || null,
          target_amount: parseFloat(newGoal.target_amount),
          current_amount: parseFloat(newGoal.current_amount) || 0,
          target_date: newGoal.target_date || null,
          category: newGoal.category,
          priority: newGoal.priority,
          color: newGoal.color
        })

      if (error) {
        console.error('Error adding goal:', error)
        alert('Erreur lors de l\'ajout de l\'objectif')
      } else {
        setNewGoal({
          title: '',
          description: '',
          target_amount: '',
          current_amount: '',
          target_date: '',
          category: 'savings',
          priority: 'medium',
          color: '#3B82F6'
        })
        setShowAddForm(false)
        loadGoals()
      }
    } catch (error) {
      console.error('Error in addGoal:', error)
      alert('Erreur lors de l\'ajout de l\'objectif')
    }
  }

  const updateGoal = async (goal: FinancialGoal) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('financial_goals')
        .update({
          title: goal.title,
          description: goal.description,
          target_amount: goal.target_amount,
          current_amount: goal.current_amount,
          target_date: goal.target_date,
          category: goal.category,
          priority: goal.priority,
          status: goal.status,
          color: goal.color,
          updated_at: new Date().toISOString()
        })
        .eq('id', goal.id)

      if (error) {
        console.error('Error updating goal:', error)
        alert('Erreur lors de la mise à jour de l\'objectif')
      } else {
        setGoals(goals.map(g => g.id === goal.id ? goal : g))
        setEditingGoal(null)
      }
    } catch (error) {
      console.error('Error in updateGoal:', error)
      alert('Erreur lors de la mise à jour de l\'objectif')
    }
  }

  const deleteGoal = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet objectif ?')) return

    try {
      const { error } = await supabase
        .from('financial_goals')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting goal:', error)
        alert('Erreur lors de la suppression de l\'objectif')
      } else {
        setGoals(goals.filter(g => g.id !== id))
      }
    } catch (error) {
      console.error('Error in deleteGoal:', error)
      alert('Erreur lors de la suppression de l\'objectif')
    }
  }

  const updateGoalProgress = async (goalId: string, newAmount: number) => {
    const goal = goals.find(g => g.id === goalId)
    if (!goal) return

    const updatedGoal = {
      ...goal,
      current_amount: newAmount,
      status: newAmount >= goal.target_amount ? 'completed' as const : goal.status
    }

    await updateGoal(updatedGoal)
  }

  const getGoalProgress = (goal: FinancialGoal) => {
    return Math.min((goal.current_amount / goal.target_amount) * 100, 100)
  }

  const getGoalStatus = (goal: FinancialGoal) => {
    const progress = getGoalProgress(goal)
    const now = new Date()
    const targetDate = goal.target_date ? new Date(goal.target_date) : null

    if (goal.status === 'completed') {
      return { status: 'completed', color: 'text-green-600', bgColor: 'bg-green-50', icon: CheckCircle }
    }

    if (goal.status === 'paused') {
      return { status: 'paused', color: 'text-yellow-600', bgColor: 'bg-yellow-50', icon: Pause }
    }

    if (targetDate && isBefore(targetDate, now) && progress < 100) {
      return { status: 'overdue', color: 'text-red-600', bgColor: 'bg-red-50', icon: AlertTriangle }
    }

    if (progress >= 100) {
      return { status: 'completed', color: 'text-green-600', bgColor: 'bg-green-50', icon: CheckCircle }
    }

    if (targetDate && differenceInDays(targetDate, now) <= 30) {
      return { status: 'urgent', color: 'text-orange-600', bgColor: 'bg-orange-50', icon: Clock }
    }

    return { status: 'active', color: 'text-blue-600', bgColor: 'bg-blue-50', icon: Target }
  }

  const getFilteredGoals = () => {
    if (filter === 'all') return goals
    return goals.filter(goal => goal.status === filter)
  }

  const getTotalTargetAmount = () => {
    return goals.filter(g => g.status !== 'cancelled').reduce((sum, goal) => sum + goal.target_amount, 0)
  }

  const getTotalCurrentAmount = () => {
    return goals.filter(g => g.status !== 'cancelled').reduce((sum, goal) => sum + goal.current_amount, 0)
  }

  const getCompletedGoals = () => {
    return goals.filter(g => g.status === 'completed').length
  }

  // Pas d'écran de chargement bloquant - affichage immédiat

  return (
    <div className="p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Objectifs Financiers
            </h1>
            <div className="flex items-center space-x-2">
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Planifiez et suivez vos objectifs
              </p>
              <span className="px-2 py-1 text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200 rounded-full font-medium">
                {goals.length} objectif{goals.length > 1 ? 's' : ''}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous</option>
              <option value="active">Actifs</option>
              <option value="completed">Terminés</option>
              <option value="paused">En pause</option>
            </select>
            <Button onClick={() => setShowAddForm(true)} className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Nouvel Objectif
            </Button>
          </div>
        </div>

        {/* Vue d'ensemble */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Objectifs</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {goals.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Terminés</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {getCompletedGoals()}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Objectif Total</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {formatCurrency(getTotalTargetAmount())}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Épargné</p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {formatCurrency(getTotalCurrentAmount())}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center">
                <PiggyBank className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </Card>
        </div>

        {/* Formulaire d'ajout */}
        {showAddForm && (
          <Card className="p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
              Nouvel Objectif
            </h2>
            <form onSubmit={addGoal} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Titre de l'objectif
                  </label>
                  <Input
                    value={newGoal.title}
                    onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                    placeholder="ex: Achat d'une voiture"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Catégorie
                  </label>
                  <select
                    value={newGoal.category}
                    onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value as FinancialGoal['category'] })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    {Object.entries(goalCategories).map(([key, category]) => (
                      <option key={key} value={key}>{category.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Montant cible (€)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newGoal.target_amount}
                    onChange={(e) => setNewGoal({ ...newGoal, target_amount: e.target.value })}
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Montant actuel (€)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newGoal.current_amount}
                    onChange={(e) => setNewGoal({ ...newGoal, current_amount: e.target.value })}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date cible
                  </label>
                  <Input
                    type="date"
                    value={newGoal.target_date}
                    onChange={(e) => setNewGoal({ ...newGoal, target_date: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Priorité
                  </label>
                  <select
                    value={newGoal.priority}
                    onChange={(e) => setNewGoal({ ...newGoal, priority: e.target.value as FinancialGoal['priority'] })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Faible</option>
                    <option value="medium">Moyenne</option>
                    <option value="high">Élevée</option>
                    <option value="urgent">Urgente</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description (optionnel)
                </label>
                <textarea
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Décrivez votre objectif..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Couleur
                </label>
                <div className="flex gap-2">
                  {colors.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewGoal({ ...newGoal, color })}
                      className={`w-8 h-8 rounded-full border-2 ${
                        newGoal.color === color ? 'border-gray-900 dark:border-white' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1 sm:flex-none">
                  Créer l'Objectif
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 sm:flex-none"
                >
                  Annuler
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Liste des objectifs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {getFilteredGoals().map((goal) => {
            const category = goalCategories[goal.category]
            const CategoryIcon = category.icon
            const progress = getGoalProgress(goal)
            const status = getGoalStatus(goal)
            const StatusIcon = status.icon

            return (
              <Card key={goal.id} className="p-6 relative overflow-hidden">
                <div 
                  className="absolute top-0 left-0 w-full h-1"
                  style={{ backgroundColor: goal.color }}
                />
                
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white"
                      style={{ backgroundColor: goal.color }}
                    >
                      <CategoryIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {goal.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {category.label}
                      </p>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${priorityColors[goal.priority]}`}>
                        {goal.priority === 'low' ? 'Faible' :
                         goal.priority === 'medium' ? 'Moyenne' :
                         goal.priority === 'high' ? 'Élevée' : 'Urgente'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingGoal(goal)}
                    >
                      <Edit3 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteGoal(goal.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {goal.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {goal.description}
                  </p>
                )}

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Progression</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {progress.toFixed(1)}%
                    </span>
                  </div>

                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${progress}%`,
                        backgroundColor: goal.color
                      }}
                    />
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Actuel</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {formatCurrency(goal.current_amount)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Objectif</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {formatCurrency(goal.target_amount)}
                    </span>
                  </div>

                  {goal.target_date && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Date cible</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {format(new Date(goal.target_date), 'dd/MM/yyyy', { locale: fr })}
                      </span>
                    </div>
                  )}

                  <div className={`flex items-center space-x-2 p-3 rounded-lg ${status.bgColor} dark:bg-opacity-20`}>
                    <StatusIcon className={`w-5 h-5 ${status.color}`} />
                    <span className={`text-sm font-medium ${status.color}`}>
                      {status.status === 'completed' ? 'Terminé' :
                       status.status === 'paused' ? 'En pause' :
                       status.status === 'overdue' ? 'En retard' :
                       status.status === 'urgent' ? 'Urgent' : 'Actif'}
                    </span>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>

        {getFilteredGoals().length === 0 && (
          <Card className="p-12 text-center">
            <Target className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {filter === 'all' ? 'Aucun objectif défini' : `Aucun objectif ${filter}`}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {filter === 'all' 
                ? 'Créez votre premier objectif financier pour commencer à planifier votre avenir'
                : `Aucun objectif trouvé avec le statut "${filter}"`}
            </p>
            {filter === 'all' && (
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Créer un Objectif
              </Button>
            )}
          </Card>
        )}
      </div>
    </div>
  )
}
