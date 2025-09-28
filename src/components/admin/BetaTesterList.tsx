import React, { useState, useEffect } from 'react'
import { Card } from '../ui/Card'
import { supabase } from '../../lib/supabase'

interface BetaTester {
  user_id: string
  email: string
  beta_end: string
  days_left: number
}

export const BetaTesterList: React.FC = () => {
  const [testers, setTesters] = useState<BetaTester[]>([])
  const [loading, setLoading] = useState(false)

  const loadBetaTesters = async () => {
    setLoading(true)
    try {
      // Récupérer les abonnements beta directement
      const { data: subscriptions, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('status', 'beta')
        .eq('is_beta_tester', true)

      if (subError) {
        console.error('Erreur lors du chargement des abonnements beta:', subError)
        return
      }

      if (!subscriptions || subscriptions.length === 0) {
        setTesters([])
        return
      }

      // Convertir les abonnements en format BetaTester
      const testersWithEmails: BetaTester[] = subscriptions.map(sub => {
        const daysLeft = sub.beta_end ? 
          Math.ceil((new Date(sub.beta_end).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 
          0

        return {
          user_id: sub.user_id,
          email: sub.user_id, // Afficher l'UUID comme identifiant
          beta_end: sub.beta_end || '',
          days_left: daysLeft
        }
      })

      setTesters(testersWithEmails)
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBetaTesters()
  }, [])

  if (loading) {
    return (
      <Card>
        <div className="p-4 text-center">
          <p>Chargement des testeurs beta...</p>
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Testeurs Beta Actifs
          </h3>
          <button
            onClick={loadBetaTesters}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Actualiser
          </button>
        </div>

        {testers.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">
            Aucun testeur beta trouvé
          </p>
        ) : (
          <div className="space-y-3">
            {testers.map((tester, index) => (
              <div
                key={tester.user_id}
                className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white font-mono text-sm">
                      {tester.user_id}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      UUID utilisateur
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Expire: {new Date(tester.beta_end).toLocaleDateString('fr-FR')}
                    </p>
                    <p className={`text-sm font-medium ${
                      tester.days_left <= 3 ? 'text-orange-600' : 'text-green-600'
                    }`}>
                      {tester.days_left} jour{tester.days_left > 1 ? 's' : ''} restant{tester.days_left > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  )
}
