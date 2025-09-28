import React, { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'

export const BetaTesterManager: React.FC = () => {
  const [uuid, setUuid] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const addBetaTester = async () => {
    if (!uuid.trim()) {
      setMessage('Veuillez entrer un UUID')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      // Appeler la fonction Supabase avec l'UUID directement
      const { data, error } = await supabase.rpc('create_beta_subscription', {
        user_uuid: uuid.trim()
      })

      if (error) {
        setMessage(`Erreur: ${error.message}`)
      } else {
        setMessage(`✅ Utilisateur ${uuid} ajouté comme testeur beta (37 jours)`)
        setUuid('')
      }
    } catch (error) {
      setMessage(`Erreur: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const getBetaTesters = async () => {
    setLoading(true)
    try {
      // D'abord, vérifier tous les abonnements pour voir ce qui existe
      const { data: allSubscriptions, error: allError } = await supabase
        .from('subscriptions')
        .select('*')

      console.log('Tous les abonnements:', allSubscriptions)
      console.log('Erreur tous abonnements:', allError)

      // Récupérer les abonnements beta
      const { data: subscriptions, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('status', 'beta')
        .eq('is_beta_tester', true)

      console.log('Abonnements beta trouvés:', subscriptions)
      console.log('Erreur abonnements beta:', subError)

      if (subError) {
        setMessage(`Erreur: ${subError.message}`)
        return
      }

      if (!subscriptions || subscriptions.length === 0) {
        // Vérifier s'il y a des abonnements avec d'autres statuts
        const { data: otherSubs } = await supabase
          .from('subscriptions')
          .select('*')
          .neq('status', 'beta')

        let message = `✅ Aucun testeur beta trouvé\n\n`
        if (otherSubs && otherSubs.length > 0) {
          message += `Abonnements existants:\n`
          otherSubs.forEach((sub, index) => {
            message += `${index + 1}. Status: ${sub.status}, Plan: ${sub.plan_type}, User: ${sub.user_id}\n`
          })
        } else {
          message += `Aucun abonnement trouvé dans la base de données.`
        }
        
        setMessage(message)
        return
      }

      // Afficher les informations de base
      let message = `✅ ${subscriptions.length} testeur(s) beta trouvé(s):\n\n`
      
      subscriptions.forEach((sub, index) => {
        const daysLeft = sub.beta_end ? 
          Math.ceil((new Date(sub.beta_end).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 
          'N/A'
        
        message += `${index + 1}. User ID: ${sub.user_id}\n`
        message += `   Beta End: ${sub.beta_end}\n`
        message += `   Jours restants: ${daysLeft}\n\n`
      })

      setMessage(message)

    } catch (error) {
      setMessage(`Erreur: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="max-w-2xl">
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Gestion des Testeurs Beta
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Ajoutez des utilisateurs comme testeurs beta avec accès complet pendant 37 jours en utilisant leur UUID.
          </p>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              UUID de l'utilisateur
            </label>
            <Input
              type="text"
              value={uuid}
              onChange={(e) => setUuid(e.target.value)}
              placeholder="aa14f0fb-bea2-4410-a8b4-93c7cb1b9409"
              className="w-full font-mono text-sm"
            />
          </div>

          <div className="flex space-x-3">
            <Button
              onClick={addBetaTester}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? 'Ajout...' : 'Ajouter Testeur Beta'}
            </Button>
            
            <Button
              onClick={getBetaTesters}
              disabled={loading}
              variant="outline"
            >
              Lister Testeurs
            </Button>
          </div>

          {message && (
            <div className={`p-3 rounded-md text-sm ${
              message.includes('✅') 
                ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300'
                : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300'
            }`}>
              {message}
            </div>
          )}
        </div>

        <div className="border-t pt-4">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            Instructions
          </h3>
          <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
            <li>• Les testeurs beta ont accès à toutes les fonctionnalités premium</li>
            <li>• La période beta dure 37 jours à partir de l'ajout</li>
            <li>• Après expiration, ils retournent automatiquement au plan gratuit</li>
            <li>• Utilisez "Lister Testeurs" pour voir tous les testeurs actifs</li>
            <li>• <strong>Pour obtenir l'UUID :</strong> Allez dans Supabase → SQL Editor → <code>SELECT id, email FROM auth.users;</code></li>
          </ul>
        </div>
      </div>
    </Card>
  )
}
