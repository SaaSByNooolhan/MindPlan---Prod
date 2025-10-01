import React, { useState, useEffect } from 'react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { 
  Plus, 
  Target, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Edit3, 
  Trash2,
  DollarSign,
  Calendar,
  BarChart3,
  PiggyBank,
  Wallet,
  CreditCard
} from 'lucide-react'
import { useAuthContext } from '../../contexts/AuthContext'
import { supabase, Transaction, Budget } from '../../lib/supabase'
import { format, startOfMonth, endOfMonth, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'


export const Budgets: React.FC = () => {
  const { user } = useAuthContext()
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null)
  
  const [newBudget, setNewBudget] = useState({
    category: '',
    amount: '',
    period: 'monthly' as 'monthly' | 'weekly' | 'yearly'
  })

  const categories = [
    'Nourriture', 'Transport', 'Logement', 'Loyer', 'Électricité', 
    'Internet', 'Études', 'Loisirs', 'Santé', 'Vêtements', 'Autres'
  ]

  useEffect(() => {
    if (user) {
      loadBudgets()
      loadTransactions()
    }
  }, [user])

  const loadBudgets = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {

        // Si la table n'existe pas, on utilise des données de démonstration
        if (error.message.includes('relation "budgets" does not exist')) {
          setBudgets([])
        }
      } else {
        setBudgets(data || [])
      }
    } catch (error) {

      setBudgets([])
    } finally {
      setLoading(false)
    }
  }

  const loadTransactions = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('type', 'expense')
        .order('date', { ascending: false })

      if (error) {

      } else {
        setTransactions(data || [])
      }
    } catch (error) {

    }
  }

  const calculateSpent = (category: string, period: 'monthly' | 'weekly' | 'yearly') => {
    const now = new Date()
    let startDate: Date
    let endDate: Date

    switch (period) {
      case 'monthly':
        startDate = startOfMonth(now)
        endDate = endOfMonth(now)
        break
      case 'weekly':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        endDate = now
        break
      case 'yearly':
        startDate = new Date(now.getFullYear(), 0, 1)
        endDate = new Date(now.getFullYear(), 11, 31)
        break
    }

    return transactions
      .filter(t => {
        try {
          const transactionDate = parseISO(t.date)
          return t.category === category && 
                 transactionDate >= startDate && 
                 transactionDate <= endDate
        } catch (error) {
          return false
        }
      })
      .reduce((sum, t) => sum + t.amount, 0)
  }

  const addBudget = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) return
    
    if (!newBudget.category || !newBudget.amount || parseFloat(newBudget.amount) <= 0) {
      alert('Veuillez remplir tous les champs correctement')
      return
    }

    try {
      const budgetData = {
        user_id: user.id,
        category: newBudget.category,
        amount: parseFloat(newBudget.amount),
        spent: 0,
        period: newBudget.period
      }

      const { data, error } = await supabase
        .from('budgets')
        .insert([budgetData])
        .select()

      if (error) {

        alert(`Erreur lors de l'ajout du budget: ${error.message}`)
      } else {
        setBudgets([data[0], ...budgets])
        setNewBudget({ category: '', amount: '', period: 'monthly' })
        setShowAddForm(false)
      }
    } catch (error) {

      alert('Erreur lors de l\'ajout du budget')
    }
  }

  const updateBudget = async (budget: Budget) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('budgets')
        .update({
          category: budget.category,
          amount: budget.amount,
          period: budget.period,
          updated_at: new Date().toISOString()
        })
        .eq('id', budget.id)

      if (error) {

        alert('Erreur lors de la mise à jour du budget')
      } else {
        setBudgets(budgets.map(b => b.id === budget.id ? budget : b))
        setEditingBudget(null)
      }
    } catch (error) {

      alert('Erreur lors de la mise à jour du budget')
    }
  }

  const deleteBudget = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce budget ?')) return

    try {
      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', id)

      if (error) {

        alert('Erreur lors de la suppression du budget')
      } else {
        setBudgets(budgets.filter(b => b.id !== id))
      }
    } catch (error) {

      alert('Erreur lors de la suppression du budget')
    }
  }

  const getBudgetStatus = (budget: Budget) => {
    const spent = calculateSpent(budget.category, budget.period)
    const percentage = (spent / budget.amount) * 100

    if (percentage >= 100) {
      return { status: 'exceeded', color: 'text-red-600', bgColor: 'bg-red-50', icon: AlertTriangle }
    } else if (percentage >= 80) {
      return { status: 'warning', color: 'text-yellow-600', bgColor: 'bg-yellow-50', icon: AlertTriangle }
    } else if (percentage >= 50) {
      return { status: 'moderate', color: 'text-blue-600', bgColor: 'bg-blue-50', icon: TrendingUp }
    } else {
      return { status: 'good', color: 'text-emerald-600', bgColor: 'bg-emerald-50', icon: CheckCircle }
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  const getTotalBudget = () => {
    return budgets.reduce((sum, budget) => sum + budget.amount, 0)
  }

  const getTotalSpent = () => {
    return budgets.reduce((sum, budget) => {
      return sum + calculateSpent(budget.category, budget.period)
    }, 0)
  }

  const getBudgetInsights = () => {
    const totalBudget = getTotalBudget()
    const totalSpent = getTotalSpent()
    const remaining = totalBudget - totalSpent
    const percentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0

    return {
      totalBudget,
      totalSpent,
      remaining,
      percentage
    }
  }

  // Pas d'écran de chargement bloquant - affichage immédiat

  const insights = getBudgetInsights()

  return (
    <div className="p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
            Gestion des Budgets
          </h1>
          <Button onClick={() => setShowAddForm(true)} className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Nouveau Budget
          </Button>
        </div>

          {/* Vue d'ensemble des budgets */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Budget Total</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {formatCurrency(insights.totalBudget)}
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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Dépensé</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {formatCurrency(insights.totalSpent)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                  <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Restant</p>
                  <p className={`text-2xl font-bold ${insights.remaining >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                    {formatCurrency(insights.remaining)}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${insights.remaining >= 0 ? 'bg-emerald-100 dark:bg-emerald-900/20' : 'bg-red-100 dark:bg-red-900/20'}`}>
                  <Wallet className={`w-6 h-6 ${insights.remaining >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`} />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Utilisé</p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {insights.percentage.toFixed(1)}%
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </Card>
          </div>

          {/* Formulaire d'ajout de budget */}
          {showAddForm && (
            <Card className="p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
                Nouveau Budget
              </h2>
              <form onSubmit={addBudget} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Catégorie
                    </label>
                    <select
                      value={newBudget.category}
                      onChange={(e) => setNewBudget({ ...newBudget, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Sélectionner une catégorie</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Montant (€)
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={newBudget.amount}
                      onChange={(e) => setNewBudget({ ...newBudget, amount: e.target.value })}
                      placeholder="0.00"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Période
                    </label>
                    <select
                      value={newBudget.period}
                      onChange={(e) => setNewBudget({ ...newBudget, period: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="monthly">Mensuel</option>
                      <option value="weekly">Hebdomadaire</option>
                      <option value="yearly">Annuel</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" className="flex-1 sm:flex-none">
                    Créer le Budget
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

          {/* Formulaire de modification de budget */}
          {editingBudget && (
            <Card className="p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
                Modifier le Budget - {editingBudget.category}
              </h2>
              <form onSubmit={(e) => {
                e.preventDefault()
                updateBudget(editingBudget)
              }} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Catégorie
                    </label>
                    <select
                      value={editingBudget.category}
                      onChange={(e) => setEditingBudget({ ...editingBudget, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Montant (€)
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={editingBudget.amount}
                      onChange={(e) => setEditingBudget({ ...editingBudget, amount: parseFloat(e.target.value) || 0 })}
                      placeholder="0.00"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Période
                    </label>
                    <select
                      value={editingBudget.period}
                      onChange={(e) => setEditingBudget({ ...editingBudget, period: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="monthly">Mensuel</option>
                      <option value="weekly">Hebdomadaire</option>
                      <option value="yearly">Annuel</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" className="flex-1 sm:flex-none">
                    Sauvegarder les Modifications
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setEditingBudget(null)}
                    className="flex-1 sm:flex-none"
                  >
                    Annuler
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* Liste des budgets */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {budgets.map((budget) => {
              const spent = calculateSpent(budget.category, budget.period)
              const percentage = (spent / budget.amount) * 100
              const status = getBudgetStatus(budget)
              const StatusIcon = status.icon

              return (
                <Card key={budget.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {budget.category}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {budget.period === 'monthly' ? 'Mensuel' : 
                         budget.period === 'weekly' ? 'Hebdomadaire' : 'Annuel'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingBudget(budget)}
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteBudget(budget.id!)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Budget</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {formatCurrency(budget.amount)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Dépensé</span>
                      <span className="font-semibold text-red-600 dark:text-red-400">
                        {formatCurrency(spent)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Restant</span>
                      <span className={`font-semibold ${(budget.amount - spent) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                        {formatCurrency(budget.amount - spent)}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Progression</span>
                        <span className={`text-sm font-medium ${status.color}`}>
                          {percentage.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            percentage >= 100 ? 'bg-red-500' :
                            percentage >= 80 ? 'bg-yellow-500' :
                            percentage >= 50 ? 'bg-blue-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className={`flex items-center space-x-2 p-3 rounded-lg ${status.bgColor} dark:bg-opacity-20`}>
                      <StatusIcon className={`w-5 h-5 ${status.color}`} />
                      <span className={`text-sm font-medium ${status.color}`}>
                        {percentage >= 100 ? 'Budget dépassé' :
                         percentage >= 80 ? 'Attention' :
                         percentage >= 50 ? 'Modéré' : 'En bonne voie'}
                      </span>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>

          {budgets.length === 0 && (
            <Card className="p-12 text-center">
              <PiggyBank className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Aucun budget défini
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Créez votre premier budget pour commencer à suivre vos dépenses
              </p>
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Créer un Budget
              </Button>
            </Card>
          )}
      </div>
    </div>
  )
}
