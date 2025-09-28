import React, { useState } from 'react'
import { Card } from '../ui/Card'
import { BetaTesterManager } from './BetaTesterManager'
import { BetaTesterList } from './BetaTesterList'
import { supabase } from '../../lib/supabase'
import { useAuthContext } from '../../contexts/AuthContext'

export const AdminPanel: React.FC = () => {
  const { user } = useAuthContext()
  const [stats, setStats] = useState({
    totalUsers: 0,
    betaTesters: 0,
    premiumUsers: 0,
    freeUsers: 0
  })
  const [loading, setLoading] = useState(true)

  // Vérifier si l'utilisateur est admin (vous pouvez personnaliser cette logique)
  const isAdmin = user?.email === 'nooolhansaas@gmail.com'

  React.useEffect(() => {
    if (isAdmin) {
      loadStats()
    }
  }, [isAdmin])

  const loadStats = async () => {
    try {
      setLoading(true)
      
      // Compter les utilisateurs
      const { count: totalUsers } = await supabase
        .from('auth.users')
        .select('*', { count: 'exact', head: true })

      // Compter les abonnements
      const { data: subscriptions } = await supabase
        .from('subscriptions')
        .select('status, plan_type')

      const betaTesters = subscriptions?.filter(s => s.status === 'beta').length || 0
      const premiumUsers = subscriptions?.filter(s => s.plan_type === 'premium' && s.status === 'active').length || 0
      const freeUsers = subscriptions?.filter(s => s.plan_type === 'free').length || 0

      setStats({
        totalUsers: totalUsers || 0,
        betaTesters,
        premiumUsers,
        freeUsers
      })
    } catch (error) {
      console.error('Erreur lors du chargement des stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isAdmin) {
    return (
      <div className="p-6">
        <Card>
          <div className="text-center py-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Accès Refusé
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              Vous n'avez pas les permissions pour accéder à cette page.
            </p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Administration
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Gestion des utilisateurs et des abonnements
        </p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Utilisateurs</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {loading ? '...' : stats.totalUsers}
            </p>
          </div>
        </Card>
        
        <Card>
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Testeurs Beta</h3>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {loading ? '...' : stats.betaTesters}
            </p>
          </div>
        </Card>
        
        <Card>
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Premium</h3>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {loading ? '...' : stats.premiumUsers}
            </p>
          </div>
        </Card>
        
        <Card>
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Gratuit</h3>
            <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">
              {loading ? '...' : stats.freeUsers}
            </p>
          </div>
        </Card>
      </div>

      {/* Gestion des testeurs beta */}
      <BetaTesterManager />
      
      {/* Liste des testeurs beta */}
      <BetaTesterList />
    </div>
  )
}
