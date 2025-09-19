import React, { useState, useEffect } from 'react'
import { Plus, TrendingUp, TrendingDown, DollarSign, Trash2, BarChart3, Wallet, CreditCard, RotateCcw, Repeat } from 'lucide-react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { supabase, Transaction } from '../../lib/supabase'
import { useAuthContext } from '../../contexts/AuthContext'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useSubscription } from '../../hooks/useSubscription'

interface FinanceTrackerProps {
  initialParams?: any
}

export const FinanceTracker: React.FC<FinanceTrackerProps> = ({ initialParams }) => {
  const { user } = useAuthContext()
  const { isPremium } = useSubscription()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [showSubscriptions, setShowSubscriptions] = useState(false)
  const [currentBalance, setCurrentBalance] = useState(0)
  
  const [newTransaction, setNewTransaction] = useState({
    title: '',
    amount: '',
    type: 'expense' as 'income' | 'expense',
    category: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    is_recurring: false,
    recurrence_type: 'monthly' as 'daily' | 'weekly' | 'monthly' | 'yearly',
    recurrence_interval: 1
  })
  const [monthlyBudget] = useState(1000)

  const categories = {
    expense: ['Nourriture', 'Transport', 'Logement', 'Loyer', 'Électricité', 'Internet', 'Études', 'Loisirs', 'Santé', 'Vêtements', 'Autres'],
    income: ['Bourse', 'Travail', 'Salaire', 'Parents', 'Autres']
  }


  useEffect(() => {
    if (user) {
      loadTransactions()
    }
  }, [user])

  useEffect(() => {
    if (initialParams?.openAddForm) {
      setShowAddForm(true)
    }
  }, [initialParams])

  const loadTransactions = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })

      if (error) {
        console.error('Error loading transactions:', error)
      } else {
        setTransactions(data || [])
        // Calculate current balance from all transactions
        const transactionBalance = data?.reduce((balance, t) => {
          return t.type === 'income' ? balance + t.amount : balance - t.amount
        }, 0) || 0
        
        setCurrentBalance(transactionBalance)
      }
    } catch (error) {
      console.error('Error in loadTransactions:', error)
    }
  }

  const addTransaction = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation plus robuste
    if (!user) {
      console.error('User not authenticated')
      return
    }
    
    if (!newTransaction.title.trim()) {
      alert('Veuillez saisir un titre pour la transaction')
      return
    }
    
    if (!newTransaction.amount || parseFloat(newTransaction.amount) <= 0) {
      alert('Veuillez saisir un montant valide')
      return
    }

    // Limitation Freemium : 5 transactions maximum
    if (!isPremium() && transactions.length >= 5) {
      alert('Limite Freemium atteinte ! Vous ne pouvez créer que 5 transactions maximum. Passez Premium pour des transactions illimitées.')
      return
    }
    
    if (!newTransaction.category) {
      alert('Veuillez sélectionner une catégorie')
      return
    }

    try {
      const transactionData = {
        user_id: user.id,
        title: newTransaction.title.trim(),
        amount: parseFloat(newTransaction.amount),
        type: newTransaction.type,
        category: newTransaction.category,
        date: newTransaction.date,
        is_recurring: newTransaction.is_recurring,
        recurrence_type: newTransaction.is_recurring ? newTransaction.recurrence_type : null,
        recurrence_interval: newTransaction.is_recurring ? newTransaction.recurrence_interval : null
      }

      const { error } = await supabase
        .from('transactions')
        .insert(transactionData)

      if (error) {
        console.error('Error adding transaction:', error)
        alert(`Erreur lors de l'ajout de la transaction: ${error.message}`)
      } else {
        // Reset form
        setNewTransaction({
          title: '',
          amount: '',
          type: 'expense',
          category: '',
          date: format(new Date(), 'yyyy-MM-dd'),
          is_recurring: false,
          recurrence_type: 'monthly',
          recurrence_interval: 1
        })
        setShowAddForm(false)
        // Add a small delay to ensure the transaction is committed to the database
        setTimeout(() => {
          loadTransactions()
        }, 200)
        console.log('Transaction ajoutée avec succès')
      }
    } catch (error) {
      console.error('Error in addTransaction:', error)
      alert('Une erreur est survenue lors de l\'ajout de la transaction')
    }
  }

  const deleteTransaction = async (transactionId: string) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', transactionId)
        .eq('user_id', user.id)

      if (error) {
        console.error('Error deleting transaction:', error)
      } else {
        loadTransactions()
      }
    } catch (error) {
      console.error('Error in deleteTransaction:', error)
    }
  }

  const resetAllTransactions = async () => {
    if (!user) return

    const confirmed = window.confirm(
      'Êtes-vous sûr de vouloir supprimer TOUTES vos transactions ? Cette action est irréversible.'
    )

    if (!confirmed) return

    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('user_id', user.id)

      if (error) {
        console.error('Error resetting transactions:', error)
        alert('Erreur lors de la suppression des transactions')
      } else {
        setTransactions([])
        setCurrentBalance(0)
        alert('Toutes vos transactions ont été supprimées')
      }
    } catch (error) {
      console.error('Error in resetAllTransactions:', error)
      alert('Une erreur est survenue lors de la suppression')
    }
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Finances</h1>
          </div>
          <div className="flex items-center space-x-2">
            <p className="text-gray-600 dark:text-gray-400">
              Suivez vos dépenses et revenus
            </p>
            <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-full font-medium">
              Toutes les transactions
            </span>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button onClick={() => setShowSubscriptions(!showSubscriptions)} className="w-full sm:w-auto">
            <CreditCard className="w-4 h-4 mr-2" />
            {showSubscriptions ? 'Masquer' : 'Abonnements'}
          </Button>
          <Button onClick={() => setShowAddForm(true)} className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Transaction
          </Button>
          {transactions.length > 0 && (
            <Button 
              onClick={resetAllTransactions} 
              variant="outline" 
              className="w-full sm:w-auto border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          )}
        </div>
      </div>

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
                {currentBalance.toFixed(2)}€
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              Basé sur toutes vos transactions
            </p>
          </div>
        </div>
      </Card>


      {/* Recurring Transactions Section */}
      {showSubscriptions && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Transactions récurrentes</h3>
          <div className="space-y-3">
            {transactions.filter(t => t.is_recurring).map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${transaction.type === 'income' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                    <Repeat className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">{transaction.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{transaction.category}</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                      🔄 {transaction.recurrence_interval === 1 ? (
                        <>
                          {transaction.recurrence_type === 'daily' && 'Tous les jours'}
                          {transaction.recurrence_type === 'weekly' && 'Toutes les semaines'}
                          {transaction.recurrence_type === 'monthly' && 'Tous les mois'}
                          {transaction.recurrence_type === 'yearly' && 'Tous les ans'}
                        </>
                      ) : (
                        <>
                          Tous les {transaction.recurrence_interval} {
                            transaction.recurrence_type === 'daily' && 'jours'
                          }{
                            transaction.recurrence_type === 'weekly' && 'semaines'
                          }{
                            transaction.recurrence_type === 'monthly' && 'mois'
                          }{
                            transaction.recurrence_type === 'yearly' && 'ans'
                          }
                        </>
                      )}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${transaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {transaction.type === 'income' ? '+' : '-'}{transaction.amount.toFixed(2)}€
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {format(parseISO(transaction.date), 'dd/MM/yyyy', { locale: fr })}
                  </p>
                </div>
              </div>
            ))}
            
            {transactions.filter(t => t.is_recurring).length === 0 && (
              <div className="text-center py-8">
                <Repeat className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">Aucune transaction récurrente</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Add Transaction Form */}
      {showAddForm && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Nouvelle transaction</h3>
          <form onSubmit={addTransaction} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Titre"
                value={newTransaction.title}
                onChange={(e) => setNewTransaction({ ...newTransaction, title: e.target.value })}
                placeholder="Titre de la transaction"
                required
              />
              
              <Input
                label="Montant"
                type="number"
                step="0.01"
                value={newTransaction.amount}
                onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                placeholder="0.00"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type
                </label>
                <select
                  value={newTransaction.type}
                  onChange={(e) => setNewTransaction({ ...newTransaction, type: e.target.value as any })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500"
                >
                  <option value="expense">Dépense</option>
                  <option value="income">Revenu</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Récurrent
                </label>
                <select
                  value={newTransaction.is_recurring ? 'true' : 'false'}
                  onChange={(e) => setNewTransaction({ ...newTransaction, is_recurring: e.target.value === 'true' })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500"
                >
                  <option value="false">Non</option>
                  <option value="true">Oui</option>
                </select>
              </div>

              {newTransaction.is_recurring && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Type de récurrence
                    </label>
                    <select
                      value={newTransaction.recurrence_type}
                      onChange={(e) => setNewTransaction({ ...newTransaction, recurrence_type: e.target.value as any })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="daily">Quotidien</option>
                      <option value="weekly">Hebdomadaire</option>
                      <option value="monthly">Mensuel</option>
                      <option value="yearly">Annuel</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Intervalle
                    </label>
                    <Input
                      type="number"
                      min="1"
                      value={newTransaction.recurrence_interval}
                      onChange={(e) => setNewTransaction({ ...newTransaction, recurrence_interval: parseInt(e.target.value) || 1 })}
                      placeholder="1"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Tous les {newTransaction.recurrence_interval} {
                        newTransaction.recurrence_type === 'daily' && 'jours'
                      }{
                        newTransaction.recurrence_type === 'weekly' && 'semaines'
                      }{
                        newTransaction.recurrence_type === 'monthly' && 'mois'
                      }{
                        newTransaction.recurrence_type === 'yearly' && 'ans'
                      }
                    </p>
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Catégorie
                </label>
                <select
                  value={newTransaction.category}
                  onChange={(e) => setNewTransaction({ ...newTransaction, category: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500"
                  required
                >
                  <option value="">Sélectionner</option>
                  {categories[newTransaction.type].map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <Input
                label="Date"
                type="date"
                value={newTransaction.date}
                onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
                required
              />
            </div>


            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <Button type="submit" className="w-full sm:w-auto">Ajouter</Button>
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => setShowAddForm(false)}
                className="w-full sm:w-auto"
              >
                Annuler
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Recurring Transactions */}
      {transactions.filter(t => t.is_recurring).length > 0 && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Transactions récurrentes</h3>
          <div className="space-y-3">
            {transactions.filter(t => t.is_recurring).map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/30">
                    <span className="text-purple-600 dark:text-purple-400">↻</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{transaction.title}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{transaction.category}</p>
                    {transaction.is_recurring && (
                      <p className="text-xs text-blue-600 dark:text-blue-400">
                        Transaction récurrente
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className={`font-semibold ${transaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {transaction.type === 'income' ? '+' : '-'}{transaction.amount.toFixed(2)}€
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {transaction.type === 'income' ? 'Revenu' : 'Dépense'}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteTransaction(transaction.id)}
                    className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                    title="Supprimer cette transaction récurrente"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Transactions List */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Transactions récentes</h3>
        <div className="space-y-3">
          {transactions.slice(0, 10).map((transaction) => (
            <div key={transaction.id} className={`flex items-center justify-between p-3 rounded-lg ${transaction.is_recurring ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500' : 'bg-gray-50 dark:bg-gray-800'}`}>
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${transaction.type === 'income' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                  {transaction.is_recurring ? (
                    <Repeat className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  ) : transaction.type === 'income' ? (
                    <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
                  )}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <p className="font-medium text-gray-900 dark:text-gray-100">{transaction.title}</p>
                    {(transaction.is_recurring || transaction.title.includes('(Mensuel)') || 
                      transaction.title.includes('(Hebdomadaire)') || transaction.title.includes('(Annuel)') || 
                      transaction.title.includes('(Quotidien)')) && (
                      <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
                        🔄
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{transaction.category}</p>
                  {transaction.is_recurring && (
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                      🔄 {transaction.recurrence_interval === 1 ? (
                        <>
                          {transaction.recurrence_type === 'daily' && 'Tous les jours'}
                          {transaction.recurrence_type === 'weekly' && 'Toutes les semaines'}
                          {transaction.recurrence_type === 'monthly' && 'Tous les mois'}
                          {transaction.recurrence_type === 'yearly' && 'Tous les ans'}
                        </>
                      ) : (
                        <>
                          Tous les {transaction.recurrence_interval} {
                            transaction.recurrence_type === 'daily' && 'jours'
                          }{
                            transaction.recurrence_type === 'weekly' && 'semaines'
                          }{
                            transaction.recurrence_type === 'monthly' && 'mois'
                          }{
                            transaction.recurrence_type === 'yearly' && 'ans'
                          }
                        </>
                      )}
                    </p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className={`font-semibold ${transaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {transaction.type === 'income' ? '+' : '-'}{transaction.amount.toFixed(2)}€
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {format(parseISO(transaction.date), 'dd/MM/yyyy', { locale: fr })}
                </p>
              </div>
            </div>
          ))}
          
          {transactions.length === 0 && (
            <div className="text-center py-8">
              <DollarSign className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Aucune transaction</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}