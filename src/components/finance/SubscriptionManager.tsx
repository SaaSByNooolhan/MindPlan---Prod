import React, { useState, useEffect } from 'react'
import { CreditCard, Plus, Trash2, DollarSign } from 'lucide-react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { supabase, Subscription, UserSubscription } from '../../lib/supabase'
import { useAuthContext } from '../../contexts/AuthContext'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'



interface SubscriptionManagerProps {
  onSubscriptionAdded?: () => void
  onSubscriptionDeleted?: () => void
}

export const SubscriptionManager: React.FC<SubscriptionManagerProps> = ({ onSubscriptionAdded, onSubscriptionDeleted }) => {
  const { user } = useAuthContext()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [userSubscriptions, setUserSubscriptions] = useState<UserSubscription[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [newSubscription, setNewSubscription] = useState({
    title: '',
    amount: '',
    category: '',
    type: 'expense' as 'income' | 'expense',
    recurrence_type: 'monthly' as 'daily' | 'weekly' | 'monthly' | 'yearly',
    recurrence_interval: 1,
    next_occurrence: format(new Date(), 'yyyy-MM-dd'),
    end_date: ''
  })

  const categories = {
    income: ['Salaire', 'Bourse', 'Travail', 'Parents', 'Pension', 'Dividendes', 'Autres revenus'],
    expense: ['Loyer', 'Électricité', 'Internet', 'Téléphone', 'Assurance', 'Gym', 'Netflix', 'Spotify', 'Amazon Prime', 'Adobe Creative', 'Microsoft 365', 'Google Workspace', 'Dropbox', 'Canva Pro', 'Figma', 'Notion', 'Autres dépenses']
  }

  useEffect(() => {
    if (user) {
      loadSubscription()
      loadUserSubscriptions()
    }
  }, [user])

  const loadSubscription = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading subscription:', error)
      } else {
        setSubscription(data)
      }
    } catch (error) {
      console.error('Error in loadSubscription:', error)
    }
  }

  const loadUserSubscriptions = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('next_occurrence', { ascending: true })

      if (error) {
        console.error('Error loading user subscriptions:', error)
      } else {
        setUserSubscriptions(data || [])
      }
    } catch (error) {
      console.error('Error in loadUserSubscriptions:', error)
    }
  }

  const addUserSubscription = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !newSubscription.title.trim() || !newSubscription.amount) return

    setLoading(true)
    try {
      const subscriptionData = {
        user_id: user.id,
        title: newSubscription.title.trim(),
        amount: parseFloat(newSubscription.amount),
        category: newSubscription.category,
        type: newSubscription.type,
        recurrence_type: newSubscription.recurrence_type,
        recurrence_interval: newSubscription.recurrence_interval,
        next_occurrence: newSubscription.next_occurrence,
        end_date: newSubscription.end_date || null,
        is_active: true
      }

      // Insert the subscription
      const { error: subscriptionError } = await supabase
        .from('user_subscriptions')
        .insert(subscriptionData)

      if (subscriptionError) {
        console.error('Error adding subscription:', subscriptionError)
        alert(`Erreur lors de l'ajout de l'abonnement: ${subscriptionError.message}`)
        return
      }

      // Note: We don't create a transaction automatically anymore
      // Subscriptions are managed separately from transactions
      console.log('Subscription created successfully')

      // Reset form and reload data
      setNewSubscription({
        title: '',
        amount: '',
        category: '',
        type: 'expense',
        recurrence_type: 'monthly',
        recurrence_interval: 1,
        next_occurrence: format(new Date(), 'yyyy-MM-dd'),
        end_date: ''
      })
      setShowAddForm(false)
      loadUserSubscriptions()
      
      // Add a small delay to ensure data is synchronized
      setTimeout(() => {
        // Notify parent component to reload transactions
        if (onSubscriptionAdded) {
          onSubscriptionAdded()
        }
      }, 300)
      
      // Show success message
      alert(`${newSubscription.title} ajouté avec succès !`)
      
    } catch (error) {
      console.error('Error in addUserSubscription:', error)
      alert('Une erreur est survenue lors de l\'ajout de l\'abonnement')
    } finally {
      setLoading(false)
    }
  }

  const deleteUserSubscription = async (subscriptionId: string) => {
    if (!user) return

    const confirmed = window.confirm(
      'Êtes-vous sûr de vouloir supprimer cet abonnement ? La transaction correspondante sera aussi supprimée.'
    )

    if (!confirmed) return

    try {
      // First, get the subscription details to find the corresponding transaction
      const { data: subscription, error: fetchError } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('id', subscriptionId)
        .eq('user_id', user.id)
        .single()

      if (fetchError) {
        console.error('Error fetching subscription:', fetchError)
        alert('Erreur lors de la récupération de l\'abonnement')
        return
      }

      // Delete the subscription
      const { error: subscriptionError } = await supabase
        .from('user_subscriptions')
        .update({ is_active: false })
        .eq('id', subscriptionId)
        .eq('user_id', user.id)

      if (subscriptionError) {
        console.error('Error deleting subscription:', subscriptionError)
        alert('Erreur lors de la suppression de l\'abonnement')
        return
      }

      // Find and delete the corresponding transaction
      const transactionTitle = `${subscription.title} (${subscription.recurrence_type === 'monthly' ? 'Mensuel' : 
                            subscription.recurrence_type === 'weekly' ? 'Hebdomadaire' : 
                            subscription.recurrence_type === 'yearly' ? 'Annuel' : 'Quotidien'})`

      const { error: transactionError } = await supabase
        .from('transactions')
        .delete()
        .eq('user_id', user.id)
        .eq('title', transactionTitle)
        .eq('amount', subscription.amount)
        .eq('type', subscription.type)
        .eq('category', subscription.category)
        .eq('date', subscription.next_occurrence)

      if (transactionError) {
        console.error('Error deleting transaction:', transactionError)
        // Don't show error to user as subscription was deleted successfully
        console.log('Transaction might not exist or already deleted')
      } else {
        console.log('Corresponding transaction deleted successfully')
      }

      // Reload subscriptions
      loadUserSubscriptions()
      
      // Add a small delay to ensure data is synchronized
      setTimeout(() => {
        // Notify parent component to reload transactions
        if (onSubscriptionAdded) {
          onSubscriptionAdded()
        }
        
        if (onSubscriptionDeleted) {
          onSubscriptionDeleted()
        }
      }, 300)

      alert('Abonnement supprimé avec succès ! La transaction correspondante a été supprimée.')

    } catch (error) {
      console.error('Error in deleteUserSubscription:', error)
      alert('Une erreur est survenue lors de la suppression de l\'abonnement')
    }
  }

  const getTotalMonthlySubscriptions = () => {
    return userSubscriptions.reduce((total, sub) => {
      let monthlyAmount = 0
      if (sub.recurrence_type === 'monthly') {
        monthlyAmount = sub.amount
      } else if (sub.recurrence_type === 'weekly') {
        monthlyAmount = sub.amount * 4.33 // Approximate weeks per month
      } else if (sub.recurrence_type === 'yearly') {
        monthlyAmount = sub.amount / 12
      } else if (sub.recurrence_type === 'daily') {
        monthlyAmount = sub.amount * 30 // Approximate days per month
      }
      
      return sub.type === 'income' ? total + monthlyAmount : total - monthlyAmount
    }, 0)
  }

  const getMonthlyIncome = () => {
    return userSubscriptions
      .filter(sub => sub.type === 'income')
      .reduce((total, sub) => {
        if (sub.recurrence_type === 'monthly') {
          return total + sub.amount
        } else if (sub.recurrence_type === 'weekly') {
          return total + (sub.amount * 4.33)
        } else if (sub.recurrence_type === 'yearly') {
          return total + (sub.amount / 12)
        } else if (sub.recurrence_type === 'daily') {
          return total + (sub.amount * 30)
        }
        return total
      }, 0)
  }

  const getMonthlyExpenses = () => {
    return userSubscriptions
      .filter(sub => sub.type === 'expense')
      .reduce((total, sub) => {
        if (sub.recurrence_type === 'monthly') {
          return total + sub.amount
        } else if (sub.recurrence_type === 'weekly') {
          return total + (sub.amount * 4.33)
        } else if (sub.recurrence_type === 'yearly') {
          return total + (sub.amount / 12)
        } else if (sub.recurrence_type === 'daily') {
          return total + (sub.amount * 30)
        }
        return total
      }, 0)
  }


  return (
    <div className="space-y-6">
      {/* Subscription Status */}
      {subscription && (
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Abonnement {subscription.plan_type === 'premium' ? 'Premium' : 'Gratuit'}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Statut: {subscription.status === 'active' ? 'Actif' : subscription.status}
                </p>
                {subscription.end_date && (
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    Expire le: {format(parseISO(subscription.end_date), 'dd/MM/yyyy', { locale: fr })}
                  </p>
                )}
              </div>
            </div>
            {subscription.plan_type === 'free' && (
              <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                Passer à Premium
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* User Subscriptions Summary */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Revenus & Dépenses Récurrents
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Salaires, loyers, abonnements, factures récurrentes...
            </p>
          </div>
          <div className="text-right">
            <p className={`text-2xl font-bold ${getTotalMonthlySubscriptions() >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {getTotalMonthlySubscriptions() >= 0 ? '+' : ''}{getTotalMonthlySubscriptions().toFixed(2)}€
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {userSubscriptions.length} élément{userSubscriptions.length !== 1 ? 's' : ''} récurrent{userSubscriptions.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        
        {userSubscriptions.length > 0 && (
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Revenus mensuels</p>
              <p className="text-lg font-bold text-green-600 dark:text-green-400">
                +{getMonthlyIncome().toFixed(2)}€
              </p>
            </div>
            <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Dépenses mensuelles</p>
              <p className="text-lg font-bold text-red-600 dark:text-red-400">
                -{getMonthlyExpenses().toFixed(2)}€
              </p>
            </div>
          </div>
        )}
        
        {userSubscriptions.length === 0 && (
          <div className="text-center py-8">
            <CreditCard className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Aucun élément récurrent enregistré</p>
            <p className="text-sm text-gray-500 dark:text-gray-500">Ajoutez vos salaires, loyers, abonnements pour suivre vos finances récurrentes</p>
          </div>
        )}
      </Card>

      {/* Add Subscription Form */}
      {showAddForm && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Nouvel élément récurrent</h3>
          <form onSubmit={addUserSubscription} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Nom"
                value={newSubscription.title}
                onChange={(e) => setNewSubscription({ ...newSubscription, title: e.target.value })}
                placeholder="ex: Salaire, Loyer, Netflix..."
                required
              />
              
              <Input
                label="Montant"
                type="number"
                step="0.01"
                value={newSubscription.amount}
                onChange={(e) => setNewSubscription({ ...newSubscription, amount: e.target.value })}
                placeholder="0.00"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type
                </label>
                <select
                  value={newSubscription.type}
                  onChange={(e) => setNewSubscription({ ...newSubscription, type: e.target.value as any, category: '' })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500"
                >
                  <option value="income">Revenu</option>
                  <option value="expense">Dépense</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Catégorie
                </label>
                <select
                  value={newSubscription.category}
                  onChange={(e) => setNewSubscription({ ...newSubscription, category: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500"
                  required
                >
                  <option value="">Sélectionner</option>
                  {categories[newSubscription.type].map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Fréquence
                </label>
                <select
                  value={newSubscription.recurrence_type}
                  onChange={(e) => setNewSubscription({ ...newSubscription, recurrence_type: e.target.value as any })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500"
                >
                  <option value="monthly">Mensuel</option>
                  <option value="weekly">Hebdomadaire</option>
                  <option value="yearly">Annuel</option>
                  <option value="daily">Quotidien</option>
                </select>
              </div>

              <Input
                label="Prochaine occurrence"
                type="date"
                value={newSubscription.next_occurrence}
                onChange={(e) => setNewSubscription({ ...newSubscription, next_occurrence: e.target.value })}
                required
              />
            </div>

            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <Button type="submit" className="w-full sm:w-auto" disabled={loading}>
                {loading ? 'Ajout...' : 'Ajouter l\'élément récurrent'}
              </Button>
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

      {/* User Subscriptions List */}
      {userSubscriptions.length > 0 && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Mes Éléments Récurrents
            </h3>
            <Button onClick={() => setShowAddForm(true)} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Ajouter
            </Button>
          </div>
          
          <div className="space-y-3">
            {userSubscriptions.map((sub) => (
              <div key={sub.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-full ${sub.type === 'income' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                    <DollarSign className={`w-4 h-4 ${sub.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{sub.title}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{sub.category}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {sub.recurrence_interval === 1 ? (
                        <>
                          {sub.recurrence_type === 'daily' && 'Tous les jours'}
                          {sub.recurrence_type === 'weekly' && 'Toutes les semaines'}
                          {sub.recurrence_type === 'monthly' && 'Tous les mois'}
                          {sub.recurrence_type === 'yearly' && 'Tous les ans'}
                        </>
                      ) : (
                        <>
                          Tous les {sub.recurrence_interval} {
                            sub.recurrence_type === 'daily' && 'jours'
                          }{
                            sub.recurrence_type === 'weekly' && 'semaines'
                          }{
                            sub.recurrence_type === 'monthly' && 'mois'
                          }{
                            sub.recurrence_type === 'yearly' && 'ans'
                          }
                        </>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className={`font-semibold ${sub.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {sub.type === 'income' ? '+' : '-'}{sub.amount.toFixed(2)}€
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Prochaine: {format(parseISO(sub.next_occurrence), 'dd/MM/yyyy', { locale: fr })}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteUserSubscription(sub.id)}
                    className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                    title="Supprimer cet élément"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Add Button when no subscriptions */}
      {userSubscriptions.length === 0 && !showAddForm && (
        <div className="text-center">
          <Button onClick={() => setShowAddForm(true)} size="lg">
            <Plus className="w-5 h-5 mr-2" />
            Ajouter mon premier élément récurrent
          </Button>
        </div>
      )}
    </div>
  )
}
